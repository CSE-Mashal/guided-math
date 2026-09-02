import {
  analyzeFractionAttempt,
  areFractionsEquivalent,
  parseFractionInput,
  type Fraction,
} from "./fractions";
import {
  analyzeEquationAttempt,
  type EquationAttemptKind,
} from "./equations";
import {
  analyzePercentageAttempt,
  type PercentageAttemptKind,
} from "./percentages";
import type { OneStepEquation } from "./equation-problems";
import type { PercentageProblem } from "./percentage-problems";

export type CustomQuestion =
  | {
      topic: "fraction-addition";
      left: Fraction;
      right: Fraction;
    }
  | {
      topic: "percentage";
      problem: PercentageProblem;
    }
  | {
      topic: "equation";
      problem: OneStepEquation;
    };

export type CustomQuestionParseResult =
  | { status: "supported"; question: CustomQuestion }
  | { status: "unsupported"; message: string };

export type CustomQuestionAttemptKind =
  | "correct"
  | "correct-not-simplified"
  | "needs-hint"
  | "invalid-answer";

const supportedFormats =
  "Supported formats: 2/3 + 5/6, 25% of 80, x - 4 = 9, or 3x = 18.";

function parseWholeNumber(value: string): number | null {
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function parseNumber(value: string): number | null {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function parseCustomQuestion(input: string): CustomQuestionParseResult {
  const normalizedInput = input.trim();
  const fractionMatch = normalizedInput.match(
    /^([+-]?\d+)\s*\/\s*([+-]?\d+)\s*\+\s*([+-]?\d+)\s*\/\s*([+-]?\d+)$/,
  );

  if (fractionMatch) {
    const left = parseFractionInput(`${fractionMatch[1]}/${fractionMatch[2]}`);
    const right = parseFractionInput(`${fractionMatch[3]}/${fractionMatch[4]}`);

    if (left && right) {
      return { status: "supported", question: { topic: "fraction-addition", left, right } };
    }

    return { status: "unsupported", message: supportedFormats };
  }

  const percentageMatch = normalizedInput.match(
    /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*%\s+of\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/i,
  );

  if (percentageMatch) {
    const percent = parseNumber(percentageMatch[1]);
    const number = parseNumber(percentageMatch[2]);

    if (percent !== null && number !== null) {
      return { status: "supported", question: { topic: "percentage", problem: { percent, number } } };
    }
  }

  const addEquationMatch = normalizedInput.match(/^x\s*\+\s*([+-]?\d+)\s*=\s*([+-]?\d+)$/i);
  if (addEquationMatch) {
    const value = parseWholeNumber(addEquationMatch[1]);
    const result = parseWholeNumber(addEquationMatch[2]);

    if (value !== null && result !== null) {
      return { status: "supported", question: { topic: "equation", problem: { operation: "add", value, result } } };
    }
  }

  const subtractEquationMatch = normalizedInput.match(/^x\s*-\s*([+-]?\d+)\s*=\s*([+-]?\d+)$/i);
  if (subtractEquationMatch) {
    const value = parseWholeNumber(subtractEquationMatch[1]);
    const result = parseWholeNumber(subtractEquationMatch[2]);

    if (value !== null && result !== null) {
      return { status: "supported", question: { topic: "equation", problem: { operation: "subtract", value, result } } };
    }
  }

  const multiplyEquationMatch = normalizedInput.match(/^([+-]?\d+)\s*x\s*=\s*([+-]?\d+)$/i);
  if (multiplyEquationMatch) {
    const value = parseWholeNumber(multiplyEquationMatch[1]);
    const result = parseWholeNumber(multiplyEquationMatch[2]);

    if (value !== null && value !== 0 && result !== null) {
      return { status: "supported", question: { topic: "equation", problem: { operation: "multiply", value, result } } };
    }
  }

  const divideEquationMatch = normalizedInput.match(/^x\s*\/\s*([+-]?\d+)\s*=\s*([+-]?\d+)$/i);
  if (divideEquationMatch) {
    const value = parseWholeNumber(divideEquationMatch[1]);
    const result = parseWholeNumber(divideEquationMatch[2]);

    if (value !== null && value !== 0 && result !== null) {
      return { status: "supported", question: { topic: "equation", problem: { operation: "divide", value, result } } };
    }
  }

  return { status: "unsupported", message: supportedFormats };
}

export function analyzeCustomQuestionAnswer(
  input: string,
  question: CustomQuestion,
): CustomQuestionAttemptKind {
  if (question.topic === "fraction-addition") {
    const attempt = analyzeFractionAttempt(input, question.left, question.right);

    if (attempt === "correct") {
      return "correct";
    }

    if (attempt === "correct-not-simplified") {
      return "correct-not-simplified";
    }

    return attempt === "invalid" ? "invalid-answer" : "needs-hint";
  }

  if (question.topic === "percentage") {
    const attempt: PercentageAttemptKind = analyzePercentageAttempt(input, question.problem);
    return attempt === "correct"
      ? "correct"
      : attempt === "invalid"
        ? "invalid-answer"
        : "needs-hint";
  }

  const attempt: EquationAttemptKind = analyzeEquationAttempt(input, question.problem);
  return attempt === "correct"
    ? "correct"
    : attempt === "invalid"
      ? "invalid-answer"
      : "needs-hint";
}

export function isEquivalentFraction(left: Fraction, right: Fraction): boolean {
  return areFractionsEquivalent(left, right);
}
