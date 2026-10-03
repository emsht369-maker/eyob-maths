#!/usr/bin/env python3
"""Independently recompute every numeric answer in bank-answer-audit.json."""
import json
import math
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "tests" / "bank-answer-audit.json"


def evaluate(tree):
    if not isinstance(tree, list):
        return Fraction(tree)
    operation, *items = tree
    if operation == "pair":
        return evaluate(items[0]), evaluate(items[1])
    values = [evaluate(item) for item in items]
    if operation == "+":
        return values[0] + values[1]
    if operation == "-":
        return values[0] - values[1]
    if operation == "*":
        result = Fraction(1)
        for value in values:
            result *= value
        return result
    if operation == "/":
        return values[0] / values[1]
    if operation == "**":
        return values[0] ** int(values[1])
    if operation == "sqrt":
        number = values[0]
        if number.denominator == 1 and math.isqrt(number.numerator) ** 2 == number.numerator:
            return Fraction(math.isqrt(number.numerator))
        return math.sqrt(float(number))
    if operation == "round":
        number, place = values
        unit = 10 ** int(place)
        return Fraction(math.floor(float(number) / unit + 0.5) * unit)
    if operation == "gcd":
        return Fraction(math.gcd(int(values[0]), int(values[1])))
    if operation == "lcm":
        return Fraction(math.lcm(int(values[0]), int(values[1])))
    if operation == "prime_product":
        return Fraction(math.prod(int(value) for value in values))
    if operation == "pi":
        return math.pi * float(values[0])
    raise ValueError(f"Unsupported audit operation: {operation}")


def parse_expected(value):
    if isinstance(value, list):
        return tuple(Fraction(part) for part in value)
    return Fraction(value)


def same(actual, expected):
    if isinstance(actual, tuple):
        return len(actual) == len(expected) and all(same(a, e) for a, e in zip(actual, expected))
    if isinstance(actual, float):
        return math.isclose(actual, float(expected), rel_tol=1e-10, abs_tol=1e-10)
    return Fraction(actual) == expected


records = json.loads(AUDIT.read_text())
seen = set()
for record in records:
    if record["id"] in seen:
        raise SystemExit(f"Duplicate numeric answer audit id: {record['id']}")
    seen.add(record["id"])
    if not same(evaluate(record["expr"]), parse_expected(record["expected"])):
        raise SystemExit(f"Incorrect numeric answer: {record['id']}")
print(f"Python verified {len(records)} numeric bank answers.")
