(function() {
  "use strict";

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const next = a % b;
      a = b;
      b = next;
    }
    return a || 1;
  }

  function fraction(n, d) {
    const sign = d < 0 ? -1 : 1;
    const common = gcd(n, d);
    n = sign * n / common;
    d = sign * d / common;
    return d === 1 ? String(n) : `${n}/${d}`;
  }

  function seeded(seed) {
    let state = (Number(seed) >>> 0) || 1;
    return function() {
      state = (state + 0x6D2B79F5) >>> 0;
      let value = state;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  function integer(rng, low, high) {
    return low + Math.floor(rng() * (high - low + 1));
  }

  function result(q, answer, steps, calc, marks, value) {
    return {
      q,
      a: answer,
      steps: steps.concat([`Check: the calculation gives ${answer}.`]),
      marks,
      calc,
      value
    };
  }

  function makeQuestion(kind, rng) {
    const pickCalc = rng() < 0.5 ? "calc" : "noncalc";
    let a;
    let b;
    let c;
    let answer;
    let q;
    let steps;
    let value;

    switch (kind) {
      case "add":
      case "money-add":
        a = integer(rng, 12, 180);
        b = integer(rng, 11, 95);
        value = a + b;
        q = kind === "money-add" ? `Add £${a} and £${b}.` : `Calculate ${a} + ${b}.`;
        answer = String(value);
        steps = [`The question asks for a total, so add the two values.`, `${a}+${b}=${value}.`];
        return result(q, answer, steps, pickCalc, 1, value);
      case "subtract":
        a = integer(rng, 70, 250);
        b = integer(rng, 10, a - 1);
        value = a - b;
        return result(`Calculate ${a} − ${b}.`, String(value), [
          "The question asks for the difference, so subtract the smaller value.",
          `${a}−${b}=${value}.`
        ], pickCalc, 1, value);
      case "multiply":
      case "area-rectangle":
        a = integer(rng, 3, 18);
        b = integer(rng, 3, 15);
        value = a * b;
        q = kind === "area-rectangle" ? `Find the area of a rectangle ${a} cm by ${b} cm.` : `Calculate ${a} × ${b}.`;
        steps = kind === "area-rectangle" ?
          ["Area counts square units inside the rectangle.", "Use area = length × width.", `${a}×${b}=${value} cm².`] :
          ["The question asks for a product, so multiply.", `${a}×${b}=${value}.`];
        return result(q, String(value), steps, pickCalc, 1, value);
      case "divide":
        b = integer(rng, 2, 12);
        a = b * integer(rng, 3, 20);
        value = a / b;
        return result(`Calculate ${a} ÷ ${b}.`, String(value), [
          "Division asks how many equal groups fit.",
          `${a}÷${b}=${value}.`
        ], pickCalc, 1, value);
      case "fraction-add":
        b = integer(rng, 2, 12);
        a = integer(rng, 1, b - 1);
        c = integer(rng, 2, 12);
        const d = integer(rng, 1, c - 1);
        value = fraction(a * c + d * b, b * c);
        answer = value;
        return result(`Add ${a}/${b} and ${d}/${c}.`, answer, [
          "Use a common denominator before adding fractions.",
          `${a}/${b}=${a*c}/${b*c} and ${d}/${c}=${d*b}/${b*c}.`,
          `Add the numerators and simplify: ${a*c+d*b}/${b*c}=${answer}.`
        ], "noncalc", 2, value);
      case "fraction-multiply":
        b = integer(rng, 2, 10);
        a = integer(rng, 1, b - 1);
        c = integer(rng, 2, 10);
        const e = integer(rng, 1, c - 1);
        value = fraction(a * e, b * c);
        return result(`Multiply ${a}/${b} by ${e}/${c}.`, value, [
          "To multiply fractions, multiply the numerators and denominators.",
          `${a}×${e}=${a*e} and ${b}×${c}=${b*c}.`,
          `Simplify ${a*e}/${b*c} to get ${value}.`
        ], "noncalc", 2, value);
      case "percent":
      case "percent-increase":
      case "percent-decrease":
        a = integer(rng, 2, 15) * 50;
        b = integer(rng, 5, 25) * 5;
        const sign = kind === "percent-decrease" ? -1 : 1;
        value = a * (100 + sign * b) / 100;
        answer = String(value);
        q = kind === "percent-increase" ? `Increase ${a} by ${b}%.` :
          kind === "percent-decrease" ? `Decrease ${a} by ${b}%.` : `Find ${b}% of ${a}.`;
        if (kind === "percent") value = a * b / 100;
        answer = String(value);
        steps = kind === "percent" ?
          [`Percent means out of 100, so multiply by ${b}/100.`, `${a}×${b}/100=${value}.`] :
          [`Use the multiplier ${(100 + sign*b)}/100.`, `${a}×${100 + sign*b}/100=${value}.`];
        return result(q, answer, steps, pickCalc, 2, value);
      case "round":
        a = integer(rng, 125, 987) / 10;
        b = [0, 1, 2][integer(rng, 0, 2)];
        const place = Math.pow(10, -b);
        value = Math.round(a / place) * place;
        answer = String(Number(value.toFixed(2)));
        return result(`Round ${a} to the nearest ${b === 0 ? "whole number" : b === 1 ? "tenth" : "hundredth"}.`, answer, [
          "Look at the digit to the right of the rounding place.",
          `Rounding ${a} gives ${answer}.`
        ], pickCalc, 1, Number(answer));
      case "indices":
        a = integer(rng, 2, 8);
        b = integer(rng, 2, 5);
        value = Math.pow(a, b);
        return result(`Evaluate ${a}^${b}.`, String(value), [
          "A power means repeated multiplication.",
          `${a}^${b} means ${Array(b).fill(a).join("×")}.`,
          `The value is ${value}.`
        ], pickCalc, 1, value);
      case "hcf":
        a = integer(rng, 2, 20);
        b = integer(rng, 2, 20);
        value = gcd(a, b);
        return result(`Find the highest common factor of ${a} and ${b}.`, String(value), [
          "The HCF is the largest number that divides both values.",
          `Common factors of ${a} and ${b} include ${value}.`,
          `The highest common factor is ${value}.`
        ], "noncalc", 1, value);
      case "lcm":
        a = integer(rng, 2, 15);
        b = integer(rng, 2, 15);
        value = a * b / gcd(a, b);
        return result(`Find the lowest common multiple of ${a} and ${b}.`, String(value), [
          "The LCM is the smallest positive number divisible by both values.",
          `Use LCM = ${a}×${b} ÷ HCF(${a},${b}).`,
          `The LCM is ${value}.`
        ], "noncalc", 2, value);
      case "ratio-simplify":
        a = integer(rng, 2, 9);
        b = integer(rng, 2, 9);
        c = integer(rng, 2, 8);
        value = `${a*c/gcd(a,b)}:${b*c/gcd(a,b)}`;
        const ratioAnswer = `${a/gcd(a,b)}:${b/gcd(a,b)}`;
        return result(`Simplify ${a*c}:${b*c}.`, ratioAnswer, [
          "Divide both parts of a ratio by the same highest common factor.",
          `The common factor is ${c*gcd(a,b)}.`,
          `The simplest ratio is ${ratioAnswer}.`
        ], "noncalc", 1, ratioAnswer);
      case "standard-form":
        a = integer(rng, 12, 98);
        b = integer(rng, 2, 7);
        value = `${a/10} × 10^${b+1}`;
        return result(`Write ${a*Math.pow(10,b)} in standard form.`, value, [
          "Standard form is a number from 1 up to 10 times a power of 10.",
          `Move the decimal point ${b+1} places to make ${a/10}.`,
          `The answer is ${value}.`
        ], pickCalc, 2, value);
      case "reverse-percent":
        b = integer(rng, 2, 8) * 10;
        a = integer(rng, 2, 12) * 100;
        value = a * 100 / (100 + b);
        return result(`${a} is the value after a ${b}% increase. Find the original value.`, String(value), [
          `After an increase, the new value is ${100+b}% of the original.`,
          `Original = ${a}×100/${100+b}.`,
          `The original value is ${value}.`
        ], "calc", 3, value);
      case "linear-expression":
        a = integer(rng, 2, 9);
        b = integer(rng, 1, 8);
        c = integer(rng, 1, 10);
        value = a + b;
        answer = `${value}x + ${c}`;
        return result(`Simplify ${a}x + ${b}x + ${c}.`, answer, [
          "Combine like terms with the same variable.",
          `${a}x+${b}x=${value}x.`,
          `Keep the constant, so the result is ${answer}.`
        ], "noncalc", 1, answer);
      case "expand":
        a = integer(rng, 2, 9);
        b = integer(rng, 1, 8);
        value = [a+b, a*b];
        answer = `x² + ${value[0]}x + ${value[1]}`;
        return result(`Expand (x + ${a})(x + ${b}).`, answer, [
          "Multiply every term in one bracket by every term in the other.",
          `This gives x² + ${a}x + ${b}x + ${a*b}.`,
          `Collect like terms to get ${answer}.`
        ], "noncalc", 2, answer);
      case "linear-equation":
        a = integer(rng, 2, 10);
        b = integer(rng, 2, 15);
        value = a * b;
        return result(`Solve ${a}x = ${value}.`, `x = ${b}`, [
          "Undo multiplication by dividing both sides by the coefficient.",
          `${value}÷${a}=${b}.`,
          `So x=${b}.`
        ], "noncalc", 1, `x = ${b}`);
      case "nth-term":
        a = integer(rng, 2, 8);
        b = integer(rng, 1, 10);
        c = integer(rng, 5, 20);
        value = a * c + b - a;
        return result(`A sequence starts ${b}, ${b+a}, ${b+2*a}, … Find term ${c}.`, String(value), [
          `The common difference is ${a}, so term n = ${a}n + ${b-a}.`,
          `Substitute n=${c}: ${a}×${c}+${b-a}.`,
          `Term ${c} is ${value}.`
        ], "noncalc", 2, value);
      case "function":
        a = integer(rng, 2, 8);
        b = integer(rng, 1, 12);
        c = integer(rng, 2, 9);
        value = a * c + b;
        return result(`For f(x)=${a}x+${b}, find f(${c}).`, String(value), [
          "A function value is found by substituting the input.",
          `f(${c})=${a}×${c}+${b}.`,
          `Therefore f(${c})=${value}.`
        ], pickCalc, 1, value);
      case "factorise":
        a = integer(rng, 2, 8);
        b = integer(rng, 1, 8);
        value = [a+b, a*b];
        answer = `(x + ${a})(x + ${b})`;
        return result(`Factorise x² + ${value[0]}x + ${value[1]}.`, answer, [
          `Find two numbers with sum ${value[0]} and product ${value[1]}.`,
          `The numbers are ${a} and ${b}.`,
          `So the factors are ${answer}.`
        ], "noncalc", 2, answer);
      case "ratio-share":
        a = integer(rng, 2, 7);
        b = integer(rng, 1, 6);
        c = integer(rng, 3, 15) * (a+b);
        value = c * a / (a+b);
        return result(`Share ${c} in the ratio ${a}:${b}. Find the first share.`, String(value), [
          `There are ${a+b} parts altogether.`,
          `One part is ${c}÷${a+b}.`,
          `The first share is ${a} parts, which is ${value}.`
        ], "noncalc", 2, value);
      case "unit-rate":
        a = integer(rng, 2, 9);
        b = integer(rng, 2, 12);
        value = integer(rng, 2, 15);
        c = value * b;
        return result(`${c} items cost £${a*c}. Find the cost per item.`, String(a), [
          "A unit rate is the amount for one item.",
          `Divide the total cost by the number of items: ${a*c}÷${c}.`,
          `Each item costs £${a}.`
        ], "calc", 2, a);
      case "speed":
        a = integer(rng, 2, 8);
        b = integer(rng, 2, 12);
        c = integer(rng, 20, 90);
        value = c;
        return result(`A car travels ${c*b} km in ${b} hours. Find its speed.`, String(value), [
          "Speed = distance ÷ time.",
          `${c*b}÷${b}=${c}.`,
          `The speed is ${value} km/h.`
        ], "calc", 2, value);
      case "distance":
        a = integer(rng, 3, 20);
        b = integer(rng, 2, 8);
        value = a*b;
        return result(`Travel at ${a} km/h for ${b} hours. Find the distance.`, String(value), [
          "Distance = speed × time.",
          `${a}×${b}=${value}.`,
          `The distance is ${value} km.`
        ], "calc", 2, value);
      case "unit-convert":
        a = integer(rng, 2, 20);
        value = a * 1000;
        return result(`Convert ${a} km to metres.`, String(value), [
          "One kilometre is 1000 metres.",
          `Multiply ${a} by 1000.`,
          `${a} km = ${value} m.`
        ], "noncalc", 1, value);
      case "scale":
        a = integer(rng, 2, 8);
        b = integer(rng, 2, 12);
        value = a*b;
        return result(`A scale drawing uses 1 cm for ${a} m. A length is ${b} cm on the drawing. Find the real length in metres.`, String(value), [
          "Multiply the drawing length by the scale.",
          `${b}×${a}=${value}.`,
          `The real length is ${value} m.`
        ], "noncalc", 2, value);
      case "growth":
        a = integer(rng, 2, 10) * 100;
        b = [10, 20, 25][integer(rng, 0, 2)];
        value = a * Math.pow((100+b)/100, 2);
        return result(`£${a} grows by ${b}% each year. Find its value after 2 years.`, String(value), [
          `The yearly multiplier is ${(100+b)}/100.`,
          `Apply it twice: ${a}×${(100+b)/100}².`,
          `The value is £${value}.`
        ], "calc", 3, value);
      case "density":
        a = integer(rng, 2, 12);
        b = integer(rng, 2, 8);
        value = a;
        return result(`A mass of ${a*b} g has volume ${b} cm³. Find its density.`, String(value), [
          "Density = mass ÷ volume.",
          `${a*b}÷${b}=${a}.`,
          `The density is ${value} g/cm³.`
        ], "calc", 2, value);
      case "similar-length":
        a = integer(rng, 2, 8);
        b = integer(rng, 3, 14);
        value = a*b;
        return result(`Similar shapes have scale factor ${a}. A matching short length is ${b} cm. Find the longer length.`, String(value), [
          "Corresponding lengths use the linear scale factor.",
          `${b}×${a}=${value}.`,
          `The longer length is ${value} cm.`
        ], "noncalc", 2, value);
      case "perimeter":
        a = integer(rng, 3, 15);
        b = integer(rng, 2, 12);
        value = 2*(a+b);
        return result(`Find the perimeter of a ${a} cm by ${b} cm rectangle.`, String(value), [
          "A rectangle has two sides of each length.",
          `Perimeter=2×(${a}+${b}).`,
          `The perimeter is ${value} cm.`
        ], "noncalc", 1, value);
      case "area-triangle":
        a = integer(rng, 3, 16);
        b = integer(rng, 2, 12);
        value = a*b/2;
        return result(`Find the area of a triangle with base ${a} cm and perpendicular height ${b} cm.`, fraction(a*b, 2), [
          "Triangle area is half of base × perpendicular height.",
          `Area=(${a}×${b})÷2.`,
          `The area is ${fraction(a*b, 2)} cm².`
        ], "noncalc", 2, fraction(a*b, 2));
      case "circle-circumference":
        a = integer(rng, 2, 15);
        value = `${a}π`;
        return result(`Find the exact circumference of a circle with diameter ${a}.`, value, [
          "Circumference = π × diameter.",
          `Substitute the diameter: π×${a}.`,
          `The exact circumference is ${value}.`
        ], "calc", 2, value);
      case "volume":
        a = integer(rng, 2, 8);
        b = integer(rng, 2, 7);
        c = integer(rng, 2, 6);
        value = a*b*c;
        return result(`Find the volume of a cuboid ${a} cm by ${b} cm by ${c} cm.`, String(value), [
          "Cuboid volume = length × width × height.",
          `${a}×${b}×${c}=${value}.`,
          `The volume is ${value} cm³.`
        ], "noncalc", 2, value);
      case "pythagoras":
        a = integer(rng, 1, 3);
        const triples = [[3,4,5],[5,12,13],[8,15,17]];
        const tri = triples[a-1];
        return result(`A right triangle has shorter sides ${tri[0]} cm and ${tri[1]} cm. Find the hypotenuse.`, String(tri[2]), [
          "Use Pythagoras: hypotenuse² = a² + b².",
          `${tri[0]}²+${tri[1]}²=${tri[2]*tri[2]}.`,
          `The positive square root is ${tri[2]} cm.`
        ], "noncalc", 2, tri[2]);
      case "straight-angle":
        a = integer(rng, 25, 155);
        value = 180-a;
        return result(`An angle on a straight line is ${a}°. Find the other angle.`, String(value), [
          "Angles on a straight line add to 180°.",
          `Subtract ${a}° from 180°.`,
          `The other angle is ${value}°.`
        ], "noncalc", 1, value);
      case "bearing-reverse":
        a = integer(rng, 1, 17)*10;
        value = (a+180)%360;
        return result(`Find the reverse bearing of ${String(a).padStart(3, "0")}°.`, String(value).padStart(3, "0"), [
          "A reverse bearing is 180° in the opposite direction.",
          `Add 180° to ${a}°.`,
          `The reverse bearing is ${String(value).padStart(3, "0")}°.`
        ], "noncalc", 2, String(value).padStart(3, "0"));
      case "polygon-angle":
        a = integer(rng, 3, 12);
        value = fraction((a-2)*180, a);
        return result(`Find each interior angle of a regular ${a}-sided polygon.`, value, [
          "The interior angle sum is (n−2)×180°.",
          `Divide by ${a} because the polygon is regular.`,
          `Each angle is ${value}°.`
        ], "noncalc", 2, value);
      case "reflection":
        a = integer(rng, 1, 12);
        b = integer(rng, -8, 8);
        value = `(${ -a}, ${b})`;
        return result(`Reflect (${a}, ${b}) in the y-axis.`, value, [
          "A y-axis reflection changes the sign of x.",
          `Keep y=${b} and change x=${a} to −${a}.`,
          `The image is ${value}.`
        ], "noncalc", 1, value);
      case "special-trig":
        return result("Find the exact value of sin 30°.", "1/2", [
          "Recall the exact value for a special angle.",
          "sin 30° = 1/2.",
          "Keep the exact fraction."
        ], "noncalc", 1, "1/2");
      case "single-probability":
        a = integer(rng, 1, 5);
        b = integer(rng, a+1, 12);
        value = fraction(a, b);
        return result(`A bag has ${a} red counters and ${b-a} blue counters. Find P(red).`, value, [
          "Probability = favourable outcomes ÷ total outcomes.",
          `There are ${a} red counters out of ${b}.`,
          `P(red)=${a}/${b}=${value}.`
        ], "noncalc", 1, value);
      case "complement":
        a = integer(rng, 1, 8);
        b = integer(rng, a+2, 15);
        value = fraction(b-a, b);
        return result(`The probability of rain is ${fraction(a,b)}. Find the probability of no rain.`, value, [
          "An event and its complement have probabilities that add to 1.",
          `Subtract ${fraction(a,b)} from 1.`,
          `The answer is ${value}.`
        ], "noncalc", 1, value);
      case "independent":
        a = integer(rng, 2, 6);
        b = integer(rng, 2, 6);
        value = fraction(1, a*b);
        return result(`Two independent events each have probability 1/${a} and 1/${b}. Find the probability both happen.`, value, [
          "For independent events, multiply the probabilities.",
          `1/${a}×1/${b}=1/${a*b}.`,
          `The probability is ${value}.`
        ], "noncalc", 2, value);
      case "without-replacement":
        a = integer(rng, 2, 8);
        b = integer(rng, 1, 5);
        value = fraction(a*b, (a+b)*(a+b-1));
        return result(`A bag has ${a} red and ${b} blue counters. Find P(red then blue) without replacement.`, value, [
          `First P(red)=${a}/${a+b}.`,
          `Then P(blue)=${b}/${a+b-1} because one counter was removed.`,
          `Multiply along the path: ${value}.`
        ], "noncalc", 2, value);
      case "sample-space":
        a = integer(rng, 2, 8);
        b = integer(rng, 2, 8);
        value = a*b;
        return result(`A spinner has ${a} outcomes and a die has ${b}. How many paired outcomes are possible?`, String(value), [
          "Each spinner result pairs with each die result.",
          `Multiply the choices: ${a}×${b}.`,
          `There are ${value} outcomes.`
        ], "noncalc", 1, value);
      case "union":
        a = integer(rng, 2, 7);
        b = integer(rng, 2, 7);
        c = integer(rng, 1, Math.min(a,b));
        value = a+b-c;
        return result(`In a group, ${a} like A, ${b} like B, and ${c} like both. How many like A or B?`, String(value), [
          "Add both groups, then subtract the overlap counted twice.",
          `${a}+${b}−${c}=${value}.`,
          `${value} people like A or B.`
        ], "noncalc", 2, value);
      case "relative-frequency":
        a = integer(rng, 1, 15);
        b = integer(rng, a+5, 40);
        value = fraction(a, b);
        return result(`An event happens ${a} times in ${b} trials. Find its relative frequency.`, value, [
          "Relative frequency = successes ÷ trials.",
          `${a}÷${b}=${value}.`,
          `The estimated probability is ${value}.`
        ], "noncalc", 1, value);
      case "expected-frequency":
        a = integer(rng, 2, 5);
        b = integer(rng, a+1, 10);
        c = integer(rng, 10, 80);
        value = c*a/b;
        return result(`An event has probability ${fraction(a,b)}. How many times is it expected in ${c} trials?`, fraction(c*a,b), [
          "Expected frequency = probability × number of trials.",
          `${fraction(a,b)}×${c}=${fraction(c*a,b)}.`,
          `The expected frequency is ${fraction(c*a,b)}.`
        ], "calc", 2, fraction(c*a,b));
      case "mean":
        a = integer(rng, 2, 15);
        b = integer(rng, 2, 15);
        c = integer(rng, 2, 15);
        value = fraction(a+b+c, 3);
        return result(`Find the mean of ${a}, ${b} and ${c}.`, value, [
          "Mean = total ÷ number of values.",
          `The total is ${a+b+c}; there are 3 values.`,
          `Mean=${a+b+c}÷3=${value}.`
        ], "noncalc", 1, value);
      case "median":
        a = integer(rng, 1, 20);
        b = integer(rng, a+1, 25);
        c = integer(rng, b+1, 30);
        value = b;
        return result(`Find the median of ${c}, ${a}, ${b}.`, String(value), [
          "Sort the values from least to greatest.",
          `The order is ${a}, ${b}, ${c}.`,
          `The middle value is ${value}.`
        ], "noncalc", 1, value);
      case "range":
        a = integer(rng, 1, 25);
        b = integer(rng, a+5, 40);
        value = b-a;
        return result(`Find the range of a data set with minimum ${a} and maximum ${b}.`, String(value), [
          "Range = maximum − minimum.",
          `${b}−${a}=${value}.`,
          `The range is ${value}.`
        ], "noncalc", 1, value);
      case "weighted-mean":
        a = integer(rng, 2, 9);
        b = integer(rng, 2, 9);
        c = integer(rng, 2, 12);
        value = fraction(2*a+3*b, 5);
        return result(`Two scores are ${a} and ${b}, with weights 2 and 3. Find the weighted mean.`, value, [
          "Multiply each score by its weight.",
          `Weighted total=${a}×2+${b}×3=${2*a+3*b}; total weight=5.`,
          `Weighted mean=${value}.`
        ], "calc", 2, value);
      case "grouped-mean":
        a = integer(rng, 2, 8);
        b = integer(rng, 2, 8);
        value = fraction(10*a+20*b, a+b);
        return result(`Grouped data has midpoints 10 and 20 with frequencies ${a} and ${b}. Estimate the mean.`, value, [
          "Use midpoint × frequency for each class.",
          `Weighted total=10×${a}+20×${b}=${10*a+20*b}.`,
          `Divide by total frequency ${a+b}: estimate=${value}.`
        ], "calc", 2, value);
      case "iqr":
        a = integer(rng, 2, 10);
        b = integer(rng, a+5, 25);
        value = b-a;
        return result(`A data set has lower quartile ${a} and upper quartile ${b}. Find the IQR.`, String(value), [
          "IQR = upper quartile − lower quartile.",
          `${b}−${a}=${value}.`,
          `The IQR is ${value}.`
        ], "noncalc", 1, value);
      case "frequency-density":
        a = integer(rng, 2, 8);
        b = integer(rng, 2, 10);
        value = fraction(a*b, b);
        return result(`A histogram class has frequency ${a*b} and width ${b}. Find its frequency density.`, String(a), [
          "Frequency density = frequency ÷ class width.",
          `${a*b}÷${b}=${a}.`,
          `The frequency density is ${a}.`
        ], "calc", 2, a);
      case "pie-angle":
        a = integer(rng, 1, 8);
        b = a*4;
        value = a*360/b;
        return result(`A category has frequency ${a} out of ${b}. Find its pie-chart angle.`, String(value), [
          "A full pie chart is 360°.",
          `Angle=${a}÷${b}×360°.`,
          `The angle is ${value}°.`
        ], "calc", 2, value);
      case "capture-recapture":
        a = integer(rng, 5, 20);
        b = integer(rng, 5, 20);
        c = integer(rng, 1, Math.min(a,b));
        value = fraction(a*b,c);
        return result(`${a} animals are marked. Later ${b} are caught, including ${c} marked. Estimate the population.`, value, [
          "Use N ≈ first sample × second sample ÷ recaptured marked.",
          `${a}×${b}÷${c}=${value}.`,
          `The estimated population is ${value} animals.`
        ], "calc", 3, value);
      default:
        throw new Error(`Unknown generator kind: ${kind}`);
    }
  }

  const definitions = [
    ["num-addition", "Integer addition", "Number", "F", "add"],
    ["num-money-addition", "Money totals", "Number", "F", "money-add"],
    ["num-subtraction", "Integer subtraction", "Number", "F", "subtract"],
    ["num-multiplication", "Integer multiplication", "Number", "F", "multiply"],
    ["num-area-product", "Area by multiplication", "Number", "F", "area-rectangle"],
    ["num-division", "Exact division", "Number", "F", "divide"],
    ["num-fraction-addition", "Adding fractions", "Number", "F", "fraction-add"],
    ["num-fraction-multiplication", "Multiplying fractions", "Number", "F", "fraction-multiply"],
    ["num-percent", "Finding a percentage", "Number", "F", "percent"],
    ["num-percent-increase", "Percentage increase", "Number", "F", "percent-increase"],
    ["num-percent-decrease", "Percentage decrease", "Number", "F", "percent-decrease"],
    ["num-rounding", "Rounding decimals", "Number", "F", "round"],
    ["num-indices", "Powers", "Number", "FH", "indices"],
    ["num-hcf", "Highest common factor", "Number", "F", "hcf"],
    ["num-lcm", "Lowest common multiple", "Number", "F", "lcm"],
    ["num-ratio-simplify", "Simplifying ratios", "Number", "F", "ratio-simplify"],
    ["num-standard-form", "Standard form", "Number", "FH", "standard-form"],
    ["num-reverse-percent", "Reverse percentages", "Number", "H", "reverse-percent"],
    ["alg-collect-like-terms", "Collecting like terms", "Algebra", "F", "linear-expression"],
    ["alg-expand-brackets", "Expanding brackets", "Algebra", "F", "expand"],
    ["alg-factorise-quadratic", "Factorising quadratics", "Algebra", "H", "factorise"],
    ["alg-linear-equation", "Linear equations", "Algebra", "F", "linear-equation"],
    ["alg-forming-equations", "Forming equations", "Algebra", "F", "linear-equation"],
    ["alg-nth-term", "Linear sequences", "Algebra", "F", "nth-term"],
    ["alg-function-value", "Function values", "Algebra", "F", "function"],
    ["alg-quadratic-expression", "Quadratic expansion", "Algebra", "H", "expand"],
    ["alg-solve-equation", "Solving equations", "Algebra", "F", "linear-equation"],
    ["alg-linear-rule", "Sequence rules", "Algebra", "F", "nth-term"],
    ["alg-substitution", "Substitution", "Algebra", "F", "function"],
    ["alg-factorising", "Factorising", "Algebra", "H", "factorise"],
    ["alg-rearrange-check", "Formula substitution", "Algebra", "H", "function"],
    ["alg-sequence-term", "Finding a sequence term", "Algebra", "F", "nth-term"],
    ["alg-collecting", "Simplifying expressions", "Algebra", "F", "linear-expression"],
    ["alg-function-input", "Evaluating a function", "Algebra", "H", "function"],
    ["ratio-sharing", "Sharing in a ratio", "Ratio", "F", "ratio-share"],
    ["ratio-unit-cost", "Unit costs", "Ratio", "F", "unit-rate"],
    ["ratio-speed", "Speed", "Ratio", "F", "speed"],
    ["ratio-distance", "Distance", "Ratio", "F", "distance"],
    ["ratio-km-metres", "Kilometres to metres", "Ratio", "F", "unit-convert"],
    ["ratio-scale-drawing", "Scale drawings", "Ratio", "F", "scale"],
    ["ratio-growth", "Compound growth", "Ratio", "H", "growth"],
    ["ratio-density", "Density", "Ratio", "FH", "density"],
    ["ratio-similar-length", "Similar lengths", "Ratio", "H", "similar-length"],
    ["ratio-percent-rise", "Percentage rise", "Ratio", "F", "percent-increase"],
    ["ratio-percent-fall", "Percentage fall", "Ratio", "F", "percent-decrease"],
    ["ratio-best-buy", "Best-buy unit rate", "Ratio", "F", "unit-rate"],
    ["ratio-recipe-scaling", "Recipe scaling", "Ratio", "F", "ratio-share"],
    ["ratio-pressure", "Pressure", "Ratio", "H", "density"],
    ["ratio-proportion", "Direct proportion", "Ratio", "F", "distance"],
    ["ratio-rate-conversion", "Rate conversion", "Ratio", "FH", "unit-convert"],
    ["ratio-linear-scale", "Linear scale factor", "Ratio", "H", "similar-length"],
    ["ratio-area-scale", "Area scale factor", "Ratio", "H", "area-rectangle"],
    ["geo-perimeter", "Rectangle perimeter", "Geometry", "F", "perimeter"],
    ["geo-rectangle-area", "Rectangle area", "Geometry", "F", "area-rectangle"],
    ["geo-triangle-area", "Triangle area", "Geometry", "F", "area-triangle"],
    ["geo-circumference", "Circle circumference", "Geometry", "F", "circle-circumference"],
    ["geo-cuboid-volume", "Cuboid volume", "Geometry", "F", "volume"],
    ["geo-pythagoras", "Pythagoras", "Geometry", "F", "pythagoras"],
    ["geo-straight-angle", "Angles on a line", "Geometry", "F", "straight-angle"],
    ["geo-reverse-bearing", "Reverse bearings", "Geometry", "F", "bearing-reverse"],
    ["geo-polygon-angle", "Regular polygon angles", "Geometry", "H", "polygon-angle"],
    ["geo-reflection", "Reflection in an axis", "Geometry", "F", "reflection"],
    ["geo-special-trig", "Exact trigonometry", "Geometry", "H", "special-trig"],
    ["geo-similar-length", "Similar shapes", "Geometry", "H", "similar-length"],
    ["geo-vector-magnitude", "Vector magnitude", "Geometry", "H", "pythagoras"],
    ["geo-cylinder-volume", "Solid volume", "Geometry", "F", "volume"],
    ["geo-perimeter-context", "Perimeter in context", "Geometry", "F", "perimeter"],
    ["geo-coordinate-reflection", "Coordinate transformation", "Geometry", "F", "reflection"],
    ["prob-single-event", "Single-event probability", "Probability", "F", "single-probability"],
    ["prob-complement", "Complementary events", "Probability", "F", "complement"],
    ["prob-independent", "Independent events", "Probability", "F", "independent"],
    ["prob-without-replacement", "Without replacement", "Probability", "H", "without-replacement"],
    ["prob-sample-space", "Sample spaces", "Probability", "F", "sample-space"],
    ["prob-union", "Combining events", "Probability", "FH", "union"],
    ["prob-relative-frequency", "Relative frequency", "Probability", "F", "relative-frequency"],
    ["prob-expected-frequency", "Expected frequency", "Probability", "F", "expected-frequency"],
    ["prob-tree-path", "Tree-diagram path", "Probability", "H", "without-replacement"],
    ["prob-two-event", "Two-event probability", "Probability", "F", "independent"],
    ["prob-overlap", "Set overlap", "Probability", "FH", "union"],
    ["prob-trial-estimate", "Experimental probability", "Probability", "F", "relative-frequency"],
    ["prob-outcome-count", "Counting outcomes", "Probability", "F", "sample-space"],
    ["prob-complement-event", "Finding a complement", "Probability", "F", "complement"],
    ["prob-tree-independent", "Independent tree branches", "Probability", "FH", "independent"],
    ["stats-mean", "Mean", "Statistics", "F", "mean"],
    ["stats-median", "Median", "Statistics", "F", "median"],
    ["stats-range", "Range", "Statistics", "F", "range"],
    ["stats-weighted-mean", "Weighted mean", "Statistics", "H", "weighted-mean"],
    ["stats-grouped-mean", "Grouped mean estimate", "Statistics", "FH", "grouped-mean"],
    ["stats-interquartile-range", "Interquartile range", "Statistics", "FH", "iqr"],
    ["stats-frequency-density", "Frequency density", "Statistics", "H", "frequency-density"],
    ["stats-pie-angle", "Pie-chart angle", "Statistics", "F", "pie-angle"],
    ["stats-frequency-total", "Frequency totals", "Statistics", "F", "add"],
    ["stats-capture-recapture", "Capture-recapture", "Statistics", "H", "capture-recapture"],
    ["stats-data-mean", "Mean from a data set", "Statistics", "F", "mean"],
    ["stats-grouped-frequency", "Grouped frequency", "Statistics", "FH", "grouped-mean"],
    ["stats-chart-frequency", "Reading chart totals", "Statistics", "F", "add"],
    ["stats-median-data", "Median from data", "Statistics", "F", "median"],
    ["stats-range-data", "Comparing ranges", "Statistics", "F", "range"]
  ];

  const registry = {};
  for (const definition of definitions) {
    const [id, title, area, tier, kind] = definition;
    registry[id] = {
      title,
      area,
      tier,
      make: function(rng) {
        if (typeof rng !== "function") throw new TypeError("Pass a seeded random number function.");
        return makeQuestion(kind, rng);
      }
    };
  }
  window.GEN = registry;
  window.GEN_SEEDED = seeded;
})();
