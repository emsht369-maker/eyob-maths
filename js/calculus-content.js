// Selected question transcriptions checked against MIT OpenCourseWare 18.01SC.
// Original course material: Fall 2010, David Jerison et al., CC BY-NC-SA 4.0.
(() => {
  "use strict";

  const questions = [
    {
      id: "MIT18-01-PS1-1A1A",
      sourceFile: "MIT18_01SC_pset1prb.pdf", sourcePage: 1,
      sourceTitle: "MIT 18.01 Exercises · Problem Set 1",
      answerSourceFile: "MIT18_01SC_pset1sol.pdf", answerSourcePage: 1,
      answerSourceTitle: "MIT 18.01 Exercises · Problem Set 1 Solutions",
      number: "1A-1(a)", topic: "calculus", subtopic: "Functions and graphs", difficulty: "easy",
      questionText: "Complete the square for y = x² − 2x − 1. Enter the equivalent vertex form.",
      hint: "Take half the coefficient of x, square it, and add and subtract that value.",
      answerText: "y = (x − 1)² − 2",
      acceptedAnswers: ["y=(x-1)^2-2", "(x-1)^2-2"],
      finalAnswer: "y = (x − 1)² − 2",
      solutionSteps: [
        "Group the x terms: x² − 2x − 1 = (x² − 2x + 1) − 1 − 1.",
        "The first three terms form a square: (x − 1)² − 2.",
        "So the vertex form is y = (x − 1)² − 2, with vertex (1, −2)."
      ], confidence: "high", verified: true, author: "David Jerison",
      licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare"
    },
    {
      id: "MIT18-01-EX1-Q1A",
      sourceFile: "MIT18_01SCF10_exam1.pdf", sourcePage: 1,
      sourceTitle: "MIT 18.01SC · Exam 1",
      answerSourceFile: "MIT18_01SCF10_exam1sol.pdf", answerSourcePage: 1,
      answerSourceTitle: "MIT 18.01SC · Exam 1 Solutions",
      number: "1(a)", topic: "calculus", subtopic: "Differentiation · quotient rule", difficulty: "medium",
      questionText: "Differentiate f(x) = x / (1 − x²). Simplify your answer.",
      hint: "Use the quotient rule. Remember that the derivative of 1 − x² is −2x.",
      answerText: "f′(x) = (1 + x²) / (1 − x²)²",
      acceptedAnswers: ["(1+x^2)/(1-x^2)^2", "(1+x²)/(1−x²)²", "(1+x2)/(1-x2)2"],
      finalAnswer: "(1 + x²) / (1 − x²)²",
      solutionSteps: [
        "Apply the quotient rule: f′(x) = [(1 − x²) − x(−2x)] / (1 − x²)².",
        "Simplify the numerator: 1 − x² + 2x² = 1 + x².",
        "Therefore f′(x) = (1 + x²) / (1 − x²)². The original function is undefined at x = ±1."
      ], confidence: "high", verified: true, author: "David Jerison",
      licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare"
    },
    {
      id: "MIT18-01-EX2-Q1B",
      sourceFile: "MIT18_01SCF10_exam2.pdf", sourcePage: 1,
      sourceTitle: "MIT 18.01SC · Exam 2",
      answerSourceFile: "MIT18_01SCF10_exam2sol.pdf", answerSourcePage: 1,
      answerSourceTitle: "MIT 18.01SC · Exam 2 Solutions",
      number: "1(b)", topic: "calculus", subtopic: "Approximation · Taylor polynomials", difficulty: "medium",
      questionText: "Use the quadratic approximation of ln(x) at x = 1 to estimate ln(1.2). Give your answer to 2 decimal places.",
      hint: "Use f(1) + f′(1)(x − 1) + ½f″(1)(x − 1)², with x = 1.2.",
      answerText: "0.18",
      acceptedAnswers: ["0.18", ".18"], finalAnswer: "0.18",
      solutionSteps: [
        "For f(x) = ln(x), f(1) = 0, f′(1) = 1, and f″(1) = −1.",
        "The quadratic approximation is ln(x) ≈ (x − 1) − ½(x − 1)².",
        "At x = 1.2, this gives 0.2 − ½(0.2)² = 0.18."
      ], confidence: "high", verified: true, author: "David Jerison",
      licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare"
    },
    {
      id: "MIT18-01-PS3-3A2A",
      sourceFile: "MIT18_01SC_pset3prb.pdf", sourcePage: 1,
      sourceTitle: "MIT 18.01 Exercises · Problem Set 3",
      answerSourceFile: "MIT18_01SC_pset3sol.pdf", answerSourcePage: 1,
      answerSourceTitle: "MIT 18.01 Exercises · Problem Set 3 Solutions",
      number: "3A-2(a)", topic: "calculus", subtopic: "Integration · power rule", difficulty: "easy",
      questionText: "Find the indefinite integral ∫(2x⁴ + 3x² + x + 8) dx.",
      hint: "Integrate each term separately. Add 1 to each power, then divide by the new power.",
      answerText: "(2/5)x⁵ + x³ + x²/2 + 8x + C",
      acceptedAnswers: ["2x^5/5+x^3+x^2/2+8x+c", "(2/5)x^5+x^3+(1/2)x^2+8x+c"],
      finalAnswer: "(2/5)x⁵ + x³ + x²/2 + 8x + C",
      solutionSteps: [
        "Integrate 2x⁴ to get (2/5)x⁵, 3x² to get x³, and x to get x²/2.",
        "The integral of 8 is 8x.",
        "Include the constant of integration: (2/5)x⁵ + x³ + x²/2 + 8x + C."
      ], confidence: "high", verified: true, author: "David Jerison",
      licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare"
    },
    {
      id: "MIT18-01-PS3-3A2C",
      sourceFile: "MIT18_01SC_pset3prb.pdf", sourcePage: 1,
      sourceTitle: "MIT 18.01 Exercises · Problem Set 3",
      answerSourceFile: "MIT18_01SC_pset3sol.pdf", answerSourcePage: 1,
      answerSourceTitle: "MIT 18.01 Exercises · Problem Set 3 Solutions",
      number: "3A-2(c)", topic: "calculus", subtopic: "Integration · substitution", difficulty: "medium",
      questionText: "Evaluate ∫√(8 + 9x) dx.",
      hint: "Let u = 8 + 9x. Then du = 9 dx, so account for the factor 1/9.",
      answerText: "(2/27)(8 + 9x)^(3/2) + C",
      acceptedAnswers: ["2(8+9x)^(3/2)/27+c", "(2/27)(8+9x)^(3/2)+c"],
      finalAnswer: "(2/27)(8 + 9x)^(3/2) + C",
      solutionSteps: [
        "Set u = 8 + 9x, so du = 9 dx and dx = du/9.",
        "Then ∫√(8 + 9x) dx = (1/9)∫u^(1/2) du.",
        "Integrate and substitute back: (1/9)(2/3)u^(3/2) + C = (2/27)(8 + 9x)^(3/2) + C."
      ], confidence: "high", verified: true, author: "David Jerison",
      licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare"
    },
    {
      id: "MIT18-01-PS4-4A1A",
      sourceFile: "MIT18_01SC_pset4prb.pdf", sourcePage: 1,
      sourceTitle: "MIT 18.01 Exercises · Problem Set 4",
      answerSourceFile: "MIT18_01SC_pset4sol.pdf", answerSourcePage: 1,
      answerSourceTitle: "MIT 18.01 Exercises · Problem Set 4 Solutions",
      number: "4A-1(a)", topic: "calculus", subtopic: "Applications of integration · area", difficulty: "medium",
      questionText: "Find the area enclosed by y = 2x² and y = 3x − 1.",
      hint: "First find the intersection points. Between them, integrate (upper curve − lower curve).",
      answerText: "1/24 square units",
      acceptedAnswers: ["1/24", "0.0416666667", "1/24 square units"], finalAnswer: "1/24 square units",
      solutionSteps: [
        "Solve 2x² = 3x − 1: (2x − 1)(x − 1) = 0, so x = 1/2 and x = 1.",
        "On this interval, 3x − 1 is above 2x².",
        "Area = ∫₁/₂¹[(3x − 1) − 2x²] dx = [3x²/2 − x − 2x³/3]₁/₂¹ = 1/24."
      ], confidence: "high", verified: true, author: "David Jerison",
      licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare"
    },
    {
      id: "MIT18-01-PS4-4A2",
      sourceFile: "MIT18_01SC_pset4prb.pdf", sourcePage: 1,
      sourceTitle: "MIT 18.01 Exercises · Problem Set 4",
      answerSourceFile: "MIT18_01SC_pset4sol.pdf", answerSourcePage: 1,
      answerSourceTitle: "MIT 18.01 Exercises · Problem Set 4 Solutions",
      number: "4A-2", topic: "calculus", subtopic: "Applications of integration · area", difficulty: "easy",
      questionText: "Find the area under y = 1 − x² from x = −1 to x = 1.",
      hint: "The function is even, so you can double the area from 0 to 1.",
      answerText: "4/3 square units",
      acceptedAnswers: ["4/3", "1.3333333333", "4/3 square units"], finalAnswer: "4/3 square units",
      solutionSteps: [
        "The curve meets the x-axis where 1 − x² = 0, at x = −1 and x = 1.",
        "Area = ∫₋₁¹(1 − x²) dx = 2∫₀¹(1 − x²) dx.",
        "Evaluate 2[x − x³/3]₀¹ = 2(2/3) = 4/3 square units."
      ], confidence: "high", verified: true, author: "David Jerison",
      licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare"
    },
    {
      id: "MIT18-01-EX3-Q1",
      sourceFile: "MIT18_01SCF10_exam3.pdf", sourcePage: 1,
      sourceTitle: "MIT 18.01SC · Exam 3",
      answerSourceFile: "MIT18_01SCF10_exam3sol.pdf", answerSourcePage: 1,
      answerSourceTitle: "MIT 18.01SC · Exam 3 Solutions",
      number: "1", topic: "calculus", subtopic: "Applications of integration · area between curves", difficulty: "medium",
      questionText: "Find the area between x = y² − 4y and x = 2y − y².",
      hint: "Find the y-values where the curves meet. Integrate the right-hand x-value minus the left-hand x-value.",
      answerText: "9 square units",
      acceptedAnswers: ["9", "9 square units"], finalAnswer: "9 square units",
      solutionSteps: [
        "Set y² − 4y = 2y − y². This gives 2y(y − 3) = 0, so the curves meet at y = 0 and y = 3.",
        "Between these values, (2y − y²) is to the right of (y² − 4y). Their horizontal distance is 6y − 2y².",
        "Area = ∫₀³(6y − 2y²) dy = [3y² − (2/3)y³]₀³ = 27 − 18 = 9 square units."
      ], confidence: "high", verified: true, author: "David Jerison",
      licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare"
    },
    {
      id: "MIT18-01-PS5-5A2C",
      sourceFile: "MIT18_01SC_pset5prb.pdf", sourcePage: 1,
      sourceTitle: "MIT 18.01 Exercises · Problem Set 5",
      answerSourceFile: "MIT18_01SC_pset5sol.pdf", answerSourcePage: 1,
      answerSourceTitle: "MIT 18.01 Exercises · Problem Set 5 Solutions",
      number: "5A-2(c)", topic: "calculus", subtopic: "Integration techniques · inverse trigonometric functions", difficulty: "medium",
      questionText: "Evaluate ∫₋₁¹ 1/√(1 − x²) dx.",
      hint: "An antiderivative is sin⁻¹(x). Remember the principal values at x = −1 and x = 1.",
      answerText: "π",
      acceptedAnswers: ["pi", "π", "3.1415926536"], finalAnswer: "π",
      solutionSteps: [
        "Use d/dx[sin⁻¹(x)] = 1/√(1 − x²) for −1 < x < 1.",
        "Evaluate the antiderivative at the endpoints: sin⁻¹(1) − sin⁻¹(−1).",
        "This is π/2 − (−π/2) = π."
      ], confidence: "high", verified: true, author: "David Jerison",
      licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare"
    },
    {
      id: "MIT18-01-EX4-Q1",
      sourceFile: "MIT18_01SCF10_exam4.pdf", sourcePage: 1,
      sourceTitle: "MIT 18.01SC · Exam 4",
      answerSourceFile: "MIT18_01SCF10_exam4sol.pdf", answerSourcePage: 1,
      answerSourceTitle: "MIT 18.01SC · Exam 4 Solutions",
      number: "1", topic: "calculus", subtopic: "Integration techniques · integration by parts", difficulty: "hard",
      questionText: "Evaluate ∫₁⁴ √t ln(t) dt.",
      hint: "Use integration by parts with u = ln(t) and dv = √t dt.",
      answerText: "(16/3) ln(4) − 28/9",
      acceptedAnswers: ["16ln(4)/3-28/9", "(16/3)ln(4)-28/9", "16/3 ln(4) - 28/9"],
      finalAnswer: "(16/3) ln(4) − 28/9",
      solutionSteps: [
        "Choose u = ln(t), dv = √t dt. Then du = dt/t and v = (2/3)t^(3/2).",
        "Integration by parts gives [(2/3)t^(3/2)ln(t)]₁⁴ − (2/3)∫₁⁴t^(1/2)dt.",
        "Evaluate the boundary term and remaining power integral to get (16/3)ln(4) − 28/9."
      ], confidence: "high", verified: true, author: "David Jerison",
      licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare"
    },
    {
      id: "MIT18-01-FINAL-Q2A",
      sourceFile: "MIT18_01SCF10_final.pdf", sourcePage: 2,
      sourceTitle: "MIT 18.01SC · Final Exam",
      answerSourceFile: "MIT18_01SCF10_finalsol.pdf", answerSourcePage: 1,
      answerSourceTitle: "MIT 18.01SC · Final Exam Answers",
      number: "2(a)", topic: "calculus", subtopic: "Differentiation · tangent lines", difficulty: "easy",
      questionText: "Find the tangent line to y = 3x² − 5x + 2 at x = 2. Enter your answer as y = mx + b.",
      hint: "Differentiate to get the tangent slope, evaluate it at x = 2, then use the point on the curve.",
      answerText: "y = 7x − 10",
      acceptedAnswers: ["y=7x-10", "7x-10"], finalAnswer: "y = 7x − 10",
      solutionSteps: [
        "Differentiate: y′ = 6x − 5, so the slope at x = 2 is 7.",
        "The curve passes through (2, 4), since 3(2²) − 5(2) + 2 = 4.",
        "Use point-slope form: y − 4 = 7(x − 2), so y = 7x − 10."
      ], confidence: "high", verified: true, author: "David Jerison",
      licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare"
    }
  ];

  window.IMPORTED_QUESTIONS = [...(window.IMPORTED_QUESTIONS || []), ...questions];
})();
