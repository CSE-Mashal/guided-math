import {
  isTutorResponse,
  type TutorHelpType,
  type TutorResponse,
} from "./tutor-schema";

export type TutorHelpRequest = {
  topic: string;
  question: string;
  studentAttempt?: string;
  type: TutorHelpType;
  blockedText: string[];
};

const tutorResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["type", "message", "exampleQuestion", "exampleAnswer"],
  properties: {
    type: {
      type: "string",
      enum: ["hint", "similar-example", "simpler-explanation"],
    },
    message: { type: "string" },
    exampleQuestion: { type: "string" },
    exampleAnswer: { type: "string" },
  },
};

const systemPrompt = `
You are Math Guide, a tutor for school-age students.

Help a student think; do not solve their exact question.
Never state, calculate, confirm, or reveal the final answer to the student's exact question.
Never rewrite the student's exact question with a solution.
Use plain, encouraging language.

For a hint: give one next-step idea only.
For a simpler explanation: explain the method without calculating the exact result.
For a similar example: use different numbers from the student's question, fully work it out step by step, and include that different example's final answer. Never calculate, state, or confirm the answer to the student's exact question.

Return only JSON that matches the requested schema.
`;

function getOutputText(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const data = payload as {
    output_text?: unknown;
    output?: Array<{
      content?: Array<{ type?: string; text?: string }>;
    }>;
  };

  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  for (const item of data.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return null;
}

function containsBlockedText(
  response: TutorResponse,
  blockedText: string[],
): boolean {
  const visibleText = [
    response.message,
    response.exampleQuestion ?? "",
    response.exampleAnswer ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return blockedText.some((text) => {
    const normalized = text.trim().toLowerCase();
    return normalized.length > 0 && visibleText.includes(normalized);
  });
}

export async function requestTutorHelp(
  apiKey: string,
  request: TutorHelpRequest,
): Promise<TutorResponse> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.4-mini",
      reasoning: { effort: "none" },
      store: false,
      max_output_tokens: 300,
      input: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            `Topic: ${request.topic}`,
            `Question: ${request.question}`,
            `Student attempt: ${request.studentAttempt || "No attempt yet"}`,
            `Requested help: ${request.type}`,
          ].join("\n"),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "math_tutor_response",
          strict: true,
          schema: tutorResponseSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error("The tutor service is unavailable right now.");
  }

  const responsePayload = await response.json();
  const outputText = getOutputText(responsePayload);

  if (!outputText) {
    throw new Error("The tutor returned an empty response.");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(outputText);
  } catch {
    throw new Error("The tutor returned an invalid response.");
  }

  if (
    !isTutorResponse(parsed) ||
    containsBlockedText(parsed, request.blockedText)
  ) {
    throw new Error("The tutor response did not pass the safety check.");
  }

  return parsed;
}