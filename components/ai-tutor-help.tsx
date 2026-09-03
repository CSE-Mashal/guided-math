"use client";

import { useState } from "react";

type TutorHelpType = "hint" | "similar-example" | "simpler-explanation";

type AiTutorHelpProps = {
  question: string;
  studentAttempt: string;
};

type TutorApiResponse = {
  message: string;
  exampleQuestion?: string;
  exampleAnswer?: string;
};

const helpLabels: Record<TutorHelpType, string> = {
  hint: "AI hint",
  "similar-example": "AI similar example",
  "simpler-explanation": "Explain more simply",
};

export function AiTutorHelp({
  question,
  studentAttempt,
}: AiTutorHelpProps) {
  const [help, setHelp] = useState<TutorApiResponse | null>(null);
  const [loadingType, setLoadingType] = useState<TutorHelpType | null>(null);
  const [error, setError] = useState("");

  async function requestHelp(type: TutorHelpType) {
    setLoadingType(type);
    setError("");
    setHelp(null);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          studentAttempt,
          type,
        }),
      });

      const data = (await response.json()) as {
        message?: unknown;
        exampleQuestion?: unknown;
        exampleAnswer?: unknown;
      };

      if (!response.ok || typeof data.message !== "string") {
        throw new Error("AI help is unavailable right now.");
      }

      setHelp({
        message: data.message,
        exampleQuestion:
          typeof data.exampleQuestion === "string"
            ? data.exampleQuestion
            : undefined,
        exampleAnswer:
          typeof data.exampleAnswer === "string"
            ? data.exampleAnswer
            : undefined,
      });
    } catch {
      setError("AI help is unavailable right now. Try the regular hint instead.");
    } finally {
      setLoadingType(null);
    }
  }

  return (
    <section className="rounded-2xl bg-[#eef3ff] p-4">
      <p className="font-bold">Need another explanation?</p>
      <p className="mt-1 text-sm leading-6 text-[#52607a]">
        AI can give a hint or a different example. It will not give the answer
        to your question.
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {(Object.keys(helpLabels) as TutorHelpType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => requestHelp(type)}
            disabled={loadingType !== null}
            className="rounded-xl border border-[#315bd6] bg-white px-4 py-2 text-sm font-bold text-[#315bd6] transition hover:bg-[#dfe8ff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingType === type ? "Thinking..." : helpLabels[type]}
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-[#b42318]">{error}</p>}

      {help && (
        <div className="mt-4 rounded-xl border border-[#cbd5e1] bg-white p-4">
          <p className="text-sm leading-6 text-[#33415f]">{help.message}</p>

          {help.exampleQuestion && (
            <p className="mt-3 text-sm font-bold text-[#172554]">
              Example: {help.exampleQuestion}
            </p>
          )}

          {help.exampleAnswer && (
            <p className="mt-1 text-sm text-[#33415f]">
              Example answer: {help.exampleAnswer}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
