export type EquationOperation = "add" | "subtract" | "multiply" | "divide";

export type OneStepEquation = {
  operation: EquationOperation;
  value: number;
  result: number;
};

export const equationProblems: OneStepEquation[] = [
  { operation: "add", value: 7, result: 15 },
  { operation: "subtract", value: 4, result: 9 },
  { operation: "multiply", value: 3, result: 18 },
  { operation: "divide", value: 5, result: 4 },
  { operation: "add", value: 12, result: 20 },
];
