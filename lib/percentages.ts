import type { PercentageProblem } from "./percentage-problems";

export type PercentageAttemptKind = "correct" | "needs-conversion" | "invalid";

function assertFiniteNumber(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number`);
  }
}

export function percentToDecimal(percent: number): number {
  assertFiniteNumber(percent, "Percent");
  return percent / 100;
}

export function percentToFraction(percent: number): { numerator: number; denominator: number } {
  assertFiniteNumber(percent, "Percent");
  return { numerator: percent, denominator: 100 };
}

export function calculatePercentOfNumber(percent: number, number: number): number {
  assertFiniteNumber(number, "Number");
  return percentToDecimal(percent) * number;
}

export function parseNumberInput(input: string): number | null {
  const trimmedInput = input.trim();

  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmedInput)) {
    return null;
  }

  const value = Number(trimmedInput);
  return Number.isFinite(value) ? value : null;
}

export function analyzePercentageAttempt(
  input: string,
  problem: PercentageProblem,
): PercentageAttemptKind {
  const submittedAnswer = parseNumberInput(input);

  if (submittedAnswer === null) {
    return "invalid";
  }

  const expectedAnswer = calculatePercentOfNumber(problem.percent, problem.number);

  return submittedAnswer === expectedAnswer ? "correct" : "needs-conversion";
}
