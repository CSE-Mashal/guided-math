export const tutorHelpTypes = [
  "hint",
  "similar-example",
  "simpler-explanation",
] as const;

export type TutorHelpType = (typeof tutorHelpTypes)[number];

export type TutorResponse = {
  type: TutorHelpType;
  message: string;
  exampleQuestion?: string;
  exampleAnswer?: string;
};

export function isTutorHelpType(value: unknown): value is TutorHelpType {
  return (
    typeof value === "string" &&
    tutorHelpTypes.includes(value as TutorHelpType)
  );
}

export function isTutorResponse(value: unknown): value is TutorResponse {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const response = value as Record<string, unknown>;
  const allowedKeys = new Set([
    "type",
    "message",
    "exampleQuestion",
    "exampleAnswer",
  ]);

  if (Object.keys(response).some((key) => !allowedKeys.has(key))) {
    return false;
  }

  if (
    !isTutorHelpType(response.type) ||
    typeof response.message !== "string" ||
    response.message.trim().length === 0 ||
    response.message.length > 500
  ) {
    return false;
  }

  return (
    (response.exampleQuestion === undefined ||
      typeof response.exampleQuestion === "string") &&
    (response.exampleAnswer === undefined ||
      typeof response.exampleAnswer === "string")
  );
}