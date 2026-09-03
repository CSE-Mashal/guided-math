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
import {
  analyzeArithmeticAttempt,
  solveBasicArithmetic,
  type BasicArithmeticProblem,
} from "./arithmetic";
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
    }
  | {
      topic: "arithmetic";
      problem: BasicArithmeticProblem;
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
  "Supported formats: 2/3 + 5/6, 25% of 80, x - 4 = 9, 3x = 18, 7 x 8, or 12 / 3.";

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

  const arithmeticMatch = normalizedInput.match(
    /^([+-]?\d+)\s*([+\-*×xX/÷])\s*([+-]?\d+)$/,
  );

  if (arithmeticMatch) {
    const left = parseWholeNumber(arithmeticMatch[1]);
    const right = parseWholeNumber(arithmeticMatch[3]);
    const operation = {
      "+": "add",
      "-": "subtract",
      "*": "multiply",
      "×": "multiply",
      "x": "multiply",
      "X": "multiply",
      "/": "divide",
      "÷": "divide",
    }[arithmeticMatch[2]] as BasicArithmeticProblem["operation"];

    if (left !== null && right !== null) {
      const problem = { left, operation, right } satisfies BasicArithmeticProblem;

      try {
        solveBasicArithmetic(problem);
        return { status: "supported", question: { topic: "arithmetic", problem } };
      } catch {
        return { status: "unsupported", message: "Division must have a whole-number result. " + supportedFormats };
      }
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

    if (question.topic === "arithmetic") {
      const attempt = analyzeArithmeticAttempt(input, question.problem);
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

export function serializeCustomQuestion(question: CustomQuestion): string {
  if (question.topic === "fraction-addition") {
    return `${question.left.numerator}/${question.left.denominator} + ${question.right.numerator}/${question.right.denominator}`;
  }

  if (question.topic === "percentage") {
    return `${question.problem.percent}% of ${question.problem.number}`;
  }

  if (question.topic === "arithmetic") {
    const symbol = {
      add: "+",
      subtract: "-",
      multiply: "×",
      divide: "÷",
    }[question.problem.operation];

    return `${question.problem.left} ${symbol} ${question.problem.right}`;
  }

  const symbol = {
    add: "+",
    subtract: "-",
    multiply: "×",
    divide: "÷",
  }[question.problem.operation];

  if (
    question.problem.operation === "multiply" ||
    question.problem.operation === "divide"
  ) {
    return question.problem.operation === "multiply"
      ? `${question.problem.value}x = ${question.problem.result}`
      : `x ÷ ${question.problem.value} = ${question.problem.result}`;
  }

  return `x ${symbol} ${question.problem.value} = ${question.problem.result}`;
}

export function getCustomQuestionAnswerText(question: CustomQuestion): string {
  if (question.topic === "fraction-addition") {
    const numerator =
      question.left.numerator * question.right.denominator +
      question.right.numerator * question.left.denominator;
    const denominator =
      question.left.denominator * question.right.denominator;

    const greatestCommonDivisor = (first: number, second: number): number => {
      let left = Math.abs(first);
      let right = Math.abs(second);

      while (right !== 0) {
        [left, right] = [right, left % right];
      }

      return left;
    };

    const divisor = greatestCommonDivisor(numerator, denominator);
    const simplifiedNumerator = numerator / divisor;
    const simplifiedDenominator = denominator / divisor;

    return simplifiedDenominator === 1
      ? String(simplifiedNumerator)
      : `${simplifiedNumerator}/${simplifiedDenominator}`;
  }

  if (question.topic === "percentage") {
    return String((question.problem.percent / 100) * question.problem.number);
  }

  if (question.topic === "arithmetic") {
    return String(solveBasicArithmetic(question.problem));
  }

  const { operation, value, result } = question.problem;

  if (operation === "add") return String(result - value);
  if (operation === "subtract") return String(result + value);
  if (operation === "multiply") return String(result / value);

  return String(result * value);
}