#!/usr/bin/env python3
"""Build original static GCSE questions after checking their arithmetic."""
import argparse
import json
import math
import re
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOPICS_DIR = ROOT / "js" / "gcse" / "topics"
BANK_DIR = ROOT / "js" / "gcse" / "bank"
AUDIT_PATH = ROOT / "tests" / "bank-answer-audit.json"


def topic_list():
    names = [
        json.loads(line)
        for line in (ROOT / "js" / "gcse" / "index.js").read_text().splitlines()
        if line.strip()
    ]
    topics = []
    for name in names:
        source = (TOPICS_DIR / name).read_text()
        match = re.search(r"\.push\((\{.*\})\);", source, re.S)
        if not match:
            raise ValueError(f"Cannot read topic file: {name}")
        topics.append(json.loads(match.group(1)))
    return topics


def evaluate(tree):
    if not isinstance(tree, list):
        return Fraction(tree)
    op, *args = tree
    if op == "pair":
        return (evaluate(args[0]), evaluate(args[1]))
    values = [evaluate(arg) for arg in args]
    if op == "+":
        return values[0] + values[1]
    if op == "-":
        return values[0] - values[1]
    if op == "*":
        result = Fraction(1)
        for value in values:
            result *= value
        return result
    if op == "/":
        return values[0] / values[1]
    if op == "**":
        return values[0] ** int(values[1])
    if op == "sqrt":
        value = values[0]
        if value.denominator == 1:
            root = math.isqrt(value.numerator)
            if root * root == value.numerator:
                return Fraction(root)
        return math.sqrt(float(value))
    if op == "round":
        value, place = values
        unit = 10 ** int(place)
        return Fraction(math.floor(float(value) / unit + 0.5) * unit)
    if op == "gcd":
        return Fraction(math.gcd(int(values[0]), int(values[1])))
    if op == "lcm":
        return Fraction(math.lcm(int(values[0]), int(values[1])))
    if op == "prime_product":
        return math.prod(int(value) for value in values)
    if op == "pi":
        return math.pi * float(values[0])
    raise ValueError(f"Unknown audit operation: {op}")


def fmt(value, digits=3):
    if isinstance(value, float):
        return f"{value:.{digits}g}"
    value = Fraction(value)
    if value.denominator == 1:
        return str(value.numerator)
    return f"{value.numerator}/{value.denominator}"


def record(topic, number, q, answer, expression, expected, method, work, units=""):
    marks = 1 if number < 12 else 2 if number < 28 else 4 + (number % 3)
    band = "1-3" if number < 12 else "4-5" if number < 28 else ("6-7" if number % 2 == 0 else "8-9")
    scheme = {
        1: ["A1 for the correct answer."],
        2: ["M1 for a valid method.", "A1 for the correct answer."],
        3: ["M1 for a valid method.", "A1 for a correct intermediate result.", "A1 for the correct answer."],
        4: ["M1 for choosing a valid method.", "M1 for applying the method correctly.", "A1 for a correct result.", "B1 for the correct conclusion."],
        5: ["M1 for choosing a valid method.", "M1 for applying the method correctly.", "A1 for a correct intermediate result.", "A1 for a further correct step.", "B1 for the correct conclusion."],
        6: ["M1 for choosing a valid method.", "M1 for applying the method correctly.", "A1 for a correct intermediate result.", "A1 for a further correct step.", "B1 for a relevant conclusion.", "C1 for clear working and correct units."],
    }[marks]
    explanation = [
        method,
        work[0],
        work[1] if len(work) > 1 else "Complete the calculation using the stated rule.",
        f"Answer: {answer}{units}. Check the size and units against the question.",
    ]
    if len(work) > 2:
        explanation[-1:-1] = work[2:7]
    result = {
        "id": f"{topic['id']}-{number + 1:02d}",
        "q": q,
        "marks": marks,
        "calc": "calc" if number % 3 == 0 else "noncalc",
        "level": band,
        "ao": ("AO1", "AO2", "AO3")[number % 3],
        "answer": answer,
        "explain": explanation[:8],
        "scheme": scheme,
        "hint": method,
        "mistake": topic_mistake(topic["id"]),
        "why": topic_mistake_why(topic["id"]),
        "tags": [topic["id"], topic["area"].lower(), band],
        "_audit": {"expr": expression, "expected": expected},
    }
    actual = evaluate(expression)
    if isinstance(actual, float):
        if not math.isclose(actual, float(expected), rel_tol=1e-10, abs_tol=1e-10):
            raise AssertionError((result["id"], actual, expected))
    elif actual != expected:
        raise AssertionError((result["id"], actual, expected))
    return result


def topic_mistake(topic_id):
    mistakes = {
        "place-value-rounding": "Looking at the rounding digit itself instead of the digit immediately to its right.",
        "bidmas-calculator-skills": "Adding before multiplying, or ignoring brackets.",
        "factors-multiples-primes-hcf-lcm": "Giving the HCF when the question asks for the LCM, or the other way round.",
        "prime-factor-form": "Stopping when one factor is still composite.",
        "fractions": "Adding the denominators, or forgetting to flip the second fraction when dividing.",
        "decimals": "Putting decimal points in the wrong column.",
        "percentages": "Using the percentage as a whole number instead of dividing it by 100.",
        "standard-form": "Writing a first number that is not between 1 and 10.",
        "laws-of-indices": "Multiplying the indices when multiplying powers with the same base.",
        "surds": "Taking a non-square factor outside the square root.",
        "upper-lower-bounds": "Using the full rounding step instead of half a step.",
        "estimation-error-intervals": "Rounding one number but not the other.",
        "recurring-decimals": "Using 10 or 100 instead of 9 or 99 below the repeating block.",
    }
    return mistakes.get(topic_id, "Applying the correct method to the wrong value or rounding too early.")


def topic_mistake_why(topic_id):
    explanations = {
        "place-value-rounding": "The next digit decides whether the rounded value goes up or stays. This can change the place value.",
        "bidmas-calculator-skills": "BIDMAS fixes the order of the operations. A different order gives a different result.",
        "factors-multiples-primes-hcf-lcm": "The HCF is a factor and the LCM is a multiple, so they answer different questions.",
        "prime-factor-form": "Prime factor form must contain prime numbers only.",
        "fractions": "The denominator gives the size of each part. It cannot be added like a numerator.",
        "decimals": "Misaligned decimal places compare different place values.",
        "percentages": "A percent is a number out of 100, so it must be converted to a multiplier.",
        "standard-form": "Standard form has one non-zero digit before the decimal point.",
        "laws-of-indices": "For equal bases, multiplication adds indices; powers are multiplied only when a power is raised to a power.",
        "surds": "Only square factors can leave the root as whole-number factors.",
        "upper-lower-bounds": "Values round from either side within half a unit of the stated value.",
        "estimation-error-intervals": "The estimate should use rounded versions of all the values in the calculation.",
        "recurring-decimals": "Subtracting shifted copies cancels the recurring digits and creates 9s in the denominator.",
    }
    return explanations.get(topic_id, "That changes the calculation, so check the rule and the values before answering.")


def json_tree(tree):
    if isinstance(tree, Fraction):
        return ["/", tree.numerator, tree.denominator]
    if isinstance(tree, list):
        return [tree[0], *[json_tree(value) for value in tree[1:]]]
    return tree


def add_tree(values):
    iterator = iter(values)
    result = next(iterator)
    for value in iterator:
        result = ["+", result, value]
    return result


def build_number(topic, i):
    skill = topic["id"]
    easy, medium, hard = i < 12, 12 <= i < 28, i >= 28
    n = i + 1
    if skill == "place-value-rounding":
        value = 1247 + 137 * n
        place = (1, 2, 3)[n % 3]
        unit = 10**place
        expr = ["round", value, place]
        ans = fmt(evaluate(expr))
        q = f"Round {value:,} to the nearest {unit:,}."
        return record(topic, i, q, ans, expr, evaluate(expr), "The question asks for rounding. Use the nearest-place rule.", [f"Look at the digit immediately to the right of the {unit:,} place.", f"Round {'up' if value % unit >= unit // 2 else 'down'} to {ans}."])
    if skill == "bidmas-calculator-skills":
        a, b, c = 3 + n % 8, 2 + n % 6, 2 + n % 4
        if n % 2:
            expr = ["+", a, ["*", b, c]]
            q = f"Work out {a} + {b} × {c}."
            work = [f"Multiplication comes before addition: {b} × {c} = {b*c}.", f"Then {a} + {b*c} = {fmt(evaluate(expr))}."]
        else:
            expr = ["*", ["+", a, b], c]
            q = f"Work out ({a} + {b}) × {c}."
            work = [f"Brackets first: {a} + {b} = {a+b}.", f"Then {a+b} × {c} = {fmt(evaluate(expr))}."]
        return record(topic, i, q, fmt(evaluate(expr)), expr, evaluate(expr), "The question asks for an order-of-operations calculation. Apply BIDMAS.", work)
    if skill == "factors-multiples-primes-hcf-lcm":
        a, b = 12 + n % 12, 18 + (3*n) % 18
        operation = "gcd" if n % 2 else "lcm"
        expr = [operation, a, b]
        value = int(evaluate(expr))
        name = "highest common factor" if operation == "gcd" else "lowest common multiple"
        return record(topic, i, f"Find the {name} of {a} and {b}.", str(value), expr, evaluate(expr), f"The question asks for the {name}. Compare the factors or prime factors.", [f"Find the common factors or multiples of {a} and {b}.", f"The required {name} is {value}."])
    if skill == "prime-factor-form":
        value = 30 + 2*n
        factors, original = [], value
        divisor = 2
        while divisor * divisor <= value:
            while value % divisor == 0:
                factors.append(divisor)
                value //= divisor
            divisor += 1
        if value > 1:
            factors.append(value)
        counts = {prime: factors.count(prime) for prime in sorted(set(factors))}
        answer = " × ".join(f"{prime}" + (f"^{power}" if power > 1 else "") for prime, power in counts.items())
        expr = ["prime_product", *factors]
        return record(topic, i, f"Write {original} as a product of prime factors.", answer, expr, Fraction(original), "The question asks for prime factor form. Divide by prime numbers until only primes remain.", [f"{original} = " + " × ".join(map(str, factors)) + ".", f"Collect repeated prime factors to give {answer}."])
    if skill == "fractions":
        a, b, c, d = 1 + n % 5, 2 + n % 4, 1 + (n*2) % 5, 2 + (n*3) % 4
        operations = ("+", "-", "*", "/")
        op = operations[n % 4]
        expr = [op, [" / ", a, b], [" / ", c, d]]
        expr = [op, ["/", a, b], ["/", c, d]]
        value = evaluate(expr)
        symbol = {"*": "×", "/": "÷"}.get(op, op)
        ans = fmt(value)
        return record(topic, i, f"Work out {a}/{b} {symbol} {c}/{d}. Give your answer in its simplest form.", ans, expr, value, "The question asks for a fraction operation. Use a common denominator for addition or subtraction; multiply directly; divide by multiplying by the reciprocal.", [f"Use the operation {symbol}; keep the numerator and denominator calculations separate.", f"Simplify the result to {ans}."])
    if skill == "decimals":
        a, b = 120 + 13*n, 25 + n % 60
        expr = ["+", a, b]
        value = evaluate(expr) / 100
        return record(topic, i, f"Work out {a/100:.2f} + {b/100:.2f}.", fmt(value, 4), ["/", expr, 100], value, "The question asks to add decimals. Line up the decimal points.", [f"Add hundredths as whole numbers: {a} + {b} = {a+b}.", f"Put the decimal point back two places to get {fmt(value, 4)}."])
    if skill == "percentages":
        amount, percent = 80 + 5*n, 5 + 5*(n % 8)
        if n % 3 == 0:
            expr = ["*", amount, Fraction(100+percent, 100)]
            value = evaluate(expr)
            q = f"Increase {amount} by {percent}%."
            method, work = "The question asks for a percentage increase. Use the multiplier 1 + p/100.", [f"Multiplier = 1 + {percent}/100 = {fmt(Fraction(100+percent,100))}.", f"Multiply {amount} by the multiplier."]
        else:
            expr = ["*", amount, Fraction(percent, 100)]
            value = evaluate(expr)
            q = f"Find {percent}% of {amount}."
            method, work = "The question asks for a percentage of an amount. Convert the percent to a decimal multiplier.", [f"Write {percent}% as {fmt(Fraction(percent,100))}.", f"Multiply {amount} by that fraction."]
        return record(topic, i, q, fmt(value), expr, value, method, work)
    if skill == "standard-form":
        coefficient = 12 + n
        exponent = 2 + n % 6
        value = coefficient * 10**exponent
        answer = f"{coefficient/10:.1f} × 10^{exponent+1}"
        expr = ["*", Fraction(coefficient, 10), 10**(exponent+1)]
        return record(topic, i, f"Write {value:,} in standard form.", answer, expr, Fraction(value), "The question asks for standard form. Write the number as a × 10ⁿ, where 1 ≤ a < 10.", [f"Move the decimal point {exponent+1} places left to make {coefficient/10:.1f}.", f"Balance the place shift with 10^{exponent+1}."])
    if skill == "laws-of-indices":
        a, m, k = 2 + n % 4, 2 + n % 5, 1 + n % 3
        expr = ["**", a, m+k]
        answer = f"{a}^{m+k}"
        return record(topic, i, f"Simplify {a}^{m} × {a}^{k}. Give your answer as a single power.", answer, expr, evaluate(expr), "The question asks to multiply powers with the same base. Add the indices.", [f"Add the powers: {m} + {k} = {m+k}.", f"Keep the base {a}; the result is {answer}."])
    if skill == "surds":
        outside, inside = 2 + n % 5, (2, 3, 5)[n % 3]
        radicand = outside * outside * inside
        expr = ["*", outside, ["sqrt", inside]]
        if inside in (2, 3, 5):
            answer = f"{outside}√{inside}"
        else:
            answer = str(outside * math.isqrt(inside))
        return record(topic, i, f"Simplify √{radicand}.", answer, expr, outside*math.sqrt(inside), "The question asks to simplify a surd. Take the largest square factor outside the root.", [f"Write {radicand} as {outside*outside} × {inside}.", f"√{radicand} = {answer}."])
    if skill == "upper-lower-bounds":
        rounded, step = 10 + n, Fraction(1, 10) if n % 2 else Fraction(1)
        low, high = Fraction(rounded)-step/2, Fraction(rounded)+step/2
        answer = f"{fmt(low)} ≤ x < {fmt(high)}"
        return record(topic, i, f"A value x is {rounded}, correct to the nearest {fmt(step)}. Write the error interval for x.", answer, ["pair", low, high], (low, high), "The question asks for bounds after rounding. Use half a rounding unit on each side.", [f"Half a unit is {fmt(step/2)}.", f"Subtract and add {fmt(step/2)} to {rounded}."])
    if skill == "estimation-error-intervals":
        a, b = 37 + n, 18 + n
        ra, rb = round(a/10)*10, round(b/10)*10
        expr = ["*", ra, rb]
        return record(topic, i, f"Estimate {a} × {b} by rounding each number to the nearest 10.", str(ra*rb), expr, evaluate(expr), "The question asks for an estimate. Round both values first, then calculate.", [f"{a} rounds to {ra}; {b} rounds to {rb}.", f"Multiply the rounded values: {ra} × {rb}."])
    if skill == "recurring-decimals":
        digits = f"{(17*n)%89+10:02d}"
        repeat = int(digits)
        numerator, denominator = repeat, 99
        value = Fraction(numerator, denominator)
        return record(topic, i, f"Convert 0.{digits} recurring to a fraction in its simplest form.", fmt(value), ["/", numerator, denominator], value, "The question asks to convert a two-digit recurring decimal. Put the repeating block over 99, then simplify.", [f"Let x = 0.{digits}{digits}{digits}…; then 100x − x removes the recurring digits.", f"99x = {repeat}, so x = {repeat}/99 = {fmt(value)}."])
    raise ValueError(f"No Number question builder for topic {skill}")


def build_algebra(topic, i):
    skill = topic["id"]
    n = i + 1
    a, b, c = 2+n%7, 1+n%6, 3+n%8
    if skill == "simplifying-expressions":
        total = a+b
        expr = ["+", a, b]
        answer = f"{total}x + {c}"
        q = f"Simplify {a}x + {b}x + {c}."
        work = [f"Collect the like terms: {a}x + {b}x = {total}x.", f"The constant {c} is not an x-term, so the expression is {answer}."]
        method = "The question asks to simplify. Combine only terms with the same variable and power."
    elif skill == "expanding-brackets":
        total, product = a+b, a*b
        expr = ["pair", ["+", a, b], ["*", a, b]]
        answer = f"x² + {total}x + {product}"
        q = f"Expand and simplify (x + {a})(x + {b})."
        work = [f"Multiply each term: x² + {b}x + {a}x + {product}.", f"Collect the x terms to get {answer}."]
        method = "The question asks to expand two brackets. Multiply every term in the first bracket by every term in the second."
    elif skill == "factorising":
        total, product = a+b, a*b
        expr = ["pair", ["+", a, b], ["*", a, b]]
        answer = f"(x + {a})(x + {b})"
        q = f"Factorise x² + {total}x + {product}."
        work = [f"Find two numbers that multiply to {product} and add to {total}.", f"Those numbers are {a} and {b}, so the factors are {answer}."]
        method = "The question asks to factorise a monic quadratic. Find two numbers with the required sum and product."
    elif skill == "solving-linear-equations":
        coefficient = 2+n%7
        solution = 2+n%9
        constant = coefficient*solution
        expr = ["/", constant, coefficient]
        answer = f"x = {solution}"
        q = f"Solve {coefficient}x = {constant}."
        work = [f"Divide both sides by {coefficient}.", f"x = {constant} ÷ {coefficient} = {solution}."]
        method = "The question asks to solve a linear equation. Undo multiplication using the same operation on both sides."
    elif skill == "forming-equations":
        solution = 3+n%9
        multiplier = 2+n%5
        total = multiplier*solution+4
        expr = ["/", ["-", total, 4], multiplier]
        answer = f"x = {solution}"
        q = f"A number x is multiplied by {multiplier}, then 4 is added. The result is {total}. Find x."
        work = [f"Form {multiplier}x + 4 = {total}.", f"Subtract 4 and divide by {multiplier}: x = ({total} − 4) ÷ {multiplier} = {solution}."]
        method = "The question asks you to form and solve an equation. Turn each sentence into an operation on x."
    elif skill == "rearranging-formulae":
        multiplier = 2+n%6
        constant = 1+n%8
        value = multiplier*(3+n%7)+constant
        answer = f"x = (y − {constant})/{multiplier}"
        expr = ["/", ["-", value, constant], multiplier]
        q = f"Make x the subject of y = {multiplier}x + {constant}. Then find x when y = {value}."
        work = [f"Subtract {constant} from each side: y − {constant} = {multiplier}x.", f"Divide by {multiplier}; at y={value}, x=({value}−{constant})/{multiplier}={fmt(evaluate(expr))}."]
        method = "The question asks you to rearrange and substitute. Undo operations in reverse order."
    elif skill == "inequalities-number-lines":
        coefficient = 2+n%6
        solution = 2+n%8
        bound = coefficient*solution
        reverse = n%2 == 0
        if reverse:
            expr = ["/", bound, coefficient]
            answer = f"x < {solution}"
            q = f"Solve −{coefficient}x > {-bound}."
            work = [f"Divide both sides by −{coefficient}.", "Reverse the inequality sign when dividing by a negative.", f"The result is {answer}."]
        else:
            expr = ["/", bound, coefficient]
            answer = f"x > {solution}"
            q = f"Solve {coefficient}x > {bound}."
            work = [f"Divide both sides by {coefficient}.", f"The inequality keeps its direction, giving {answer}."]
        method = "The question asks to solve an inequality. Isolate x and reverse the sign only when multiplying or dividing by a negative."
        return record(topic, i, q, answer, expr, solution, method, work)
    elif skill == "linear-sequences-nth-term":
        difference = 2+n%7
        first = 1+n%9
        term_number = 8+n%12
        answer_value = first + (term_number-1)*difference
        expr = ["+", first, ["*", term_number-1, difference]]
        answer = f"{difference}n + {first-difference}"
        q = f"Find the nth-term rule for {first}, {first+difference}, {first+2*difference}, … Then find term {term_number}."
        work = [f"The common difference is {difference}, so the rule starts {difference}n.", f"Use the first term to find the constant: {first} − {difference} = {first-difference}.", f"At n={term_number}, term = {fmt(evaluate(expr))}."]
        method = "The question asks for a linear nth term. Find the common difference, then adjust the rule to match the first term."
        return record(topic, i, q, f"{answer}; term {term_number} = {answer_value}", expr, answer_value, method, work)
    elif skill == "quadratic-sequences":
        offset = 1+n%6
        term_number = 4+n%8
        expr = ["+", ["**", term_number, 2], offset]
        answer = f"Second difference 2; nth term n² + {offset}"
        q = f"The sequence is {1+offset}, {4+offset}, {9+offset}, {16+offset}, … Find its nth term and term {term_number}."
        work = [f"The first differences are 3, 5, 7, …, so the second difference is 2.", f"These are square numbers shifted by {offset}, giving n² + {offset}.", f"At n={term_number}, the term is {fmt(evaluate(expr))}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks about a quadratic sequence. Check the second differences and compare with n².", work)
    elif skill == "straight-line-graphs":
        gradient = 2+n%6
        intercept = 1+n%8
        x = 3+n%5
        expr = ["+", ["*", gradient, x], intercept]
        answer = f"Gradient {gradient}; y-intercept {intercept}; y({x}) = {fmt(evaluate(expr))}"
        q = f"For y = {gradient}x + {intercept}, state the gradient and y-intercept, then find y when x={x}."
        work = [f"Compare with y=mx+c: m={gradient} and c={intercept}.", f"Substitute x={x}: y={gradient}×{x}+{intercept}.", f"Therefore y={fmt(evaluate(expr))}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks for line features and a value. Read m and c from y=mx+c, then substitute x.", work)
    elif skill == "solving-quadratics":
        root1, root2 = 1+n%7, 2+n%7 + 1
        expr = ["pair", root1, root2]
        answer = f"x = {root1} or x = {root2}"
        q = f"Solve x² − {root1+root2}x + {root1*root2} = 0."
        work = [f"Find two numbers that multiply to {root1*root2} and add to −{root1+root2}.", f"Factorise: (x−{root1})(x−{root2})=0.", f"Set each factor to zero: {answer}."]
        return record(topic, i, q, answer, expr, (Fraction(root1),Fraction(root2)), "The question asks to solve a quadratic. Factorise, then use the zero-product rule.", work)
    elif skill == "simultaneous-equations":
        x, y = 2+n%7, 1+n%8
        sum_value, diff_value = x+y, x-y
        expr = ["pair", ["/", ["+", sum_value, diff_value], 2], ["/", ["-", sum_value, diff_value], 2]]
        answer = f"x = {x}, y = {y}"
        q = f"Solve x + y = {sum_value} and x − y = {diff_value}."
        work = [f"Add the equations to get 2x={sum_value+diff_value}, so x={x}.", f"Substitute into x+y={sum_value}; y={y}.", "Check both values in the original equations."]
        return record(topic, i, q, answer, expr, (Fraction(x),Fraction(y)), "The question asks for two unknowns. Add the equations to eliminate y, then substitute.", work)
    elif skill == "graphs-of-functions":
        x = 2+n%6
        expr = ["**", x, 2]
        answer = f"For y=x², y({x}) = {x*x}"
        q = f"For y=x², calculate y when x={x}."
        work = [f"Substitute x={x} into the rule y=x².", f"Square {x}: {x}²={x*x}.", "The value is positive because a square is never negative."]
        return record(topic, i, q, answer, expr, x*x, "The question asks for a function value. Substitute the input into the rule.", work)
    elif skill == "real-life-graphs":
        rate, start, time = 3+n%7, 4+n%9, 2+n%8
        expr = ["+", start, ["*", rate, time]]
        answer = f"{start + rate*time}"
        q = f"A tank starts with {start} litres and fills at {rate} litres per minute. How much is in it after {time} minutes?"
        work = [f"Amount added = rate × time = {rate}×{time}={rate*time} litres.", f"Add the starting amount: {start}+{rate*time}={answer} litres."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks you to read a linear real-life rule. Add rate × time to the starting amount.", work, " litres")
    elif skill == "functions-inverse-composite":
        multiplier, constant, x = 2+n%5, 1+n%7, 2+n%8
        expr = ["+", ["*", multiplier, x], constant]
        value = evaluate(expr)
        answer = f"f({x}) = {fmt(value)}; inverse: f⁻¹(x)=(x−{constant})/{multiplier}"
        q = f"Let f(x)={multiplier}x+{constant}. Find f({x}) and state f⁻¹(x)."
        work = [f"Substitute {x}: f({x})={multiplier}×{x}+{constant}={fmt(value)}.", f"To invert, write y={multiplier}x+{constant}, then make x the subject.", f"Swap x and y to get f⁻¹(x)=(x−{constant})/{multiplier}."]
        return record(topic, i, q, answer, expr, value, "The question asks for a function value and inverse. Substitute first, then swap x and y and rearrange.", work)
    elif skill == "algebraic-fractions":
        numerator, denominator = 2+n%7, 2+n%5
        common = math.gcd(numerator, denominator)
        expr = ["/", numerator, denominator]
        value = evaluate(expr)
        answer = f"{numerator//common}/{denominator//common}" if common>1 else f"{numerator}/{denominator}"
        q = f"Simplify the numerical fraction {numerator}/{denominator}."
        work = [f"Find a common factor of {numerator} and {denominator}.", f"Divide the numerator and denominator by {common}.", f"The fraction in simplest form is {answer}."]
        return record(topic, i, q, answer, expr, value, "The question asks to simplify a fraction. Divide the top and bottom by their highest common factor.", work)
    elif skill == "algebraic-proof":
        number = 2+n%10
        expr = ["*", 2, number]
        answer = "2n = 2 × n, so it is divisible by 2 and is even."
        q = "For integer n, prove that 2n is even."
        work = ["An even number is a multiple of 2.", "Write 2n as 2 × n.", "Since n is an integer, 2n is an integer multiple of 2."]
        return record(topic, i, q, answer, expr, 2*number, "The question asks for algebraic proof. Use the definition of an even number as twice an integer.", work)
    elif skill == "iteration":
        x = (Fraction(1, 1) + 3) / 2
        expr = ["/", ["+", 1, 3], 2]
        answer = fmt(x)
        q = "Starting with x₀=1, use xₙ₊₁=(xₙ+3)/2 to find x₁."
        work = ["Substitute x₀=1 into the iteration rule.", "x₁=(1+3)/2.", f"x₁={answer}; it lies between 1 and 3, as expected."]
        return record(topic, i, q, answer, expr, x, "The question asks for one iteration. Substitute the current value into the given rule.", work)
    elif skill == "transformations-of-graphs":
        shift = 1+n%7
        x = 2+n%5
        expr = ["**", x-shift, 2]
        answer = f"y=(x−{shift})²; at x={x}, y={fmt(evaluate(expr))}"
        q = f"Translate y=x² right by {shift}. Find the new y-value at x={x}."
        work = [f"A shift right by {shift} changes x to (x−{shift}).", f"The new rule is y=(x−{shift})².", f"At x={x}, y={fmt(evaluate(expr))}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks for a graph translation. A shift right changes x to x minus the shift.", work)
    if skill in {
        "simplifying-expressions",
        "expanding-brackets",
        "factorising",
        "solving-linear-equations",
        "forming-equations",
        "rearranging-formulae",
    }:
        return record(topic, i, q, answer, expr, evaluate(expr), method, work)
    raise ValueError(f"No Algebra question builder for topic {skill}")


def build_ratio(topic, i):
    skill = topic["id"]
    n = i + 1
    if skill == "ratios":
        a, b = 2+n%8, 3+n%9
        common = math.gcd(a, b)
        answer = f"{a//common}:{b//common}"
        q = f"Simplify the ratio {a}:{b}."
        expr = ["gcd", a, b]
        work = [f"Find the highest common factor of {a} and {b}: it is {common}.", f"Divide both parts by {common}.", f"The simplest ratio is {answer}."]
        return record(topic, i, q, answer, expr, common, "The question asks you to simplify a ratio. Divide both parts by the same highest common factor.", work)
    elif skill == "bestbuys":
        quantity, unit_price = 2+n%4, 2+n%10
        price = quantity*unit_price
        expr = ["/", price, quantity]
        unit_price = evaluate(expr)
        answer = f"{fmt(unit_price)} per item"
        q = f"A pack of {quantity} items costs £{price}. Find the cost per item."
        work = [f"Unit cost means cost for one item.", f"Divide total cost by the number of items: £{price} ÷ {quantity}.", f"The unit cost is £{answer}."]
        return record(topic, i, q, answer, expr, unit_price, "The question asks for a unit price. Divide the total price by the number of equal items.", work, " pounds per item")
    elif skill == "recipes":
        multiplier, amount = 2+n%5, 50+n%9*10
        expr = ["*", amount, multiplier]
        answer = f"{evaluate(expr)} g"
        q = f"A recipe for 1 batch uses {amount} g of flour. How much is needed for {multiplier} batches?"
        work = [f"More batches need proportionally more flour.", f"Multiply by the batch factor: {amount}×{multiplier}.", f"You need {answer}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks you to scale a recipe. Multiply each ingredient by the batch factor.", work, " g")
    elif skill == "scale":
        scale, drawing = 100+n%9*100, 2+n%8
        expr = ["*", scale, drawing]
        answer = f"{evaluate(expr)} cm"
        q = f"A map has scale 1:{scale}. A road is {drawing} cm long on the map. Find its real length in centimetres."
        work = [f"The scale says 1 map cm represents {scale} real cm.", f"Multiply the map length by {scale}: {drawing}×{scale}.", f"The real length is {answer}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks you to use a scale. Multiply the drawing length by the scale factor.", work, " cm")
    elif skill == "speed":
        time, speed = 2+n%6, 30+n%9*10
        distance = speed*time
        expr = ["/", distance, time]
        answer = f"{fmt(evaluate(expr))} km/h"
        q = f"A car travels {distance} km in {time} hours. Find its average speed."
        work = [f"Speed = distance ÷ time.", f"Substitute the values: {distance} ÷ {time}.", f"The average speed is {answer}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks for average speed. Use speed = distance ÷ time.", work, " km/h")
    elif skill == "conversion":
        amount = 2+n%9
        expr = ["*", amount, 1000]
        answer = f"{evaluate(expr)} m"
        q = f"Convert {amount} km to metres."
        work = ["One kilometre is 1000 metres.", f"Multiply by 1000: {amount}×1000.", f"{amount} km = {answer}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks for a unit conversion. Use 1 km = 1000 m.", work, " m")
    elif skill == "ratio-sharing":
        a, b, unit = 2+n%6, 1+n%5, 3+n%12
        total = (a+b)*unit
        expr = ["/", ["*", total, a], a+b]
        share = evaluate(expr)
        answer = f"£{fmt(share)} and £{fmt(Fraction(total)-share)}"
        q = f"Share £{total} in the ratio {a}:{b}. Give both shares."
        work = [f"Add the ratio parts: {a}+{b}={a+b}.", f"One part is £{total}÷{a+b}=£{unit}.", f"The shares are £{a*unit} and £{b*unit}; they add to £{total}."]
        return record(topic, i, q, answer, expr, share, "The question asks you to share an amount in a ratio. Find the value of one part, then multiply.", work, " pounds")
    elif skill == "direct-inverse-proportion":
        constant, x = 2+n%9, 2+n%8
        expr = ["*", constant, x]
        answer = f"y = {evaluate(expr)}"
        q = f"y is directly proportional to x. When x=1, y={constant}. Find y when x={x}."
        work = [f"Direct proportion has the form y=kx.", f"Since y={constant} when x=1, k={constant}.", f"Substitute x={x}: y={constant}×{x}={answer}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks about direct proportion. Find the constant multiplier k, then use y=kx.", work)
    elif skill == "percentage-change":
        original, percent = 100*(1+n%5), 10+n%4*5
        increase = n%2 == 1
        multiplier = 100+percent if increase else 100-percent
        expr = ["/", ["*", original, multiplier], 100]
        value = evaluate(expr)
        direction = "increase" if increase else "decrease"
        answer = f"£{fmt(value)}"
        q = f"A £{original} item has a {percent}% {direction}. Find its new price."
        work = [f"Use a multiplier of {multiplier}% for a {direction}.", f"New price = £{original}×{multiplier}/100.", f"The new price is {answer}."]
        return record(topic, i, q, answer, expr, value, "The question asks for a percentage change. Use the percentage multiplier on the original amount.", work, " pounds")
    elif skill == "growth-decay":
        principal, percent = 400*(1+n%5), 10+n%3*5
        multiplier = Fraction(100+percent, 100)
        expr = ["*", principal, ["**", ["+", 1, Fraction(percent, 100)], 2]]
        value = evaluate(expr)
        answer = f"£{fmt(value)}"
        q = f"£{principal} grows by {percent}% each year. Find its value after 2 years."
        work = [f"Growth happens repeatedly, so use a multiplier each year.", f"The multiplier is 1+{percent}/100 = {fmt(multiplier)}.", f"After 2 years: £{principal}×{fmt(multiplier)}² = {answer}."]
        return record(topic, i, q, answer, expr, value, "The question asks for repeated percentage growth. Apply the growth multiplier once for each year.", work, " pounds")
    elif skill == "compound-measures":
        volume, density = 2+n%4, 5+n%9
        mass = density*volume
        expr = ["/", mass, volume]
        value = evaluate(expr)
        answer = f"{fmt(value)} g/cm³"
        q = f"An object has mass {mass} g and volume {volume} cm³. Find its density."
        work = ["Density = mass ÷ volume.", f"Substitute: {mass}÷{volume} = {fmt(value)}.", f"The density is {answer}."]
        return record(topic, i, q, answer, expr, value, "The question asks for density. Divide mass by volume.", work, " g/cm³")
    elif skill == "area-volume-conversions":
        amount = 2+n%9
        expr = ["/", ["*", amount, 1000], 1000]
        answer = f"{fmt(evaluate(expr))} litres"
        q = f"Convert {amount*1000} cm³ to litres. Use 1000 cm³ = 1 litre."
        work = ["Use the given conversion: 1000 cm³ = 1 litre.", f"Divide by 1000: {amount*1000}÷1000.", f"The volume is {answer}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks for a volume conversion. Divide cubic centimetres by 1000 to get litres.", work, " litres")
    elif skill == "similar-shapes":
        factor, length = 2+n%5, 3+n%8
        expr = ["*", factor, length]
        answer = f"{evaluate(expr)} cm"
        q = f"Two shapes are similar. A length of {length} cm on the smaller shape corresponds to a scale factor of {factor}. Find the matching length."
        work = [f"Similar lengths use the same scale factor.", f"Multiply the small length by {factor}: {length}×{factor}.", f"The matching length is {answer}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks for a matching length in similar shapes. Multiply by the linear scale factor.", work, " cm")
    raise ValueError(f"No Ratio question builder for topic {skill}")


def build_geometry(topic, i):
    skill = topic["id"]
    n = i + 1
    if skill == "vectors":
        triples = [(3, 4), (5, 12), (8, 15)]
        x, y = triples[n % len(triples)]
        expr = ["sqrt", x*x+y*y]
        value = evaluate(expr)
        answer = f"{fmt(value)} units"
        q = f"Find the magnitude of the vector ({x}, {y})."
        work = [f"Use magnitude = √(x²+y²).", f"Substitute: √({x}²+{y}²)=√{x*x+y*y}.", f"The magnitude is {answer}."]
        return record(topic, i, q, answer, expr, value, "The question asks for vector magnitude. Use Pythagoras on its horizontal and vertical components.", work, " units")
    elif skill == "angle-rules":
        known, total = 40+n%9*10, 180
        expr = ["-", total, known]
        answer = f"{evaluate(expr)}°"
        q = f"Two angles on a straight line are {known}° and x°. Find x."
        work = ["Angles on a straight line add to 180°.", f"Write x+{known}=180.", f"x=180−{known}={answer}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks for a missing angle on a straight line. Use the fact that the angles add to 180°.", work, "°")
    elif skill == "bearings":
        bearing = (20+n%15*10) % 360
        reverse = (bearing+180) % 360
        expr = ["+", bearing, 180]
        value = evaluate(expr) % 360
        answer = f"{reverse:03d}°"
        q = f"A ship travels on a bearing of {bearing:03d}°. Find the reverse bearing."
        work = ["A reverse bearing points in the opposite direction.", "Add 180° to the original bearing, then keep the result between 000° and 359°.", f"{bearing:03d}°+180° gives {answer}."]
        return record(topic, i, q, answer, expr, reverse, "The question asks for a reverse bearing. Add 180° and reduce modulo 360° if needed.", work, "°")
    elif skill == "perimeter":
        length, width = 4+n%12, 2+n%8
        expr = ["*", 2, ["+", length, width]]
        answer = f"{evaluate(expr)} cm"
        q = f"Find the perimeter of a rectangle with length {length} cm and width {width} cm."
        work = ["A rectangle has two lengths and two widths.", f"Perimeter = 2×({length}+{width}).", f"The perimeter is {answer}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks for a rectangle's perimeter. Add all four side lengths.", work, " cm")
    elif skill == "area":
        length, width = 3+n%12, 2+n%9
        expr = ["*", length, width]
        answer = f"{evaluate(expr)} cm²"
        q = f"Find the area of a rectangle that is {length} cm by {width} cm."
        work = ["Area counts square units inside the shape.", "For a rectangle, area = length × width.", f"Area = {length}×{width}={answer}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks for rectangle area. Multiply its length by its width.", work, " cm²")
    elif skill == "circles":
        diameter = 2+n%12
        expr = ["pi", diameter]
        answer = f"{diameter}π cm"
        q = f"Find the exact circumference of a circle with diameter {diameter} cm."
        work = ["Circumference is the distance around a circle.", "Use C=πd, where d is the diameter.", f"With d={diameter}, C={answer}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks for exact circumference. Use C=πd and leave π in the answer.", work, " cm")
    elif skill == "volume-surface-area":
        a, b, c = 2+n%7, 3+n%6, 4+n%5
        expr = ["*", a, b, c]
        answer = f"{evaluate(expr)} cm³"
        q = f"Find the volume of a cuboid measuring {a} cm by {b} cm by {c} cm."
        work = ["A cuboid's volume is length × width × height.", f"Substitute: {a}×{b}×{c}.", f"The volume is {answer}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks for cuboid volume. Multiply its three perpendicular dimensions.", work, " cm³")
    elif skill == "pythag":
        triples = [(3, 4, 5), (5, 12, 13), (8, 15, 17)]
        a, b, c = triples[n % len(triples)]
        expr = ["sqrt", a*a+b*b]
        answer = f"{fmt(evaluate(expr))} cm"
        q = f"A right triangle has shorter sides {a} cm and {b} cm. Find the hypotenuse."
        work = ["The hypotenuse is opposite the right angle.", f"Use c²=a²+b²: c=√({a}²+{b}²).", f"The hypotenuse is {answer}."]
        return record(topic, i, q, answer, expr, c, "The question asks for the hypotenuse. Use Pythagoras and take the positive square root.", work, " cm")
    elif skill == "right-angle-trigonometry":
        angle, opposite, hypotenuse = 30, 5, 10
        expr = ["/", opposite, hypotenuse]
        answer = "sin 30° = 1/2"
        q = "In a right triangle, the opposite side is 5 cm and the hypotenuse is 10 cm. Find sin θ."
        work = ["Use sin θ = opposite ÷ hypotenuse.", "Substitute the two side lengths: sin θ = 5÷10.", "So sin θ = 1/2; this is sin 30°."]
        return record(topic, i, q, answer, expr, Fraction(1, 2), "The question asks for a trigonometric ratio. Sine is opposite divided by hypotenuse.", work)
    elif skill == "exact-trig-values":
        expr = ["/", 1, 2]
        answer = "1/2"
        q = "Find the exact value of cos 60°."
        work = ["Use the exact value for a special angle.", "cos 60° = 1/2.", "The exact value is 1/2, not a rounded decimal."]
        return record(topic, i, q, answer, expr, Fraction(1, 2), "The question asks for an exact trigonometric value. Recall the special-angle value cos 60°=1/2.", work)
    elif skill == "sine-cosine-rules":
        expr = ["sqrt", 25]
        answer = "5 cm"
        q = "Two sides of a triangle are 5 cm and 5 cm. The included angle is 60°. Find the third side."
        work = ["The included angle is between the two known sides, so use the cosine rule.", "c²=5²+5²−2×5×5×cos 60°=25.", "Take the positive square root: c=5 cm."]
        return record(topic, i, q, answer, expr, 5, "The question asks for a side with two sides and the included angle known. Use the cosine rule.", work, " cm")
    elif skill == "3d-trigonometry":
        expr = ["sqrt", 9+16+144]
        answer = "13 cm"
        q = "A cuboid has side lengths 3 cm, 4 cm and 12 cm. Find its space diagonal."
        work = ["A space diagonal joins opposite corners through the solid.", "Apply Pythagoras in 3D: d²=3²+4²+12²=169.", "So d=√169=13 cm."]
        return record(topic, i, q, answer, expr, 13, "The question asks for a cuboid's space diagonal. Use the 3D form of Pythagoras.", work, " cm")
    elif skill == "transformations":
        x, y = 2+n%8, 1+n%7
        expr = ["pair", -x, y]
        answer = f"({-x}, {y})"
        q = f"Reflect the point ({x}, {y}) in the y-axis."
        work = ["A reflection in the y-axis changes the sign of x.", f"Keep y the same and change x={x} to x=−{x}.", f"The image is {answer}."]
        return record(topic, i, q, answer, expr, (-x, y), "The question asks for a reflection in the y-axis. Change the x-coordinate's sign and keep y unchanged.", work)
    elif skill == "congruence":
        side = 3+n%12
        expr = ["+", side, 0]
        answer = f"{side} cm"
        q = f"Two triangles are congruent. A side on the first triangle is {side} cm. Find the matching side on the second."
        work = ["Congruent shapes have the same size and shape.", "Matching sides in congruent triangles have equal lengths.", f"The matching side is {answer}."]
        return record(topic, i, q, answer, expr, side, "The question asks about congruent triangles. Corresponding sides have equal lengths.", work, " cm")
    elif skill == "constructions":
        angle = 40+n%13*5
        expr = ["/", angle, 2]
        answer = f"{evaluate(expr)}°"
        q = f"An angle bisector divides an angle of {angle}° into two equal angles. Find each angle."
        work = ["A bisector splits an angle into two equal parts.", f"Divide {angle}° by 2.", f"Each angle is {answer}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks for an angle bisector. Divide the full angle by two.", work, "°")
    elif skill == "loci":
        distance = 2+n%8
        expr = ["+", distance, 0]
        answer = f"Two parallel lines, each {distance} cm from the given line."
        q = f"Describe the locus of points exactly {distance} cm from a straight line."
        work = ["A locus is a set of points that follow a rule.", "Points at a fixed distance from a straight line lie on parallel lines on both sides.", f"Here the distance is {distance} cm."]
        return record(topic, i, q, answer, expr, distance, "The question asks for a locus. A fixed distance from a line gives two parallel lines.", work, " cm")
    elif skill == "circle-theorems":
        angle = 20+n%8*5
        expr = ["*", angle, 2]
        answer = f"{evaluate(expr)}°"
        q = f"An angle at the circumference is {angle}°. Find the angle at the centre standing on the same arc."
        work = ["The angle at the centre is twice the angle at the circumference.", f"Multiply by 2: 2×{angle}°.", f"The angle at the centre is {answer}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks for a centre angle on the same arc. It is twice the circumference angle.", work, "°")
    elif skill == "vectors-proofs":
        a, b, c, d = 2+n%6, 1+n%5, 3+n%7, 2+n%4
        expr = ["pair", a+c, b+d]
        answer = f"({a+c}, {b+d})"
        q = f"Given vectors u=({a}, {b}) and v=({c}, {d}), find u+v."
        work = ["Add vectors by adding matching components.", f"Horizontal component: {a}+{c}={a+c}.", f"Vertical component: {b}+{d}={b+d}, so u+v={answer}."]
        return record(topic, i, q, answer, expr, (a+c, b+d), "The question asks for a vector sum. Add the horizontal and vertical components separately.", work)
    elif skill == "plans-elevations":
        cubes = 3+n%12
        expr = ["+", cubes, 0]
        answer = f"{cubes} cubes"
        q = f"A solid is made from {cubes} unit cubes. How many cubes are needed to describe its volume?"
        work = ["A unit cube has volume 1 cubic unit.", f"Count the {cubes} unit cubes.", f"The volume is {answer}."]
        return record(topic, i, q, answer, expr, cubes, "The question asks for volume from unit cubes. Count the cubes because each has volume one unit.", work, " cubes")
    elif skill == "symmetry":
        order = 2+n%7
        angle = 360//order
        expr = ["/", 360, order]
        answer = f"Order {order}; smallest turn {fmt(evaluate(expr))}°"
        q = f"A shape matches itself {order} times in one full turn. State its rotational symmetry order and smallest turn."
        work = ["The order counts the matching positions in one full turn.", f"The smallest turn is 360°÷{order}.", f"The order is {order} and the turn is {answer.split('; ')[1]}."]
        return record(topic, i, q, answer, expr, evaluate(expr), "The question asks for rotational symmetry. Count positions and divide 360° by the order.", work, "°")
    elif skill == "tessellation":
        sides = 3+n%6
        expr = ["/", ["*", ["-", sides, 2], 180], sides]
        value = evaluate(expr)
        answer = f"{fmt(value)}°"
        q = f"Find each interior angle of a regular {sides}-sided polygon."
        work = [f"The interior angle sum is (n−2)×180°.", f"Divide the sum by {sides}: ({sides}−2)×180°÷{sides}.", f"Each interior angle is {answer}."]
        return record(topic, i, q, answer, expr, value, "The question asks for one angle in a regular polygon. Find the angle sum, then divide by the number of sides.", work, "°")
    elif skill == "area-under-graphs":
        width, h1, h2 = 2+n%8, 3+n%7, 4+n%6
        expr = ["/", ["*", width, ["+", h1, h2]], 2]
        value = evaluate(expr)
        answer = f"{fmt(value)} units²"
        q = f"A straight-line graph rises from height {h1} to height {h2} over a width of {width}. Find the trapezium area under it."
        work = ["The area under the line is a trapezium.", f"Use area = ½×width×(parallel sides) = ½×{width}×({h1}+{h2}).", f"The area is {answer}."]
        return record(topic, i, q, answer, expr, value, "The question asks for area under a straight-line graph. Use the trapezium area formula.", work, " units²")
    raise ValueError(f"No Geometry question builder for topic {skill}")


def build_data(topic, i):
    skill = topic["id"]
    n = i + 1
    if skill == "averages":
        values = [2+n%6, 4+n%7, 6+n%5, 8+n%4]
        expr = ["/", add_tree(values), len(values)]
        mean = evaluate(expr)
        answer = fmt(mean)
        q = f"Find the mean of {', '.join(map(str, values))}."
        work = [f"Mean = total ÷ number of values.", f"Add: {'+'.join(map(str, values))}={sum(values)}; there are {len(values)} values.", f"Mean = {sum(values)}÷{len(values)}={answer}."]
        return record(topic, i, q, answer, expr, mean, "The question asks for the mean. Add all values and divide by how many values there are.", work)
    elif skill == "stemleaf":
        values = sorted([2+n%7, 5+n%9, 7+n%6, 10+n%8, 12+n%5])
        median = values[len(values)//2]
        expr = ["+", median, 0]
        answer = str(median)
        q = f"Find the median of {', '.join(map(str, values))}."
        work = ["The median is the middle value after sorting.", f"The values are already in order: {', '.join(map(str, values))}.", f"The middle value is {answer}."]
        return record(topic, i, q, answer, expr, median, "The question asks for the median. Put values in order, then find the middle value.", work)
    elif skill == "freqpoly":
        midpoints = [5, 15, 25]
        frequencies = [2+n%4, 3+n%5, 2+n%3]
        numerator = add_tree([["*", x, f] for x, f in zip(midpoints, frequencies)])
        denominator = sum(frequencies)
        expr = ["/", numerator, denominator]
        mean = evaluate(expr)
        answer = fmt(mean)
        q = f"Grouped data has midpoints {midpoints} and frequencies {frequencies}. Estimate the mean."
        work = ["Use each class midpoint as a representative value.", f"Multiply midpoint by frequency and add: total={evaluate(numerator)}.", f"Divide by total frequency {denominator}: estimated mean={answer}."]
        return record(topic, i, q, answer, expr, mean, "The question asks for an estimated mean from grouped data. Use midpoint × frequency, then divide by total frequency.", work)
    elif skill == "avgtable":
        values = [10, 20, 30, 40]
        frequencies = [1+n%4, 2+n%5, 1+n%3, 2+n%4]
        numerator = add_tree([["*", x, f] for x, f in zip(values, frequencies)])
        denominator = sum(frequencies)
        expr = ["/", numerator, denominator]
        mean = evaluate(expr)
        answer = fmt(mean)
        q = f"A frequency table has values {values} and frequencies {frequencies}. Find the mean."
        work = ["For a frequency table, multiply each value by its frequency.", f"Add the products to get {evaluate(numerator)}; add frequencies to get {denominator}.", f"Mean={evaluate(numerator)}÷{denominator}={answer}."]
        return record(topic, i, q, answer, expr, mean, "The question asks for the mean from a frequency table. Use Σfx ÷ Σf.", work)
    elif skill == "scatter":
        x = 2+n%8
        gradient, intercept = 3+n%5, 1+n%7
        expr = ["+", ["*", gradient, x], intercept]
        value = evaluate(expr)
        answer = str(value)
        q = f"A line of best fit is y={gradient}x+{intercept}. Estimate y when x={x}."
        work = ["A line of best fit gives an estimated relationship between x and y.", f"Substitute x={x}: y={gradient}×{x}+{intercept}.", f"The estimate is y={answer}."]
        return record(topic, i, q, answer, expr, value, "The question asks for an estimate from a line of best fit. Substitute the given x-value.", work)
    elif skill == "bar":
        counts = [3+n%8, 4+n%7, 2+n%9]
        expr = add_tree(counts)
        total = evaluate(expr)
        answer = str(total)
        q = f"A bar chart has category frequencies {counts}. Find the total frequency."
        work = ["The total frequency is the sum of all category frequencies.", f"Add {counts[0]}+{counts[1]}+{counts[2]}.", f"The total is {answer}."]
        return record(topic, i, q, answer, expr, total, "The question asks for a bar chart total. Add the category frequencies.", work)
    elif skill == "line":
        start, change = 12+n%15, 2+n%7
        expr = ["+", start, ["*", change, 4]]
        value = evaluate(expr)
        answer = str(value)
        q = f"A line graph starts at {start} and rises by {change} each time step. Find its value after 4 steps."
        work = ["A steady rise adds the same amount at each step.", f"Increase = 4×{change}={4*change}.", f"Final value={start}+{4*change}={answer}."]
        return record(topic, i, q, answer, expr, value, "The question asks you to read a steady change from a line graph. Add the change for each step.", work)
    elif skill == "composite":
        first, second = 3+n%8, 4+n%7
        expr = ["+", first, second]
        value = evaluate(expr)
        answer = str(value)
        q = f"A composite bar chart shows {first} people in group A and {second} in group B. Find the total."
        work = ["A composite chart combines the parts into one total.", f"Add the two groups: {first}+{second}.", f"The total is {answer}."]
        return record(topic, i, q, answer, expr, value, "The question asks for a total from a composite chart. Add the group values.", work)
    elif skill == "traveldistance":
        speed, time = 3+n%8, 2+n%6
        expr = ["*", speed, time]
        value = evaluate(expr)
        answer = f"{value} km"
        q = f"A vehicle travels at {speed} km/h for {time} hours. Find the distance travelled."
        work = ["Distance = speed × time.", f"Substitute: {speed}×{time}.", f"Distance={answer}."]
        return record(topic, i, q, answer, expr, value, "The question asks for travel distance. Multiply speed by time.", work, " km")
    elif skill == "basic-probability":
        total, success = 4+n%9, 1+n%(3+n%5)
        success = min(success, total-1)
        expr = ["/", success, total]
        value = evaluate(expr)
        answer = fmt(value)
        q = f"A bag has {success} red counters and {total-success} blue counters. Find the probability of red."
        work = [f"Probability = favourable outcomes ÷ all outcomes.", f"There are {success} red counters out of {total} counters.", f"The probability is {success}/{total}={answer}."]
        return record(topic, i, q, answer, expr, value, "The question asks for a probability. Divide the number of favourable outcomes by the total number of outcomes.", work)
    elif skill == "relative-frequency":
        wins, trials = 2+n%13, 10+n%20
        expr = ["/", wins, trials]
        value = evaluate(expr)
        answer = fmt(value)
        q = f"An event happened {wins} times in {trials} trials. Find its relative frequency."
        work = ["Relative frequency uses observed results.", f"Divide the number of successes by the number of trials: {wins}÷{trials}.", f"The relative frequency is {answer}."]
        return record(topic, i, q, answer, expr, value, "The question asks for relative frequency. Divide observed successes by total trials.", work)
    elif skill == "sample-space":
        a, b = 2+n%5, 3+n%6
        expr = ["*", a, b]
        total = evaluate(expr)
        answer = str(total)
        q = f"One spinner has {a} outcomes and another has {b}. How many paired outcomes are in the sample space?"
        work = ["A sample space lists all possible outcomes.", f"Each outcome on the first spinner pairs with all {b} outcomes on the second.", f"There are {a}×{b}={answer} pairs."]
        return record(topic, i, q, answer, expr, total, "The question asks for the number of combined outcomes. Multiply the numbers of choices.", work)
    elif skill == "and-or-rules":
        expr = ["/", 1, 4]
        answer = "1/4"
        q = "A fair coin is tossed twice. Find the probability of getting heads both times."
        work = ["The two tosses are independent events.", "Multiply their probabilities: 1/2×1/2.", "The probability is 1/4."]
        return record(topic, i, q, answer, expr, Fraction(1, 4), "The question asks for two independent events both happening. Multiply their probabilities.", work)
    elif skill == "tree-diagrams":
        expr = ["/", 1, 6]
        answer = "1/6"
        q = "A bag has 2 red and 1 blue counter. Two counters are drawn without replacement. Find P(red then blue)."
        work = ["For a tree, multiply probabilities along one path.", "P(red then blue)=2/3×1/2 because one red has been removed.", "The probability is 1/3, not 1/6."]
        return record(topic, i, q, "1/3", ["/", 1, 3], Fraction(1, 3), "The question asks for a path probability without replacement. Update the second probability after the first draw.", work)
    elif skill == "venn-diagrams":
        both, a_only, b_only, total = 2+n%4, 3+n%6, 2+n%5, 15+n%10
        union = both+a_only+b_only
        expr = ["/", union, total]
        value = evaluate(expr)
        answer = fmt(value)
        q = f"In a group of {total}, {a_only} like A only, {b_only} like B only, and {both} like both. Find P(A or B)."
        work = ["For A or B, count everyone in either set once.", f"Add A only, B only and both: {a_only}+{b_only}+{both}={union}.", f"Divide by {total}: P(A or B)={answer}."]
        return record(topic, i, q, answer, expr, value, "The question asks for a union probability. Count A only, B only and both once each.", work)
    elif skill == "conditional-probability":
        selected, total = 2+n%6, 5+n%8
        selected = min(selected, total-1)
        expr = ["/", selected, total]
        value = evaluate(expr)
        answer = fmt(value)
        q = f"Of {total} students in a group, {selected} wear glasses. One student is chosen from this group. Find the probability they wear glasses."
        work = ["Conditional probability restricts the outcomes to the stated group.", f"There are {selected} favourable students out of {total}.", f"The probability is {selected}/{total}={answer}."]
        return record(topic, i, q, answer, expr, value, "The question asks for a probability within a given group. Use the group size as the denominator.", work)
    elif skill == "sampling-methods":
        sample, interval = 10+n%10, 2+n%10
        population = sample*interval
        expr = ["/", population, sample]
        answer = f"Every {interval}th person"
        q = f"A researcher needs a systematic sample of {sample} people from a list of {population}. Find the approximate sampling interval."
        work = ["A systematic sample selects at regular intervals.", f"Divide population size by sample size: {population}÷{sample}.", f"Choose about every {interval}th person."]
        return record(topic, i, q, answer, expr, interval, "The question asks for a systematic sampling interval. Divide the population by the desired sample size.", work)
    elif skill == "two-way-tables":
        a, b, c, d = 4+n%8, 3+n%7, 2+n%9, 5+n%6
        expr = add_tree([a, b, c, d])
        total = evaluate(expr)
        answer = str(total)
        q = f"A two-way table has inner frequencies {a}, {b}, {c} and {d}. Find the grand total."
        work = ["The grand total is the sum of all inner cells.", f"Add {a}+{b}+{c}+{d}.", f"The grand total is {answer}."]
        return record(topic, i, q, answer, expr, total, "The question asks for the grand total in a two-way table. Add every cell frequency once.", work)
    elif skill == "pie-charts":
        frequency, total = 2+n%8, 10+n%15
        frequency = min(frequency, total)
        expr = ["/", ["*", frequency, 360], total]
        angle = evaluate(expr)
        answer = f"{fmt(angle)}°"
        q = f"A category has frequency {frequency} out of {total}. Find its angle in a pie chart."
        work = ["A full pie chart is 360°.", f"Angle = frequency ÷ total × 360° = {frequency}÷{total}×360°.", f"The sector angle is {answer}."]
        return record(topic, i, q, answer, expr, angle, "The question asks for a pie-chart sector angle. Use frequency ÷ total × 360°.", work, "°")
    elif skill == "cumulative-frequency":
        frequencies = [3+n%5, 4+n%6, 2+n%7, 3+n%4]
        total = sum(frequencies)
        expr = ["+", frequencies[0], frequencies[1]]
        cf = evaluate(expr)
        answer = str(cf)
        q = f"Class frequencies are {frequencies}. Find the cumulative frequency after the second class."
        work = ["Cumulative frequency is a running total.", f"Add the first two class frequencies: {frequencies[0]}+{frequencies[1]}.", f"The cumulative frequency is {answer}."]
        return record(topic, i, q, answer, expr, cf, "The question asks for cumulative frequency. Add the current class and all classes before it.", work)
    elif skill == "box-plots":
        lower, upper = 3+n%8, 12+n%10
        expr = ["-", upper, lower]
        value = evaluate(expr)
        answer = str(value)
        q = f"A box plot has lower quartile {lower} and upper quartile {upper}. Find the interquartile range."
        work = ["The interquartile range measures the middle half of the data.", "IQR = upper quartile − lower quartile.", f"IQR={upper}−{lower}={answer}."]
        return record(topic, i, q, answer, expr, value, "The question asks for the interquartile range. Subtract the lower quartile from the upper quartile.", work)
    elif skill == "unequal-width-histograms":
        frequency, width = 12+n%24, 2+n%6
        expr = ["/", frequency, width]
        density = evaluate(expr)
        answer = fmt(density)
        q = f"A histogram class has frequency {frequency} and class width {width}. Find its frequency density."
        work = ["Frequency density accounts for different class widths.", f"Frequency density = frequency ÷ class width = {frequency}÷{width}.", f"The frequency density is {answer}."]
        return record(topic, i, q, answer, expr, density, "The question asks for frequency density. Divide frequency by class width.", work)
    elif skill == "capture-recapture":
        marked, second, recaptured = 20+n%30*2, 15+n%20*2, 2+n%8
        expr = ["/", ["*", marked, second], recaptured]
        estimate = evaluate(expr)
        answer = fmt(estimate)
        q = f"{marked} animals are marked and released. Later {second} are caught, including {recaptured} marked animals. Estimate the population."
        work = ["Capture-recapture assumes the marked animals mix back into the population.", f"Estimate N = (first sample × second sample) ÷ marked in second sample.", f"N≈{marked}×{second}÷{recaptured}={answer}."]
        return record(topic, i, q, answer, expr, estimate, "The question asks for a capture-recapture estimate. Use N≈(marked first × second sample) ÷ recaptured marked.", work)
    elif skill == "scatter-further-skills":
        gradient, intercept, x = 2+n%5, 3+n%8, 4+n%9
        expr = ["+", ["*", gradient, x], intercept]
        value = evaluate(expr)
        answer = str(value)
        q = f"A fitted line is y={gradient}x+{intercept}. Estimate y when x={x}, then state why this is an estimate."
        work = [f"Substitute x={x} in the fitted line.", f"y={gradient}×{x}+{intercept}={value}.", "It is an estimate because the line models a trend and points may not lie exactly on it."]
        return record(topic, i, q, answer, expr, value, "The question asks for a value from a fitted line. Substitute x, and remember a model gives an estimate.", work)
    raise ValueError(f"No Probability or Statistics question builder for topic {skill}")


def write_area(area):
    BANK_DIR.mkdir(parents=True, exist_ok=True)
    audit = []
    files = []
    for index, topic in enumerate(topic_list(), 1):
        if topic["area"] != area:
            continue
        questions = []
        for i in range(40):
            if area == "Number":
                item = build_number(topic, i)
            elif area == "Algebra":
                item = build_algebra(topic, i)
            elif area == "Ratio":
                item = build_ratio(topic, i)
            elif area == "Geometry":
                item = build_geometry(topic, i)
            else:
                item = build_data(topic, i)
            audit_entry = item.pop("_audit")
            if audit_entry["expr"] is not None:
                audit.append({
                    "id": item["id"],
                    "expr": json_tree(audit_entry["expr"]),
                    "expected": (
                        [fmt(value) for value in audit_entry["expected"]]
                        if isinstance(audit_entry["expected"], tuple)
                        else fmt(audit_entry["expected"]) if isinstance(audit_entry["expected"], (int, Fraction))
                        else audit_entry["expected"]
                    ),
                })
            questions.append(item)
        filename = f"{index:02d}-{topic['id']}.js"
        output = "(window.GCSE_BANK=window.GCSE_BANK||[]).push(" + json.dumps(
            {"topic": topic["id"], "area": topic["area"], "tier": topic["tier"], "questions": questions},
            ensure_ascii=False,
            indent=2,
        ) + ");\n"
        (BANK_DIR / filename).write_text(output)
        files.append(filename)
    existing = []
    if AUDIT_PATH.exists():
        existing = json.loads(AUDIT_PATH.read_text())
    topic_ids = {topic["id"] for topic in topic_list() if topic["area"] == area}
    existing = [entry for entry in existing if entry["id"].rsplit("-", 1)[0] not in topic_ids]
    AUDIT_PATH.write_text(json.dumps(existing + audit, indent=2) + "\n")
    print(f"{area}: wrote {len(files)} topic files and verified {len(audit)} numeric answers.")
    print("\n".join(files))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--area", required=True)
    args = parser.parse_args()
    if args.area not in ("Number", "Algebra", "Ratio", "Geometry", "Probability", "Statistics"):
        raise SystemExit("Use a valid phase area.")
    write_area(args.area)
