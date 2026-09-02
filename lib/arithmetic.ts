export type BasicArithmeticOperation = "add" | "subtract" | "multiply" | "divide";

export type BasicArithmeticProblem = {
  left: number;
  operation: BasicArithmeticOperation;
  right: number;
};

export type ArithmeticAttemptKind = "correct" | "needs-calculation" | "invalid";

function assertWholeNumber(value: number, name: string): void {
  if (!Number.isInteger(value)) {
    throw new RangeError(`${name} must be a whole number`);
  }
}

export function solveBasicArithmetic(problem: BasicArithmeticProblem): number {
  assertWholeNumber(problem.left, "Left value");
  assertWholeNumber(problem.right, "Right value");

  switch (problem.operation) {
    case "add":
      return problem.left + problem.right;
    case "subtract":
      return problem.left - problem.right;
    case "multiply":
      return problem.left * problem.right;
    case "divide":
      if (problem.right === 0 || problem.left % problem.right !== 0) {
        throw new RangeError("Division must have a whole-number result");
      }

      return problem.left / problem.right;
  }
}

export function parseArithmeticAnswer(input: string): number | null {
  const trimmedInput = input.trim();

  if (!/^[+-]?\d+$/.test(trimmedInput)) {
    return null;
  }

  return Number(trimmedInput);
}

export function analyzeArithmeticAttempt(
  input: string,
  problem: BasicArithmeticProblem,
): ArithmeticAttemptKind {
  const submittedAnswer = parseArithmeticAnswer(input);

  if (submittedAnswer === null) {
    return "invalid";
  }

  return submittedAnswer === solveBasicArithmetic(problem)
    ? "correct"
    : "needs-calculation";
}
