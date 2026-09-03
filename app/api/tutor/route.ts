import {
  getCustomQuestionAnswerText,
  parseCustomQuestion,
  serializeCustomQuestion,
} from "../../../lib/custom-question";
import { requestTutorHelp } from "../../../lib/tutor";
import { isTutorHelpType } from "../../../lib/tutor-schema";

let requestCount = 0;
let requestWindowStartedAt = Date.now();

function isRateLimited(): boolean {
  const now = Date.now();

  if (now - requestWindowStartedAt > 60_000) {
    requestWindowStartedAt = now;
    requestCount = 0;
  }

  requestCount += 1;
  return requestCount > 10;
}

export async function POST(request: Request): Promise<Response> {
  if (isRateLimited()) {
    return Response.json(
      { message: "Please wait a moment before asking for more AI help." },
      { status: 429 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }

  const { question, studentAttempt, type } = body as Record<string, unknown>;

  if (
    typeof question !== "string" ||
    question.trim().length === 0 ||
    question.length > 120 ||
    (studentAttempt !== undefined &&
      (typeof studentAttempt !== "string" || studentAttempt.length > 60)) ||
    !isTutorHelpType(type)
  ) {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }

  const parsedQuestion = parseCustomQuestion(question);

  if (parsedQuestion.status !== "supported") {
    return Response.json(
      { message: "That question format is not supported yet." },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { message: "AI help is not configured yet." },
      { status: 503 },
    );
  }

  try {
    const normalizedQuestion = serializeCustomQuestion(parsedQuestion.question);
    const expectedAnswer = getCustomQuestionAnswerText(parsedQuestion.question);

    const tutorResponse = await requestTutorHelp(apiKey, {
      topic: parsedQuestion.question.topic,
      question: normalizedQuestion,
      studentAttempt:
        typeof studentAttempt === "string" ? studentAttempt.trim() : undefined,
      type,
      blockedText: [normalizedQuestion, expectedAnswer],
    });

    return Response.json(tutorResponse);
   } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown tutor error";

    console.error("Tutor request failed:", message);

    return Response.json(
      { message: "AI help is unavailable right now. Try the regular hint instead." },
      { status: 503 },
    );
  }
}