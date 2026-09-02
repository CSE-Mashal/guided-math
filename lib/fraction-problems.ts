import type { Fraction } from "@/lib/fractions";

export type FractionProblem = {
  left: Fraction;
  right: Fraction;
};

export type SimplificationProblem = {
  fraction: Fraction;
};

export type EquivalentFractionProblem = {
  fraction: Fraction;
};

export const fractionProblems: FractionProblem[] = [
  {
    left: { numerator: 3, denominator: 4 },
    right: { numerator: 1, denominator: 2 },
  },
  {
    left: { numerator: 2, denominator: 3 },
    right: { numerator: 1, denominator: 4 },
  },
  {
    left: { numerator: 3, denominator: 5 },
    right: { numerator: 1, denominator: 2 },
  },
  {
    left: { numerator: 5, denominator: 6 },
    right: { numerator: 2, denominator: 3 },
  },
  {
    left: { numerator: 3, denominator: 8 },
    right: { numerator: 1, denominator: 5 },
  },
];

export const simplifyingFractionProblems: SimplificationProblem[] = [
  { fraction: { numerator: 12, denominator: 18 } },
  { fraction: { numerator: 15, denominator: 24 } },
  { fraction: { numerator: 21, denominator: 28 } },
  { fraction: { numerator: 32, denominator: 40 } },
  { fraction: { numerator: 45, denominator: 60 } },
];

export const equivalentFractionProblems: EquivalentFractionProblem[] = [
  { fraction: { numerator: 1, denominator: 2 } },
  { fraction: { numerator: 2, denominator: 3 } },
  { fraction: { numerator: 3, denominator: 4 } },
  { fraction: { numerator: 4, denominator: 5 } },
  { fraction: { numerator: 5, denominator: 6 } },
];
