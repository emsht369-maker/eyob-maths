import json
import math
import re
from fractions import Fraction
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

spec_file = Path(__file__).resolve().parents[1] / "audit" / "visual-specs.json"
rows = json.loads(spec_file.read_text(encoding="utf-8"))


def frac_text(value):
    value = Fraction(value)
    return str(value.numerator) if value.denominator == 1 else f"{value.numerator}/{value.denominator}"


def sample_quantile(data, fraction):
    ordered = sorted(data)
    position = Fraction(len(ordered) + 1) * fraction
    lower_position = position.numerator // position.denominator
    part = position - lower_position
    lower_index = max(0, lower_position - 1)
    upper_index = min(len(ordered) - 1, lower_position)
    return Fraction(ordered[lower_index]) + (
        Fraction(ordered[upper_index] - ordered[lower_index]) * part
    )


def js_number(value):
    if isinstance(value, Fraction):
        return frac_text(value)
    if isinstance(value, float):
        if math.isclose(value, round(value), abs_tol=1e-10):
            return str(round(value))
        return str(value)
    return str(value)


def independent_result(spec):
    kind = spec["kind"]
    if kind in ("coordinates-read", "coordinates-plot"):
        return f'{spec["x"]},{spec["y"]}'
    if kind == "equation-points":
        return f'y={spec["m"]}x{"+" if spec["c"] >= 0 else ""}{spec["c"]}'
    if kind in ("slope-graph", "line-equation", "choose-line-graph", "gradient-intercept"):
        slope = Fraction(str(spec["m"]))
        slope_value = frac_text(slope)
        if kind == "slope-graph":
            return slope_value
        if kind == "gradient-intercept":
            return f'{slope_value},{spec["c"]}'
        return f'y={slope_value}x{"+" if spec["c"] >= 0 else ""}{spec["c"]}'
    if kind == "midpoint-distance":
        if spec["subkind"] == "distance":
            return js_number(math.hypot(spec["x2"] - spec["x1"], spec["y2"] - spec["y1"]))
        return f'{frac_text(Fraction(spec["x1"] + spec["x2"], 2))},{frac_text(Fraction(spec["y1"] + spec["y2"], 2))}'
    if kind == "number-line-inequality":
        symbol = ("≥" if spec["closed"] else ">") if spec["direction"] == "right" else ("≤" if spec["closed"] else "<")
        return f'x{symbol}{spec["bound"]}'
    if kind == "linear-inequality-graph":
        point_x, point_y = spec["testPoint"]
        boundary_y = spec["m"] * point_x + spec["c"]
        test_passes = point_y > boundary_y if spec["above"] else point_y < boundary_y
        if test_passes != spec["testPointPasses"]:
            raise ValueError("The test point and shaded inequality side disagree.")
        sign = ">" if spec["above"] else "<"
        return f'y{sign}{spec["m"]}x{"+" if spec["c"] >= 0 else ""}{spec["c"]}'
    if kind == "polar-coordinates":
        theta = math.radians(spec["theta"])
        return f'{round(spec["r"] * math.cos(theta), 2)},{round(spec["r"] * math.sin(theta), 2)}'
    if kind == "triangle-angles" and spec.get("subtype") == "exterior":
        numerator = spec["outsideCoefficient"] - spec["insideCoefficient"]
        return frac_text(Fraction(spec["knownAngle"], numerator))
    if kind in ("angles-on-straight-line", "angles-around-point", "triangle-angles"):
        total = spec["total"]
        x = Fraction(total - spec["known"], spec["a"] + spec["b"])
        return frac_text(x)
    if kind in ("vertical-angles", "parallel-lines"):
        if spec["relation"] == "co-interior":
            x = Fraction(180 - spec["offset"] - spec["otherOffset"], spec["coefficient"])
        else:
            x = Fraction(spec["otherOffset"] - spec["offset"], spec["coefficient"])
        return frac_text(x)
    if kind == "regular-polygon-angles":
        sides = spec["sides"]
        value = Fraction(360, sides) if spec["angleType"] == "exterior" else Fraction((sides - 2) * 180, sides)
        return frac_text(value)
    if kind == "name-fraction":
        return frac_text(Fraction(spec["numerator"], spec["denominator"]))
    if kind == "shade-fraction":
        return ",".join(str(value) for value in spec["shaded"])
    if kind == "equivalent-fractions":
        if spec["simplified"]:
            return frac_text(Fraction(spec["numerator"], spec["denominator"]))
        return f'{spec["numerator"] * spec["multiplier"]}/{spec["denominator"] * spec["multiplier"]}'
    if kind == "fraction-add-subtract":
        n1, d1, n2, d2 = spec["n1"], spec["d1"], spec["n2"], spec["d2"]
        sign = -1 if spec["operation"] == "subtract" else 1
        return frac_text(Fraction(n1, d1) + sign * Fraction(n2, d2))
    if kind == "fraction-of-amount":
        return js_number(Fraction(spec["numerator"] * spec["amount"], spec["denominator"]))
    if kind == "fraction-number-line":
        return frac_text(Fraction(spec["numerator"], spec["denominator"]))
    if kind == "percentages":
        if spec["change"]:
            change = (Fraction(str(spec["newValue"])) - Fraction(spec["value"])) * 100 / spec["value"]
            computed = abs(change)
            if computed != spec["percent"]:
                raise ValueError("The percentage change does not match the bar values.")
            return ("+" if change > 0 else "−") + frac_text(computed) + "%"
        if spec["read"] or spec["shade"]:
            return str(spec["percent"]) + "%"
        return js_number(Fraction(spec["value"] * spec["percent"], 100))
    if kind == "ratio-tape":
        return f'{spec["shareA"]},{spec["shareB"]}'
    if kind == "compare-fractions":
        return spec["relation"]
    if kind == "bar-chart-reading":
        return str(spec["values"][spec["selected"]])
    if kind == "pie-chart":
        return str(round(spec["counts"][spec["selected"]] / sum(spec["counts"]) * 360, 2))
    if kind == "histogram":
        index = spec["selected"]
        if spec["asked"] == "density":
            return str(Fraction(spec["frequencies"][index], spec["widths"][index]))
        return str(spec["frequencies"][index])
    if kind == "scatter-graph":
        if spec["asked"] == "estimate":
            return str(spec["slope"] * spec["estimateX"] + spec["intercept"])
        xs, ys = spec["xs"], spec["ys"]
        covariance = sum((x - sum(xs) / len(xs)) * (y - sum(ys) / len(ys)) for x, y in zip(xs, ys))
        return "positive" if covariance > 0 else "negative" if covariance < 0 else "no"
    if kind == "box-plot":
        data = sorted(spec["data"])
        median = sample_quantile(data, Fraction(1, 2))
        q1, q3 = sample_quantile(data, Fraction(1, 4)), sample_quantile(data, Fraction(3, 4))
        return js_number({"median": median, "range": data[-1] - data[0], "iqr": q3 - q1,
                          "q1": q1, "q3": q3}[spec["asked"]])
    if kind == "cumulative-frequency":
        total = sum(spec["frequencies"])
        bounds = spec["bounds"]

        def quantile(fraction):
            rank = total * fraction
            cumulative = 0
            lower = 0
            for upper, frequency in zip(bounds, spec["frequencies"]):
                if rank <= cumulative + frequency:
                    return lower + (rank - cumulative) / frequency * (upper - lower)
                cumulative += frequency
                lower = upper
            raise ValueError("Quantile rank exceeds the total frequency.")

        median = quantile(Fraction(1, 2))
        iqr = quantile(Fraction(3, 4)) - quantile(Fraction(1, 4))
        return js_number(median if spec["asked"] == "median" else iqr)
    if kind == "stem-leaf":
        data = sorted(spec["data"])
        if spec["asked"] == "median":
            return js_number(sample_quantile(data, Fraction(1, 2)))
        if spec["asked"] == "q1":
            return js_number(sample_quantile(data, Fraction(1, 4)))
        if spec["asked"] == "q3":
            return js_number(sample_quantile(data, Fraction(3, 4)))
        if spec["asked"] == "mode":
            return str(max(set(data), key=data.count))
        return str(data[-1] - data[0])
    if kind == "frequency-polygon":
        key = "midpoints" if spec["asked"] == "midpoint" else "frequencies"
        return str(spec[key][spec["selected"]])
    if kind == "probability-tree":
        red, blue = spec["red"], spec["blue"]
        total, replacement = red + blue, spec["replacement"]
        if spec["asked"] == "branch":
            return frac_text(Fraction(red if replacement else red - 1, total if replacement else total - 1))
        if spec["asked"] == "and":
            return frac_text(Fraction(red * (red if replacement else red - 1), total * (total if replacement else total - 1)))
        no_red = Fraction(blue * (blue if replacement else blue - 1), total * (total if replacement else total - 1))
        return frac_text(1 - no_red)
    if kind == "venn-diagram":
        counts = spec["counts"]
        total = sum(counts)
        if not spec["three"]:
            if spec["asked"] == "intersection":
                return str(counts[2])
            if spec["asked"] == "union":
                return str(total - counts[3])
            return frac_text(Fraction(counts[0] + counts[2], total))
        if spec["asked"] == "onlyA":
            return str(counts[0])
        if spec["asked"] == "all":
            return str(counts[6])
        if spec["asked"] == "union":
            return str(total - counts[7])
        return frac_text(Fraction(counts[0] + counts[3] + counts[4] + counts[6], total))
    if kind == "sample-space":
        return frac_text(Fraction(spec["favourable"], spec["total"]))
    if kind == "distance-time":
        index = spec["selected"]
        times, distances = spec["times"], spec["distances"]
        return js_number(Fraction(abs(distances[index + 1] - distances[index]), times[index + 1] - times[index]))
    if kind == "speed-time":
        if spec["asked"] == "acceleration":
            index = spec["selected"]
            return js_number(Fraction(spec["speeds"][index + 1] - spec["speeds"][index], spec["times"][index + 1] - spec["times"][index]))
        distance = sum(
            Fraction(spec["speeds"][i] + spec["speeds"][i + 1], 2)
            * (spec["times"][i + 1] - spec["times"][i])
            for i in range(len(spec["times"]) - 1)
        )
        return js_number(distance)
    if kind == "conversion-graph":
        return str(round(spec["factor"] * spec["input"], 2))
    if kind == "quadratic-graph":
        if spec["asked"] == "roots":
            return f'{spec["root1"]},{spec["root2"]}'
        if spec["asked"] == "symmetry":
            return js_number(spec["axis"])
        return f'{js_number(spec["axis"])},{js_number(spec["turnY"])}'
    if kind == "function-graphs":
        if spec["graph"] == "cubic":
            return f'y={spec["scale"]}x³'
        if spec["graph"] == "reciprocal":
            return f'y={spec["scale"]}/x'
        return f'y={spec["base"]}^(x/2)'
    if kind == "sine-cosine":
        return str(spec["amplitude"] if spec["asked"] == "amplitude" else spec["period"])
    if kind == "plot-line-click":
        return ";".join(f"{x},{y}" for x, y in spec["points"])
    if kind == "simultaneous-graphs":
        x = Fraction(spec["c2"] - spec["c1"], spec["m1"] - spec["m2"])
        y = spec["m1"] * x + spec["c1"]
        return f"{frac_text(x)},{frac_text(y)}"
    if kind == "graph-transformations":
        shift, coefficient = spec["shift"], spec.get("coefficient", 1)
        if spec["transformation"] == "vertical":
            return f'y={coefficient}x²{"+" if shift > 0 else ""}{shift}'
        if spec["transformation"] == "horizontal":
            return f'y={coefficient}(x{"+" if shift > 0 else ""}{shift})²'
        if spec["transformation"] == "reflection":
            return f'y=−{"" if coefficient == 1 else coefficient}x²'
        return f'y={coefficient}(2x)²'
    if kind == "geometric-transformations":
        point = spec["image"][spec["selected"]]
        return f"{point[0]},{point[1]}"
    if kind == "vectors-grid":
        sign = -1 if spec["operation"] == "subtract" else 1
        result = [a + sign * b for a, b in zip(spec["vectorA"], spec["vectorB"])]
        return f"{result[0]},{result[1]}"
    if kind == "pythagoras":
        return str(spec["hypotenuse"] if spec["asked"] == "hypotenuse" else math.isqrt(
            spec["hypotenuse"] ** 2 - spec["legB"] ** 2
        ))
    if kind == "right-trigonometry":
        if spec["asked"] == "angle":
            return f'{math.degrees(math.atan2(spec["opposite"], spec["adjacent"])):.2f}'
        radians = math.radians(spec["angle"])
        value = spec["hypotenuse"] * (math.sin(radians) if spec["side"] == "opposite" else math.cos(radians))
        return f"{value:.2f}"
    if kind == "bearings":
        value = math.degrees(math.atan2(spec["east"], spec["north"])) % 360
        return f"{round(value):03d}"
    if kind == "circle-theorems":
        if spec["theorem"] == "centre":
            return frac_text(Fraction(2 * spec["otherOffset"] - spec["offset"], spec["coefficient"] - 2 * spec["otherCoefficient"]))
        if spec["theorem"] == "same-segment":
            return frac_text(Fraction(spec["known"] - spec["offset"], spec["coefficient"]))
        if spec["theorem"] == "tangent":
            return frac_text(Fraction(90 - spec["offset"], spec["coefficient"]))
        return frac_text(Fraction(180 - spec["offset"] - spec["otherOffset"], spec["coefficient"] + spec["otherCoefficient"]))
    if kind == "area-sector":
        if spec["shape"] == "sector":
            radius, angle = spec["radius"], spec["angle"]
            value = angle / 360 * (2 * math.pi * radius if spec["asked"] == "arc" else math.pi * radius * radius)
            return f"{value:.2f}"
        width, height = spec["width"], spec["height"]
        if spec["asked"] == "area":
            return str(width * height - spec["notchWidth"] * spec["notchHeight"])
        return str(2 * (width + height))
    if kind == "similar-shapes":
        factor, small = spec["scaleFactor"], spec["small"]
        multiplier = factor if spec["asked"] == "length" else factor ** (2 if spec["asked"] == "area" else 3)
        return str(small * multiplier)
    if kind == "dot-product-angle":
        first, second = spec["vectorA"], spec["vectorB"]
        dot = sum(a * b for a, b in zip(first, second))
        cosine = dot / (math.hypot(*first) * math.hypot(*second))
        return f"{math.degrees(math.acos(max(-1, min(1, cosine)))):.2f}"
    if kind == "regression":
        points = spec["points"]
        xs, ys = [p[0] for p in points], [p[1] for p in points]
        x_mean, y_mean = sum(xs) / len(xs), sum(ys) / len(ys)
        slope = sum((x - x_mean) * (y - y_mean) for x, y in points) / sum((x - x_mean) ** 2 for x in xs)
        intercept = y_mean - slope * x_mean
        if spec["asked"] == "slope":
            value = slope
        elif spec["asked"] == "intercept":
            value = intercept
        else:
            x, y = points[spec["selected"]]
            value = y - (slope * x + intercept)
        return f"{value:.2f}"
    if kind == "gradient-descent":
        next_weight = spec["weight"] - spec["learningRate"] * 2 * (spec["weight"] - spec["target"])
        return f"{next_weight:.2f}"
    if kind == "sigmoid-graph":
        probability = 1 / (1 + math.exp(-spec["input"]))
        return f"{probability:.3f}"
    if kind == "normal-distribution":
        interval = (spec["lower"], spec["upper"])
        empirical = {(-1, 1): 68, (-2, 2): 95, (-3, 3): 99.7,
                     (-2, -1): 13.5, (1, 2): 13.5, (-1, 0): 34, (2, 3): 2.35}
        return f'{empirical[interval]}%'
    if kind == "tangent-slope":
        return str(2 * spec["a"] * spec["x"])
    if kind == "riemann-trapezoid":
        total = 0
        for index in range(spec["intervals"]):
            left = index * spec["width"]
            right = (index + 1) * spec["width"]
            left_height = spec["a"] * (left ** 2 if spec["quadratic"] else left) + spec["b"]
            right_height = spec["a"] * (right ** 2 if spec["quadratic"] else right) + spec["b"]
            total += spec["width"] * (
                (left_height + right_height) / 2 if spec["method"] == "trapezium" else left_height
            )
        return f"{total:.1f}" if not float(total).is_integer() else str(int(total))
    if kind == "derivative-turning":
        return "minimum" if spec["sign"] > 0 else "maximum"
    if kind == "function-minimum":
        return str(spec["k"])
    if kind == "partial-contour-slope":
        return str(spec["dx"] if spec["along"] == "x" else spec["dy"])
    if kind == "contour-gradient":
        return f'{spec["gx"]},{spec["gy"]}'
    if kind == "matrix-transform-square":
        matrix, point = spec["matrix"], spec["point"]
        return f'{matrix[0][0] * point[0] + matrix[0][1] * point[1]},{matrix[1][0] * point[0] + matrix[1][1] * point[1]}'
    if kind == "determinant-area":
        matrix = spec["matrix"]
        return str(abs(matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]))
    if kind == "eigenvector-direction":
        return str(spec["eigenvalue"])
    if kind == "matrix-vector-grid":
        matrix, vector = spec["matrix"], spec["vector"]
        return ",".join(str(row[0] * vector[0] + row[1] * vector[1]) for row in matrix)
    if kind == "complex-argand":
        real, imaginary = spec["real"], spec["imaginary"]
        if spec["operation"] == "add":
            return f'{real + spec["otherReal"]},{imaginary + spec["otherImaginary"]}'
        if spec["operation"] == "modulus":
            return str(math.hypot(real, imaginary))
        return f'{real},{-imaginary}'
    if kind == "sequence-term-graph":
        return str(spec["first"] + (spec["termNumber"] - 1) * spec["difference"])
    if kind == "series-bars":
        if spec["sequenceType"] == "arithmetic":
            terms = [spec["first"] + index * spec["change"] for index in range(spec["count"])]
        else:
            terms = [spec["first"] * spec["change"] ** index for index in range(spec["count"])]
        return str(sum(terms))
    if kind == "combinatorics-routes":
        return str(math.comb(spec["across"] + spec["up"], spec["across"]))
    if kind == "modular-clock":
        movement = spec["amount"] if spec["operation"] == "+" else -spec["amount"]
        return str((spec["start"] - 1 + movement) % 12 + 1)
    if kind == "prime-sieve":
        primes = []
        for value in range(spec["lower"], spec["upper"] + 1):
            if value > 1 and all(value % divisor for divisor in range(2, math.isqrt(value) + 1)):
                primes.append(value)
        return str(len(primes))
    if kind == "factor-tree":
        powers = {}
        for factor in spec["factors"]:
            powers[factor] = powers.get(factor, 0) + 1
        return "×".join(str(prime) if power == 1 else f"{prime}^{power}"
                        for prime, power in sorted(powers.items()))
    if kind == "logic-venn-truth":
        if spec["operation"] == "AND":
            return str(spec["both"])
        if spec["operation"] == "OR":
            return str(spec["onlyA"] + spec["both"] + spec["onlyB"])
        return str(spec["onlyB"] + spec["neither"])
    if kind == "slope-field-match":
        return spec["equation"]
    if kind == "ode-growth-decay":
        return "growth" if spec["rate"] > 0 else "decay"
    if kind == "newton-method":
        return f'{(spec["x0"] + spec["n"] / spec["x0"]) / 2:.2f}'
    if kind == "log-exp-graph":
        return str(spec["exponent"])
    if kind == "polynomial-roots":
        return str(spec["firstRoot"] if spec["rootIndex"] == 0 else spec["secondRoot"])
    if kind == "place-value-rounding":
        number = Decimal(spec["numberTenths"]) / Decimal(10)
        places = {"tens": Decimal("1E1"), "ones": Decimal("1"), "tenths": Decimal("0.1")}
        rounded = number.quantize(places[spec["place"]], rounding=ROUND_HALF_UP)
        return format(rounded.normalize(), "f")
    if kind == "negative-thermometer":
        return str(spec["starting"] + spec["change"])
    if kind == "bidmas-tree":
        return str((spec["a"] + spec["b"]) * spec["c"] if spec["bracketed"]
                   else spec["a"] + spec["b"] * spec["c"])
    if kind == "algebra-tiles":
        return str(spec["a"] + spec["b"])
    if kind == "completing-square":
        return f'{spec["h"]},{spec["k"]}'
    if kind == "iteration-staircase":
        value = Decimal(spec["initial"])
        for _ in range(spec["steps"]):
            value = (value + Decimal(spec["constant"])) / 2
        return format(value.quantize(Decimal("0.001"), rounding=ROUND_HALF_UP), "f")
    if kind == "inequality-region":
        count = 0
        for x_value in range(spec["lowerX"], spec["limit"] - spec["lowerY"] + 1):
            for y_value in range(spec["lowerY"], spec["limit"] - x_value + 1):
                count += 1
        return str(count)
    if kind == "loci-bisectors":
        return ";".join(",".join(str(coordinate) for coordinate in point)
                        for point in spec["targets"])
    if kind == "nets-solids":
        sides = spec["sides"]
        return str({"faces": sides + 2, "edges": 3 * sides, "vertices": 2 * sides}[spec["metric"]])
    if kind == "volume-solids":
        shape, radius, height = spec["shape"], spec["radius"], spec["height"]
        if shape == "prism":
            volume = spec["length"] * radius * height
        elif shape == "cylinder":
            volume = math.pi * radius ** 2 * height
        elif shape == "cone":
            volume = math.pi * radius ** 2 * height / 3
        else:
            volume = 4 * math.pi * radius ** 3 / 3
        decimal_value = Decimal(str(volume)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        return format(decimal_value, "f")
    if kind == "plans-elevations":
        heights = spec["heights"]
        if spec["view"] == "plan":
            return str(len(heights))
        if spec["view"] == "side":
            return str(max(heights))
        return str(sum(heights))
    if kind == "symmetry":
        return str(spec["sides"])
    if kind == "congruence-similarity":
        return str(spec["scaleFactor"] ** 2 if spec["asked"] == "area"
                   else spec["smallSide"] * spec["scaleFactor"])
    if kind == "sine-cosine-rules":
        angle = math.radians(spec["angle"])
        side = math.sqrt(
            spec["sideB"] ** 2 + spec["sideC"] ** 2
            - 2 * spec["sideB"] * spec["sideC"] * math.cos(angle)
        )
        return f"{side:.2f}"
    if kind == "sine-area":
        area = spec["sideA"] * spec["sideB"] * math.sin(math.radians(spec["angle"])) / 2
        return str(int(area)) if area.is_integer() else f"{area:.1f}"
    if kind == "3d-pythagoras":
        base_diagonal = math.hypot(spec["length"], spec["width"])
        if spec["asked"] == "angle":
            return f'{math.degrees(math.atan2(spec["height"], base_diagonal)):.1f}'
        return str(round(math.hypot(base_diagonal, spec["height"])))
    if kind == "compound-measures":
        return str(spec["total"] // spec["base"])
    if kind == "two-way-tables":
        if spec["asked"] == "rowA":
            return str(spec["rows"][0])
        if spec["asked"] == "rowB":
            return str(spec["rows"][1])
        if spec["asked"] == "columnA":
            return str(spec["columns"][0])
        if spec["asked"] == "total":
            return str(spec["total"])
        return str(spec["cells"][0])
    if kind == "capture-recapture":
        return str(spec["marked"] * spec["secondSample"] // spec["recaptured"])
    raise ValueError(f"No independent solver for spec kind {kind}")


def clean(value):
    return re.sub(r"\s+", "", str(value)).replace("−", "-").lower()


def equal(expected, stored):
    left, right = clean(expected), clean(stored)
    if left == right:
        return True
    if "," in left and "," in right:
        try:
            left_parts, right_parts = left.split(","), right.split(",")
            return len(left_parts) == len(right_parts) and all(
                math.isclose(float(Fraction(a)), float(Fraction(b)), rel_tol=0, abs_tol=0.011)
                for a, b in zip(left_parts, right_parts)
            )
        except (ValueError, ZeroDivisionError):
            return False
    try:
        return math.isclose(float(Fraction(left)), float(Fraction(right)), rel_tol=0, abs_tol=1e-8)
    except (ValueError, ZeroDivisionError):
        try:
            return math.isclose(float(left), float(right), rel_tol=0, abs_tol=1e-8)
        except ValueError:
            return False


counts = {}
mismatches = []
for row in rows:
    # Compute from the spec before reading the stored answer for comparison.
    expected = independent_result(row["spec"])
    counts[row["generator"]] = counts.get(row["generator"], 0) + 1
    if not equal(expected, row["answer"]):
        mismatches.append((row["generator"], row["seed"], expected, row["answer"]))

print("| Generator | Specs checked | Patterns observed | Mismatches |")
print("|---|---:|---:|---:|")
for generator, count in sorted(counts.items()):
    errors = sum(1 for item in mismatches if item[0] == generator)
    patterns = len({json.dumps(row["spec"], sort_keys=True) for row in rows if row["generator"] == generator})
    print(f"| {generator} | {count} | {patterns} | {errors} |")
if any(count != 60 for count in counts.values()):
    raise SystemExit("Every generator must have exactly 60 exported seed cases.")
if mismatches:
    print("\nMismatch details:")
    for generator, seed, expected, stored in mismatches:
        print(f"| {generator} | {seed} | expected {expected} | stored {stored} |")
    raise SystemExit(1)
print(f"\nVerified {len(rows)} answers independently from their specs. Mismatches: 0.")
