export type Fraction = {
  numerator: number;
  denominator: number;
};

function assertInteger(value: number, name: string): void {
  if (!Number.isInteger(value)) {
    throw new RangeError(`${name} must be an integer`);
  }
}

function assertValidFraction(fraction: Fraction): void {
  assertInteger(fraction.numerator, "Numerator");
  assertInteger(fraction.denominator, "Denominator");

  if (fraction.denominator === 0) {
    throw new RangeError("Denominator cannot be zero");
  }
}

export function greatestCommonDivisor(first: number, second: number): number {
  assertInteger(first, "First value");
  assertInteger(second, "Second value");

  let larger = Math.abs(first);
  let smaller = Math.abs(second);

  while (smaller !== 0) {
    const remainder = larger % smaller;
    larger = smaller;
    smaller = remainder;
  }

  return larger;
}

export function simplifyFraction(fraction: Fraction): Fraction {
  assertValidFraction(fraction);

  if (fraction.numerator === 0) {
    return { numerator: 0, denominator: 1 };
  }

  const sign = fraction.denominator < 0 ? -1 : 1;
  const divisor = greatestCommonDivisor(fraction.numerator, fraction.denominator);

  return {
    numerator: (fraction.numerator * sign) / divisor,
    denominator: (fraction.denominator * sign) / divisor,
  };
}

export function addFractions(left: Fraction, right: Fraction): Fraction {
  assertValidFraction(left);
  assertValidFraction(right);

  return simplifyFraction({
    numerator: left.numerator * right.denominator + right.numerator * left.denominator,
    denominator: left.denominator * right.denominator,
  });
}

export function formatFraction(fraction: Fraction): string {
  const simplified = simplifyFraction(fraction);

  if (simplified.denominator === 1) {
    return String(simplified.numerator);
  }

  return `${simplified.numerator}/${simplified.denominator}`;
}

export function areFractionsEquivalent(left: Fraction, right: Fraction): boolean {
  const simplifiedLeft = simplifyFraction(left);
  const simplifiedRight = simplifyFraction(right);

  return (
    simplifiedLeft.numerator === simplifiedRight.numerator &&
    simplifiedLeft.denominator === simplifiedRight.denominator
  );
}

export function parseFractionInput(input: string): Fraction | null {
  const match = input.trim().match(/^([+-]?\d+)(?:\s*\/\s*([+-]?\d+))?$/);

  if (!match) {
    return null;
  }

  const fraction = {
    numerator: Number(match[1]),
    denominator: match[2] ? Number(match[2]) : 1,
  };

  if (fraction.denominator === 0) {
    return null;
  }

  return fraction;
}
