import type { OneStepEquation } from "./equation-problems";

export type EquationAttemptKind = "correct" | "needs-inverse-operation" | "invalid";

export function solveOneStepEquation(problem: OneStepEquation): number {
  switch (problem.operation) {
    case "add":
      return problem.result - problem.value;
    case "subtract":
      return problem.result + problem.value;
    case "multiply":
      return problem.result / problem.value;
    case "divide":
      return problem.result * problem.value;
  }
}

export function parseEquationAnswer(input: string): number | null {
  const trimmedInput = input.trim();

  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmedInput)) {
    return null;
  }

  const value = Number(trimmedInput);
  return Number.isFinite(value) ? value : null;
}

export function analyzeEquationAttempt(
  input: string,
  problem: OneStepEquation,
): EquationAttemptKind {
  const submittedAnswer = parseEquationAnswer(input);

  if (submittedAnswer === null) {
    return "invalid";
  }

  return submittedAnswer === solveOneStepEquation(problem)
    ? "correct"
    : "needs-inverse-operation";
}
