// Extra Math Master practice. Each entry is [question, answer, hint].
// Keep this file separate so the original TOPICS questions stay unchanged.
window.MORE_QUESTIONS = [
  function(n) {
    const a = 12 + n * 3, b = 2 + n, c = 3 + n % 4;
    return [
      [`Work out ${a} + ${b} × ${c}.`, String(a + b * c), "Use order of operations. Multiply before adding."],
      [`Work out (${a} − ${b}) × 2.`, String((a - b) * 2), "Work out the brackets first."],
      [`What is the next multiple of ${c} after ${a}?`, String((Math.floor(a / c) + 1) * c), "List the multiples of the number."],
      [`Is ${a + 1} even or odd?`, (a + 1) % 2 ? "Odd" : "Even", "An even number is divisible by 2."],
      [`Round ${a * 137 + 8} to the nearest hundred.`, String(Math.round((a * 137 + 8) / 100) * 100), "Check the tens digit."],
      [`Find the highest common factor of ${6 + n} and ${12 + 2 * n}.`, String(gcd(6 + n, 12 + 2 * n)), "Find the greatest number that divides both exactly."],
      [`Find the lowest common multiple of ${4 + n % 4} and ${6 + n % 5}.`, String(lcm(4 + n % 4, 6 + n % 5)), "Find the first positive multiple shared by both numbers."],
      [`Write ${24 + n * 6} as a product of prime factors.`, primeFactors(24 + n * 6), "Divide by the smallest prime numbers first."],
      [`Work out ${30 + n * 2} − ${17 + n}.`, String(13 + n), "Subtract the smaller value from the larger."],
      [`Estimate ${49 + n} × ${19 + n}.`, `About ${Math.round((49 + n) / 10) * 10 * Math.round((19 + n) / 10) * 10}`, "Round both numbers to easy tens, then multiply."]
    ];
  },
  function(n) {
    const a = 1 + n % 5, b = 2 + n % 6;
    return [
      [`Simplify ${2 * a}/${2 * b}.`, fraction(a, b), "Divide the top and bottom by their highest common factor."],
      [`Add ${a}/${b} and 1/${b}.`, fraction(a + 1, b), "The denominators already match, so add the numerators."],
      [`Subtract 1/${b} from ${a + 1}/${b}.`, fraction(a, b), "Keep the denominator and subtract the numerators."],
      [`Multiply ${a}/${b} by 2/3.`, fraction(2 * a, 3 * b), "Multiply numerator by numerator and denominator by denominator."],
      [`Divide ${a}/${b} by 2/3.`, fraction(3 * a, 2 * b), "Keep the first fraction and multiply by the reciprocal of the second."],
      [`Write ${a}/${b} as a decimal to 3 decimal places.`, (a / b).toFixed(3), "Divide the numerator by the denominator."],
      [`Find 10% of ${b * 100}.`, String(b * 10), "Ten per cent is one tenth."],
      [`Increase ${b * 20} by 25%.`, String(b * 25), "A 25% increase uses the multiplier 1.25."],
      [`Share ${b * 12} in the ratio 1:${a}. Find the larger share.`, String(b * 12 * a / (a + 1)), "Add the parts. Find one part, then multiply by the larger ratio part."],
      [`A price changes from ${b * 10} to ${b * 12}. Find the percentage increase.`, "20%", "Divide the increase by the original price, then multiply by 100."]
    ];
  },
  function(n) {
    const a = 2 + n % 7, x = 2 + n % 8, b = a * x;
    return [
      [`Solve ${a}x = ${b}.`, `x = ${x}`, "Divide both sides by the coefficient of x."],
      [`Solve x + ${a} = ${x + a}.`, `x = ${x}`, `Subtract ${a} from both sides.`],
      [`Simplify ${a}x + ${x}x.`, `${a + x}x`, "Collect like terms by adding their coefficients."],
      [`Expand ${a}(x + ${x}).`, `${a}x + ${a * x}`, "Multiply each term inside the bracket by the number outside."],
      [`Factorise ${a}x + ${a * x}.`, `${a}(x + ${x})`, "Take out the highest common factor."],
      [`If x=${x}, find 3x + ${a}.`, String(3 * x + a), "Substitute the value of x, then follow order of operations."],
      [`Solve ${a}x + ${a} = ${a * x + a}.`, `x = ${x}`, `Subtract ${a}, then divide by ${a}.`],
      [`Solve x − ${a} = ${x - a}.`, `x = ${x}`, `Add ${a} to both sides.`],
      [`Expand (x + ${a})(x + 1).`, `x² + ${a + 1}x + ${a}`, "Multiply each term in the first bracket by each term in the second."],
      [`Find the value of 2x² when x=${x}.`, String(2 * x * x), "Square x first, then multiply by 2."]
    ];
  },
  function(n) {
    const x1 = 1 + n, y1 = 2 + n, x2 = x1 + 2, y2 = y1 + 2 * (2 + n % 3);
    return [
      [`Find the gradient through (${x1},${y1}) and (${x2},${y2}).`, String((y2 - y1) / (x2 - x1)), "Gradient is change in y divided by change in x."],
      [`Find the midpoint of (${x1},${y1}) and (${x2},${y2}).`, `(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`, "Find the mean of the x-coordinates and the mean of the y-coordinates."],
      [`Find the distance between (${x1},${y1}) and (${x1},${y2}).`, String(Math.abs(y2 - y1)), "The x-coordinate is the same, so subtract the y-coordinates."],
      [`For y=${2 + n}x+3, find y when x=2.`, String(2 * (2 + n) + 3), "Substitute 2 for x."],
      [`For y=${n + 4}, state the y-intercept.`, String(n + 4), "The y-intercept is the value of y when x is zero."],
      [`For y=−x+${n + 5}, state the gradient.`, "−1", "In y=mx+c, the gradient is m."],
      [`If y=2x, find y when x=${n + 3}.`, String(2 * (n + 3)), "Multiply x by 2."],
      [`The point (0,${n + 2}) is on an axis. Which axis?`, "The y-axis", "Points on the y-axis have x-coordinate zero."],
      [`Find the distance between (${n},0) and (${n + 4},0).`, "4", "Both points lie on the x-axis; subtract their x-coordinates."],
      [`A line has gradient 3. How much does y change when x increases by 2?`, "6", "Change in y equals gradient times change in x."]
    ];
  },
  function(n) {
    const a = 3 + n, b = 4 + n;
    return [
      [`A triangle has angles ${40 + n}° and ${60 + n}°. Find the third angle.`, `${80 - 2 * n}°`, "Angles in a triangle add to 180°."],
      [`Find the perimeter of a ${a} cm by ${b} cm rectangle.`, `${2 * (a + b)} cm`, "Add all four sides, or use 2(length + width)."],
      [`Find the area of a ${a} cm by ${b} cm rectangle.`, `${a * b} cm²`, "Area of a rectangle is length times width."],
      [`A square has side ${a} cm. Find its area.`, `${a * a} cm²`, "Square the side length."],
      [`A square has side ${a} cm. Find its perimeter.`, `${4 * a} cm`, "A square has four equal sides."],
      [`A right triangle has shorter sides ${3 + n % 3} cm and 4 cm. Find its hypotenuse.`, `${Math.sqrt((3 + n % 3) ** 2 + 16)} cm`, "Use Pythagoras: hypotenuse squared is the sum of the two shorter sides squared."],
      [`Two angles on a straight line are ${70 + n}° and x°. Find x.`, `${110 - n}°`, "Angles on a straight line add to 180°."],
      [`A circle has radius ${a} cm. Give its circumference in terms of π.`, `${2 * a}π cm`, "Circumference is 2πr."],
      [`A circle has radius ${a} cm. Give its area in terms of π.`, `${a * a}π cm²`, "Area is πr²."],
      [`A cuboid measures ${a} cm by ${b} cm by 2 cm. Find its volume.`, `${a * b * 2} cm³`, "Multiply length, width and height."]
    ];
  },
  function(n) {
    const a = 3 + n % 5, b = 4 + n % 4;
    return [
      [`In a right triangle, opposite=3 and hypotenuse=5. Find sin θ.`, "3/5 = 0.6", "SOH: sine is opposite over hypotenuse."],
      [`In a right triangle, adjacent=4 and hypotenuse=5. Find cos θ.`, "4/5 = 0.8", "CAH: cosine is adjacent over hypotenuse."],
      [`In a right triangle, opposite=3 and adjacent=4. Find tan θ.`, "3/4 = 0.75", "TOA: tangent is opposite over adjacent."],
      [`What is sin 30°?`, "1/2", "Recall the exact special-angle value."],
      [`What is cos 60°?`, "1/2", "Recall the exact special-angle value."],
      [`Convert 180° to radians.`, "π", "180 degrees equals π radians."],
      [`Convert 90° to radians.`, "π/2", "90 degrees is half of 180 degrees."],
      [`A right triangle has opposite 6 and hypotenuse 10. Find sin θ.`, "0.6", "Divide the opposite side by the hypotenuse."],
      [`A right triangle has adjacent 8 and opposite 6. Find tan θ.`, "3/4", "Divide opposite by adjacent, then simplify."],
      [`If sin θ=1/2 and θ is acute, find θ.`, "30°", "Use the inverse sine or recall the exact special angle."]
    ];
  },
  function(n) {
    const a = 2 + n % 5, p = 2 + n % 4;
    return [
      [`Work out ${a}³.`, String(a ** 3), "A power means repeated multiplication."],
      [`Work out 2⁻³.`, "1/8", "A negative power means take the reciprocal."],
      [`Find √${(a + 1) ** 2}.`, String(a + 1), "A square root undoes squaring."],
      [`Find ∛${(a + 1) ** 3}.`, String(a + 1), "A cube root undoes cubing."],
      [`Simplify 2³ × 2⁴.`, "2⁷", "When multiplying powers with the same base, add the indices."],
      [`Simplify 5⁶ ÷ 5².`, "5⁴", "When dividing powers with the same base, subtract the indices."],
      [`Find log₂ ${2 ** p}.`, String(p), "A logarithm asks what power gives the number."],
      [`Find ln(e³).`, "3", "Natural log and the exponential function undo each other."],
      [`Simplify √${4 * (a + 1) ** 2}.`, `${2 * (a + 1)}`, "Take the square root of each square factor."],
      [`Write 3,400,000 in standard form.`, "3.4 × 10⁶", "Move the decimal point so the first number is at least 1 and less than 10."]
    ];
  },
  function(n) {
    const a = 2 + n % 7;
    return [
      [`Differentiate x⁴.`, "4x³", "Use the power rule: bring the power down, then subtract 1."],
      [`Differentiate ${a}x².`, `${2 * a}x`, "Multiply the coefficient by the power, then reduce the power by 1."],
      [`Differentiate 5x³ + 2x.`, "15x² + 2", "Differentiate each term separately."],
      [`Integrate 2x.`, "x² + C", "Increase the power by 1, then divide by the new power."],
      [`Find the gradient of y=3x+4.`, "3", "For a straight line y=mx+c, the gradient is m."],
      [`Find the stationary point of y=x².`, "(0, 0)", "Set the derivative 2x equal to zero."],
      [`Differentiate x⁵.`, "5x⁴", "Apply the power rule."],
      [`Find ∫₀² 2x dx.`, "4", "An antiderivative is x²; evaluate at 2 and at 0."],
      [`Differentiate 7.`, "0", "The derivative of a constant is zero."],
      [`Find the slope of y=x² at x=3.`, "6", "Differentiate to get 2x, then substitute x=3."]
    ];
  },
  function(n) {
    const a = 2 + n % 5, b = 1 + n % 4;
    return [
      [`A fair coin is tossed. Find P(heads).`, "1/2", "There is one favourable outcome out of two."],
      [`A fair die is rolled. Find P(even).`, "1/2", "Three of the six outcomes are even."],
      [`A bag has ${a} red and ${b} blue counters. Find P(red).`, fraction(a, a + b), "Divide the number of red counters by the total number."],
      [`If P(A)=0.3, find P(not A).`, "0.7", "An event and its complement add to 1."],
      [`Two fair coins are tossed. Find P(two heads).`, "1/4", "Multiply the independent probabilities 1/2 and 1/2."],
      [`A fair die is rolled. Find P(rolling more than 4).`, "1/3", "The favourable outcomes are 5 and 6 out of 6."],
      [`If P(A and B)=0.2 and P(B)=0.5, find P(A|B).`, "0.4", "Conditional probability is P(A and B) divided by P(B)."],
      [`A fair die is rolled 60 times. How many sixes are expected?`, "10", "Expected count is probability times number of trials."],
      [`A bag has 3 red and 2 blue counters. Find P(red then blue), without replacement.`, "3/10", "Multiply 3/5 by 2/4 because one red counter is removed."],
      [`A fair coin is tossed twice. Find P(at least one head).`, "3/4", "Use 1 minus the probability of no heads."]
    ];
  },
  function(n) {
    const a = 2 + n % 6;
    return [
      [`Find the mean of 2, 4, 6.`, "4", "Add the values, then divide by how many there are."],
      [`Find the median of 1, 5, 3.`, "3", "Put the values in order and choose the middle."],
      [`Find the range of ${a}, ${a + 3}, ${a + 8}.`, "8", "Subtract the smallest value from the largest."],
      [`Find the mode of 2, 3, 3, 5.`, "3", "The mode is the value that appears most often."],
      [`The mean of four numbers is 6. Find their total.`, "24", "Total equals mean times the number of values."],
      [`Find the mean of values 1, 2 with frequencies 2, 3.`, "1.6", "Multiply each value by its frequency, add, then divide by total frequency."],
      [`Does correlation prove causation?`, "No", "A relationship can be caused by another factor or by chance."],
      [`Find the interquartile range if Q1=4 and Q3=10.`, "6", "IQR equals Q3 minus Q1."],
      [`A group has 12 boys and 8 girls. What fraction are girls?`, "2/5", "Girls divided by the total, then simplify."],
      [`A class has 20 pupils. 5 choose chess. Find the pie-chart angle.`, "90°", "Use 5/20 of 360 degrees."]
    ];
  },
  function(n) {
    const a = 1 + n % 5, b = 2 + n % 4;
    return [
      [`Add the matrices [[1,2],[3,4]] and [[1,0],[0,1]].`, "[[2,2],[3,5]]", "Add entries in the same positions."],
      [`Find the determinant of [[2,1],[3,4]].`, "5", "For a 2 by 2 matrix, ad−bc."],
      [`Transpose [[1,2],[3,4]].`, "[[1,3],[2,4]]", "Swap rows and columns."],
      [`Multiply [[1,0],[0,1]] by [[${a},0],[0,${b}]].`, `[[${a},0],[0,${b}]]`, "The identity matrix leaves a matrix unchanged."],
      [`Multiply [[2,1],[0,1]] by [[1],[2]].`, "[[4],[2]]", "Multiply each row by the column and add."],
      [`What is the identity matrix of size 2?`, "[[1,0],[0,1]]", "It has ones on the main diagonal and zeros elsewhere."],
      [`Find the trace of [[${a},0],[0,${b}]].`, String(a + b), "The trace is the sum of diagonal entries."],
      [`Is [[1,0],[0,1]] invertible?`, "Yes", "Its determinant is 1, which is not zero."],
      [`Find the determinant of [[1,2],[2,4]].`, "0", "Calculate 1×4−2×2."],
      [`What are the eigenvalues of [[2,0],[0,3]]?`, "2 and 3", "For a diagonal matrix, the diagonal entries are the eigenvalues."]
    ];
  },
  function(n) {
    const a = 17 + n, b = 5 + n % 4;
    return [
      [`Find ${a} mod ${b}.`, String(a % b), "Divide and give the remainder."],
      [`Is ${31 + n * 2} prime?`, isPrime(31 + n * 2) ? "Yes" : "No", "Test whether a prime number up to the square root divides it."],
      [`Find the GCD of 48 and 18.`, "6", "Use common factors or the Euclidean algorithm."],
      [`Find the LCM of 6 and 8.`, "24", "Find the smallest positive multiple shared by both."],
      [`What is the remainder when ${20 + n} is divided by 3?`, String((20 + n) % 3), "Use the nearest lower multiple of 3."],
      [`Is ${100 + n * 9} divisible by 9?`, digitSum(100 + n * 9) % 9 === 0 ? "Yes" : "No", "Add the digits. The sum must be divisible by 9."],
      [`Find the prime factorisation of 30.`, "2 × 3 × 5", "Split the number into prime factors only."],
      [`Find the units digit of 7².`, "9", "Work out 49 and look at its units digit."],
      [`If x ≡ 2 (mod 5), give one possible positive x less than 20.`, "2", "Numbers with this remainder are 2, 7, 12, 17, …"],
      [`Find the last digit of 3⁴.`, "1", "Calculate 3⁴=81."]
    ];
  },
  function(n) {
    return [
      [`If P is true and Q is false, is P AND Q true or false?`, "False", "AND is true only if both statements are true."],
      [`If P is true and Q is false, is P OR Q true or false?`, "True", "OR is true when at least one statement is true."],
      [`What is the negation of “x is even”?`, "x is odd", "Negation states that the original claim is not true."],
      [`If every multiple of 4 is even, is 12 even?`, "Yes", "12 is a multiple of 4, so use the given statement."],
      [`Give the contrapositive of “if n is even, then n² is even”.`, "If n² is odd, then n is odd.", "Swap and negate the conclusion and hypothesis."],
      [`A is {1,2,3} and B is {3,4}. Find A ∩ B.`, "{3}", "The intersection contains elements in both sets."],
      [`A is {1,2,3} and B is {3,4}. Find A ∪ B.`, "{1,2,3,4}", "The union contains each element that appears in either set."],
      [`Is “all squares are rectangles” true?`, "Yes", "A square has four right angles, so it meets the definition of a rectangle."],
      [`What must a counterexample do?`, "Show one case where the statement is false.", "One valid counterexample is enough to disprove a universal claim."],
      [`Complete: an even integer can be written as …`, "2k, where k is an integer", "Use the definition of an even number."]
    ];
  },
  function(n) {
    const a = 3 + n, d = 2 + n % 5;
    return [
      [`Find the 10th term of ${a}, ${a + d}, ${a + 2 * d}, …`, String(a + 9 * d), "Use first term plus nine common differences."],
      [`Find the common difference of ${a}, ${a + d}, ${a + 2 * d}.`, String(d), "Subtract one term from the next."],
      [`Find the sum 1+2+…+10.`, "55", "Use n(n+1)/2."],
      [`A geometric sequence starts 2, 6, 18. Find the next term.`, "54", "Multiply each term by the same ratio."],
      [`Find the nth term of 4, 7, 10, 13, …`, "3n + 1", "Start with 3n and adjust so the first term is 4."],
      [`Find the sum of the first 5 terms of 2, 4, 6, 8, …`, "30", "Add the five terms or use the arithmetic sum formula."],
      [`Does 1+1/2+1/4+… converge?`, "Yes, to 2", "This geometric series has ratio 1/2, whose magnitude is less than 1."],
      [`Find the 6th term of 5, 10, 20, …`, "160", "Multiply by 2 for each next term."],
      [`Write 1+2+3+4 using sigma notation.`, "Σ(k=1 to 4) k", "The index runs from 1 to 4 and the term is k."],
      [`Find the 20th term of 2, 5, 8, …`, "59", "Use 2+(20−1)×3."]
    ];
  },
  function(n) {
    const a = 2 + n, b = 1 + n % 4;
    return [
      [`What is i²?`, "−1", "This is the defining rule for i."],
      [`Simplify (2+3i)+(1−i).`, "3+2i", "Add real parts together and imaginary parts together."],
      [`Find the conjugate of ${a}+${b}i.`, `${a}−${b}i`, "Keep the real part and change the sign of the imaginary part."],
      [`Find |3+4i|.`, "5", "Use √(real²+imaginary²)."],
      [`Simplify i³.`, "−i", "Use i³=i²×i."],
      [`Simplify (1+i)(1−i).`, "2", "Use difference of squares and i²=−1."],
      [`What is the real part of 5−2i?`, "5", "The real part is the number without i."],
      [`What is the imaginary part of 5−2i?`, "−2", "The coefficient of i is the imaginary part."],
      [`Simplify (2i)².`, "−4", "Square 2 and use i²=−1."],
      [`Find |6+8i|.`, "10", "Use √(6²+8²)."]
    ];
  },
  function(n) {
    const a = 2 + n, b = 3 + n % 4;
    return [
      [`Find the length of vector (3, 4).`, "5", "Use √(x²+y²)."],
      [`Find the midpoint of (0,0) and (4,6).`, "(2, 3)", "Average the x-values and average the y-values."],
      [`Find the distance from (0,0) to (3,4).`, "5", "Use Pythagoras on the coordinate differences."],
      [`Find (1,2)·(3,4).`, "11", "Multiply matching components, then add."],
      [`Add vectors (2,1) and (−1,3).`, "(1, 4)", "Add matching components."],
      [`Find 3(2,−1).`, "(6, −3)", "Multiply each component by 3."],
      [`Are (1,0) and (0,1) orthogonal?`, "Yes", "Their dot product is zero."],
      [`Find the magnitude of (5,12).`, "13", "Use √(5²+12²)."],
      [`Find the distance between (1,1) and (4,5).`, "5", "The changes are 3 and 4; use Pythagoras."],
      [`Find (1,2,3)·(4,5,6).`, "32", "Calculate 1×4+2×5+3×6."]
    ];
  },
  function(n) {
    const a = 2 + n;
    return [
      [`Find the centre and radius of x²+y²=25.`, "Centre (0,0), radius 5", "Compare with (x−a)²+(y−b)²=r²."],
      [`Find the distance between (1,1) and (4,5).`, "5", "Use the distance formula and Pythagoras."],
      [`Find the midpoint of (2,4) and (8,10).`, "(5, 7)", "Average the two x-values and the two y-values."],
      [`For y=2x+3, state the gradient.`, "2", "Read the coefficient of x."],
      [`Does (3,4) lie on x²+y²=25?`, "Yes", "Substitute x=3 and y=4."],
      [`Find the x-intercept of y=x+2.`, "(−2, 0)", "Set y=0 and solve for x."],
      [`Find the y-intercept of y=3x−4.`, "(0, −4)", "Set x=0."],
      [`Find the centre of (x−2)²+(y+3)²=16.`, "(2, −3)", "Read the signs carefully in the circle form."],
      [`Find the radius of (x−2)²+(y+3)²=16.`, "4", "The radius is the square root of the right-hand side."],
      [`Find the gradient through (0,1) and (2,5).`, "2", "Gradient is (5−1)/(2−0)."]
    ];
  },
  function(n) {
    const a = 2 + n;
    return [
      [`Reflect (3,2) in the x-axis.`, "(3, −2)", "Keep x and change the sign of y."],
      [`Enlarge (2,3) by scale factor 2 from the origin.`, "(4, 6)", "Multiply both coordinates by 2."],
      [`Translate (1,2) by vector (3,−1).`, "(4, 1)", "Add the vector components to the point."],
      [`Rotate (1,0) 90° anticlockwise about the origin.`, "(0, 1)", "A 90° anticlockwise turn sends the positive x direction to positive y."],
      [`Reflect (${a},1) in the y-axis.`, `(${-a}, 1)`, "Change the sign of x and keep y."],
      [`Enlarge (1,−2) by scale factor 3 from the origin.`, "(3, −6)", "Multiply each coordinate by 3."],
      [`Translate (2,2) by vector (−1,4).`, "(1, 6)", "Add the vector to the point."],
      [`What does a reflection do to a shape's size?`, "It keeps the same size.", "A reflection is a rigid transformation."],
      [`Reflect (−2,5) in the x-axis.`, "(−2, −5)", "Change the sign of y."],
      [`Enlarge (3,1) by scale factor 2.`, "(6, 2)", "Multiply both coordinates by 2."]
    ];
  },
  function(n) {
    const a = 4 + n % 5;
    return [
      [`Find ${a}!.`, String(factorial(a)), "Multiply the positive integers from 1 to the number."],
      [`How many ways can 2 different books be arranged from 4 books?`, "12", "Use 4 choices for the first place and 3 for the second."],
      [`Find C(5,2).`, "10", "Use 5×4 divided by 2×1."],
      [`How many ways can 3 items be chosen from 6?`, "20", "Use combinations because order does not matter."],
      [`How many outcomes are there for 3 coin tosses?`, "8", "Each toss has 2 choices, so use 2³."],
      [`How many ways can 3 different objects be arranged?`, "6", "There are 3! orders."],
      [`Find C(6,1).`, "6", "Choosing one item from six gives six choices."],
      [`How many 2-digit codes can use digits 1 to 4 if repeats are allowed?`, "16", "There are four choices for each of two positions."],
      [`Find the coefficient of x in (1+x)³.`, "3", "Expand or use the third row of Pascal's triangle."],
      [`How many ways can one item be chosen from 5?`, "5", "There are five possible choices."]
    ];
  },
  function(n) {
    const a = 2 + n % 5;
    return [
      [`Find the remainder when x²+1 is divided by x−2.`, "5", "Use the remainder theorem and substitute x=2."],
      [`Factorise x²−1.`, "(x−1)(x+1)", "Use the difference of two squares."],
      [`Simplify (x²−1)/(x−1), where x≠1.`, "x+1", "Factorise the numerator, then cancel the common factor."],
      [`Find the remainder when x²+3x+2 is divided by x−1.`, "6", "Substitute x=1."],
      [`Simplify (x²−4)/(x−2), where x≠2.`, "x+2", "Factorise x²−4 and cancel x−2."],
      [`Find the degree of 3x⁴−2x+1.`, "4", "The degree is the highest power of x."],
      [`What is the coefficient of x² in 5x²+3x−1?`, "5", "The coefficient is the number multiplying x²."],
      [`Is x²+1 divisible by x−2 with remainder 0?`, "No", "Substitute x=2; the remainder is 5."],
      [`Simplify (x²+2x)/x, where x≠0.`, "x+2", "Factor out x and cancel."],
      [`Find the constant term of x³+4x−7.`, "−7", "The constant term has no x."]
    ];
  },
  function(n) {
    return [
      [`A triangle has angles 40°, 60° and x°. Find x.`, "80°", "Triangle angles add to 180°."],
      [`What is the sum of angles in a Euclidean triangle?`, "180°", "This is the flat-plane triangle angle rule."],
      [`How many degrees are in a full turn?`, "360°", "A full turn returns to the starting direction."],
      [`A right angle is how many degrees?`, "90°", "A right angle is one quarter of a full turn."],
      [`On a sphere, can a triangle's angles add to more than 180°?`, "Yes", "Curved surfaces do not follow the flat-plane angle sum."],
      [`How many sides does a pentagon have?`, "5", "The prefix penta means five."],
      [`What is the sum of angles in a quadrilateral?`, "360°", "Split it into two triangles."],
      [`A regular hexagon has what order of rotational symmetry?`, "6", "It matches itself six times in a full turn."],
      [`Are parallel lines in Euclidean geometry ever the same line?`, "No", "Parallel lines are distinct and do not meet."],
      [`A triangle has angles 90° and 35°. Find the third angle.`, "55°", "Subtract the known angles from 180°."]
    ];
  },
  function(n) {
    const a = 2 + n % 7;
    return [
      [`Find the determinant of [[2,1],[3,4]].`, "5", "For a 2×2 matrix, calculate ad−bc."],
      [`Find the eigenvalues of [[2,0],[0,3]].`, "2 and 3", "For a diagonal matrix, the diagonal entries are eigenvalues."],
      [`Are (1,0) and (0,1) orthogonal?`, "Yes", "Find their dot product."],
      [`Find the dimension of 3D space.`, "3", "Dimension counts independent coordinate directions."],
      [`Find the trace of [[${a},0],[0,2]].`, String(a + 2), "Add the diagonal entries."],
      [`What is the determinant of the identity matrix [[1,0],[0,1]]?`, "1", "Calculate 1×1−0×0."],
      [`Find the dot product of (1,2) and (3,4).`, "11", "Calculate 1×3+2×4."],
      [`How many basis vectors are needed for a 2D plane?`, "2", "A basis has one independent vector for each dimension."],
      [`Is the zero vector orthogonal to every vector?`, "Yes", "Its dot product with any vector is zero."],
      [`Find the determinant of [[1,2],[2,4]].`, "0", "Calculate 1×4−2×2."]
    ];
  },
  function(n) {
    const a = 2 + n % 6;
    return [
      [`Find ∂/∂x of x²y.`, "2xy", "Treat y as a constant and differentiate with respect to x."],
      [`Find ∂/∂y of x²y.`, "x²", "Treat x as a constant."],
      [`Find the gradient of x²+y² at (1,2).`, "(2, 4)", "Differentiate in x and y, then substitute the point."],
      [`Find ∫₀¹ x dx.`, "1/2", "An antiderivative is x²/2; evaluate at the endpoints."],
      [`Find the gradient of f(x,y)=x²+y².`, "(2x, 2y)", "The gradient is the vector of partial derivatives."],
      [`Differentiate ${a}x² with respect to x.`, `${2 * a}x`, "Apply the power rule."],
      [`Find ∂/∂x of 3xy when y is constant.`, "3y", "Treat y as a constant multiplier."],
      [`Find ∂/∂y of 4xy².`, "8xy", "Treat 4x as constant and use the power rule."],
      [`Find the gradient of x²+y² at (0,0).`, "(0, 0)", "Substitute x=0 and y=0 into (2x,2y)."],
      [`Evaluate ∫₀² 1 dx.`, "2", "The area under y=1 from 0 to 2 is a rectangle."]
    ];
  },
  function(n) {
    const a = 2 + n;
    return [
      [`What is the order of y''+y=0?`, "2", "The order is the highest derivative present."],
      [`Solve dy/dx=2y, y(0)=1.`, "y=e^(2x)", "The exponential function has derivative proportional to itself."],
      [`If dy/dx=3, how does y change over 2 units of x?`, "It increases by 6.", "Change equals rate times interval."],
      [`What is a solution curve?`, "A function that satisfies the differential equation.", "Substitute the function and its derivatives to check."],
      [`If y'=y and y(0)=1, what is y(1)?`, "e", "The solution is y=e^x."],
      [`What does an initial condition specify?`, "A value of the solution at a given input.", "It selects one particular solution."],
      [`Is dy/dx=5 a first-order or second-order equation?`, "First-order", "The highest derivative is the first derivative."],
      [`If dy/dx=2 and x increases by 3, what is the change in y?`, "6", "Multiply the constant rate by the interval."],
      [`What is the highest derivative in y'''+y=0?`, "Third derivative", "Count the primes on y."],
      [`If y'=0 for all x, what type of function is y?`, "A constant", "A function with zero rate of change does not change."]
    ];
  },
  function(n) {
    const w = 3 + n, g = 2 + n % 5;
    return [
      [`w=${w}, gradient=${g}, learning rate=0.5. Find the new w.`, String(w - 0.5 * g), "Use w_new = w − learning rate × gradient."],
      [`Find the minimum of (x−2)²+1.`, "1 at x=2", "A square is at least zero and is zero when x=2."],
      [`Use one Euler step for y'=y, y=1, step size 0.1.`, "1.1", "Add step size times gradient: y_new=y+h y'."],
      [`Round 3.14159 to 2 decimal places.`, "3.14", "Check the third decimal digit."],
      [`A cost falls from 20 to 15. What is the decrease?`, "5", "Subtract the new cost from the old cost."],
      [`Use gradient descent: w=4, gradient=2, learning rate=0.1.`, "3.8", "Subtract 0.1×2 from 4."],
      [`Estimate 49×21 by rounding to tens.`, "1000", "Use 50×20."],
      [`Find the minimum of (x+3)²+2.`, "2 at x=−3", "The square term is smallest when it is zero."],
      [`If a model error is 0.4 and falls by 0.1, what is the new error?`, "0.3", "Subtract the improvement from the starting error."],
      [`A quantity is 12 and grows by 50%. What is the new quantity?`, "18", "Multiply by 1.5."]
    ];
  }
];

function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return Math.abs(a);
}
function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }
function fraction(a, b) {
  const common = gcd(a, b);
  return `${a / common}/${b / common}`;
}
function primeFactors(value) {
  const factors = [];
  for (let p = 2; p * p <= value; p++) {
    while (value % p === 0) { factors.push(p); value /= p; }
  }
  if (value > 1) factors.push(value);
  const counts = [...new Set(factors)].map(p => factors.filter(x => x === p).length);
  return [...new Set(factors)].map((p, i) => counts[i] > 1 ? `${p}^${counts[i]}` : String(p)).join(" × ");
}
function isPrime(value) {
  if (value < 2) return false;
  for (let p = 2; p * p <= value; p++) if (value % p === 0) return false;
  return true;
}
function digitSum(value) { return String(value).split("").reduce((sum, digit) => sum + Number(digit), 0); }
function factorial(value) { let result = 1; for (let i = 2; i <= value; i++) result *= i; return result; }

window.MORE_QUESTIONS = window.MORE_QUESTIONS.map((makeQuestions, topicIndex) =>
  makeQuestions(topicIndex).map((question, questionIndex) => [
    question[0], question[1], question[2], "", "M"
  ])
);
