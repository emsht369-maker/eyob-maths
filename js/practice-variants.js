"use strict";

window.PRACTICE_VARIATION_GENERATOR = function(topicIndex, variation) {
  const n = Math.max(1, Math.floor(variation));
  const a = n + 2;
  const b = 2 + n % 9;
  const c = 3 + n % 7;
  const k = 1 + n % 5;
  const gcd = (left, right) => {
    while (right) [left, right] = [right, left % right];
    return Math.abs(left);
  };
  const fraction = (numerator, denominator) => {
    const common = gcd(numerator, denominator);
    return `${numerator / common}/${denominator / common}`;
  };
  const factorial = value => {
    let result = 1;
    for (let factor = 2; factor <= value; factor += 1) result *= factor;
    return result;
  };
  switch (topicIndex) {
    case 0:
      return [
        [`Work out ${a} + ${b} × ${c}.`, String(a + b * c), "Multiply first, then add."],
        [`Work out (${a} − ${b}) × ${k}.`, String((a - b) * k), "Work out the brackets first."],
        [`Divide ${a * k} by ${k}.`, String(a), "Use multiplication to check your division."]
      ];
    case 1:
      return [
        [`Find ${b * 10}% of ${a * 10}.`, String(a * b), "Convert the percentage to a multiplier."],
        [`Simplify ${a}/${a * k}.`, fraction(1, k), "Divide the numerator and denominator by their common factor."],
        [`Increase ${a * 4} by 25%.`, String(a * 5), "A 25% increase is the same as multiplying by 1.25."]
      ];
    case 2:
      return [
        [`Solve ${b}x + ${c} = ${b * a + c}.`, `x = ${a}`, "Subtract the constant, then divide by the coefficient of x."],
        [`If x = ${a}, find ${b}x − ${c}.`, String(b * a - c), "Substitute the value of x, then calculate."],
        [`Solve ${b}x − ${c} = ${b * a - c}.`, `x = ${a}`, "Add the constant to both sides, then divide."]
      ];
    case 3:
      return [
        [`A line passes through (0, ${c}) and (2, ${2 * b + c}). Find its gradient.`, String(b), "Gradient is change in y divided by change in x."],
        [`For y = ${b}x + ${c}, find y when x = ${a}.`, String(b * a + c), "Substitute x into the equation."],
        [`For y = ${b}x + ${c}, state the y-intercept.`, String(c), "The y-intercept is the value of y when x = 0."]
      ];
    case 4:
      return [
        [`Find the area of a ${a} cm by ${b} cm rectangle.`, `${a * b} cm²`, "Multiply length by width."],
        [`Find the perimeter of a ${a} cm by ${b} cm rectangle.`, `${2 * (a + b)} cm`, "Add the four side lengths."],
        [`Two angles in a triangle are ${a}° and ${b}°. Find the third angle.`, `${180 - a - b}°`, "Angles in a triangle add to 180°."]
      ];
    case 5: {
      const angle = [30, 45, 60][n % 3];
      const exactSine = ["1/2", "√2/2", "√3/2"][n % 3];
      const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17]];
      const [opposite, adjacent, hypotenuse] = triples[n % triples.length].map(side => side * n);
      return [
        [`A right triangle has opposite side ${opposite} and hypotenuse ${hypotenuse}. Find sin θ.`, fraction(opposite, hypotenuse), "Use SOH: sine = opposite ÷ hypotenuse."],
        [`A right triangle has adjacent side ${adjacent} and hypotenuse ${hypotenuse}. Find cos θ.`, fraction(adjacent, hypotenuse), "Use CAH: cosine = adjacent ÷ hypotenuse."],
        [`Find sin ${angle}° exactly.`, exactSine, "Recall the exact sine ratio for this special angle."]
      ];
    }
    case 6:
      return [
        [`Work out ${b}³.`, String(b ** 3), "A cube means multiply the number by itself three times."],
        [`Find √${a * a}.`, String(a), "A square root undoes squaring."],
        [`Find log₂ ${2 ** (2 + n % 6)}.`, String(2 + n % 6), "Ask which power of 2 gives this number."]
      ];
    case 7:
      return [
        [`For f(x) = ${b}x², find f′(${a}).`, String(2 * b * a), "Differentiate b x² to get 2b x, then substitute x."],
        [`Find the gradient of y = ${b}x² + ${c}x at x = ${a}.`, String(2 * b * a + c), "Differentiate each term, then substitute x."],
        [`Find the area under y = ${b}x from x = 0 to x = ${a}.`, String(b * a * a / 2), "The graph makes a triangle: area = base × height ÷ 2."]
      ];
    case 8:
      return [
        [`A bag has ${a} red and ${b} blue counters. Find P(red).`, fraction(a, a + b), "Probability = favourable outcomes ÷ total outcomes."],
        [`If P(A) = ${a}/${a + b}, find P(not A).`, fraction(b, a + b), "A probability and its complement add to 1."],
        [`A fair coin is flipped ${2 + n % 4} times. How many equally likely outcome strings are there?`, String(2 ** (2 + n % 4)), "Each independent flip doubles the number of possible strings."]
      ];
    case 9:
      return [
        [`Find the mean of ${a}, ${a + 2} and ${a + 4}.`, String(a + 2), "Add the three values and divide by 3."],
        [`Find the range of ${a}, ${a + 2} and ${a + 4}.`, "4", "Range = largest value − smallest value."],
        [`Find the median of ${a}, ${a + 2} and ${a + 4}.`, String(a + 2), "Order the values and select the middle one."]
      ];
    case 10:
      return [
        [`Find the determinant of [[${a}, 1], [1, ${b}]].`, String(a * b - 1), "For a 2 by 2 matrix, determinant = ad − bc."],
        [`Multiply [[${a}, 0], [0, 1]] by the vector [2, 3]. Give the first component.`, String(2 * a), "Multiply the first matrix row by the vector column."],
        [`Find the trace of [[${a}, 2], [3, ${b}]].`, String(a + b), "The trace is the sum of the diagonal entries."]
      ];
    case 11:
      return [
        [`Find the remainder when ${a * b + c} is divided by ${b}.`, String(c % b), "Subtract the largest multiple of the divisor that fits."],
        [`Find the HCF of ${a * k} and ${b * k}.`, String(k * gcd(a, b)), "Take the common factor out, then find the HCF."],
        [`Is ${2 * n} divisible by 2?`, "Yes", "An integer is divisible by 2 when its final digit is even."]
      ];
    case 12:
      return [
        [`Let A = {${a}, ${a + 1}, ${a + 2}} and B = {${a + 2}, ${a + 3}}. Find A ∩ B.`, `{${a + 2}}`, "The intersection contains values in both sets."],
        [`Let A = {${a}, ${a + 1}} and B = {${a + 1}, ${a + 2}}. Find the number of elements in A ∪ B.`, "3", "The union lists each value from either set once."],
        [`If P is true and Q is false, is P AND Q true or false?`, "False", "An AND statement is true only when both parts are true."]
      ];
    case 13:
      return [
        [`Find the 8th term of ${a}, ${a + b}, ${a + 2 * b}, …`, String(a + 7 * b), "Use first term + 7 × common difference."],
        [`Find the common difference of ${a}, ${a + b}, ${a + 2 * b}, …`, String(b), "Subtract one term from the next."],
        [`Find the sum of the first ${k} positive integers.`, String(k * (k + 1) / 2), "Use n(n + 1) ÷ 2."]
      ];
    case 14:
      return [
        [`Find the modulus of ${3 * k} + ${4 * k}i.`, String(5 * k), "Use √(real² + imaginary²)."],
        [`Write the conjugate of ${a} + ${b}i.`, `${a} − ${b}i`, "Keep the real part and change the sign of the imaginary part."],
        [`Find the real part of ${a} + ${b}i.`, String(a), "The real part is the number without i."]
      ];
    case 15:
      return [
        [`Find the dot product of (${a}, 2) and (3, ${b}).`, String(3 * a + 2 * b), "Multiply matching components and add the products."],
        [`Find the magnitude of the vector (${3 * k}, ${4 * k}).`, String(5 * k), "Use √(x² + y²)."],
        [`What is the first component of (${a}, ${b}) + (2, 3)?`, String(a + 2), "Add the first components."]
      ];
    case 16:
      return [
        [`Find the distance between (${a}, 0) and (${a + b}, 0).`, String(b), "For points on a horizontal line, subtract the x-coordinates."],
        [`Find the midpoint of (${a}, 2) and (${a + 4}, 2).`, `(${a + 2}, 2)`, "Average the x-coordinates and the y-coordinates."],
        [`Find the radius of x² + y² = ${a * a}.`, String(a), "In x² + y² = r², the radius is the square root of the constant."]
      ];
    case 17:
      return [
        [`Translate the point (${a}, ${b}) by vector (2, −1). Give the new point.`, `(${a + 2}, ${b - 1})`, "Add the vector components to the point coordinates."],
        [`Reflect the point (${a}, ${b}) in the y-axis. Give the image.`, `(${-a}, ${b})`, "A reflection in the y-axis changes the sign of x only."],
        [`Rotate the point (${a}, 0) 90° anticlockwise about the origin. Give the image.`, `(0, ${a})`, "A 90° anticlockwise rotation maps (x, y) to (−y, x)."]
      ];
    case 18:
      return [
        [`How many ways can 2 different items be chosen from ${a + 2}?`, String((a + 2) * (a + 1) / 2), "Use n(n − 1) ÷ 2 for choosing 2 items."],
        [`How many orders are there for arranging ${k} different books?`, String(factorial(k)), "The number of orders is k factorial."],
        [`A route has ${k} steps, each either left or right. How many routes are possible?`, String(2 ** k), "Each step has 2 choices."]
      ];
    case 19: {
      const secondRoot = a === b ? b + 1 : b;
      return [
        [`Solve x² − ${a + secondRoot}x + ${a * secondRoot} = 0. Give both roots.`, `${a} and ${secondRoot}`, "Find two numbers with product a × b and sum a + b."],
        [`Expand (x + ${a})(x + ${secondRoot}). Give the constant term.`, String(a * secondRoot), "The constant term is the product of the two constants."],
        [`If f(x) = x² − ${a + secondRoot}x + ${a * secondRoot}, find f(0).`, String(a * secondRoot), "Substitute zero; all terms containing x become zero."]
      ];
    }
    case 20:
      return [
        [`Find the interior angle sum of a ${a + 1}-sided polygon.`, `${(a - 1) * 180}°`, "Use (number of sides − 2) × 180°."],
        [`A circle has radius ${a} cm. Find its diameter.`, `${2 * a} cm`, "Diameter = 2 × radius."],
        [`A rectangle has sides ${a} cm and ${b} cm. Find its area.`, `${a * b} cm²`, "Area = length × width."]
      ];
    case 21:
      return [
        [`Multiply [[${a}, 1], [0, ${b}]] by [1, 2]. Give the first component.`, String(a + 2), "Multiply the first row by the vector column."],
        [`Find the determinant of [[${a}, 0], [0, ${b}]].`, String(a * b), "For this diagonal matrix, multiply the diagonal entries."],
        [`Apply the matrix [[1, 0], [0, ${b}]] to point (2, 3). Give the y-coordinate.`, String(3 * b), "The second row gives the new y-coordinate."]
      ];
    case 22:
      return [
        [`Differentiate f(x) = ${a}x² + ${b}x. Find f′(${c}).`, String(2 * a * c + b), "Differentiate to get 2ax + b, then substitute x."],
        [`For f(x) = x² − ${a}x, find f′(${b}).`, String(2 * b - a), "The derivative is 2x − a."],
        [`The curve is y = ${a}x². Find its gradient at x = ${b}.`, String(2 * a * b), "Differentiate y, then substitute the x-coordinate."]
      ];
    case 23:
      return [
        [`Use one Euler step for dy/dt = y, starting at y = ${a} with step size 1. Find the next y.`, String(2 * a), "Euler step: new y = old y + step size × rate."],
        [`If dy/dt = 2y and y = ${a}, find dy/dt.`, String(2 * a), "Substitute the value of y into the differential equation."],
        [`Solve dy/dt = 0. The solution is constant. If y(0) = ${a}, what is y(3)?`, String(a), "A zero rate means y does not change."]
      ];
    case 24:
      return [
        [`A car travels ${a * 12} km in ${a} hours. Find its average speed.`, "12 km/h", "Speed = distance ÷ time."],
        [`Use one gradient-descent step: w = ${a + 3}, gradient = 4, learning rate = 0.25. Find the new w.`, String(a + 2), "New w = old w − learning rate × gradient."],
        [`Round ${a * 100 + 47} to the nearest hundred.`, String(a * 100), "Check the tens digit to decide which hundred is nearest."]
      ];
    default:
      return [];
  }
};
