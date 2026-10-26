(function() {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const KEY = "mathmaster-visual";
  const EXAM_SIZE = 10;
  const AREAS = ["Number", "Algebra", "Geometry", "Graphs", "Fractions"];
  const state = readState();
  let generators = [];
  let current = null;
  let currentGenerator = null;
  let attempts = 0;
  let answered = false;
  let exam = null;
  let examTimer = null;
  let practiceMistakes = false;

  function readState() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Saved Visual Lab progress has an invalid format.");
      return Object.assign({ points: 0, streak: 0, total: 0, correct: 0, skills: {}, mistakes: [], days: [] }, value);
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error("Saved Visual Lab progress is not valid JSON.");
      throw error;
    }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
    renderStats();
  }

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  }

  function sampleQuantile(sorted, fraction) {
    const position = (sorted.length + 1) * fraction;
    const lowerIndex = Math.max(0, Math.floor(position) - 1);
    const upperIndex = Math.min(sorted.length - 1, Math.ceil(position) - 1);
    const part = position - Math.floor(position);
    return sorted[lowerIndex] + (sorted[upperIndex] - sorted[lowerIndex]) * part;
  }

  function sampleQuantileSteps(sorted, fraction, label, value) {
    const position = (sorted.length + 1) * fraction;
    const lowerIndex = Math.max(0, Math.floor(position) - 1);
    const upperIndex = Math.min(sorted.length - 1, Math.ceil(position) - 1);
    const part = position - Math.floor(position);
    const method = part === 0 ? `Read the ${position}th value.` :
      `Interpolate ${part * 100}% of the way from the ${Math.floor(position)}th value (${sorted[lowerIndex]}) to the ${Math.ceil(position)}th value (${sorted[upperIndex]}).`;
    return [
      `For n = ${sorted.length}, ${label} is at position (${sorted.length} + 1) × ${fraction} = ${position}.`,
      method,
      `${label} = ${value}.`
    ];
  }

  function frac(n, d) {
    const sign = d < 0 ? -1 : 1;
    const divisor = gcd(n, d);
    n = sign * n / divisor; d = sign * d / divisor;
    return d === 1 ? String(n) : `${n}/${d}`;
  }

  function formatSlope(value) {
    return Number.isInteger(value) ? String(value) : frac(Math.round(value * 2), 2);
  }

  function lineEquation(m, c) {
    return `y=${formatSlope(m)}x${c < 0 ? "" : "+"}${c}`;
  }

  function lineGraphic(m, c, extra, label) {
    const range = { minX: -5, maxX: 5, minY: -4, maxY: 4 };
    const [a, b] = clippedLine(m, c, range);
    return window.VisualSVG.wrap(
      window.VisualSVG.plane(range) + window.VisualSVG.segment(a[0], a[1], b[0], b[1], Boolean(extra && extra.dashed)) + (extra && extra.points || ""),
      label || `A coordinate grid showing the line y = ${m}x + ${c}`,
      "A coordinate grid with labelled axes, unit grid lines, and one straight line."
    );
  }

  function clippedLine(m, c, range) {
    const r = range || { minX: -5, maxX: 5, minY: -4, maxY: 4 };
    const candidates = [];
    for (const x of [r.minX, r.maxX]) {
      const y = m * x + c;
      if (y >= r.minY && y <= r.maxY) candidates.push([x, y]);
    }
    if (m !== 0) for (const y of [r.minY, r.maxY]) {
      const x = (y - c) / m;
      if (x >= r.minX && x <= r.maxX) candidates.push([x, y]);
    }
    const unique = candidates.filter((point, index) =>
      candidates.findIndex(other => Math.abs(other[0] - point[0]) < 1e-8 && Math.abs(other[1] - point[1]) < 1e-8) === index);
    if (unique.length < 2) throw new Error("A generated graph line does not cross the visible grid.");
    return unique.slice(0, 2).map(point => window.VisualSVG.mapPoint(point[0], point[1], r));
  }

  function shadePolygon(m, c, above) {
    let points = [[-5, -4], [5, -4], [5, 4], [-5, 4]];
    const inside = ([x, y]) => above ? y >= m * x + c : y <= m * x + c;
    const output = [];
    for (let index = 0; index < points.length; index += 1) {
      const currentPoint = points[index];
      const nextPoint = points[(index + 1) % points.length];
      const currentInside = inside(currentPoint), nextInside = inside(nextPoint);
      if (currentInside) output.push(currentPoint);
      if (currentInside !== nextInside) {
        const [x1, y1] = currentPoint, [x2, y2] = nextPoint;
        const x = (m * x1 + c - y1) / ((y2 - y1) - m * (x2 - x1)) * (x2 - x1) + x1;
        output.push([x, m * x + c]);
      }
    }
    return output.map(point => window.VisualSVG.mapPoint(point[0], point[1]));
  }

  function makeOptions(answer, wrong, rng, count) {
    const optionCount = count || 4;
    const values = [String(answer)];
    wrong.forEach(value => {
      if (String(value) !== values[0] && !values.includes(String(value))) values.push(String(value));
    });
    let fallback = 1;
    while (values.length < optionCount) {
      const numericAnswer = Number(answer);
      const next = Number.isFinite(numericAnswer) ? String(numericAnswer + fallback) : `Option ${fallback}`;
      if (!values.includes(next)) values.push(next);
      fallback += 1;
    }
    const shuffled = values.slice(0, optionCount);
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = rng.int(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.map((value, index) => ({
      label: String.fromCharCode(65 + index),
      value,
      content: value,
      correct: value === String(answer)
    }));
  }

  function pack(config) {
    const item = Object.assign({
      seed: 0, type: "typed", prompt: "", diagram: "", answer: "", accept: [], tolerance: 1e-8,
      hint: "", explainSteps: [], solutionDiagram: "", spec: {}, marks: 1
    }, config);
    if (!item.hint) item.hint = item.explainSteps[0] || "Read the labelled diagram and identify the values you need.";
    if (item.type === "mc" && !item.options) item.options = makeOptions(item.answer, item.distractors || [], window.VisualRNG.seeded(item.seed));
    if (item.type === "click" && !item.clickTarget) item.clickTarget = null;
    if (item.solutionDiagram === item.diagram && item.solutionDiagram) {
      item.solutionDiagram = item.solutionDiagram.replace("</svg>", window.VisualSVG.text(200, 242, `Answer: ${item.answer}`, 13) + "</svg>");
    }
    return item;
  }

  function angleQuestion(id, rng) {
    const x = rng.int(3, 15), a = rng.int(1, 3), b = rng.int(1, 3);
    const notToScale = window.VisualSVG.text(200, 255, "Diagram NOT accurately drawn", 11);
    const isOpposite = id === "vertical-angles";
    const isParallel = id === "parallel-lines";
    const total = id === "angles-around-point" ? 360 : 180;
    const known = total - (a + b) * x;
    let content = "";
    let rule;
    let equation;
    if (id === "triangle-angles" && rng() < 0.5) {
      const insideCoefficient = rng.int(1, 2);
      const outsideCoefficient = insideCoefficient + rng.int(1, 2);
      const knownAngle = (outsideCoefficient - insideCoefficient) * x;
      content = window.VisualSVG.polygon([[90, 210], [310, 210], [200, 45]], "v-outline") +
        window.VisualSVG.segment(310, 210, 365, 210) +
        window.VisualSVG.arc(90, 210, 27, 0, 45, `${insideCoefficient}x°`) +
        window.VisualSVG.arc(200, 45, 25, 250, 290, `${knownAngle}°`) +
        window.VisualSVG.arc(310, 210, 28, 135, 180, `${outsideCoefficient}x°`);
      rule = "An exterior angle of a triangle equals the sum of the two opposite interior angles.";
      equation = `${outsideCoefficient}x = ${insideCoefficient}x + ${knownAngle}`;
      return pack({
        prompt: `Find x. ${rule}`,
        diagram: window.VisualSVG.wrap(content + notToScale, "A triangle with an exterior angle and two opposite interior angles", "The exterior angle is formed by extending one side of the triangle. Diagram NOT accurately drawn."),
        answer: String(x), seed: rng.seed,
        spec: { kind: id, subtype: "exterior", x, insideCoefficient, outsideCoefficient, knownAngle },
        explainSteps: [rule, `Write the equation: ${equation}.`, `Subtract ${insideCoefficient}x from both sides.`, `Divide by ${outsideCoefficient - insideCoefficient}: x = ${x}.`],
        solutionDiagram: window.VisualSVG.wrap(content + window.VisualSVG.text(200, 237, `x = ${x}`, 15) + notToScale, "Exterior angle solution", "The exterior angle rule gives the displayed value of x. Diagram NOT accurately drawn."), marks: 2
      });
    }
    if (isOpposite || isParallel) {
      const coeff = rng.int(2, 4);
      const offset = rng.int(8, 25);
      const relation = isParallel ? rng.pick(["alternate", "corresponding", "co-interior"]) : "opposite";
      const equalAngles = relation !== "co-interior";
      const otherOffset = equalAngles ? coeff * x + offset : 180 - coeff * x - offset;
      content = isOpposite ?
        window.VisualSVG.segment(60, 130, 340, 130) + window.VisualSVG.segment(105, 225, 295, 35) +
          window.VisualSVG.segment(105, 35, 295, 225) +
          window.VisualSVG.arc(200, 130, 36, 40, 140, `${coeff}x + ${offset}°`) +
        window.VisualSVG.arc(200, 130, 36, 220, 320, `${otherOffset}°`) :
        window.VisualSVG.segment(55, 80, 345, 80) + window.VisualSVG.segment(55, 190, 345, 190) +
          window.VisualSVG.segment(115, 235, 285, 35) +
          window.VisualSVG.arc(200, 80, 31, relation === "corresponding" ? 70 : 250,
            relation === "corresponding" ? 125 : 305, `${coeff}x + ${offset}°`) +
          window.VisualSVG.arc(200, 190, 31, relation === "co-interior" ? 250 : 70,
            relation === "co-interior" ? 305 : 125, `${otherOffset}°`);
      rule = isOpposite ? "Vertically opposite angles are equal." :
        relation === "alternate" ? "Alternate angles between parallel lines are equal." :
        relation === "corresponding" ? "Corresponding angles between parallel lines are equal." :
        "Co-interior angles between parallel lines add to 180°.";
      equation = equalAngles ? `${coeff}x + ${offset} = ${otherOffset}` : `${coeff}x + ${offset} + ${otherOffset} = 180`;
      const answer = String(x);
      return pack({
        prompt: `Find x. ${rule}`,
        diagram: window.VisualSVG.wrap(content + notToScale, "Angle expressions on crossing lines", "The marked opposite or alternate angles are equal. Diagram NOT accurately drawn."),
        answer, seed: rng.seed, spec: { kind: id, x, coefficient: coeff, offset, otherOffset, relation },
        explainSteps: [rule, equalAngles ? `Set the expressions equal: ${equation}.` : `Use the sum equation: ${equation}.`,
          equalAngles ? `Subtract ${offset} from both sides.` : `Subtract ${offset} and ${otherOffset} from 180°.`,
          `Divide by ${coeff}; x = ${answer}.`],
        solutionDiagram: window.VisualSVG.wrap(content + window.VisualSVG.text(200, 237, `x = ${answer}`, 15) + notToScale, "Angle solution with x", "Equal marked angles give the value of x. Diagram NOT accurately drawn."), marks: 2
      });
    }
    let answer = String(x);
    if (id === "triangle-angles") {
      const firstConstant = rng.int(5, known - 5);
      const secondConstant = known - firstConstant;
      content = window.VisualSVG.polygon([[90, 210], [310, 210], [200, 45]], "v-outline") +
        window.VisualSVG.arc(90, 210, 27, 0, 45, `${a}x + ${firstConstant}°`) +
        window.VisualSVG.arc(310, 210, 27, 135, 180, `${b}x + ${secondConstant}°`) +
        window.VisualSVG.arc(200, 45, 25, 250, 290, `${known}°`);
      rule = "Angles inside a triangle add to 180°.";
      equation = `${a}x + ${firstConstant} + ${b}x + ${secondConstant} + ${known} = 180`;
    } else {
      const firstConstant = rng.int(5, known - 5);
      const secondConstant = known - firstConstant;
      if (id === "angles-around-point") {
        content = window.VisualSVG.segment(200, 130, 200, 28) + window.VisualSVG.segment(200, 130, 355, 205) + window.VisualSVG.segment(200, 130, 45, 205) +
          window.VisualSVG.arc(200, 130, 34, 90, 210, `${a}x + ${firstConstant}°`) +
          window.VisualSVG.arc(200, 130, 34, 210, 330, `${b}x + ${secondConstant}°`) +
          window.VisualSVG.arc(200, 130, 34, 330, 450, `${known}°`);
        rule = "Angles around a point add to 360°.";
        equation = `${a}x + ${firstConstant} + ${b}x + ${secondConstant} + ${known} = 360`;
      } else {
        content = window.VisualSVG.segment(45, 130, 355, 130) +
          window.VisualSVG.arc(200, 130, 37, 0, 180, `${a}x + ${firstConstant}°`) +
          window.VisualSVG.arc(200, 130, 37, 180, 360, `${b}x + ${secondConstant}°`);
        rule = "Angles on a straight line add to 180°.";
        equation = `${a}x + ${firstConstant} + ${b}x + ${secondConstant} = 180`;
      }
    }
    return pack({
      prompt: `Find x. ${rule}`,
      diagram: window.VisualSVG.wrap(content + notToScale, "Angle expressions in an original geometry diagram", "The marked angles fit the stated angle rule. Diagram NOT accurately drawn."),
      answer, seed: rng.seed, spec: { kind: id, x, a, b, known, total, equation },
      explainSteps: [rule, `Form the equation: ${equation}.`, `The known angle constants total ${known}°, so ${a + b}x = ${total - known}.`, `Divide by ${a + b}: x = ${answer}.`],
      solutionDiagram: window.VisualSVG.wrap(content + window.VisualSVG.text(200, 237, `x = ${answer}`, 15) + notToScale, "Angle diagram with x solved", "The angle rule gives the displayed value of x. Diagram NOT accurately drawn."), marks: 2
    });
  }

  function makeVisualQuestion(id, rng) {
    const S = window.VisualSVG;
    let x, y, x1, y1, x2, y2, m, c, answer, diagram, solutionDiagram, spec;
    switch (id) {
      case "coordinates-read":
      case "coordinates-plot": {
        if (id === "coordinates-read" && rng() < 0.5) return makeVisualQuestion("coordinates-plot", rng);
        x = rng.int(-4, 4); y = rng.int(-3, 3);
        const range = { minX: -5, maxX: 5, minY: -4, maxY: 4 };
        const p = S.mapPoint(x, y, range);
        const pointSvg = S.point(p[0], p[1], id === "coordinates-read" ? "P" : "", { radius: 6 });
        diagram = S.wrap(S.plane(range) + (id === "coordinates-read" ? pointSvg : ""), id === "coordinates-read" ? `A grid with point P at (${x}, ${y})` : "A coordinate grid for plotting one point", "The grid uses one square for each integer step on both axes.");
        answer = `${x},${y}`;
        if (id === "coordinates-plot") return pack({
          type: "click", seed: rng.seed, prompt: `Plot the point (${x}, ${y}) by clicking the grid.`,
          diagram: S.wrap(S.plane(range) + `<circle class="v-click-target" cx="${p[0]}" cy="${p[1]}" r="8"/>`, `A grid for plotting the point (${x}, ${y})`, "Click the grid where x and y have the requested values.")
            .replace("<svg ", '<svg class="v-touch-coordinate" '),
          answer, clickTarget: { type: "point", x, y, tolerance: 1, range },
          explainSteps: ["Read the horizontal coordinate first.", `Move ${Math.abs(x)} squares ${x < 0 ? "left" : "right"} to x = ${x}.`, `Move ${Math.abs(y)} squares ${y < 0 ? "down" : "up"} to y = ${y}.`, `The point is (${x}, ${y}).`],
          solutionDiagram: S.wrap(S.plane(range) + pointSvg, `Solution showing point (${x}, ${y})`, "The marked solution point is at the requested coordinates."),
          spec: { kind: id, x, y, target: [x, y], range }, marks: 1
        });
        return pack({ seed: rng.seed, prompt: "Read the coordinates of point P. Give your answer as x, y.", diagram,
          answer, accept: [`(${x},${y})`, `x=${x},y=${y}`], spec: { kind: id, x, y }, explainSteps: ["Read the horizontal value first.", `Point P is ${x} on the x-axis.`, `Then read the vertical value, ${y}.`, `The coordinates are (${x}, ${y}).`], solutionDiagram: diagram });
      }
      case "equation-points": {
        m = rng.int(-2, 2) || 2; c = rng.int(-1, 1); x = rng.int(-3, 3); y = m * x + c;
        const coords = [-1, 0, 1].map(v => {
          const p = S.mapPoint(v, m * v + c);
          return S.point(p[0], p[1], `(${v},${m * v + c})`);
        }).join("");
        answer = lineEquation(m, c);
        const endpoints = clippedLine(m, c);
        return pack({ type: "mc", seed: rng.seed, prompt: `Three points lie on this line. Choose its equation: (-1, ${-m + c}), (0, ${c}), (1, ${m + c}).`,
          diagram: S.wrap(S.plane() + S.segment(endpoints[0][0], endpoints[0][1], endpoints[1][0], endpoints[1][1]) + coords, "Three points on a coordinate grid", "The plotted points share a straight-line rule."),
          answer, distractors: [`y=${m + 1}x${c < 0 ? "" : "+"}${c}`, `y=${m}x${c + 1}`, `y=${m}x${c - 1}`],
          spec: { kind: id, m, c, points: [[-1, -m + c], [0, c], [1, m + c]] },
          explainSteps: ["A straight-line rule has the form y = mx + c.", `The point (0, ${c}) gives the intercept c = ${c}.`, `The y-value changes by ${2 * m} when x changes by 2, so m = ${m}.`, `The equation is ${answer}.`],
          solutionDiagram: lineGraphic(m, c, { points: coords }, `Solution line ${answer}`) });
      }
      case "slope-graph":
      case "line-equation":
      case "choose-line-graph":
      case "gradient-intercept": {
        x1 = -1; x2 = 2;
        m = rng.pick([-2, -1, -0.5, 0, 0.5, 1, 2]);
        y1 = rng.pick([-3, -2, -1, 0, 1, 2, 3].filter(value => value + m * (x2 - x1) >= -3 && value + m * (x2 - x1) <= 3));
        y2 = y1 + m * (x2 - x1); c = y1 - m * x1;
        const p1 = S.mapPoint(x1, y1), p2 = S.mapPoint(x2, y2);
        const points = S.point(p1[0], p1[1], `(${x1},${y1})`) + S.point(p2[0], p2[1], `(${x2},${y2})`);
        diagram = lineGraphic(m, c, { points }, "A graph of a straight line through two labelled grid points");
        const slopeText = formatSlope(m);
        answer = id === "slope-graph" ? (Number.isInteger(m) ? String(m) : slopeText) :
          id === "gradient-intercept" ? `${Number.isInteger(m) ? m : slopeText}, ${c}` :
          lineEquation(m, c);
        const triangle = S.segment(p1[0], p1[1], p2[0], p1[1], false, "v-rise-run") +
          S.segment(p2[0], p1[1], p2[0], p2[1], false, "v-rise-run") +
          S.text((p1[0] + p2[0]) / 2, p1[1] + 18, `run ${x2 - x1}`, 13) +
          S.text(p2[0] + 34, (p1[1] + p2[1]) / 2, `rise ${y2 - y1}`, 13) + points;
        solutionDiagram = S.wrap(S.plane() + S.segment(p1[0], p1[1], p2[0], p2[1]) + triangle, "Rise and run marked on the line", "The horizontal change is the run. The vertical change is the rise.");
        spec = { kind: id, x1, y1, x2, y2, m, c };
        let alternativeIntercept = Math.max(-3, Math.min(3, c + 2));
        if (alternativeIntercept === c) alternativeIntercept = c - 2;
        const graphOptions = id === "choose-line-graph" ? makeOptions(answer, [
          lineEquation(-m || 1, Math.max(-3, Math.min(3, c + 1))),
          lineEquation(m + 1, Math.max(-3, Math.min(3, c - 1)))
        ], rng, 3).map(option => {
          const match = option.value.match(/^y=(-?\d+(?:\/\d+)?)x([+-]\d+)$/);
          const optionM = match ? (match[1].includes("/") ? Number(match[1].split("/")[0]) / Number(match[1].split("/")[1]) : Number(match[1])) : m;
          const optionC = match ? Number(match[2]) : c;
          return Object.assign(option, { svg: lineGraphic(optionM, optionC, null, `Option ${option.label}: y = ${option.value.slice(2)}`) });
        }) : undefined;
        return pack({ type: id === "choose-line-graph" ? "mc" : "typed", prompt:
          id === "slope-graph" ? "Find the slope (gradient) of the line." :
          id === "line-equation" ? "Find the equation of the line in the form y = mx + c." :
          id === "gradient-intercept" ? "Give the gradient and y-intercept as gradient, intercept." : `Choose the graph that matches ${answer}.`,
          diagram: id === "choose-line-graph" ? S.wrap(S.text(200, 133, answer, 25), "A straight-line equation", "Choose the small graph with this line equation.") : diagram,
          answer, seed: rng.seed, spec, solutionDiagram,
          options: graphOptions,
          explainSteps: [`Use gradient = change in y ÷ change in x.`, `Rise = ${y2 - y1} and run = ${x2 - x1}.`, `Gradient = ${y2 - y1}/${x2 - x1} = ${Number.isInteger(m) ? m : slopeText}.`, `The intercept is c = ${c}; the line rule is ${answer}.`] });
      }
      case "midpoint-distance": {
        x1 = rng.int(-4, -3); y1 = rng.int(-3, -2);
        const [dx, dy, distance] = rng.pick([[3, 4, 5], [4, 3, 5], [5, 0, 5], [0, 5, 5]]);
        x2 = x1 + dx; y2 = y1 + dy;
        const useDistance = rng() < 0.5;
        answer = useDistance ? String(distance) : `${frac(x1 + x2, 2)},${frac(y1 + y2, 2)}`;
        const p1 = S.mapPoint(x1, y1), p2 = S.mapPoint(x2, y2);
        diagram = S.wrap(S.plane() + S.segment(p1[0], p1[1], p2[0], p2[1]) + S.point(p1[0], p1[1], "A") + S.point(p2[0], p2[1], "B"), "Two points A and B on a coordinate grid", "The grid shows endpoints A and B.");
        return pack({ prompt: useDistance ? "Find the distance AB. This pair has an integer distance." : "Find the midpoint of AB as x, y.", diagram, answer, seed: rng.seed,
          spec: { kind: id, subkind: useDistance ? "distance" : "midpoint", x1, y1, x2, y2, distance },
          accept: useDistance ? [] : [`(${answer})`], explainSteps: useDistance ?
            ["Use the distance formula from the horizontal and vertical changes.", `Horizontal change = ${x2 - x1}; vertical change = ${y2 - y1}.`, `Distance = √(${x2 - x1}² + ${y2 - y1}²) = ${distance}.`] :
            ["A midpoint is halfway between both endpoint coordinates.", `Average the x-values: (${x1} + ${x2}) ÷ 2 = ${frac(x1 + x2, 2)}.`, `Average the y-values: (${y1} + ${y2}) ÷ 2 = ${frac(y1 + y2, 2)}.`, `The midpoint is (${answer}).`], solutionDiagram: diagram });
      }
      case "number-line-inequality": {
        x = rng.int(-4, 4); const closed = rng() < 0.5; const right = rng() < 0.5;
        answer = `${right ? "x" : "x"}${right ? (closed ? "≥" : ">") : (closed ? "≤" : "<")}${x}`;
        diagram = S.numberLine(-5, 5, 1, [{ value: x, closed, direction: right ? "right" : "left" }]);
        return pack({ type: "mc", prompt: "Write the inequality shown on the number line.", diagram, answer, seed: rng.seed,
          distractors: [`x${right ? "<" : ">"}${x}`, `x${right ? "≥" : "≤"}${x + (closed ? 1 : -1)}`, `x=${x}`],
          spec: { kind: id, bound: x, closed, direction: right ? "right" : "left" }, solutionDiagram: diagram,
          explainSteps: ["A filled circle includes the endpoint; an open circle excludes it.", `The boundary is x = ${x}.`, `The arrow points ${right ? "right, so use greater than" : "left, so use less than"}.`, `The inequality is ${answer}.`] });
      }
      case "linear-inequality-graph": {
        m = rng.pick([-2, -1, 1, 2]); c = rng.int(-2, 2); const above = rng() < 0.5; const strict = rng() < 0.5;
        answer = `y${above ? ">" : "<"}${m}x${c < 0 ? "" : "+"}${c}`;
        const inequalityGraphic = (slope, intercept, shadeAbove, dashed, label, markOrigin) => {
          const [start, end] = clippedLine(slope, intercept);
          const origin = markOrigin ? S.point(200, 130, "(0,0)") : "";
          return S.wrap(S.plane() + S.polygon(shadePolygon(slope, intercept, shadeAbove), "v-shade") +
            S.segment(start[0], start[1], end[0], end[1], dashed) + origin,
          label, "The graph shows a boundary line and the shaded solution side.");
        };
        diagram = S.wrap(S.text(200, 132, answer, 24), "A linear inequality to graph", `Choose a graph for ${answer}.`);
        const wrongShade = `y${above ? "<" : ">"}${m}x${c < 0 ? "" : "+"}${c}`;
        const wrongSlope = `y${above ? ">" : "<"}${m + 1}x${c < 0 ? "" : "+"}${c}`;
        const graphOptions = [
          { value: answer, correct: true, svg: inequalityGraphic(m, c, above, strict, "Correct boundary and shading", false) },
          { value: wrongShade, correct: false, svg: inequalityGraphic(m, c, !above, strict, "Opposite shaded side", false) },
          { value: wrongSlope, correct: false, svg: inequalityGraphic(m + 1, c, above, strict, "Incorrect boundary slope", false) }
        ];
        for (let i = graphOptions.length - 1; i > 0; i -= 1) {
          const j = rng.int(0, i);
          [graphOptions[i], graphOptions[j]] = [graphOptions[j], graphOptions[i]];
        }
        graphOptions.forEach((option, index) => { option.label = String.fromCharCode(65 + index); option.content = ""; });
        const solutionDiagram = inequalityGraphic(m, c, above, strict, "Inequality with test point (0,0)", true);
        return pack({ type: "mc", prompt: `Choose the graph of ${answer}. The boundary is ${strict ? "dashed" : "solid"}.`, diagram, answer, seed: rng.seed,
          options: graphOptions,
          spec: { kind: id, m, c, above, strict, testPoint: [0, 0], testPointValue: -c, testPointPasses: above ? 0 > c : 0 < c },
          explainSteps: [`The boundary is y = ${m}x + ${c}.`, `The line is ${strict ? "dashed, so the boundary is excluded" : "solid, so the boundary is included"}.`, `Test (0, 0): 0 ${above ? ">" : "<"} ${c} is ${above ? 0 > c : 0 < c ? "true" : "false"}.`, `The shaded side gives ${answer}.`],
          solutionDiagram });
      }
      case "polar-coordinates": {
        const angle = rng.pick([-150, -120, -90, -60, -45, -30, 30, 45, 60, 90, 120, 150]);
        const r = rng.pick([-4, -3, 2, 3, 4]);
        const px = 200 + r * Math.cos(angle * Math.PI / 180) * 25;
        const py = 130 - r * Math.sin(angle * Math.PI / 180) * 25;
        const radians = angle * Math.PI / 180;
        const xval = +(r * Math.cos(radians)).toFixed(2), yval = +(r * Math.sin(radians)).toFixed(2);
        answer = `${xval},${yval}`;
        diagram = S.wrap(S.polarGrid(105, { x: px, y: py }, "P"), "A polar grid with a marked point", "The angle labels go around the origin. Negative angles turn clockwise; a negative radius reverses direction.");
        const candidates = [`${-xval},${yval}`, `${xval},${-yval}`, `${yval},${xval}`];
        return pack({ type: "mc", prompt: `Choose the Cartesian coordinates of polar point (r, θ) = (${r}, ${angle}°).`, diagram, answer, seed: rng.seed,
          distractors: candidates, spec: { kind: id, r, theta: angle, x: xval, y: yval },
          explainSteps: ["Use x = r cos θ and y = r sin θ.", `x = ${r} cos(${angle}°) = ${xval}.`, `y = ${r} sin(${angle}°) = ${yval}.`, `The Cartesian point is (${xval}, ${yval}).`], solutionDiagram: diagram });
      }
      case "angles-on-straight-line":
      case "vertical-angles":
      case "angles-around-point":
      case "triangle-angles":
      case "parallel-lines":
        return angleQuestion(id, rng);
      case "regular-polygon-angles": {
        const sides = rng.pick([5, 6, 7, 8, 9, 10, 12]);
        const exterior = rng() < 0.5;
        answer = exterior ? String(360 / sides) : String((sides - 2) * 180 / sides);
        const pts = Array.from({ length: sides }, (_, i) => {
          const theta = -Math.PI / 2 + 2 * Math.PI * i / sides;
          return [200 + 82 * Math.cos(theta), 125 + 82 * Math.sin(theta)];
        });
        diagram = S.wrap(S.polygon(pts, "v-outline") + S.arc(200, 45, 25, 270, 270 + 360 / sides, "θ"), `A regular polygon with ${sides} sides`, "The polygon has equal sides and equal interior angles.");
        return pack({ prompt: `Find one ${exterior ? "exterior" : "interior"} angle of a regular ${sides}-sided polygon.`, diagram, answer, seed: rng.seed,
          spec: { kind: id, sides, angleType: exterior ? "exterior" : "interior" },
          explainSteps: ["For a regular polygon, each exterior angle is 360° ÷ number of sides.", `360° ÷ ${sides} = ${360 / sides}°.`, exterior ? `The exterior angle is ${answer}°.` : `Interior + exterior = 180°, so 180° − ${360 / sides}° = ${answer}°.`],
          solutionDiagram: diagram, tolerance: 1e-7 });
      }
      case "name-fraction":
      case "shade-fraction":
      case "equivalent-fractions":
      case "fraction-add-subtract":
      case "fraction-of-amount":
      case "fraction-number-line":
      case "compare-fractions": {
        const d = rng.int(3, 10), n = rng.int(1, d - 1);
        if (id === "name-fraction") {
          const circleModel = rng() < 0.5;
          diagram = circleModel ? S.circle(200, 112, 72, "shaded part", n, d) : S.bar(d, n, "Name the shaded fraction");
          answer = frac(n, d);
          return pack({ prompt: "Write the shaded part as a simplified fraction.", diagram, answer, seed: rng.seed,
            spec: { kind: id, numerator: n, denominator: d }, explainSteps: ["Count the total equal parts for the denominator.", `There are ${d} equal parts.`, `Count the shaded parts for the numerator: ${n}.`, `Simplify ${n}/${d} to get ${answer}.`], solutionDiagram: diagram });
        }
        if (id === "shade-fraction") {
          const target = Array.from({ length: n }, (_, i) => i);
          let cells = "";
          const width = 340 / d;
          for (let i = 0; i < d; i += 1) cells += `<rect class="v-click-cell" data-shade-part="${i}" x="${30 + i * width}" y="104" width="${width}" height="52" tabindex="0" role="button" aria-pressed="false" aria-label="Fraction bar part ${i + 1}"/>`;
          diagram = S.wrap(S.text(200, 72, `Click ${n} of ${d} equal parts`, 17) + cells, "An unshaded fraction bar with clickable parts", `Click any ${n} of the ${d} equal sections.`)
            .replace("<svg ", '<svg class="v-touch-bar" ');
          return pack({ type: "click", prompt: `Shade ${n}/${d} of the bar by clicking ${n} sections.`, diagram, answer: target.join(","), seed: rng.seed,
            clickTarget: { type: "shade", parts: d, count: n }, spec: { kind: id, numerator: n, denominator: d, shaded: target },
            explainSteps: ["The denominator tells how many equal parts the whole has.", `Split the bar into ${d} equal parts.`, `The numerator tells how many parts to shade: ${n}.`, `Shade ${n} parts to show ${frac(n, d)}.`],
            solutionDiagram: S.bar(d, n, `${n}/${d} shaded`), marks: 1 });
        }
        if (id === "equivalent-fractions") {
          const multiple = rng.int(2, 5), simplified = rng() < 0.5;
          const top = n * multiple, bottom = d * multiple;
          answer = simplified ? frac(n, d) : `${top}/${bottom}`;
          diagram = S.wrap(S.text(200, 60, `${n}/${d} = ?`, 20) + S.bar(d, n, "same shaded proportion") .replace(/^.*?<svg[^>]*>|<\/svg>$/gs, ""), "Equivalent fractions shown with a shaded bar", "The shaded share is the same even when the bar is split into more equal pieces.");
          return pack({ type: "mc", prompt: simplified ? `Simplify ${top}/${bottom}.` : `Choose a fraction equivalent to ${n}/${d}.`, diagram, answer, seed: rng.seed,
            distractors: [`${top + 1}/${bottom}`, `${n}/${bottom}`, `${top}/${bottom + 1}`], spec: { kind: id, numerator: n, denominator: d, multiplier: multiple, simplified },
            explainSteps: ["Equivalent fractions are made by multiplying or dividing top and bottom by the same number.", simplified ? `Divide ${top}/${bottom} by ${multiple}/${multiple}.` : `Multiply ${n}/${d} by ${multiple}/${multiple}.`, `The result is ${answer}.`], solutionDiagram: diagram });
        }
        if (id === "fraction-add-subtract") {
          const d2 = rng.int(2, 9), n2 = rng.int(1, d2 - 1), subtract = rng() < 0.5;
          const numerator = subtract ? n * d2 - n2 * d : n * d2 + n2 * d;
          const denominator = d * d2;
          answer = frac(numerator, denominator);
          diagram = S.wrap(S.bar(d, n, "first fraction") .replace(/^.*?<svg[^>]*>|<\/svg>$/gs, "") + S.bar(d2, n2, "second fraction").replace(/^.*?<svg[^>]*>|<\/svg>$/gs, ""), "Two fraction bars", "The bars show the two fractions being combined.");
          return pack({ prompt: `${subtract ? "Subtract" : "Add"} ${n}/${d} ${subtract ? "−" : "+"} ${n2}/${d2}.`, diagram, answer, seed: rng.seed,
            spec: { kind: id, n1: n, d1: d, n2, d2, operation: subtract ? "subtract" : "add", numerator, denominator },
            explainSteps: ["Use a common denominator so the parts have equal size.", `${n}/${d} = ${n * d2}/${denominator}; ${n2}/${d2} = ${n2 * d}/${denominator}.`, `${subtract ? "Subtract" : "Add"} the numerators: ${numerator}/${denominator}.`, `Simplify to ${answer}.`], solutionDiagram: S.bar(denominator, Math.max(0, Math.min(denominator, numerator)), `Answer ${answer}`) });
        }
        if (id === "fraction-of-amount") {
          const amount = d * rng.int(3, 15);
          answer = String(n * amount / d);
          diagram = S.wrap(S.bar(d, n, `Find ${n}/${d} of ${amount}`), `Fraction bar showing ${n} of ${d} parts of ${amount}`, "The amount is split into denominator-sized equal groups.");
          return pack({ prompt: `Find ${n}/${d} of ${amount}.`, diagram, answer, seed: rng.seed,
            spec: { kind: id, numerator: n, denominator: d, amount, answer: Number(answer) },
            explainSteps: [`Divide by the denominator to find one equal part: ${amount} ÷ ${d} = ${amount / d}.`, `Multiply by the numerator to find ${n} parts.`, `${n} × ${amount / d} = ${answer}.`, `So ${n}/${d} of ${amount} is ${answer}.`], solutionDiagram: S.bar(d, n, `${answer} of ${amount}`) });
        }
        if (id === "fraction-number-line") {
          const value = n / d;
          const xPos = 24 + 352 * value;
          const place = rng() < 0.5;
          const line = S.numberLine(0, 1, 1 / d, []).replace(/^.*?<svg[^>]*>|<\/svg>$/gs, "");
          diagram = S.wrap(line + (place ? "" : `<circle cx="${xPos}" cy="128" r="7" class="v-point"/>`),
            place ? "A number line from zero to one for placing a fraction" : "A number line from zero to one with a marked fraction",
            place ? "Click the position for the fraction between zero and one." : "The point is between zero and one.");
          if (place) diagram = diagram.replace("<svg ", '<svg class="v-touch-numberline" ');
          answer = frac(n, d);
          const solution = S.wrap(line + `<circle cx="${xPos}" cy="128" r="7" class="v-point"/>`,
            `Solution showing ${answer} on the number line`, "The marked point is the requested fraction.");
          if (place) return pack({ type: "click", prompt: `Place ${answer} on the number line by clicking its position, or type the fraction.`, diagram, answer, seed: rng.seed,
            clickTarget: { type: "numberline", value, tolerance: 0.5 / d, denominator: d },
            spec: { kind: id, numerator: n, denominator: d, value, mode: "place" },
            explainSteps: ["The number line from 0 to 1 is one whole.", `Split it into ${d} equal steps.`, `Count ${n} steps from 0 to locate ${answer}.`], solutionDiagram: solution });
          return pack({ prompt: "Read the marked fraction in simplest form.", diagram, answer, seed: rng.seed,
            spec: { kind: id, numerator: n, denominator: d, value, mode: "read" },
            explainSteps: ["The line from 0 to 1 is one whole.", `The point is ${n}/${d} of the way from 0 to 1.`, `Simplify the fraction if possible: ${answer}.`], solutionDiagram: solution, tolerance: 1e-8 });
        }
        const n2 = rng.int(1, d - 1);
        const first = frac(n, d), second = frac(n2, d);
        const compare = n === n2 ? "=" : n > n2 ? ">" : "<";
        answer = `${first}${compare}${second}`;
        diagram = S.wrap(S.bar(d, n, first).replace(/^.*?<svg[^>]*>|<\/svg>$/gs, "") + S.bar(d, n2, second).replace(/^.*?<svg[^>]*>|<\/svg>$/gs, ""), "Two fraction bars to compare", "Each bar is split into the same number of equal parts.");
        return pack({ type: "mc", prompt: `Compare ${first} and ${second}. Choose <, >, or =.`, diagram, answer: compare, seed: rng.seed,
          options: makeOptions(compare, ["<", ">", "="].filter(value => value !== compare), rng, 3), spec: { kind: id, n1: n, n2, denominator: d, relation: compare },
          explainSteps: ["Both fractions have the same denominator.", `Compare the numerators ${n} and ${n2}.`, `${n} ${compare} ${n2}, so ${first} ${compare} ${second}.`], solutionDiagram: diagram });
      }
      case "percentages": {
        const value = rng.int(10, 90) * 10;
        const change = rng() < 0.5;
        const read = !change && rng() < 0.5;
        const shade = !change && !read && rng() < 0.5;
        const percent = rng.pick(shade ? [5, 10, 15, 20] : [5, 10, 15, 20, 25, 30, 40, 60, 75]);
        const increase = change ? rng() < 0.5 : true;
        answer = change ? `${increase ? "+" : "−"}${percent}%` : read || shade ? `${percent}%` : String(value * percent / 100);
        let cells = "";
        let solutionDiagram = "";
        if (change) {
          const next = value + (increase ? 1 : -1) * value * percent / 100;
          const scale = 300 / Math.max(value, next);
          cells += S.text(120, 54, `Before: ${value}`, 15) + `<rect x="50" y="68" width="${value * scale}" height="40" class="v-fill"/>`;
          cells += S.text(120, 152, `After: ${next}`, 15) + `<rect x="50" y="166" width="${next * scale}" height="40" class="v-empty"/>`;
          cells += S.text(200, 238, `${increase ? "+" : "−"}${percent}%`, 17);
          diagram = S.wrap(cells, "Two bars showing a percentage change", `The first bar is ${value}; the second is ${next}.`);
          solutionDiagram = diagram;
        } else {
          if (shade) {
            let solvedCells = "";
            for (let i = 0; i < 100; i += 1) {
              const x = (i % 10) * 45 + 0.5, y = Math.floor(i / 10) * 45 + 0.5;
              cells += `<rect x="${x}" y="${y}" width="44" height="44" class="v-click-cell" data-shade-part="${i}" tabindex="0" role="button" aria-pressed="false" aria-label="Grid square ${i + 1}"/>`;
              solvedCells += `<rect x="${x}" y="${y}" width="44" height="44" class="${i < percent ? "v-fill" : "v-empty"}"/>`;
            }
            diagram = S.wrap(cells, "An interactive ten by ten percentage grid", `Click ${percent} of the 100 equal squares.`, "0 0 450 450")
              .replace("<svg ", '<svg class="v-touch-percent-grid" ');
            solutionDiagram = S.wrap(solvedCells, "Solved percentage grid", `${percent} of 100 squares are shaded.`, "0 0 450 450")
              .replace("<svg ", '<svg class="v-touch-percent-grid" ');
          } else {
            for (let i = 0; i < 100; i += 1) cells += `<rect x="${30 + (i % 10) * 21}" y="${25 + Math.floor(i / 10) * 21}" width="19" height="19" class="${i < percent ? "v-fill" : "v-empty"}"/>`;
            diagram = S.wrap(cells + S.text(200, 252, `${percent}% shaded`, 15), "A 10 by 10 percentage grid", `There are 100 cells, with ${percent} shaded.`);
            solutionDiagram = diagram;
          }
        }
        const clickTarget = shade ? { type: "shade", parts: 100, count: percent } : null;
        return pack({ type: shade ? "click" : "typed",
          prompt: change ? `A bar changes from ${value} to ${value + (increase ? 1 : -1) * value * percent / 100}. What is the percentage change? Use + for an increase and − for a decrease.` :
            read ? "What percentage of the 10 by 10 grid is shaded?" :
            shade ? `Shade ${percent}% of the grid by clicking ${percent} squares.` : `Find ${percent}% of ${value}.`,
          diagram, answer, seed: rng.seed, clickTarget,
          spec: { kind: id, value, percent, change, read, shade, increase,
            newValue: change ? value + (increase ? 1 : -1) * value * percent / 100 : null,
            answer: change ? percent : read || shade ? percent : value * percent / 100 },
          explainSteps: change ? ["Percentage change = change ÷ original × 100%.", `Change = ${value * percent / 100}; original = ${value}.`, `${value * percent / 100} ÷ ${value} × 100% = ${percent}%.`, `It is an ${increase ? "increase" : "decrease"}: ${answer}.`] :
            read ? ["A percentage is the number shaded out of 100.", `There are 100 equal squares and ${percent} are shaded.`, `${percent} out of 100 is ${percent}%.`] :
            shade ? ["The grid has 100 equal squares.", `Each square is 1% of the whole.`, `Shade ${percent} squares to show ${percent}%.`] :
            [`Percent means out of 100, so calculate ${value} × ${percent}/100.`, `${value} × ${percent}/100 = ${answer}.`, `Therefore ${percent}% of ${value} is ${answer}.`], solutionDiagram });
      }
      case "ratio-tape": {
        const a = rng.int(2, 5), b = rng.int(2, 6), unit = rng.int(3, 12), total = (a + b) * unit;
        answer = `${a * unit},${b * unit}`;
        diagram = S.wrap(S.bar(a + b, a, `Ratio ${a}:${b}; total ${total}`), "A tape diagram divided in a ratio", "The tape has equal-sized parts. The shaded number shows the first share.");
        return pack({ prompt: `Share ${total} in the ratio ${a}:${b}. Give both shares separated by a comma.`, diagram, answer, seed: rng.seed,
          spec: { kind: id, a, b, unit, total, shareA: a * unit, shareB: b * unit },
          explainSteps: [`Add ratio parts: ${a} + ${b} = ${a + b}.`, `One part is ${total} ÷ ${a + b} = ${unit}.`, `First share = ${a} × ${unit} = ${a * unit}.`, `Second share = ${b} × ${unit} = ${b * unit}.`], solutionDiagram: diagram });
      }
      default:
        return makePhase2Question(id, rng);
    }
  }

  function makePhase2Question(id, rng) {
    const S = window.VisualSVG;
    const wrap = (content, title, description) => S.wrap(content, title, description);
    const chartAxes = (left, top, right, bottom, xLabel, yLabel) =>
      S.segment(left, top, left, bottom, false, "v-axis") +
      S.segment(left, bottom, right, bottom, false, "v-axis") +
      S.text((left + right) / 2, 250, xLabel, 12) + S.text(left - 18, top + 8, yLabel, 11);
    const point = (x, y, label) => S.point(x, y, label || "", { radius: 4, dx: 9, dy: -8 });
    const plot = (x, y, minX, maxX, minY, maxY, bounds) => {
      const b = bounds || { left: 42, top: 28, right: 375, bottom: 218 };
      return [b.left + (x - minX) / (maxX - minX) * (b.right - b.left),
        b.bottom - (y - minY) / (maxY - minY) * (b.bottom - b.top)];
    };
    const answerPack = (config) => pack(Object.assign({ seed: rng.seed, tolerance: 0.01 }, config));
    const rational = (n, d) => {
      const divisor = gcd(n, d);
      return { n: n / divisor, d: d / divisor,
        subtract(other) { return rational(this.n * other.d - other.n * this.d, this.d * other.d); } };
    };
    let answer, diagram, spec;

    if (id === "bar-chart-reading") {
      const values = [46, 51, 56, 61].map(value => value + rng.int(-2, 2));
      const chosen = rng.int(0, 3), axisStart = 40, labels = ["A", "B", "C", "D"];
      const x0 = 60, yBase = 212, scale = 8;
      let svg = "";
      [40, 45, 50, 55, 60, 65].forEach(tick => {
        const y = yBase - (tick - axisStart) * scale;
        svg += S.segment(x0, y, 372, y, false, "v-grid") + S.text(34, y + 4, tick, 10);
      });
      values.forEach((value, index) => {
        const x = 88 + index * 70, height = (value - axisStart) * scale;
        svg += `<rect x="${x}" y="${yBase - height}" width="38" height="${height}" class="v-fill"/>` +
          S.text(x + 19, 232, labels[index], 12) + S.text(x + 19, yBase - height - 6, value, 11);
      });
      svg += chartAxes(x0, 26, 372, yBase, "Category", "Value");
      answer = String(values[chosen]);
      spec = { kind: id, values, labels, selected: chosen, axisStart };
      return answerPack({ prompt: `The vertical axis starts at ${axisStart}, not zero. What is the actual value for category ${labels[chosen]}?`,
        hint: "Read the number label; do not compare bar heights from a shortened axis.",
        diagram: wrap(svg, "Bar chart with a truncated vertical axis", "Four bars use a vertical axis that starts at 40, which makes their differences look larger."),
        answer, spec, explainSteps: ["Read the value scale, including where it starts.", `Category ${labels[chosen]} is labelled ${values[chosen]}.`,
          `The axis is truncated at ${axisStart}; the printed value is still ${answer}.`],
        solutionDiagram: wrap(svg + S.text(210, 248, `Actual value = ${answer}; axis begins at ${axisStart}`, 12),
          "Bar chart annotated with the correct value", "The selected bar's labelled value is shown with a warning about the truncated axis.") });
    }

    if (id === "pie-chart") {
      const parts = rng.int(3, 8), counts = Array.from({ length: parts }, () => rng.int(2, 12));
      const selected = rng.int(0, parts - 1), total = counts.reduce((sum, value) => sum + value, 0);
      const degrees = counts[selected] / total * 360;
      const cx = 200, cy = 128, radius = 82;
      let start = -Math.PI / 2, svg = "";
      const colours = ["v-fill", "v-empty", "v-region", "v-shade"];
      counts.forEach((count, index) => {
        const end = start + count / total * 2 * Math.PI;
        const x1 = cx + radius * Math.cos(start), y1 = cy + radius * Math.sin(start);
        const x2 = cx + radius * Math.cos(end), y2 = cy + radius * Math.sin(end);
        const large = end - start > Math.PI ? 1 : 0;
        svg += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z" class="${colours[index % colours.length]}"/>` +
          S.text(cx + 112 * Math.cos((start + end) / 2), cy + 112 * Math.sin((start + end) / 2), String(count), 11);
        start = end;
      });
      answer = degrees.toFixed(2);
      spec = { kind: id, counts, selected, total, angle: degrees };
      return answerPack({ prompt: `A pie chart represents ${total} items. Find the angle of the sector labelled ${counts[selected]}. Give degrees to 2 decimal places.`,
        hint: "A full circle is 360°. Use the part over the total.",
        diagram: wrap(svg, "Pie chart with labelled counts", "Each sector size represents its count as a fraction of the total."),
        answer, spec, explainSteps: [`A full circle is 360° and represents ${total} items.`, `The selected sector represents ${counts[selected]} of ${total}.`,
          `Its angle is ${counts[selected]}/${total} × 360° = ${answer}°.`],
        solutionDiagram: wrap(svg + S.text(200, 244, `${counts[selected]}/${total} × 360° = ${answer}°`, 13),
          "Pie chart with sector angle calculation", "The selected sector's angle is calculated from its share of the total.") });
    }

    if (id === "histogram") {
      const widths = [2, 3, 4, 5], frequencies = widths.map(width => width * rng.int(2, 7));
      const selected = rng.int(0, 3), density = frequencies[selected] / widths[selected];
      let svg = "";
      let left = 48;
      const pixelScale = 324 / widths.reduce((sum, width) => sum + width, 0);
      widths.forEach((width, index) => {
        const pixelWidth = width * pixelScale, height = frequencies[index] / width * 15;
        svg += `<rect x="${left}" y="${218 - height}" width="${pixelWidth}" height="${height}" class="${index === selected ? "v-fill" : "v-empty"}"/>` +
          S.text(left + pixelWidth / 2, 235, `${width} wide`, 10);
        left += pixelWidth;
      });
      svg += chartAxes(48, 26, 372, 218, "Class interval width", "Frequency density");
      const askDensity = rng() < 0.5;
      answer = String(askDensity ? density : frequencies[selected]);
      spec = { kind: id, widths, frequencies, selected, density, asked: askDensity ? "density" : "frequency" };
      return answerPack({ prompt: `The highlighted class has width ${widths[selected]} and frequency ${frequencies[selected]}. Find its ${askDensity ? "frequency density" : "frequency"}.`,
        hint: "Frequency density = frequency ÷ class width.",
        diagram: wrap(svg, "Histogram with unequal class widths", "The bars have unequal widths, so their heights show frequency density rather than frequency."),
        answer, spec, explainSteps: [`Frequency density = frequency ÷ class width.`, `${frequencies[selected]} ÷ ${widths[selected]} = ${density}.`,
          askDensity ? `The frequency density is ${answer}.` : `Frequency = density × width = ${density} × ${widths[selected]} = ${answer}.`],
        solutionDiagram: wrap(svg + S.text(210, 251, `${frequencies[selected]} ÷ ${widths[selected]} = ${density}`, 12),
          "Histogram annotated with frequency density", "The selected class's frequency is divided by its width.") });
    }

    if (id === "scatter-graph") {
      const mode = rng.int(0, 2);
      const slopeMagnitude = rng.int(1, 8) / 2;
      const slope = mode === 0 ? slopeMagnitude : mode === 1 ? -slopeMagnitude : 0;
      const intercept = mode === 2 ? rng.int(2, 8) : rng.int(-3, 8);
      const xs = [-5, -3, -1, 1, 3, 5];
      const offsets = mode === 2 ? [1, -1, -1, 1, 0, 0] : [1, -1, 0, 1, -1, 0];
      const ys = xs.map((value, index) => slope * value + intercept + offsets[index]);
      const estimateX = rng.pick([-4, -3, -2, -1, 1, 2, 3, 4]), estimate = slope * estimateX + intercept;
      const askCorrelation = rng() < 0.5, relation = mode === 0 ? "positive" : mode === 1 ? "negative" : "no";
      const graphValues = ys.concat([-5 * slope + intercept, 5 * slope + intercept]);
      const minY = Math.min(-5, Math.floor(Math.min(...graphValues)) - 2);
      const maxY = Math.max(15, Math.ceil(Math.max(...graphValues)) + 2);
      let svg = "";
      xs.forEach((value, index) => {
        const p = plot(value, ys[index], -5, 5, minY, maxY);
        svg += point(p[0], p[1]);
      });
      const a = plot(-5, slope * -5 + intercept, -5, 5, minY, maxY), b = plot(5, slope * 5 + intercept, -5, 5, minY, maxY);
      svg += S.segment(a[0], a[1], b[0], b[1], true) + chartAxes(42, 28, 375, 218, "x", "y");
      answer = askCorrelation ? relation : String(estimate);
      spec = { kind: id, xs, ys, mode, slope, intercept, estimateX, estimate, asked: askCorrelation ? "correlation" : "estimate" };
      return answerPack({ prompt: askCorrelation ? "Describe the correlation shown by the scatter graph." :
        `Use the drawn line of best fit to estimate y when x = ${estimateX}; accept answers within 0.5 units.`,
        hint: askCorrelation ? "Look at the overall direction of the points from left to right." : "Read the dashed line of best fit, not an individual point.",
        diagram: wrap(svg, "Scatter graph with a dashed line of best fit", "The plotted points show a trend and the dashed line is the line of best fit."),
        answer, tolerance: askCorrelation ? 1e-8 : 0.5,
        accept: askCorrelation ? [relation === "no" ? "none" : relation + " correlation"] : [],
        spec, explainSteps: askCorrelation ? [`Follow the overall trend from left to right.`, `The points ${mode === 0 ? "generally rise" : mode === 1 ? "generally fall" : "do not rise or fall overall"}.`,
          `This is ${relation} correlation.`] : [`Find x = ${estimateX} on the horizontal axis.`, `Move up to the dashed line of best fit.`,
          `Read the corresponding estimate, y = ${estimate}.`],
        solutionDiagram: wrap(svg + S.text(205, 249, askCorrelation ? `${relation} correlation` : `At x = ${estimateX}, estimate y = ${estimate}`, 12),
          "Scatter graph with its interpretation", "The trend or estimated value is written below the graph.") });
    }

    if (id === "box-plot") {
      const sorted = Array.from({ length: 10 }, () => rng.int(2, 40)).sort((a, b) => a - b);
      const median = sampleQuantile(sorted, 1 / 2);
      const q1 = sampleQuantile(sorted, 1 / 4), q3 = sampleQuantile(sorted, 3 / 4);
      const range = sorted[9] - sorted[0], iqr = q3 - q1;
      const values = { median, range, iqr, q1, q3 }, ask = rng.pick(["median", "range", "iqr", "q1", "q3"]);
      const x = value => 45 + value / 45 * 320;
      const y = 128;
      const svg = S.segment(x(sorted[0]), y, x(sorted[9]), y) +
        `<rect x="${x(q1)}" y="92" width="${x(q3) - x(q1)}" height="72" class="v-empty"/>` +
        S.segment(x(median), 92, x(median), 164, false, "v-point") +
        S.segment(x(sorted[0]), 110, x(sorted[0]), 146) + S.segment(x(sorted[9]), 110, x(sorted[9]), 146) +
        S.text(x(sorted[0]), 183, sorted[0], 10) + S.text(x(q1), 183, q1, 10) + S.text(x(median), 183, median, 10) +
        S.text(x(q3), 183, q3, 10) + S.text(x(sorted[9]), 183, sorted[9], 10) + chartAxes(45, 30, 365, 218, "Value", "");
      answer = String(values[ask]);
      spec = { kind: id, data: sorted, q1, median, q3, min: sorted[0], max: sorted[9], asked: ask };
      return answerPack({ prompt: `Use the box plot to find the ${ask === "iqr" ? "interquartile range (IQR)" : ask === "q1" ? "lower quartile" : ask === "q3" ? "upper quartile" : ask}.`,
        hint: "The box runs from the lower quartile to the upper quartile; the line inside is the median.",
        diagram: wrap(svg, "Box plot with five-number summary", "The whiskers show the minimum and maximum; the box shows the quartiles and median."),
        answer, spec, explainSteps: ask === "q1" ? sampleQuantileSteps(sorted, 1 / 4, "Q1", q1) :
          ask === "q3" ? sampleQuantileSteps(sorted, 3 / 4, "Q3", q3) :
          ask === "median" ? sampleQuantileSteps(sorted, 1 / 2, "Median", median) :
          ask === "iqr" ? [`For n = ${sorted.length}, Q1 is at position (${sorted.length} + 1)/4 and Q3 is at position 3(${sorted.length} + 1)/4.`,
            `Interpolate between neighboring ordered values when either position is not whole: Q1 = ${q1}, Q3 = ${q3}.`,
            `IQR = Q3 − Q1 = ${q3} − ${q1} = ${iqr}.`] :
          [`Read the five-number summary from left to right: minimum, lower quartile, median, upper quartile, maximum.`,
            `Range = maximum − minimum = ${sorted[9]} − ${sorted[0]} = ${range}.`,
            "Use the labels at the ends of the box or whiskers to read the relevant values."],
        solutionDiagram: wrap(svg + S.text(205, 247, `${ask.toUpperCase()} = ${answer}`, 13),
          "Box plot annotated with the requested statistic", "The required median, range, or interquartile range is shown.") });
    }

    if (id === "cumulative-frequency") {
      const bounds = [10, 20, 30, 40];
      const frequencies = [6, 8, 10, 16].map(value => value + 2 * rng.int(0, 2));
      const cumulative = frequencies.map((value, index) => frequencies.slice(0, index + 1).reduce((a, b) => a + b, 0));
      const total = cumulative[cumulative.length - 1], ranks = [total / 4, total / 2, 3 * total / 4];
      const quantiles = ranks.map(rank => {
        const index = cumulative.findIndex(value => value >= rank);
        const previous = index ? cumulative[index - 1] : 0;
        const lower = index ? bounds[index - 1] : 0;
        return lower + (rank - previous) / frequencies[index] * (bounds[index] - lower);
      });
      const median = quantiles[1], iqr = quantiles[2] - quantiles[0], ask = rng() < 0.5 ? "median" : "iqr";
      let svg = "";
      const pts = [[0, 0], ...bounds.map((bound, index) => [bound, cumulative[index]])];
      pts.forEach((pair, index) => {
        const p = plot(pair[0], pair[1], 0, 42, 0, total + 4);
        if (index) {
          const prev = plot(pts[index - 1][0], pts[index - 1][1], 0, 42, 0, total + 4);
          svg += S.segment(prev[0], prev[1], p[0], p[1]);
        }
        svg += point(p[0], p[1]);
      });
      const guideRanks = ask === "median" ? [total / 2] : [total / 4, 3 * total / 4];
      const guides = guideRanks.map(rank => {
        const value = quantiles[ranks.indexOf(rank)];
        const p = plot(value, rank, 0, 42, 0, total + 4);
        return S.segment(42, p[1], p[0], p[1], true, "v-rise-run") +
          S.segment(p[0], p[1], p[0], 218, true, "v-rise-run");
      }).join("");
      svg += guides + chartAxes(42, 28, 375, 218, "Value", "Cumulative frequency");
      answer = String(ask === "median" ? median : iqr);
      spec = { kind: id, bounds, frequencies, cumulative, total, quantiles, asked: ask, median, iqr };
      return answerPack({ prompt: `The cumulative-frequency graph represents ${total} values. Estimate the ${ask === "iqr" ? "interquartile range" : "median"}; accept answers within 0.5 units.`,
        hint: "Find the 50th percentile for the median; find the 25th and 75th percentiles for the IQR.",
        diagram: wrap(svg, "Cumulative frequency graph", "The line rises through class boundaries; quartiles are estimated by interpolation."),
        answer, tolerance: 0.5, spec, explainSteps: [`Total frequency n = ${total}.`,
          ask === "median" ? `Read cumulative frequency n/2 = ${total / 2} on the vertical axis, then interpolate to the curve and read the value: ${median.toFixed(2)}.` :
            `Read n/4 = ${total / 4} and 3n/4 = ${3 * total / 4} on the vertical axis, then interpolate to the curve. Q1 ≈ ${quantiles[0].toFixed(2)} and Q3 ≈ ${quantiles[2].toFixed(2)}.`,
          ask === "median" ? `The estimated median is ${answer}.` : `Q1 = ${quantiles[0].toFixed(2)} and Q3 = ${quantiles[2].toFixed(2)}.`,
          ...(ask === "iqr" ? [`IQR = Q3 − Q1 = ${answer}.`] : [])],
        solutionDiagram: wrap(svg + S.text(208, 248, `${ask.toUpperCase()} ≈ ${answer}`, 13),
          "Cumulative frequency graph annotated with its estimate", "The estimated statistic is shown beneath the plotted cumulative curve.") });
    }

    if (id === "stem-leaf") {
      const start = rng.int(1, 4) * 10, step = rng.int(1, 3), modeIndex = rng.int(1, 6);
      const data = Array.from({ length: 7 }, (_, index) => start + index * step).concat(start + modeIndex * step).sort((a, b) => a - b);
      const leaves = [];
      for (let stem = Math.floor(data[0] / 10); stem <= Math.floor(data[data.length - 1] / 10); stem += 1) {
        leaves.push({ stem, leaf: data.filter(value => Math.floor(value / 10) === stem).map(value => value % 10).sort((a, b) => a - b) });
      }
      const median = sampleQuantile(data, 1 / 2), q1 = sampleQuantile(data, 1 / 4);
      const q3 = sampleQuantile(data, 3 / 4), mode = start + modeIndex * step, range = data[7] - data[0];
      const asked = rng.pick(["median", "q1", "q3", "mode", "range"]);
      const svg = S.text(200, 55, "Stem | Leaf", 17) + leaves.map((row, index) =>
        S.text(165, 92 + index * 25, `${row.stem}  |  ${row.leaf.join("  ")}`, 14)).join("") +
        S.text(200, 228, "Key: 2 | 4 means 24", 12);
      const values = { median, mode, range, q1, q3 };
      answer = String(values[asked]);
      spec = { kind: id, data, stems: leaves, median, q1, q3, mode, range, asked };
      return answerPack({ prompt: `Use the stem-and-leaf diagram to find the ${asked === "q1" ? "lower quartile" : asked === "q3" ? "upper quartile" : asked}.`,
        hint: "Use the key to join each stem and leaf. Then order the values.",
        diagram: wrap(svg, "Stem-and-leaf diagram", "The stem gives the tens and the leaf gives the units."),
        answer, spec, explainSteps: asked === "q1" ? sampleQuantileSteps(data, 1 / 4, "Q1", q1) :
          asked === "q3" ? sampleQuantileSteps(data, 3 / 4, "Q3", q3) :
          asked === "median" ? sampleQuantileSteps(data, 1 / 2, "Median", median) :
          [`Use the key: a stem and leaf combine to make one data value.`,
            asked === "mode" ? `${mode} occurs twice; every other value occurs once.` :
            `Range = greatest − least = ${data[7]} − ${data[0]} = ${range}.`,
            `The ${asked} is ${answer}.`],
        solutionDiagram: wrap(svg + S.text(200, 250, `${asked} = ${answer}`, 13),
          "Stem-and-leaf diagram with statistic", "The selected statistic is shown below the ordered values.") });
    }

    if (id === "frequency-polygon") {
      const midpoints = [5, 15, 25, 35, 45], frequencies = midpoints.map(() => rng.int(3, 18));
      const selected = rng.int(0, 4), askMidpoint = rng() < 0.5;
      let svg = "";
      const coords = midpoints.map((midpoint, index) => plot(midpoint, frequencies[index], 0, 50, 0, 22));
      coords.forEach((p, index) => {
        svg += point(p[0], p[1], askMidpoint && index === selected ? "?" : String(frequencies[index]));
        if (index) svg += S.segment(coords[index - 1][0], coords[index - 1][1], p[0], p[1]);
      });
      svg += chartAxes(42, 28, 375, 218, "Class midpoint", "Frequency");
      answer = String(askMidpoint ? midpoints[selected] : frequencies[selected]);
      spec = { kind: id, midpoints, frequencies, selected, asked: askMidpoint ? "midpoint" : "frequency" };
      return answerPack({ prompt: askMidpoint ? "Read the midpoint of the class at the marked vertex." :
        `Read the frequency at class midpoint ${midpoints[selected]}.`,
        hint: "A frequency polygon joins the frequency at each class midpoint.",
        diagram: wrap(svg, "Frequency polygon", "The plotted vertices show class midpoints and their frequencies."),
        answer, spec, explainSteps: [`Each vertex is plotted at (class midpoint, frequency).`,
          askMidpoint ? `The marked vertex is over midpoint ${answer}.` : `At midpoint ${midpoints[selected]}, the vertical value is ${answer}.`,
          askMidpoint ? `The class midpoint is ${answer}.` : `So the frequency is ${answer}.`],
        solutionDiagram: wrap(svg + S.text(205, 248, `${askMidpoint ? "midpoint" : "frequency"} = ${answer}`, 13),
          "Frequency polygon annotated with the requested reading", "The required midpoint or frequency is identified on the polygon.") });
    }

    if (id === "probability-tree") {
      const red = rng.int(2, 7), blue = rng.int(2, 7), total = red + blue, replacement = rng() < 0.5;
      const asked = rng.pick(["branch", "and", "or"]);
      const secondRed = replacement ? rational(red, total) : rational(red - 1, total - 1);
      let result;
      if (asked === "branch") result = secondRed;
      else if (asked === "and") result = rational(red * (replacement ? red : red - 1), total * (replacement ? total : total - 1));
      else result = rational(1, 1).subtract(rational(blue * (replacement ? blue : blue - 1), total * (replacement ? total : total - 1)));
      answer = frac(result.n, result.d);
      const svg = S.segment(65, 125, 165, 72) + S.segment(65, 125, 165, 178) +
        S.segment(165, 72, 270, 42) + S.segment(165, 72, 270, 100) +
        S.segment(165, 178, 270, 150) + S.segment(165, 178, 270, 208) +
        S.text(108, 84, `R ${frac(red, total)}`, 11) + S.text(108, 174, `B ${frac(blue, total)}`, 11) +
        S.text(205, 49, `R ${frac(replacement ? red : red - 1, replacement ? total : total - 1)}`, 10) +
        S.text(205, 102, `B ${frac(blue, replacement ? total : total - 1)}`, 10) +
        S.text(205, 152, `R ${frac(red, replacement ? total : total - 1)}`, 10) +
        S.text(205, 210, `B ${frac(replacement ? blue : blue - 1, replacement ? total : total - 1)}`, 10) +
        S.text(315, 48, "RR", 12) + S.text(315, 104, "RB", 12) + S.text(315, 154, "BR", 12) + S.text(315, 211, "BB", 12);
      spec = { kind: id, red, blue, total, replacement, asked, answerNumerator: result.n, answerDenominator: result.d };
      return answerPack({ prompt: asked === "branch" ?
        `A bag has ${red} red and ${blue} blue counters. ${replacement ? "A counter is replaced." : "A counter is not replaced."} Find P(second is red | first is red).` :
        asked === "and" ? `Find the probability of drawing red twice ${replacement ? "with" : "without"} replacement.` :
        `Find the probability of drawing at least one red counter in two draws ${replacement ? "with" : "without"} replacement.`,
        hint: "Multiply along a tree branch for AND. For at least one, subtract the no-red path from 1.",
        diagram: wrap(svg, "Two-draw probability tree", "The first draw splits into red and blue; each branch then splits by the second draw."),
        answer, spec, explainSteps: asked === "branch" ?
          [`The first draw is red, so ${red} red counters remain if there is no replacement.`, `There are ${replacement ? total : total - 1} counters for the second draw.`,
            `The conditional probability is ${answer}.`] : asked === "and" ?
          [`Follow the red then red path.`, `Multiply its branch probabilities: ${red}/${total} × ${replacement ? red : red - 1}/${replacement ? total : total - 1}.`,
            `The probability is ${answer}.`] :
          [`Use the complement: at least one red = 1 − no red.`, `The no-red path probability is ${blue}/${total} × ${replacement ? blue : blue - 1}/${replacement ? total : total - 1}.`,
            `Therefore the probability is ${answer}.`],
        solutionDiagram: wrap(svg + S.text(205, 249, `P = ${answer}`, 13), "Probability tree with answer", "The requested probability is shown beneath the branches.") });
    }

    if (id === "venn-diagram") {
      const three = rng() < 0.5;
      const counts = Array.from({ length: three ? 8 : 4 }, () => rng.int(1, 9));
      const asked = rng.pick(three ? ["onlyA", "all", "union", "probA"] : ["intersection", "union", "probA"]);
      const total = counts.reduce((sum, value) => sum + value, 0);
      let value;
      if (!three) value = asked === "intersection" ? counts[2] : asked === "union" ? total - counts[3] :
        rational(counts[0] + counts[2], total);
      else value = asked === "onlyA" ? counts[0] : asked === "all" ? counts[6] :
        asked === "union" ? total - counts[7] : rational(counts[0] + counts[3] + counts[4] + counts[6], total);
      const countA = three ? counts[0] + counts[3] + counts[4] + counts[6] : counts[0] + counts[2];
      answer = typeof value === "number" ? String(value) : frac(value.n, value.d);
      let svg = "";
      if (!three) {
        svg = `<circle cx="155" cy="128" r="68" class="v-empty"/><circle cx="245" cy="128" r="68" class="v-empty"/>` +
          S.text(128, 91, String(counts[0]), 13) + S.text(200, 96, String(counts[2]), 13) +
          S.text(272, 91, String(counts[1]), 13) + S.text(200, 214, `Neither ${counts[3]}`, 12) +
          S.text(130, 42, "A", 14) + S.text(270, 42, "B", 14);
      } else {
        svg = `<circle cx="155" cy="112" r="59" class="v-empty"/><circle cx="245" cy="112" r="59" class="v-empty"/><circle cx="200" cy="174" r="59" class="v-empty"/>` +
          counts.slice(0, 7).map((count, index) => S.text([126, 274, 200, 165, 153, 247, 200][index], [103, 103, 79, 160, 176, 176, 133][index], count, 12)).join("") +
          S.text(201, 231, `Outside all: ${counts[7]}`, 11) + S.text(125, 42, "A", 13) + S.text(275, 42, "B", 13) + S.text(200, 244, "C", 13);
      }
      spec = { kind: id, three, counts, total, asked };
      const askText = { intersection: "the number in A and B", union: "the number in at least one set", probA: "the probability of being in set A", onlyA: "the number in A only", all: "the number in all three sets" }[asked];
      return answerPack({ prompt: `There are ${total} people in the survey. Find ${askText}${asked === "probA" ? " as a simplified fraction" : ""}.`,
        hint: "Read only the regions that belong to the set or event named in the question.",
        diagram: wrap(svg, `${three ? "Three-set" : "Two-set"} Venn diagram`, "Each number is the count in one non-overlapping region; the outside count is not in any set."),
        answer, spec, explainSteps: asked === "intersection" ? [`The intersection is the overlapping region.`, `The A-and-B region contains ${counts[2]} people.`, `So the intersection count is ${answer}.`] :
          asked === "union" ? [`The union includes every region inside at least one circle.`, `Exclude only the outside region${three ? " of all three circles" : ""}.`,
            `${total} − ${three ? counts[7] : counts[3]} = ${answer}.`] : asked === "probA" ?
          [`Count all regions that belong to set A.`, `There are ${countA} members in A out of ${total}.`,
            `So P(A) = ${answer}.`] : asked === "onlyA" ? [`Only A is the region inside A and outside the other two sets.`, `That region contains ${counts[0]} people.`,
              `The answer is ${answer}.`] : [`The central overlap belongs to all three sets.`, `It contains ${counts[6]} people.`, `The answer is ${answer}.`],
        solutionDiagram: wrap(svg + S.text(205, 255, `${answer}`, 13), "Venn diagram with the requested count", "The requested count or probability is shown below the regions.") });
    }

    if (id === "sample-space") {
      const sidesA = rng.int(3, 5), sidesB = rng.int(3, 5), target = rng.int(2, sidesA + sidesB);
      let svg = "";
      for (let a = 1; a <= sidesA; a += 1) {
        for (let b = 1; b <= sidesB; b += 1) {
          const x = 72 + (a - 1) * 54, y = 65 + (b - 1) * 36;
          svg += `<rect x="${x - 20}" y="${y - 15}" width="40" height="30" class="${a + b === target ? "v-fill" : "v-empty"}"/>` + S.text(x, y + 4, `${a},${b}`, 10);
        }
      }
      const favourable = Math.max(0, Math.min(sidesA, target - 1) - Math.max(1, target - sidesB) + 1);
      answer = frac(favourable, sidesA * sidesB);
      spec = { kind: id, sidesA, sidesB, target, favourable, total: sidesA * sidesB };
      return answerPack({ prompt: `Two fair spinners show 1 to ${sidesA} and 1 to ${sidesB}. Find P(their total is ${target}).`,
        hint: "Count the highlighted ordered pairs, then divide by the total number of pairs.",
        diagram: wrap(svg + S.text(200, 242, `Spinner A across; spinner B down`, 12), "Sample-space grid for two spinners", "Every cell is one equally likely ordered pair; highlighted cells have the target sum."),
        answer, spec, explainSteps: [`There are ${sidesA} × ${sidesB} = ${sidesA * sidesB} equally likely outcomes.`,
          `Exactly ${favourable} ordered pairs add to ${target}.`, `Probability = favourable outcomes ÷ total outcomes = ${answer}.`],
        solutionDiagram: wrap(svg + S.text(200, 255, `${favourable}/${sidesA * sidesB} = ${answer}`, 13),
          "Sample-space grid with favourable outcomes marked", "The highlighted cells are counted to find the probability.") });
    }

    if (id === "distance-time") {
      const routes = [
        [0, 1, 1, 3, 0], [0, 2, 2, 4, 1], [0, 2, 0, 2, 0],
        [0, 3, 1, 4, 0], [0, 1, 3, 3, 0], [0, 3, 0, 1, 0]
      ];
      const route = rng.int(0, routes.length - 1), level = rng.int(2, 7);
      const duration = rng.pick([1, 2, 3, 4, 5]);
      const context = rng.pick(["walking", "cycling", "bus", "train"]);
      const times = [0, 1, 2, 3, 4].map(value => value * duration);
      const distances = routes[route].map(value => value * level);
      const selected = rng.int(0, times.length - 2);
      const speeds = times.slice(1).map((time, index) => Math.abs(distances[index + 1] - distances[index]) / (time - times[index]));
      let svg = "";
      const maxDistance = Math.max(...distances) + 2;
      const coords = times.map((time, index) => plot(time, distances[index], 0, times[times.length - 1], 0, maxDistance));
      coords.forEach((p, index) => {
        svg += point(p[0], p[1], `${times[index]},${distances[index]}`);
        if (index) svg += S.segment(coords[index - 1][0], coords[index - 1][1], p[0], p[1]);
      });
      svg += chartAxes(42, 28, 375, 218, "Time (minutes)", "Distance (km)");
      answer = String(speeds[selected]);
      spec = { kind: id, times, distances, selected, speeds, level, route, duration, context };
      const movement = distances[selected + 1] === distances[selected] ? "stopped" :
        distances[selected + 1] < distances[selected] ? "returning" : "moving away";
      return answerPack({ prompt: `A ${context} journey is shown. Find the speed during ${times[selected]} to ${times[selected + 1]} minutes; accept answers within 0.05 km/min.`,
        hint: "Speed is the change in distance divided by the change in time. A downward line means returning.",
        diagram: wrap(svg, "Distance-time graph with a stop and return journey", "The flat segment shows a stop, and the falling segment shows a return towards the start."),
        answer, tolerance: 0.05, spec, explainSteps: [`Choose the segment from ${times[selected]} to ${times[selected + 1]} minutes.`,
          `${movement === "stopped" ? "Distance does not change, so speed is zero." : `Distance changes by ${Math.abs(distances[selected + 1] - distances[selected])} km in ${times[selected + 1] - times[selected]} minutes.`}`,
          `Speed = distance change ÷ time change = ${answer} km/min.`],
        solutionDiagram: wrap(svg + S.text(208, 250, `${movement}; speed = ${answer} km/min`, 12),
          "Distance-time graph annotated with segment speed", "The selected segment's motion and speed are shown below the graph.") });
    }

    if (id === "speed-time") {
      const level = rng.int(2, 9), interval = rng.pick([2, 3, 4]);
      const context = rng.pick(["runner", "cyclist", "car", "train"]);
      const times = [0, interval, 2 * interval, 3 * interval], speeds = [0, level, level, 0];
      const askDistance = rng() < 0.5, selected = rng.int(0, 2);
      let distance = 0, svg = "";
      const coords = times.map((time, index) => plot(time, speeds[index], 0, times[3], 0, level + 2));
      coords.forEach((p, index) => {
        svg += point(p[0], p[1], `${times[index]},${speeds[index]}`);
        if (index) {
          svg += S.segment(coords[index - 1][0], coords[index - 1][1], p[0], p[1]);
          distance += (speeds[index - 1] + speeds[index]) / 2 * (times[index] - times[index - 1]);
        }
      });
      svg += chartAxes(42, 28, 375, 218, `Time (seconds)`, "Speed (m/s)");
      const acceleration = (speeds[selected + 1] - speeds[selected]) / (times[selected + 1] - times[selected]);
      answer = String(askDistance ? distance : acceleration);
      spec = { kind: id, times, speeds, level, interval, context, selected, asked: askDistance ? "distance" : "acceleration", acceleration, distance };
      return answerPack({ prompt: askDistance ? `A ${context} travels as shown. Find the total distance travelled in ${times[3]} seconds.` :
        `A ${context} moves as shown. Find the acceleration from ${times[selected]} to ${times[selected + 1]} seconds. Give m/s².`,
        hint: "On a speed-time graph, area gives distance and gradient gives acceleration.",
        diagram: wrap(svg, "Speed-time graph", "The graph has a rising section, a constant-speed section, and a falling section."),
        answer, spec, explainSteps: askDistance ? [`Distance is the area under a speed-time graph.`,
          `Add the trapezium areas: ${times.slice(1).map((time, i) => `(${speeds[i]} + ${speeds[i + 1]}) ÷ 2 × ${time - times[i]}`).join(" + ")}.`,
          `The total distance is ${answer} m.`] : [`Acceleration is the gradient of a speed-time graph.`,
          `Change in speed = ${speeds[selected + 1]} − ${speeds[selected]} = ${speeds[selected + 1] - speeds[selected]} m/s.`,
          `Divide by ${times[selected + 1] - times[selected]} s: acceleration = ${answer} m/s².`],
        solutionDiagram: wrap(svg + S.text(207, 250, `${askDistance ? "distance" : "acceleration"} = ${answer}`, 13),
          "Speed-time graph annotated with its answer", "The area or gradient result is written below the graph.") });
    }

    if (id === "conversion-graph") {
      const factor = rng.int(8, 30) / 10, input = rng.int(2, 10) * 5;
      const contexts = [
        ["input units", "output units"], ["recipe batches", "servings"],
        ["map units", "distance units"], ["machine units", "product units"],
        ["tokens", "points"]
      ];
      const context = rng.int(0, contexts.length - 1), [inputLabel, outputLabel] = contexts[context];
      const output = factor * input, maxOutput = Math.max(180, factor * 55 + 10);
      const f = value => plot(value, factor * value, 0, 55, 0, maxOutput);
      const a = f(0), b = f(55), p = f(input);
      const svg = S.segment(a[0], a[1], b[0], b[1]) + S.segment(p[0], p[1], p[0], 218, true, "v-rise-run") +
        S.segment(42, p[1], p[0], p[1], true, "v-rise-run") + point(p[0], p[1], "P") +
        chartAxes(42, 28, 375, 218, inputLabel, outputLabel);
      answer = output.toFixed(1);
      spec = { kind: id, factor, input, output, context };
      return answerPack({ prompt: `The graph converts at ${factor} ${outputLabel} per ${inputLabel}. Read the output for ${input} ${inputLabel}; accept answers within 0.5 ${outputLabel}.`,
        hint: "Follow the input value up to the line, then across to the output axis.",
        diagram: wrap(svg, "Straight-line conversion graph", "A straight line through the origin shows a constant unit conversion."),
        answer, tolerance: 0.5, spec, explainSteps: [`The graph passes through the origin, so output is proportional to input.`,
          `The conversion rate is ${factor} ${outputLabel} for each ${inputLabel}.`, `${input} × ${factor} = ${answer} ${outputLabel}.`],
        solutionDiagram: wrap(svg + S.text(205, 250, `${input} × ${factor} = ${answer}`, 13),
          "Conversion graph with read-off marked", "Dashed guide lines lead from the chosen input to its output value.") });
    }

    if (id === "quadratic-graph") {
      const root1 = rng.int(-4, -1), root2 = rng.int(1, 4), coefficient = rng.pick([-1, 1]);
      const axis = (root1 + root2) / 2, turnY = -coefficient * ((root2 - root1) / 2) ** 2;
      const asked = rng.pick(["roots", "turning", "symmetry"]);
      let svg = "", previous = null;
      for (let value = -5; value <= 5; value += 0.25) {
        const y = coefficient * (value - root1) * (value - root2), p = plot(value, y, -5, 5, -15, 15);
        if (Math.abs(y) <= 15) {
          if (previous) svg += S.segment(previous[0], previous[1], p[0], p[1]);
          previous = p;
        } else previous = null;
      }
      const p1 = plot(root1, 0, -5, 5, -15, 15), p2 = plot(root2, 0, -5, 5, -15, 15);
      const vertex = plot(axis, turnY, -5, 5, -15, 15);
      svg += point(p1[0], p1[1], "root") + point(p2[0], p2[1], "root") +
        point(vertex[0], vertex[1], "turn") + chartAxes(42, 28, 375, 218, "x", "y");
      answer = asked === "roots" ? `${root1},${root2}` : asked === "turning" ? `${axis},${turnY}` : String(axis);
      spec = { kind: id, coefficient, root1, root2, axis, turnY, asked };
      return answerPack({ prompt: asked === "roots" ? "Find both x-intercepts of the quadratic graph, in increasing order." :
        asked === "turning" ? "Give the coordinates of the turning point as x, y." : "Give the equation of the line of symmetry as x = value.",
        hint: "The roots are where the curve crosses the x-axis. The symmetry line passes through the turning point.",
        diagram: wrap(svg, "Quadratic graph with roots and turning point", "The curve is a parabola; the marked points show its roots and turning point."),
        answer, spec, explainSteps: asked === "roots" ? [`An x-intercept has y = 0.`, `The curve crosses the x-axis at x = ${root1} and x = ${root2}.`,
          `The roots in order are ${answer}.`] : asked === "turning" ? [`The turning point is the lowest or highest point of the curve.`,
          `Its x-coordinate is halfway between the roots: (${root1} + ${root2}) ÷ 2 = ${axis}.`,
          `Substitute x = ${axis} into the quadratic to get y = ${turnY}.`] :
          [`A parabola is symmetric about a vertical line through its turning point.`, `The axis value is halfway between the roots.`,
            `x = (${root1} + ${root2}) ÷ 2 = ${answer}.`],
        solutionDiagram: wrap(svg + S.text(208, 250, asked === "symmetry" ? `x = ${answer}` : `Answer: ${answer}`, 13),
          "Quadratic graph annotated with its solution", "The requested roots or turning-point feature is identified.") });
    }

    if (id === "function-graphs") {
      const kind = rng.pick(["cubic", "reciprocal", "exponential"]);
      const scale = rng.int(1, 24) / 4, base = rng.int(12, 35) / 10;
      const equations = { cubic: `y=${scale}x³`, reciprocal: `y=${scale}/x`, exponential: `y=${base}^(x/2)` };
      const curve = x => kind === "cubic" ? scale * x ** 3 : kind === "reciprocal" ? scale / x : base ** (x / 2);
      let svg = "", prior = null;
      for (let x = -5; x <= 5; x += 0.2) {
        if (kind === "reciprocal" && Math.abs(x) < 0.3) { prior = null; continue; }
        const y = curve(x);
        if (y < -9 || y > 12) { prior = null; continue; }
        const p = plot(x, y, -5, 5, -10, 13);
        if (prior) svg += S.segment(prior[0], prior[1], p[0], p[1]);
        prior = p;
      }
      svg += chartAxes(42, 28, 375, 218, "x", "y");
      answer = equations[kind];
      const distractors = Object.values(equations).filter(value => value !== answer).concat(["y=x²"]);
      const options = makeOptions(answer, distractors, rng, 4);
      spec = { kind: id, graph: kind, equation: answer, scale, base };
      return answerPack({ type: "mc", prompt: "Which equation matches the shape of this graph?",
        hint: "Look for the key shape: S-curve, two reciprocal branches, or rapid exponential rise.",
        diagram: wrap(svg, `${kind} function graph`, "One of a cubic, reciprocal, or exponential curve is shown."),
        answer, options, spec, explainSteps: kind === "cubic" ? [`A cubic graph has an S-like shape and can cross the x-axis.`, `The curve shown is symmetric about the origin.`,
          `The matching equation is ${answer}.`] : kind === "reciprocal" ? [`A reciprocal graph has two separate branches.`, `It approaches both axes but does not touch them.`,
            `The matching equation is ${answer}.`] : [`An exponential graph rises quickly and stays above the x-axis.`, `Its growth is multiplicative rather than a straight-line change.`,
              `The matching equation is ${answer}.`],
        solutionDiagram: wrap(svg + S.text(208, 250, answer, 13), "Function graph with equation", "The equation that produces the displayed curve is shown.") });
    }

    if (id === "sine-cosine") {
      const amplitude = rng.int(1, 4), period = rng.pick([90, 180, 360, 720]), kind = rng.pick(["sine", "cosine"]);
      const fn = x => amplitude * (kind === "sine" ? Math.sin(2 * Math.PI * x / period) : Math.cos(2 * Math.PI * x / period));
      let svg = "", prior = null;
      for (let x = 0; x <= 720; x += 5) {
        const p = plot(x, fn(x), 0, 720, -5, 5);
        if (prior) svg += S.segment(prior[0], prior[1], p[0], p[1]);
        prior = p;
      }
      svg += chartAxes(42, 28, 375, 218, "Angle (degrees, 0 to 720)", "y");
      const asked = rng() < 0.5 ? "amplitude" : "period";
      answer = String(asked === "amplitude" ? amplitude : period);
      spec = { kind: id, amplitude, period, function: kind, asked };
      return answerPack({ prompt: `Find the ${asked} of this ${kind} graph. Give your answer in degrees where needed.`,
        hint: "Amplitude is the distance from the midline to a peak. Period is the horizontal length of one full cycle.",
        diagram: wrap(svg, `${kind} graph in degrees`, "A labelled trigonometric curve is drawn for angles from zero to 360 degrees."),
        answer, spec, explainSteps: asked === "amplitude" ? [`The midline is y = 0.`, `A peak is ${amplitude} units from the midline.`,
          `Therefore the amplitude is ${answer}.`] : [`A period is one full repeat of the wave.`, `The graph uses the factor 360° divided by ${period}° inside the function.`,
            `So one cycle has period ${answer}°.`],
        solutionDiagram: wrap(svg + S.text(208, 250, `${asked} = ${answer}${asked === "period" ? "°" : ""}`, 13),
          "Trigonometric graph annotated with its property", "The requested amplitude or period is labelled below the graph.") });
    }

    if (id === "plot-line-click") {
      const x1 = rng.int(-4, 0), x2 = rng.int(x1 + 1, 4), y1 = rng.int(-3, 2), y2 = rng.int(-2, 3);
      const range = { minX: -5, maxX: 5, minY: -4, maxY: 4 };
      const answerPoints = [[x1, y1], [x2, y2]];
      const targetSvg = S.plane(range);
      answer = `${x1},${y1};${x2},${y2}`;
      spec = { kind: id, points: answerPoints, range };
      return answerPack({ type: "click", prompt: `Click both endpoints of the line segment joining (${x1}, ${y1}) and (${x2}, ${y2}).`,
        hint: "Read each coordinate as (horizontal x, vertical y). You can also type both points separated by a semicolon.",
        diagram: wrap(targetSvg, "Coordinate grid for plotting two endpoints", "Click the two requested integer-coordinate points on the grid."),
        answer, clickTarget: { type: "points", points: answerPoints, tolerance: 1, range }, spec,
        explainSteps: ["For each point, move along the x-axis first.", `The first endpoint is (${x1}, ${y1}).`,
          `The second endpoint is (${x2}, ${y2}).`, "The segment joins the two plotted endpoints."],
        solutionDiagram: wrap(targetSvg + S.point(...S.mapPoint(x1, y1, range), "A") + S.point(...S.mapPoint(x2, y2, range), "B") +
          S.segment(...S.mapPoint(x1, y1, range), ...S.mapPoint(x2, y2, range)), "Solution line segment", "The two endpoints and the segment between them are marked.") });
    }

    if (id === "simultaneous-graphs") {
      const x = rng.int(-3, 3), y = rng.int(-3, 3), slopes = [-2, -1, 0, 1, 2];
      const m1 = rng.pick(slopes), m2 = rng.pick(slopes.filter(value => value !== m1));
      const c1 = y - m1 * x, c2 = y - m2 * x;
      const first = clippedLine(m1, c1), second = clippedLine(m2, c2);
      const svg = S.plane() + S.segment(first[0][0], first[0][1], first[1][0], first[1][1]) +
        S.segment(second[0][0], second[0][1], second[1][0], second[1][1], true) +
        S.text(85, 24, `y=${m1}x${c1 < 0 ? "" : "+"}${c1}`, 11) + S.text(300, 24, `y=${m2}x${c2 < 0 ? "" : "+"}${c2}`, 11);
      answer = `${x},${y}`;
      spec = { kind: id, m1, c1, m2, c2, x, y };
      return answerPack({ prompt: "Read the intersection of the two lines. Give x, y.",
        hint: "The solution satisfies both line equations at the crossing point.",
        diagram: wrap(svg, "Two straight lines crossing on a coordinate grid", "The solid and dashed lines intersect at one coordinate pair."),
        answer, spec, explainSteps: [`The solution is where both line graphs cross.`, `At the crossing, x = ${x}.`,
          `Substitute into either line: y = ${m1}(${x}) + ${c1} = ${y}.`, `The intersection is (${x}, ${y}).`],
        solutionDiagram: wrap(svg + S.point(...S.mapPoint(x, y), `${x},${y}`), "Intersection marked on both lines", "The simultaneous solution is labelled at the crossing.") });
    }

    if (id === "graph-transformations") {
      const transformation = rng.pick(["vertical", "horizontal", "reflection", "compression"]);
      const shift = transformation === "vertical" || transformation === "horizontal" ?
        rng.pick([-8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8]) : 0;
      const coefficient = rng.int(1, 4);
      const coefficientText = coefficient === 1 ? "" : String(coefficient);
      const formulaFor = item => ({
        vertical: `y=${coefficient}x²${shift < 0 ? "" : "+"}${shift}`,
        horizontal: `y=${coefficient}(x${shift < 0 ? "" : "+"}${shift})²`,
        reflection: `y=−${coefficientText}x²`,
        compression: `y=${coefficient}(2x)²`
      }[item]);
      const formula = formulaFor(transformation);
      const fn = x => transformation === "vertical" ? coefficient * x * x + shift :
        transformation === "horizontal" ? coefficient * (x + shift) ** 2 :
        transformation === "reflection" ? -coefficient * (x * x) : coefficient * (2 * x) ** 2;
      let svg = "", previous = null;
      for (let x = -4; x <= 4; x += 0.2) {
        const y = fn(x);
        if (y < -10 || y > 14) { previous = null; continue; }
        const p = plot(x, y, -4, 4, -10, 14);
        if (previous) svg += S.segment(previous[0], previous[1], p[0], p[1]);
        previous = p;
      }
      svg += chartAxes(42, 28, 375, 218, "x", "y");
      const answerOptions = ["vertical", "horizontal", "reflection", "compression"].map(formulaFor);
      const options = makeOptions(formula, answerOptions.filter(value => value !== formula), rng, 4);
      answer = formula;
      spec = { kind: id, transformation, shift, coefficient, formula };
      return answerPack({ type: "mc", prompt: `Which rule describes the transformed graph of f(x) = ${coefficient}x²?`,
        hint: "Compare the curve with its base graph: look for a vertical shift, horizontal shift, reflection, or narrower curve.",
        diagram: wrap(svg, "Transformed quadratic graph", `The shown parabola is a transformation of the base graph y equals ${coefficient} x squared.`),
        answer, options, spec, explainSteps: transformation === "vertical" ? [`Adding a constant outside f changes every y-value.`, `The curve moves ${shift > 0 ? "up" : "down"} by ${Math.abs(shift)}.`,
          `The rule is y = f(x) + ${shift}, or ${formula}.`] : transformation === "horizontal" ?
          [`Changing x inside f moves the graph horizontally.`, `The expression x ${shift < 0 ? "−" : "+"} ${Math.abs(shift)} shifts it ${shift < 0 ? "right" : "left"}.`,
            `The rule is y = f(x + ${shift}), or ${formula}.`] : transformation === "reflection" ?
          [`A negative sign outside f reverses all y-values.`, `The graph is reflected in the x-axis.`, `The rule is y = −f(x), or ${formula}.`] :
          [`Replacing x by 2x halves the horizontal distances.`, `The graph becomes narrower around the y-axis.`, `The rule is y = f(2x), or ${formula}.`],
        solutionDiagram: wrap(svg + S.text(205, 250, formula, 13), "Transformed graph with its rule", "The equation for the displayed transformation is shown below.") });
    }

    if (id === "geometric-transformations") {
      const operation = rng.pick(["reflection", "rotation", "translation", "enlargement"]);
      const original = [[1, 1], [2, 1], [1, 2]], tx = rng.int(-2, 2), ty = rng.int(-2, 2);
      const scale = rng.pick([-2, -1, 2]);
      const clickMode = rng() < 0.5;
      const transform = ([px, py]) => operation === "reflection" ? [-px, py] :
        operation === "rotation" ? [-py, px] : operation === "translation" ? [px + tx, py + ty] : [scale * px, scale * py];
      const image = original.map(transform), selected = rng.int(0, 2);
      const fitted = S.fittedPlane(original.concat(image), 1);
      const pixels = points => points.map(value => fitted.toScreen(value[0], value[1]));
      const origPixels = pixels(original), imagePixels = pixels(image);
      const originalSvg = S.polygon(origPixels, "v-outline") +
        original.map((value, index) => S.point(origPixels[index][0], origPixels[index][1], String.fromCharCode(65 + index))).join("");
      const imageSvg = S.polygon(imagePixels, "v-region") +
        image.map((value, index) => S.point(imagePixels[index][0], imagePixels[index][1], String.fromCharCode(65 + index) + "′")).join("");
      const transformed = image[selected];
      answer = `${transformed[0]},${transformed[1]}`;
      spec = { kind: id, operation, original, image, selected, tx, ty, scale, mode: clickMode ? "click" : "typed" };
      const instruction = operation === "reflection" ? "reflect in the y-axis" : operation === "rotation" ? "rotate 90° anticlockwise about the origin" :
        operation === "translation" ? `translate by (${tx}, ${ty})` : `enlarge from the origin by scale factor ${scale}`;
      const prompt = clickMode ?
        `Triangle ABC is transformed: ${instruction}. Click where vertex ${String.fromCharCode(65 + selected)}′ will land.` :
        `Triangle ABC is transformed: ${instruction}. Find the image of vertex ${String.fromCharCode(65 + selected)} as x, y.`;
      const grid = fitted.grid + originalSvg;
      const transformedPixel = fitted.toScreen(transformed[0], transformed[1]);
      return answerPack({ type: clickMode ? "click" : "typed", prompt,
        hint: "Apply the same coordinate rule to both coordinates of the named point.",
        diagram: wrap(clickMode ? grid + `<circle class="v-click-target" cx="${transformedPixel[0]}" cy="${transformedPixel[1]}" r="10"/>` : grid,
          "Triangle ABC on a coordinate grid", "The original triangle has labelled vertices A, B and C."),
          clickTarget: clickMode ? { type: "point", x: transformed[0], y: transformed[1], tolerance: 1,
            mapping: { ox: fitted.ox, oy: fitted.oy, scale: fitted.scale, range: fitted.range } } : null,
        answer, spec, explainSteps: operation === "reflection" ? [`A reflection in the y-axis changes x to −x.`, `The original vertex is (${original[selected].join(", ")}).`,
          `Its image is (${transformed.join(", ")}).`] : operation === "rotation" ? [`A 90° anticlockwise turn maps (x, y) to (−y, x).`,
          `Apply this rule to (${original[selected].join(", ")}).`, `The image is (${transformed.join(", ")}).`] :
          operation === "translation" ? [`A translation adds its vector to each point.`, `Add (${tx}, ${ty}) to (${original[selected].join(", ")}).`,
            `The image is (${transformed.join(", ")}).`] : [`An enlargement about the origin multiplies both coordinates by its scale factor.`,
              `Multiply (${original[selected].join(", ")}) by ${scale}.`, `The image is (${transformed.join(", ")}).`],
        solutionDiagram: wrap(fitted.grid + originalSvg + imageSvg, "Original and transformed triangles", "The image triangle is shown with primed vertex labels."),
        marks: 2 });
    }

    if (id === "vectors-grid") {
      const vectorA = [rng.int(-3, 3), rng.int(-3, 3)], vectorB = [rng.int(-3, 3), rng.int(-3, 3)];
      const subtract = rng() < 0.5, result = vectorA.map((value, index) => value + (subtract ? -1 : 1) * vectorB[index]);
      const fitted = S.fittedPlane([[0, 0], vectorA, vectorB, result], 1);
      const origin = fitted.toScreen(0, 0), endA = fitted.toScreen(...vectorA);
      const endB = fitted.toScreen(...vectorB);
      const svg = fitted.grid +
        S.arrow(origin[0], origin[1], endA[0], endA[1], "a") + S.arrow(origin[0], origin[1], endB[0], endB[1], "b");
      answer = result.join(",");
      spec = { kind: id, vectorA, vectorB, operation: subtract ? "subtract" : "add", result };
      return answerPack({ prompt: `Given a = (${vectorA.join(", ")}) and b = (${vectorB.join(", ")}), find a ${subtract ? "−" : "+"} b as x, y.`,
        hint: "Add or subtract the horizontal components and the vertical components separately.",
        diagram: wrap(svg, "Two vectors from the origin on a grid", "Vector a and vector b are drawn from the origin."),
        answer, spec, explainSteps: [`Work with matching components.`, `Horizontal: ${vectorA[0]} ${subtract ? "−" : "+"} ${vectorB[0]} = ${result[0]}.`,
          `Vertical: ${vectorA[1]} ${subtract ? "−" : "+"} ${vectorB[1]} = ${result[1]}.`, `The result is (${answer}).`],
        solutionDiagram: wrap(svg + S.arrow(origin[0], origin[1], ...fitted.toScreen(...result), "result"),
          "Vector addition or subtraction with result", "The resultant vector is shown from the origin.") });
    }

    if (id === "pythagoras") {
      const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25],
        [20, 21, 29], [12, 35, 37], [9, 40, 41], [11, 60, 61]];
      const primitive = rng.pick(triples), multiplier = rng.int(1, 5);
      const swapped = rng() < 0.5;
      const [legA, legB, hypotenuse] = [
        swapped ? primitive[1] : primitive[0],
        swapped ? primitive[0] : primitive[1],
        primitive[2]
      ].map(value => value * multiplier);
      const missingHypotenuse = rng() < 0.5;
      answer = String(missingHypotenuse ? hypotenuse : legA);
      const unit = Math.min(235 / legA, 145 / legB), baseX = 75 + legA * unit, topY = 205 - legB * unit;
      const svg = S.polygon([[75, 205], [baseX, 205], [75, topY]], "v-outline") +
        S.rightAngle(75, 205, 14) + S.text((75 + baseX) / 2, 224, `${legA}`, 15) +
        S.text(57, (205 + topY) / 2, `${legB}`, 15) +
        S.text((baseX + 75) / 2 + 12, (205 + topY) / 2 - 10, missingHypotenuse ? "?" : `${hypotenuse}`, 15);
      spec = { kind: id, legA, legB, hypotenuse, asked: missingHypotenuse ? "hypotenuse" : "leg",
        primitive, multiplier, swapped };
      return answerPack({ prompt: `Find the ${missingHypotenuse ? "hypotenuse" : "missing side"} of this right-angled triangle.`,
        hint: "Use a² + b² = c², where c is the longest side opposite the right angle.",
        diagram: wrap(svg, "Right-angled triangle with labelled sides", "The two perpendicular sides meet at the marked right angle."),
        answer, spec, explainSteps: missingHypotenuse ? [`Pythagoras' theorem is a² + b² = c².`, `${legA}² + ${legB}² = ${legA * legA + legB * legB}.`,
          `Take the square root: c = ${answer}.`] : [`The hypotenuse is the longest side, so c = ${hypotenuse}.`,
          `The missing leg squared is c² − ${legB}² = ${hypotenuse * hypotenuse} − ${legB * legB} = ${answer * answer}.`,
          `Take the square root: the missing leg is ${answer}.`],
        solutionDiagram: wrap(svg + S.text(205, 250, `Missing side = ${answer}`, 13), "Pythagoras triangle with answer", "The missing side is calculated using the square-root rule."),
        marks: 2 });
    }

    if (id === "right-trigonometry") {
      const askAngle = rng() < 0.5;
      let angle, opposite, adjacent, hypotenuse, side = null;
      if (askAngle) {
        [opposite, adjacent, hypotenuse] = rng.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25],
          [20, 21, 29], [12, 35, 37], [9, 40, 41], [11, 60, 61]]);
        const multiplier = rng.int(1, 5);
        opposite *= multiplier; adjacent *= multiplier; hypotenuse *= multiplier;
        angle = Math.atan2(opposite, adjacent) * 180 / Math.PI;
        answer = angle.toFixed(2);
      } else {
        angle = rng.pick([15, 30, 45, 60, 75]);
        hypotenuse = rng.pick([10, 15, 20, 25, 30, 40]);
        const findOpposite = rng() < 0.5;
        side = findOpposite ? "opposite" : "adjacent";
        opposite = hypotenuse * Math.sin(angle * Math.PI / 180);
        adjacent = hypotenuse * Math.cos(angle * Math.PI / 180);
        answer = (findOpposite ? opposite : adjacent).toFixed(2);
      }
      const unit = Math.min(225 / adjacent, 140 / opposite), baseX = 75 + adjacent * unit, topY = 205 - opposite * unit;
      const angleDegrees = Math.atan2(opposite, adjacent) * 180 / Math.PI;
      const svg = S.polygon([[75, 205], [baseX, 205], [75, topY]], "v-outline") + S.rightAngle(75, 205, 14) +
        S.arc(75, 205, 32, 0, angleDegrees, "θ") +
        S.text((75 + baseX) / 2, 224, `${adjacent.toFixed(1)}`, 13) + S.text(53, (205 + topY) / 2, `${opposite.toFixed(1)}`, 13) +
        S.text((baseX + 75) / 2 + 12, (205 + topY) / 2 - 10, `${hypotenuse.toFixed(1)}`, 13);
      spec = { kind: id, angle, opposite, adjacent, hypotenuse, asked: askAngle ? "angle" : "side",
        side };
      const acceptedRounds = [Number(answer).toPrecision(3), Number(answer).toFixed(1)];
      return answerPack({ prompt: askAngle ?
        "Find angle θ in degrees using a calculator in degree mode. Give the answer to 1 decimal place or 3 significant figures." :
        `The marked angle is ${angle}°. Set the calculator to degree mode. Find the ${spec.side} side using a trig ratio; give the answer to 1 decimal place or 3 significant figures.`,
        hint: "Choose the ratio using the sides known or needed: SOH, CAH or TOA.",
        diagram: wrap(svg, "Right triangle for a trigonometry question", "The right angle and the side lengths are labelled."),
        answer, accept: acceptedRounds, spec, explainSteps: askAngle ? [`Set the calculator to degree mode.`,
          `Relative to θ, the opposite side is ${opposite} and the adjacent side is ${adjacent}.`,
          `Use tan θ = opposite ÷ adjacent = ${opposite}/${adjacent}.`, `θ = tan⁻¹(${opposite}/${adjacent}) = ${answer}° in degree mode.`] :
          [`The hypotenuse is ${hypotenuse} and the marked angle is ${angle}°. Set the calculator to degree mode.`,
          spec.side === "opposite" ?
            `Use sine: sin θ = opposite ÷ hypotenuse.` : `Use cosine: cos θ = adjacent ÷ hypotenuse.`,
          `${spec.side === "opposite" ? "Opposite" : "Adjacent"} = ${hypotenuse} × ${spec.side === "opposite" ? "sin" : "cos"}(${angle}°) = ${answer}.`],
        solutionDiagram: wrap(svg + S.text(205, 250, `${answer}${askAngle ? "°" : ""}`, 13),
          "Trigonometry triangle with calculated value", "The required side or angle is written beneath the right triangle."),
        marks: 2 });
    }

    if (id === "bearings") {
      const directions = [];
      for (let east = -12; east <= 12; east += 1) {
        for (let north = -12; north <= 12; north += 1) {
          if (east !== 0 || north !== 0) directions.push([east, north]);
        }
      }
      const [east, north] = rng.pick(directions);
      let bearing = Math.atan2(east, north) * 180 / Math.PI;
      if (bearing < 0) bearing += 360;
      answer = String(Math.round(bearing)).padStart(3, "0");
      const length = 68 / Math.hypot(east, north);
      const endpoint = [200 + east * length, 130 - north * length];
      const svg = `<circle cx="200" cy="130" r="76" class="v-empty"/>` +
        S.arrow(200, 130, 200, 74, "N") + S.arrow(endpoint[0], endpoint[1], endpoint[0], endpoint[1] - 28, "N") +
        S.arrow(200, 130, endpoint[0], endpoint[1], "B") + S.point(200, 130, "A") +
        S.point(endpoint[0], endpoint[1], "B") + S.arc(200, 130, 34, 90 - bearing, 90, `${answer}°`);
      spec = { kind: id, east, north, bearing, answer, diagramLength: 68 };
      return answerPack({ prompt: `Find the three-figure bearing of B from A. Measure clockwise from north.`,
        hint: "A bearing starts at north and turns clockwise. Use the east and north components.",
        diagram: wrap(svg, "Compass showing north at A and B and a bearing from A to B", "North is marked at both points; the arrow from A to B shows the direction of travel."),
        answer, spec, explainSteps: [`A three-figure bearing is measured clockwise from north.`, `The displacement is ${east} east and ${north} north.`,
          `Measure clockwise from the north line at A: atan2(east, north) = ${answer}°.`],
        solutionDiagram: wrap(svg + S.text(205, 250, `Bearing = ${answer}°`, 13),
          "Bearing diagram with the three-figure answer", "The clockwise bearing from the north line at A is labelled.") });
    }

    if (id === "circle-theorems") {
      const theorem = rng.pick(["centre", "same-segment", "tangent", "cyclic"]);
      let coefficient, offset, otherCoefficient, otherOffset, known, x;
      let svg = `<circle cx="200" cy="130" r="86" class="v-empty"/>`;
      if (theorem === "centre") {
        const k = rng.int(4, 18);
        x = 2 * k; coefficient = 4; offset = 2 * k; otherCoefficient = 1; otherOffset = 3 * k;
        svg += S.segment(200, 130, 130, 195) + S.segment(200, 130, 270, 195) +
          S.segment(200, 48, 130, 195) + S.segment(200, 48, 270, 195) +
          S.arc(200, 130, 30, 225, 315, `${coefficient}x + ${offset}°`) +
          S.arc(200, 48, 24, 220, 320, `${otherCoefficient}x + ${otherOffset}°`);
        known = null;
      } else if (theorem === "same-segment") {
        coefficient = 2; offset = rng.int(5, 20) * 2; known = 90; x = (known - offset) / coefficient;
        svg += S.segment(120, 130, 280, 130) + S.segment(120, 130, 150, 70) + S.segment(280, 130, 150, 70) +
          S.segment(120, 130, 250, 78) + S.segment(280, 130, 250, 78) +
          S.arc(150, 70, 18, 290, 330, `${coefficient}x + ${offset}°`) + S.arc(250, 78, 18, 210, 250, `${known}°`);
      } else if (theorem === "tangent") {
        coefficient = rng.int(2, 4); x = rng.int(5, 20); offset = 90 - coefficient * x;
        svg += S.segment(200, 44, 200, 130) + S.segment(105, 44, 295, 44) +
          S.rightAngle(200, 44, 20) + S.arc(200, 44, 31, 180, 270, `${coefficient}x + ${offset}°`);
        known = 90;
      } else {
        x = rng.int(5, 25); coefficient = rng.int(1, 2); offset = rng.int(10, 20);
        otherCoefficient = rng.int(1, 2); otherOffset = 180 - (coefficient + otherCoefficient) * x - offset;
        svg += S.polygon([[200, 46], [278, 130], [200, 214], [122, 130]], "v-outline") +
          S.arc(200, 46, 24, 295, 340, `${coefficient}x + ${offset}°`) +
          S.arc(200, 214, 24, 25, 70, `${otherCoefficient}x + ${otherOffset}°`);
        known = 180;
      }
      answer = String(x);
      spec = { kind: id, theorem, coefficient, offset, otherCoefficient: otherCoefficient || null,
        otherOffset: otherOffset || null, known, x };
      const prompts = { centre: "An angle at the centre is twice the angle at the circumference. Solve for x.",
        "same-segment": "Angles in the same segment are equal. Solve for x.",
        tangent: "A radius meets a tangent at 90°. Solve for x.",
        cyclic: "Opposite angles in a cyclic quadrilateral add to 180°. Solve for x." };
      return answerPack({ prompt: prompts[theorem], hint: "Write the circle-theorem relationship as an equation, then isolate x.",
        diagram: wrap(svg + S.text(200, 238, "Diagram NOT accurately drawn", 11), `Circle theorem diagram: ${theorem}`, "An original circle diagram marks the angles used by the stated theorem. Diagram NOT accurately drawn."),
        answer, spec, explainSteps: theorem === "centre" ? [`The angle at the centre equals twice the angle at the circumference.`,
          `${coefficient}x + ${offset} = 2(${otherCoefficient}x + ${otherOffset}).`, `Solving gives x = ${answer}.`] :
          theorem === "same-segment" ? [`Angles in the same segment are equal.`, `${coefficient}x + ${offset} = ${known}°.`,
            `Subtract ${offset} and divide by ${coefficient}: x = ${answer}.`] :
          theorem === "tangent" ? [`A radius is perpendicular to a tangent.`, `${coefficient}x + ${offset} = 90°.`,
            `Subtract ${offset} and divide by ${coefficient}: x = ${answer}.`] :
          [`Opposite angles in a cyclic quadrilateral total 180°.`, `${coefficient}x + ${offset} + ${otherCoefficient}x + ${otherOffset} = 180°.`,
            `Collect the x terms and solve: x = ${answer}.`],
        solutionDiagram: wrap(svg + S.text(200, 238, "Diagram NOT accurately drawn", 11) +
          S.text(205, 255, `x = ${answer}`, 13), "Circle theorem solution", "The theorem's equation gives the displayed value of x. Diagram NOT accurately drawn."),
        marks: 2 });
    }

    if (id === "area-sector") {
      const sector = rng() < 0.5;
      let svg, result;
      if (sector) {
        const radius = rng.int(4, 12), angle = rng.pick([60, 90, 120, 180, 270]);
        const end = angle * Math.PI / 180, cx = 190, cy = 130, r = 78;
        const x2 = cx + r * Math.cos(end), y2 = cy - r * Math.sin(end), large = angle > 180 ? 1 : 0;
        svg = `<circle cx="${cx}" cy="${cy}" r="${r}" class="v-empty"/><path d="M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 ${large} 0 ${x2} ${y2} Z" class="v-fill"/>` +
          S.segment(cx, cy, cx + r, cy) + S.segment(cx, cy, x2, y2) + S.text(cx + 35, cy + 20, `${radius} cm`, 12) + S.text(cx + 18, cy - 17, `${angle}°`, 12);
        const askArc = rng() < 0.5;
        result = askArc ? angle / 360 * 2 * Math.PI * radius : angle / 360 * Math.PI * radius * radius;
        answer = result.toFixed(2);
        spec = { kind: id, shape: "sector", radius, angle, asked: askArc ? "arc" : "area", result };
        return answerPack({ prompt: `Find the ${askArc ? "arc length" : "area"} of the shaded sector. Give ${askArc ? "cm" : "cm²"} to 2 decimal places.`,
          hint: askArc ? "Arc length is the fraction angle/360 of the full circumference." : "Sector area is the fraction angle/360 of the full circle area.",
          diagram: wrap(svg, "Circle sector with radius and angle", "The shaded sector's central angle and radius are labelled."),
          answer, spec, explainSteps: askArc ? [`The sector is ${angle}/360 of a full circle.`, `Full circumference = 2π × ${radius}.`,
            `Arc length = ${angle}/360 × 2π × ${radius} = ${answer} cm.`] :
          [`The sector is ${angle}/360 of a full circle.`, `Full circle area = π × ${radius}².`,
            `Sector area = ${angle}/360 × π × ${radius}² = ${answer} cm².`],
          solutionDiagram: wrap(svg + S.text(205, 250, `${askArc ? "Arc" : "Area"} = ${answer}`, 13),
            "Sector annotated with calculated measure", "The requested sector measure is shown below the circle.") });
      }
      const width = rng.int(7, 12), height = rng.int(5, 9);
      const notchWidth = rng.int(2, width - 2), notchHeight = rng.int(1, height - 1);
      const points = [[60, 45], [340, 45], [340, 215], [60 + notchWidth / width * 280, 215],
        [60 + notchWidth / width * 280, 45 + notchHeight / height * 170], [60, 45 + notchHeight / height * 170]];
      const area = width * height - notchWidth * notchHeight, perimeter = 2 * (width + height), askArea = rng() < 0.5;
      svg = S.polygon(points, "v-empty") + S.text(200, 35, `${width} cm by ${height} cm`, 13) +
        S.text(200, 238, `Cut-out: ${notchWidth} cm by ${notchHeight} cm`, 12);
      answer = String(askArea ? area : perimeter);
      spec = { kind: id, shape: "compound", width, height, notchWidth, notchHeight, asked: askArea ? "area" : "perimeter", area, perimeter };
      return answerPack({ prompt: `Find the ${askArea ? "area" : "perimeter"} of this L-shaped compound figure.`, hint: "Split the L into rectangles for area. For perimeter, add each outside edge.",
        diagram: wrap(svg, "L-shaped compound figure with dimensions", "A rectangular corner is removed from the larger rectangle."),
        answer, spec, explainSteps: askArea ? [`Area of the outer rectangle = ${width} × ${height}.`,
          `Subtract the cut-out area: ${notchWidth} × ${notchHeight}.`, `${width * height} − ${notchWidth * notchHeight} = ${answer} cm².`] :
          [`Add the lengths around the outside edge.`, `The notch replaces equal lengths of the original outside edges, so the total is 2(${width} + ${height}).`,
            `Perimeter = ${answer} cm.`],
        solutionDiagram: wrap(svg + S.text(205, 250, `${askArea ? "Area" : "Perimeter"} = ${answer}`, 12),
          "Compound shape annotated with its measure", "The requested area or perimeter is written beneath the L shape.") });
    }

    if (id === "similar-shapes") {
      const factor = rng.int(2, 4), asked = rng.pick(["length", "area", "volume"]), small = rng.int(2, 12);
      const result = asked === "length" ? small * factor : asked === "area" ? small * factor ** 2 : small * factor ** 3;
      const svg = S.polygon([[80, 190], [155, 190], [80, 110]], "v-outline") +
        S.polygon([[215, 190], [215 + 75 * factor / 2, 190], [215, 190 - 80 * factor / 2]], "v-region") +
        S.text(118, 211, `small`, 12) + S.text(282, 211, `large`, 12);
      answer = String(result);
      spec = { kind: id, scaleFactor: factor, small, asked, result };
      return answerPack({ prompt: asked === "length" ? `A corresponding small length is ${small} cm. The length scale factor is ${factor}. Find the large length.` :
        `The length scale factor is ${factor}. A small shape has ${asked} ${small} ${asked === "area" ? "cm²" : "cm³"}. Find the corresponding large ${asked}.`,
        hint: "Area scales by k² and volume scales by k³, where k is the length scale factor.",
        diagram: wrap(svg, "Two similar triangles at different scales", "The larger triangle is an enlargement of the smaller by the stated scale factor."),
        answer, spec, explainSteps: [`The length scale factor is k = ${factor}.`,
          asked === "length" ? `Lengths multiply by k: ${small} × ${factor}.` :
          asked === "area" ? `Areas multiply by k²: ${small} × ${factor}².` : `Volumes multiply by k³: ${small} × ${factor}³.`,
          `The large ${asked} is ${answer}.`],
        solutionDiagram: wrap(svg + S.text(205, 250, `${asked} = ${answer}`, 13),
          "Similar shapes with scale calculation", "The scale relationship and resulting measure are displayed.") });
    }

    if (id === "dot-product-angle") {
      const options = [[1, 0], [0, 1], [1, 1], [1, -1], [2, 1], [-2, 1], [3, 2], [-1, 3], [2, -3]];
      const vectorA = rng.pick(options), vectorB = rng.pick(options);
      const dot = vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1];
      const cosine = dot / (Math.hypot(...vectorA) * Math.hypot(...vectorB));
      const angle = Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI;
      answer = angle.toFixed(2);
      const fitted = S.fittedPlane([[0, 0], vectorA, vectorB], 1), origin = fitted.toScreen(0, 0);
      const endA = fitted.toScreen(...vectorA), endB = fitted.toScreen(...vectorB);
      const angleA = Math.atan2(vectorA[1], vectorA[0]) * 180 / Math.PI;
      let angleB = Math.atan2(vectorB[1], vectorB[0]) * 180 / Math.PI;
      while (angleB - angleA > 180) angleB -= 360;
      while (angleB - angleA < -180) angleB += 360;
      const svg = fitted.grid + S.arrow(origin[0], origin[1], endA[0], endA[1], "a") + S.arrow(origin[0], origin[1], endB[0], endB[1], "b");
      spec = { kind: id, vectorA, vectorB, dot, angle };
      return answerPack({ prompt: `Find the angle between a = (${vectorA.join(", ")}) and b = (${vectorB.join(", ")}). Give degrees to 2 decimal places.`,
        hint: "Use a · b = |a||b| cos θ, then take inverse cosine in degree mode.",
        diagram: wrap(svg, "Two vectors on a coordinate grid", "Both vectors start at the origin; their included angle is the required value."),
        answer, spec, explainSteps: [`Compute the dot product: a · b = ${vectorA[0]}×${vectorB[0]} + ${vectorA[1]}×${vectorB[1]} = ${dot}.`,
          `Use cos θ = (a · b)/(|a||b|).`, `θ = cos⁻¹(${cosine.toFixed(4)}) = ${answer}°.`],
        solutionDiagram: wrap(svg + S.arc(origin[0], origin[1], 28, angleA, angleB, `${answer}°`) + S.text(205, 250, `${answer}°`, 13),
          "Vectors annotated with their included angle", "The angle between the vectors is labelled in degrees.") });
    }

    if (id === "regression") {
      const baseSlope = rng.pick([-2, -1, 1, 2]), baseIntercept = rng.int(-2, 2);
      const xs = [-4, -2, 0, 2, 4], residuals = xs.map(() => rng.int(-2, 2));
      const ys = xs.map((value, index) => baseSlope * value + baseIntercept + residuals[index]);
      const xMean = xs.reduce((sum, value) => sum + value, 0) / xs.length;
      const yMean = ys.reduce((sum, value) => sum + value, 0) / ys.length;
      const slope = xs.reduce((sum, value, index) => sum + (value - xMean) * (ys[index] - yMean), 0) /
        xs.reduce((sum, value) => sum + (value - xMean) ** 2, 0);
      const intercept = yMean - slope * xMean, selected = rng.int(0, xs.length - 1);
      const residual = ys[selected] - (slope * xs[selected] + intercept), asked = rng.pick(["slope", "intercept", "residual"]);
      let svg = "";
      xs.forEach((value, index) => {
        const p = plot(value, ys[index], -5, 5, -15, 15);
        svg += point(p[0], p[1], asked === "residual" && index === selected ? "P" : "");
      });
      const p1 = plot(-5, slope * -5 + intercept, -5, 5, -15, 15), p2 = plot(5, slope * 5 + intercept, -5, 5, -15, 15);
      svg += S.segment(p1[0], p1[1], p2[0], p2[1], true);
      if (asked === "residual") {
        const dataPoint = plot(xs[selected], ys[selected], -5, 5, -15, 15), fittedPoint = plot(xs[selected], slope * xs[selected] + intercept, -5, 5, -15, 15);
        svg += S.segment(dataPoint[0], dataPoint[1], fittedPoint[0], fittedPoint[1], false, "v-rise-run");
      }
      svg += chartAxes(42, 28, 375, 218, "x", "y");
      const result = { slope, intercept, residual }[asked];
      answer = result.toFixed(2);
      spec = { kind: id, points: xs.map((value, index) => [value, ys[index]]), asked, selected, slope, intercept, residual };
      return answerPack({ prompt: asked === "residual" ? `Find the residual for the labelled point P (observed y − predicted y).` :
        `Read the ${asked} of the dashed regression line. Give your answer to 2 decimal places.`,
        hint: asked === "residual" ? "Residual = observed y-value minus the value predicted by the line." : "Use two points on the dashed line to estimate its gradient and intercept.",
        diagram: wrap(svg, "Scatter plot with least-squares regression line", "The dashed line is the regression line; the labelled point's residual is the vertical gap."),
        answer, spec, explainSteps: asked === "slope" ? [`Choose two locations on the regression line.`, `Gradient = change in y ÷ change in x.`,
          `The fitted slope is ${answer}.`] : asked === "intercept" ? [`The intercept is where the regression line crosses the y-axis.`, `At x = 0, the fitted value is ${intercept.toFixed(2)}.`,
            `So the intercept is ${answer}.`] : [`Predicted y comes from the dashed regression line at x = ${xs[selected]}.`,
              `Residual = observed − predicted = ${ys[selected]} − ${(slope * xs[selected] + intercept).toFixed(2)}.`,
              `The residual is ${answer}.`],
        solutionDiagram: wrap(svg + S.text(205, 250, `${asked} = ${answer}`, 13),
          "Regression graph annotated with statistic", "The requested regression value is shown below the scatter graph.") });
    }

    if (id === "gradient-descent") {
      const target = rng.int(-2, 2);
      let weight = rng.int(-4, 4);
      if (weight === target) weight += weight < 4 ? 1 : -1;
      const learningRate = rng.pick([0.1, 0.2, 0.25, 0.5]);
      const loss = value => (value - target) ** 2;
      const gradient = 2 * (weight - target), nextWeight = weight - learningRate * gradient;
      const currentPixel = plot(weight, loss(weight), -5, 5, 0, 40), nextPixel = plot(nextWeight, loss(nextWeight), -5, 5, 0, 40);
      let svg = "", previous = null;
      for (let value = -5; value <= 5; value += 0.1) {
        const y = loss(value);
        if (y > 40) { previous = null; continue; }
        const p = plot(value, y, -5, 5, 0, 40);
        if (previous) svg += S.segment(previous[0], previous[1], p[0], p[1]);
        previous = p;
      }
      svg += S.segment(currentPixel[0], 218, currentPixel[0], currentPixel[1], true, "v-rise-run") +
        S.segment(nextPixel[0], 218, nextPixel[0], nextPixel[1], true, "v-rise-run") +
        S.arrow(currentPixel[0], 225, nextPixel[0], 225, "step") +
        point(currentPixel[0], currentPixel[1], "w") + point(nextPixel[0], nextPixel[1], "next") +
        chartAxes(42, 28, 375, 218, "Weight w", "Loss");
      answer = nextWeight.toFixed(2);
      spec = { kind: id, weight, target, learningRate, gradient, nextWeight, loss: loss(weight) };
      return answerPack({ prompt: `For L(w) = (w − ${target})², take one gradient-descent step from w = ${weight} with learning rate ${learningRate}. Find the new w.`,
        hint: "Update rule: new w = old w − learning rate × gradient. The gradient is 2(w − target).",
        diagram: wrap(svg, "Gradient descent step on a parabola", "The current weight and the next step are marked on the loss curve."),
        answer, spec, explainSteps: [`Differentiate L(w) = (w − ${target})²: gradient = 2(w − ${target}).`,
          `At w = ${weight}, gradient = ${gradient}.`, `Update: ${weight} − ${learningRate} × ${gradient} = ${answer}.`,
          `The next weight is ${answer}.`],
        solutionDiagram: wrap(svg + S.text(205, 250, `w next = ${answer}`, 13),
          "Gradient descent graph with the update", "The new weight after one learning step is shown below the parabola.") });
    }

    if (id === "sigmoid-graph") {
      const input = rng.int(-50, 50) / 10, sigmoid = value => 1 / (1 + Math.exp(-value));
      const probability = sigmoid(input);
      let svg = "", previous = null;
      for (let value = -6; value <= 6; value += 0.1) {
        const p = plot(value, sigmoid(value), -6, 6, 0, 1);
        if (previous) svg += S.segment(previous[0], previous[1], p[0], p[1]);
        previous = p;
      }
      const marked = plot(input, probability, -6, 6, 0, 1);
      svg += S.segment(marked[0], 218, marked[0], marked[1], true, "v-rise-run") +
        S.segment(42, marked[1], marked[0], marked[1], true, "v-rise-run") + point(marked[0], marked[1]) +
        chartAxes(42, 28, 375, 218, "Input z", "Probability");
      answer = probability.toFixed(3);
      spec = { kind: id, input, probability };
      return answerPack({ prompt: `Read the sigmoid probability for input z = ${input}. Give 3 decimal places.`,
        hint: "The sigmoid output is between 0 and 1. Follow z up to the curve, then across to the probability axis.",
        diagram: wrap(svg, "Sigmoid curve with a marked input", "A sigmoid curve rises smoothly from probabilities near zero to probabilities near one."),
        answer, spec, explainSteps: [`The sigmoid function is σ(z) = 1/(1 + e^(−z)).`,
          `At z = ${input}, σ(z) = 1/(1 + e^(−${input})) = ${probability.toFixed(5)}.`,
          `Rounded to 3 decimal places, the probability is ${answer}.`],
        solutionDiagram: wrap(svg + S.text(205, 250, `σ(${input}) = ${answer}`, 13),
          "Sigmoid graph annotated with probability", "The probability corresponding to the input is written below the graph.") });
    }

    if (id === "normal-distribution") {
      const choices = [
        { lower: -1, upper: 1, percent: 68, description: "within 1 standard deviation of the mean" },
        { lower: -2, upper: 2, percent: 95, description: "within 2 standard deviations of the mean" },
        { lower: -3, upper: 3, percent: 99.7, description: "within 3 standard deviations of the mean" },
        { lower: -2, upper: -1, percent: 13.5, description: "between 1 and 2 standard deviations below the mean" },
        { lower: 1, upper: 2, percent: 13.5, description: "between 1 and 2 standard deviations above the mean" },
        { lower: -1, upper: 0, percent: 34, description: "between the mean and 1 standard deviation below it" },
        { lower: 2, upper: 3, percent: 2.35, description: "between 2 and 3 standard deviations above the mean" }
      ];
      const chosen = rng.pick(choices), mean = rng.int(30, 70), standardDeviation = rng.pick([2, 3, 4, 5, 6, 8, 10]);
      const density = value => Math.exp(-0.5 * value * value) /
        (standardDeviation * Math.sqrt(2 * Math.PI));
      const valueAt = z => mean + z * standardDeviation;
      const coordinate = z => plot(valueAt(z), density(z), mean - 4 * standardDeviation,
        mean + 4 * standardDeviation, 0, 0.22);
      let area = `M ${coordinate(chosen.lower)[0]} 218 L ${coordinate(chosen.lower)[0]} ${coordinate(chosen.lower)[1]}`;
      for (let value = chosen.lower + 0.05; value < chosen.upper; value += 0.05) {
        const p = coordinate(value);
        area += ` L ${p[0]} ${p[1]}`;
      }
      const end = coordinate(chosen.upper);
      area += ` L ${end[0]} ${end[1]} L ${end[0]} 218 Z`;
      let curve = "", previous = null;
      for (let value = -4; value <= 4; value += 0.05) {
        const p = coordinate(value);
        if (previous) curve += S.segment(previous[0], previous[1], p[0], p[1]);
        previous = p;
      }
      const svg = `<path d="${area}" class="v-shade"/>` + curve +
        [-3, -2, -1, 0, 1, 2, 3].map(value => {
          const p = plot(valueAt(value), 0, mean - 4 * standardDeviation,
            mean + 4 * standardDeviation, 0, 0.22);
          return S.segment(p[0], 213, p[0], 223, false, "v-axis") +
            S.text(p[0], 239, value === 0 ? String(mean) : String(valueAt(value)), 10);
        }).join("") + chartAxes(42, 28, 375, 218, "Value", "Density");
      answer = `${chosen.percent}%`;
      spec = { kind: id, lower: chosen.lower, upper: chosen.upper, percent: chosen.percent,
        description: chosen.description, mean, standardDeviation };
      return answerPack({ prompt: `The normal distribution has mean ${mean} and standard deviation ${standardDeviation}. Use the empirical rule to find the percentage ${chosen.description}.`,
        hint: "The 68–95–99.7 rule gives the percentages within 1, 2 and 3 standard deviations.",
        diagram: wrap(svg, "Normal distribution with a shaded interval", "The bell curve shows the standard normal distribution; the chosen interval is shaded."),
        answer, spec, explainSteps: [`The mean is μ = ${mean}; one standard deviation is σ = ${standardDeviation}.`,
          chosen.percent === 68 ? "About 68% lies within 1 standard deviation of the mean." :
          chosen.percent === 95 ? "About 95% lies within 2 standard deviations of the mean." :
          chosen.percent === 99.7 ? "About 99.7% lies within 3 standard deviations of the mean." :
          `Use symmetry and subtract empirical-rule bands to find the interval ${chosen.lower}σ to ${chosen.upper}σ.`,
          `The shaded probability is approximately ${answer}.`],
        solutionDiagram: wrap(svg + S.text(205, 255, `Shaded proportion ≈ ${answer}`, 13),
          "Normal distribution annotated with empirical-rule percentage", "The approximate probability for the shaded interval is shown.") });
    }
    throw new Error(`No Phase 2 visual question factory exists for "${id}".`);
  }

  window.VisualFactory = { makeVisualQuestion };

  function renderStats() {
    $("#visual-points").textContent = String(state.points);
    $("#visual-streak").textContent = String(state.streak);
    $("#visual-accuracy").textContent = state.total ? `${Math.round(state.correct / state.total * 100)}%` : "—";
    $("#visual-skill-stats").innerHTML = Object.entries(state.skills).map(([skill, stats]) =>
      `<li>${escapeHtml(skill)}: ${stats.correct}/${stats.total}</li>`).join("") || "<li>Answer a few questions to see skill stats.</li>";
    $("#visual-mistakes").innerHTML = state.mistakes.slice(-8).reverse().map(item =>
      `<li><button type="button" aria-label="Replay ${escapeHtml(item.title)}, seed ${item.seed}" data-replay-id="${escapeHtml(item.id)}" data-replay-seed="${item.seed}">${escapeHtml(item.title)} · seed ${item.seed}</button></li>`).join("") || "<li>No saved mistakes yet.</li>";
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char]);
  }

  function selectedGenerators() {
    const area = $("#visual-area").value;
    const skill = $("#visual-skill").value;
    const tier = $("#visual-tier").value;
    return generators.filter(item => (area === "All" || item.area === area) &&
      (skill === "All" || item.id === skill) &&
      (tier === "All" || item.tier === "FH" || item.tier === tier));
  }

  function makeQuestion(generator, seed) {
    const rng = window.VisualRNG.seeded(seed);
    const question = generator.make(rng);
    question.seed = seed >>> 0;
    question.generatorId = generator.id;
    question.skill = generator.skill;
    question.title = generator.title;
    return question;
  }

  function renderQuestionPrompt(question) {
    const target = $("#visual-prompt");
    target.replaceChildren();
    const marker = "[[matrix]]";
    const text = String(question.prompt || "");
    if (!question.promptMatrix || !text.includes(marker)) {
      target.textContent = text;
      return;
    }
    const [before, after] = text.split(marker);
    target.append(document.createTextNode(before));
    const matrix = document.createElement("table");
    matrix.className = "visual-prompt-matrix";
    matrix.setAttribute("aria-label", "2 by 2 matrix");
    const body = document.createElement("tbody");
    question.promptMatrix.forEach(row => {
      const tr = document.createElement("tr");
      row.forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = String(value).replace(/-/g, "−");
        tr.appendChild(cell);
      });
      body.appendChild(tr);
    });
    matrix.appendChild(body);
    target.appendChild(matrix);
    target.append(document.createTextNode(after || ""));
  }

  function clickAnswerMarkup(target) {
    if (target.type === "point") return `<label class="visual-answer-label" for="visual-click-keyboard">Or type the point as x, y</label><input id="visual-click-keyboard" type="text" aria-label="Type the coordinates as x, y"><output id="visual-click-answer" aria-live="polite">No selection yet.</output>`;
    if (target.type === "points") return `<label class="visual-answer-label" for="visual-click-keyboard">Or type both points as x,y; x,y</label><input id="visual-click-keyboard" type="text" aria-label="Type both points as x,y; x,y"><output id="visual-click-answer" aria-live="polite">Click two points.</output>`;
    if (target.type === "numberline") return `<label class="visual-answer-label" for="visual-click-keyboard">Or type the fraction</label><input id="visual-click-keyboard" type="text" aria-label="Type the fraction"><output id="visual-click-answer" aria-live="polite">No selection yet.</output>`;
    return `<p class="mut">Click the diagram to give your answer.</p><output id="visual-click-answer" aria-live="polite">0 sections selected</output>`;
  }

  function svgViewBox(svg) {
    const values = (svg.getAttribute("viewBox") || "0 0 400 260").trim().split(/[ ,]+/).map(Number);
    if (values.length !== 4 || !values.every(Number.isFinite) || values[2] <= 0 || values[3] <= 0) {
      throw new Error("The interactive diagram has an invalid viewBox.");
    }
    return values;
  }

  function svgPointFromEvent(svg, event) {
    return window.VisualClick.toSvgPoint(
      event.clientX, event.clientY, svg.getBoundingClientRect(), svgViewBox(svg),
      svg.getAttribute("preserveAspectRatio")
    );
  }

  function nextQuestion(seed, generatorOverride) {
    if (exam && !exam.finished) return;
    const available = practiceMistakes ? state.mistakes : selectedGenerators();
    if (!available.length) {
      $("#visual-status").textContent = practiceMistakes ? "There are no saved mistakes." : "No question types match these filters.";
      return;
    }
    const target = practiceMistakes ? available[Math.floor(Math.random() * available.length)] : null;
    currentGenerator = generatorOverride || (target ?
      generators.find(item => item.id === target.id) : available[Math.floor(Math.random() * available.length)]);
    if (!currentGenerator) {
      $("#visual-status").textContent = "The saved question type is no longer available.";
      return;
    }
    const questionSeed = seed == null ? (Math.random() * 0xffffffff) >>> 0 : Number(seed) >>> 0;
    current = makeQuestion(currentGenerator, target ? target.seed : questionSeed);
    if(window.AITutor){
      const tutorPanel=$(".visual-question-card [data-ai-tutor]");
      if(tutorPanel)tutorPanel.remove();
      delete $(".visual-question-card").dataset.aiAttached;
    }
    attempts = 0; answered = false;
    $("#visual-status").textContent = "";
    $("#visual-feedback").textContent = "";
    $("#visual-explanation").hidden = true;
    $("#visual-hint-text").hidden = true;
    $("#visual-hint-text").textContent = "";
    renderQuestionPrompt(current);
    $("#visual-diagram").innerHTML = current.diagram;
    $("#visual-seed").textContent = `${current.generatorId} · ${current.seed}`;
    $("#visual-solution").innerHTML = current.solutionDiagram;
    $("#visual-steps").innerHTML = current.explainSteps.map(step => `<li>${escapeHtml(step)}</li>`).join("");
    $("#visual-wolfram").hidden = exam && !exam.finished;
    $("#visual-support").hidden = exam && !exam.finished;
    $("#visual-answer-area").innerHTML = current.type === "mc" ?
      `<fieldset><legend>Choose one answer</legend>${current.options.map((option, index) =>
        `<label class="visual-option"><input type="radio" name="visual-answer" value="${escapeHtml(option.value)}" aria-label="Option ${option.label}"><b>${option.label}.</b> ${option.svg || escapeHtml(option.content)}</label>`).join("")}</fieldset>` :
      current.type === "click" ? clickAnswerMarkup(current.clickTarget) :
      `<label class="visual-answer-label" for="visual-answer">Your answer</label><input id="visual-answer" type="text" autocomplete="off" aria-label="Type your answer"${current.answerPlaceholder ? ` placeholder="${escapeHtml(current.answerPlaceholder)}"` : ""}>`;
    renderClickHandler();
    renderSupport(current);
    $("#visual-submit").disabled = false;
    $("#visual-explain").disabled = true;
    $("#visual-next").disabled = Boolean(exam);
    $("#visual-next").textContent = "Skip question";
    $("#visual-next").setAttribute("aria-label", "Skip this question and continue");
    $("#visual-same").disabled = false;
    $("#visual-report").disabled = false;
    $("#visual-question-count").textContent = exam ? `Question ${exam.index + 1} of ${EXAM_SIZE}` : "Practice";
    $("#visual-progress").value = exam ? exam.index + 1 : 0;
    $("#visual-hint").disabled = Boolean(exam);
    if(!exam&&window.AITutor){
      const wolframLink=[...$("#visual-support").querySelectorAll("a")]
        .find(link=>link.textContent.includes("Wolfram Alpha"));
      window.AITutor.attach($(".visual-question-card"),{
        question:current.promptForTutor || current.prompt,
        topic:current.skill,
        level:current.difficulty||"GCSE",
        responseElement:$("#visual-answer-area"),
        wolframLink:wolframLink&&wolframLink.href,
        makeSimilar:()=>{
          nextQuestion(undefined,currentGenerator);
          return {replacedQuestion:true};
        }
      });
    }
  }

  function renderClickHandler() {
    const target = current.clickTarget;
    if (!target) return;
    if (target.type === "point") {
      const svg = $("#visual-diagram svg");
      svg.addEventListener("pointerup", event => {
        if (!event.isPrimary || event.button !== 0) return;
        const viewBox = svgViewBox(svg);
        const point = svgPointFromEvent(svg, event);
        const guess = target.mapping ? [
          Math.max(target.mapping.range.minX, Math.min(target.mapping.range.maxX,
            Math.round((point[0] - target.mapping.ox) / target.mapping.scale))),
          Math.max(target.mapping.range.minY, Math.min(target.mapping.range.maxY,
            Math.round((target.mapping.oy - point[1]) / target.mapping.scale)))
        ] : window.VisualClick.toGridPoint(point, viewBox, target.range);
        $("#visual-click-answer").textContent = `Selected (${guess[0]}, ${guess[1]})`;
        $("#visual-click-answer").dataset.value = `${guess[0]},${guess[1]}`;
      });
    } else if (target.type === "points") {
      const svg = $("#visual-diagram svg");
      const selected = [];
      svg.addEventListener("pointerup", event => {
        if (!event.isPrimary || event.button !== 0) return;
        if (selected.length >= target.points.length) return;
        const viewBox = svgViewBox(svg), range = target.range;
        const coordinate = window.VisualClick.toGridPoint(svgPointFromEvent(svg, event), viewBox, range);
        if (selected.some(point => point[0] === coordinate[0] && point[1] === coordinate[1])) return;
        selected.push(coordinate);
        const pixel = window.VisualSVG.mapPoint(coordinate[0], coordinate[1], range);
        svg.insertAdjacentHTML("beforeend", `<circle cx="${pixel[0]}" cy="${pixel[1]}" r="6" class="v-click-user"/>`);
        const value = selected.map(point => point.join(",")).join(";");
        $("#visual-click-answer").dataset.value = value;
        $("#visual-click-answer").textContent = `${selected.length} of ${target.points.length} points selected: ${value}`;
      });
    } else if (target.type === "numberline") {
      const svg = $("#visual-diagram svg");
      svg.addEventListener("pointerup", event => {
        if (!event.isPrimary || event.button !== 0) return;
        const point = svgPointFromEvent(svg, event);
        const guess = window.VisualClick.toNumberLineValue(
          point, target.denominator, svgViewBox(svg), 24, 376
        );
        $("#visual-click-answer").textContent = `Selected ${guess}`;
        $("#visual-click-answer").dataset.value = String(guess);
      });
    } else if (target.type === "shade") {
      const toggle = event => {
        const rect = event.target.closest("[data-shade-part]");
        if (!rect) return;
        const selected = new Set(($("#visual-click-answer").dataset.value || "").split(",").filter(Boolean));
        const part = rect.dataset.shadePart;
        selected.has(part) ? selected.delete(part) : selected.add(part);
        rect.classList.toggle("v-selected", selected.has(part));
        rect.setAttribute("aria-pressed", selected.has(part) ? "true" : "false");
        $("#visual-click-answer").dataset.value = [...selected].sort((a, b) => Number(a) - Number(b)).join(",");
        $("#visual-click-answer").textContent = `${selected.size} sections selected`;
      };
      const svg = $("#visual-diagram svg");
      svg.addEventListener("pointerup", event => {
        if (event.isPrimary && event.button === 0) toggle(event);
      });
      svg.addEventListener("keydown", event => {
        if ((event.key === "Enter" || event.key === " ") && event.target.closest("[data-shade-part]")) {
          event.preventDefault();
          toggle(event);
        }
      });
    }
  }

  function userAnswer() {
    if (current.type === "mc") return document.querySelector('input[name="visual-answer"]:checked')?.value || "";
    if (current.type === "click") {
      const typed = $("#visual-click-keyboard");
      return (typed && typed.value.trim()) || $("#visual-click-answer").dataset.value || "";
    }
    return $("#visual-answer").value;
  }

  function isAnswerCorrect(question, answer) {
    if (question.type === "click" && question.clickTarget.type === "shade") {
      const values = answer.split(",").filter(Boolean).map(Number).sort((a, b) => a - b);
      return values.length === question.clickTarget.count;
    }
    if (question.type === "click" && question.clickTarget.type === "point") {
      const values = answer.split(",").map(window.VisualChecker.comparable);
      return values.length === 2 && values.every(value => typeof value === "number" && Number.isFinite(value)) &&
        Math.abs(values[0] - question.clickTarget.x) <= question.clickTarget.tolerance &&
        Math.abs(values[1] - question.clickTarget.y) <= question.clickTarget.tolerance;
    }
    if (question.type === "click" && question.clickTarget.type === "points") {
      const values = answer.split(";").map(pair => pair.split(",").map(window.VisualChecker.comparable));
      const targets = question.clickTarget.points, tolerance = question.clickTarget.tolerance;
      const matches = (point, target) => Math.abs(point[0] - target[0]) <= tolerance &&
        Math.abs(point[1] - target[1]) <= tolerance;
      return values.length === targets.length && values.every(point => point.length === 2 &&
        point.every(value => typeof value === "number" && Number.isFinite(value))) &&
        ((matches(values[0], targets[0]) && matches(values[1], targets[1])) ||
          (matches(values[0], targets[1]) && matches(values[1], targets[0])));
    }
    return window.VisualChecker.correct(question.answer, answer, {
      accept: question.accept,
      tolerance: question.type === "click" ? question.clickTarget.tolerance : question.tolerance
    });
  }

  function isCorrect() {
    return isAnswerCorrect(current, userAnswer());
  }

  function formatReviewAnswer(question) {
    if (question.type === "click" && question.clickTarget.type === "shade") {
      if (question.spec.kind === "shade-fraction") {
        return `Any ${question.clickTarget.count} of ${question.clickTarget.parts} parts (${question.spec.numerator}/${question.spec.denominator}).`;
      }
      if (question.spec.kind === "percentages") {
        return `Any ${question.clickTarget.count} of ${question.clickTarget.parts} squares (${question.spec.percent}%).`;
      }
    }
    return question.answer;
  }

  function submitAnswer() {
    if (!current || answered) return;
    const correct = isCorrect();
    if (exam && !exam.finished) {
      exam.answers[exam.index] = userAnswer();
      exam.submitted[exam.index] = true;
      $("#visual-feedback").textContent = "Answer saved. You can change it before the test ends.";
      return;
    }
    attempts += 1;
    if (correct) {
      answered = true;
      recordAnswer(true);
      $("#visual-feedback").textContent = "Correct. Nice work!";
      $("#visual-submit").disabled = true;
      $("#visual-explain").disabled = false;
      $("#visual-next").disabled = false;
      $("#visual-next").textContent = "Next question";
      $("#visual-next").setAttribute("aria-label", "Get the next question");
      if (current.type === "click") {
        $("#visual-explanation").hidden = false;
        $("#visual-explanation").open = true;
      }
      return;
    }
    $("#visual-feedback").textContent = attempts === 1 ? "Not quite. Try once more." : "Not quite. Read the worked steps.";
    if (attempts >= 2) {
      answered = true;
      recordAnswer(false);
      $("#visual-submit").disabled = true;
      $("#visual-explain").disabled = false;
      $("#visual-explanation").hidden = false;
      $("#visual-explanation").open = true;
      $("#visual-next").disabled = false;
      $("#visual-next").textContent = "Next question";
      $("#visual-next").setAttribute("aria-label", "Get the next question");
      renderSupport(current);
    }
  }

  function recordAnswer(wasCorrect) {
    state.total += 1;
    if (wasCorrect) {
      state.correct += 1;
      state.points += current.marks || 1;
      window.dispatchEvent(new CustomEvent("mm2:points",{detail:{pointsEarned:current.marks||1,source:"visual-practice"}}));
      state.streak += 1;
    } else {
      state.streak = 0;
      if (!state.mistakes.some(item => item.id === current.generatorId && item.seed === current.seed)) {
        state.mistakes.push({ id: current.generatorId, seed: current.seed, title: current.title });
      }
    }
    const stats = state.skills[current.skill] || { total: 0, correct: 0 };
    stats.total += 1;
    if (wasCorrect) stats.correct += 1;
    state.skills[current.skill] = stats;
    save();
  }

  function renderSupport(question) {
    const query = encodeURIComponent(question.skill);
    const links = [
      ["YouTube", `https://www.youtube.com/results?search_query=${query}`],
      ["Khan Academy", `https://www.khanacademy.org/search?page_search_query=${query}`],
      ["Corbettmaths", `https://corbettmaths.com/?s=${query}`],
      ["BBC Bitesize", `https://www.bbc.co.uk/search?q=${query}`]
    ];
    if (question.area === "Graphs") {
      const spec = question.spec || {};
      const plot = spec.m != null ? `plot y=${spec.m}x${spec.c < 0 ? "" : "+"}${spec.c}` :
        spec.r != null ? `convert polar point (${spec.r}, ${spec.theta} degrees) to Cartesian coordinates` :
        spec.x != null && spec.y != null ? `plot point (${spec.x}, ${spec.y})` : question.prompt;
      links.push(["Wolfram Alpha", `https://www.wolframalpha.com/input?i=${encodeURIComponent(plot)}`]);
    }
    $("#visual-support").innerHTML = links.map(([label, url]) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join("");
    $("#visual-wolfram").hidden = !links.some(link => link[0] === "Wolfram Alpha");
  }

  function showExplanation() {
    $("#visual-explanation").hidden = false;
    $("#visual-explanation").open = true;
    $("#visual-explain").disabled = true;
  }

  function reportQuestion() {
    const report = `${current.generatorId} seed ${current.seed}`;
    if (!navigator.clipboard) {
      $("#visual-status").textContent = `Copy this report code: ${report}`;
      return;
    }
    navigator.clipboard.writeText(report).then(() => {
      $("#visual-status").textContent = "Question code copied.";
    }).catch(error => {
      $("#visual-status").textContent = `Copy this report code: ${report}`;
      console.error("Could not copy the question report code.", error);
    });
  }

  function startExam() {
    const pool = selectedGenerators();
    if (!pool.length) return;
    if(window.AITutor){
      const tutorPanel=$(".visual-question-card [data-ai-tutor]");
      if(tutorPanel)tutorPanel.remove();
      delete $(".visual-question-card").dataset.aiAttached;
    }
    const seed = (Math.random() * 0xffffffff) >>> 0;
    exam = { questions: [], answers: Array(EXAM_SIZE).fill(null), results: Array(EXAM_SIZE).fill(false), submitted: Array(EXAM_SIZE).fill(false), index: 0, finished: false, startedAt: Date.now() };
    const rng = window.VisualRNG.seeded(seed);
    const shuffled = pool.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = rng.int(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    for (let i = 0; i < EXAM_SIZE; i += 1) {
      const generator = shuffled[i % shuffled.length];
      exam.questions.push({ generator, question: makeQuestion(generator, (rng() * 0xffffffff) >>> 0) });
    }
    $("#visual-exam-review").hidden = true;
    $("#visual-exam-panel").hidden = false;
    $("#visual-support").hidden = true;
    $("#visual-wolfram").hidden = true;
    $("#visual-exam-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    renderExamQuestion();
    clearInterval(examTimer);
    examTimer = setInterval(() => {
      $("#visual-exam-time").textContent = formatTime(Date.now() - exam.startedAt);
    }, 1000);
  }

  function renderExamQuestion() {
    if (!exam || exam.finished) return;
    const active = exam.questions[exam.index];
    currentGenerator = active.generator;
    current = active.question;
    attempts = 0; answered = false;
    renderQuestionPrompt(current);
    $("#visual-diagram").innerHTML = current.diagram;
    $("#visual-seed").textContent = `${current.generatorId} · ${current.seed}`;
    $("#visual-explanation").hidden = true;
    $("#visual-hint-text").hidden = true;
    $("#visual-feedback").textContent = "";
    $("#visual-support").hidden = true;
    $("#visual-answer-area").innerHTML = current.type === "mc" ?
      `<fieldset><legend>Choose one answer</legend>${current.options.map(option => `<label class="visual-option"><input type="radio" name="visual-answer" value="${escapeHtml(option.value)}" aria-label="Option ${option.label}"><b>${option.label}.</b> ${option.svg || escapeHtml(option.content)}</label>`).join("")}</fieldset>` :
      current.type === "click" ? clickAnswerMarkup(current.clickTarget) :
      `<label class="visual-answer-label" for="visual-answer">Your answer</label><input id="visual-answer" type="text" autocomplete="off"${current.answerPlaceholder ? ` placeholder="${escapeHtml(current.answerPlaceholder)}"` : ""}>`;
    renderClickHandler();
    if (exam.answers[exam.index] != null) {
      if (current.type === "mc") {
        const choice = Array.from(document.querySelectorAll('input[name="visual-answer"]')).find(input => input.value === exam.answers[exam.index]);
        if (choice) choice.checked = true;
      } else if (current.type === "typed") {
        $("#visual-answer").value = exam.answers[exam.index] || "";
      } else {
        $("#visual-click-answer").textContent = exam.answers[exam.index] || "No selection yet.";
        $("#visual-click-answer").dataset.value = exam.answers[exam.index] || "";
        if (current.clickTarget.type !== "shade") $("#visual-click-keyboard").value = exam.answers[exam.index] || "";
        else {
          exam.answers[exam.index].split(",").filter(Boolean).forEach(part => {
            const cell = $("#visual-diagram").querySelector(`[data-shade-part="${part}"]`);
            if (cell) {
              cell.classList.add("v-selected");
              cell.setAttribute("aria-pressed", "true");
            }
          });
        }
      }
    }
    $("#visual-submit").disabled = false;
    $("#visual-explain").disabled = true;
    $("#visual-next").disabled = true;
    $("#visual-question-count").textContent = `Question ${exam.index + 1} of ${EXAM_SIZE}`;
    $("#visual-progress").value = exam.index + 1;
    $("#visual-hint").disabled = true;
  }

  function moveExam(step) {
    if (!exam || exam.finished) return;
    exam.answers[exam.index] = userAnswer();
    exam.index = Math.max(0, Math.min(EXAM_SIZE - 1, exam.index + step));
    renderExamQuestion();
  }

  function finishExam() {
    if (!exam || exam.finished) return;
    exam.answers[exam.index] = userAnswer();
    if (exam.answers.some(value => value == null || value === "") && !window.confirm("Some answers are empty. Finish the test anyway?")) return;
    exam.finished = true;
    clearInterval(examTimer);
    exam.results = exam.questions.map((entry, index) => isAnswerCorrect(entry.question, exam.answers[index] || ""));
    const score = exam.results.filter(Boolean).length;
    $("#visual-exam-score").textContent = `Score: ${score}/${EXAM_SIZE} (${Math.round(score / EXAM_SIZE * 100)}%).`;
    $("#visual-exam-review-list").innerHTML = exam.questions.map((entry, index) => exam.results[index] ? "" :
      `<article class="visual-review-card"><h3>Question ${index + 1}: ${escapeHtml(entry.question.prompt)}</h3><p>Your answer: ${escapeHtml(exam.answers[index] || "No answer")}</p><p>Correct answer: ${escapeHtml(formatReviewAnswer(entry.question))}</p><ol>${entry.question.explainSteps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol>${entry.question.solutionDiagram}</article>`).join("") ||
      "<p>All answers are correct.</p>";
    $("#visual-exam-review").hidden = false;
    $("#visual-exam-review-list").querySelectorAll(".visual-review-card").forEach((card,index)=>{
      const entry=exam.questions.filter((_,questionIndex)=>!exam.results[questionIndex])[index];
      if(!entry)return;
      const support=[...$("#visual-support").querySelectorAll("a")]
        .find(link=>link.textContent.includes("Wolfram Alpha"));
      window.AITutor?.attach(card,{
        question:entry.question.promptForTutor || entry.question.prompt,
        studentAnswer:String(exam.answers[exam.questions.indexOf(entry)]||""),
        topic:entry.question.skill,
        level:"Visual Lab",
        wolframLink:support&&support.href
      });
    });
    $("#visual-support").hidden = false;
    $("#visual-wolfram").hidden = false;
    $("#visual-submit").disabled = true;
    $("#visual-hint").disabled = true;
    $("#visual-explain").disabled = true;
    $("#visual-next").disabled = true;
  }

  function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function renderFilters() {
    $("#visual-skill").innerHTML = `<option value="All">All skills</option>${generators.map(item =>
      `<option value="${escapeHtml(item.id)}">${escapeHtml(item.skill)}</option>`).join("")}`;
  }

  async function loadGenerators() {
    for (const file of window.VISUAL_GENERATOR_FILES) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        const path = `js/visual/generators/${file}`;
        script.src = window.MATH_MASTER_ASSETS?.[path] || path;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Could not load visual generator ${file}.`));
        document.head.appendChild(script);
      });
    }
    generators = window.VISUAL_GENERATORS || [];
    if (generators.length !== window.VISUAL_GENERATOR_FILES.length) throw new Error("Not every visual generator was registered.");
    renderFilters();
    renderStats();
    const requestedId = new URLSearchParams(window.location ? window.location.search : "").get("generator");
    if (requestedId) {
      const requestedGenerator = generators.find(item => item.id === requestedId);
      if (!requestedGenerator) throw new Error(`Unknown visual generator: ${requestedId}`);
      $("#visual-skill").value = requestedId;
      nextQuestion(undefined, requestedGenerator);
    } else {
      nextQuestion();
    }
    $("#visual-theme").checked = Boolean(state.light);
    document.body.classList.toggle("visual-light", Boolean(state.light));
    window.VISUAL_READY = true;
  }

  function bind() {
    $("#visual-area").addEventListener("change", () => nextQuestion());
    $("#visual-tier").addEventListener("change", () => nextQuestion());
    $("#visual-skill").addEventListener("change", () => nextQuestion());
    $("#visual-submit").addEventListener("click", submitAnswer);
    $("#visual-hint").addEventListener("click", () => {
      if (!exam) {
        $("#visual-hint-text").textContent = "Hint: " + (current.hint || current.explainSteps[0] || "Look at the diagram and identify the values you need.");
        $("#visual-hint-text").hidden = false;
      }
    });
    $("#visual-explain").addEventListener("click", showExplanation);
    $("#visual-next").addEventListener("click", () => nextQuestion());
    $("#visual-same").addEventListener("click", () => current && nextQuestion(current.seed, currentGenerator));
    $("#visual-same-type").addEventListener("click", () => currentGenerator && nextQuestion(undefined, currentGenerator));
    $("#visual-report").addEventListener("click", reportQuestion);
    $("#visual-next-exam").addEventListener("click", () => moveExam(1));
    $("#visual-prev-exam").addEventListener("click", () => moveExam(-1));
    $("#visual-finish-exam").addEventListener("click", finishExam);
    $("#visual-start-exam").addEventListener("click", startExam);
    $("#visual-new-practice").addEventListener("click", () => { exam = null; $("#visual-exam-panel").hidden = true; $("#visual-hint").disabled = false; nextQuestion(); });
    $("#visual-practise-mistakes").addEventListener("click", () => { practiceMistakes = true; nextQuestion(); });
    $("#visual-theme").addEventListener("change", event => {
      document.body.classList.toggle("visual-light", event.target.checked);
      state.light = event.target.checked;
      save();
    });
    $("#visual-mistakes").addEventListener("click", event => {
      const button = event.target.closest("[data-replay-id]");
      if (!button) return;
      practiceMistakes = false;
      const generator = generators.find(item => item.id === button.dataset.replayId);
      if (!generator) return;
      $("#visual-area").value = "All";
      $("#visual-tier").value = "All";
      $("#visual-skill").value = "All";
      nextQuestion(Number(button.dataset.replaySeed), generator);
    });
    document.querySelector("main").addEventListener("keydown", event => {
      if (event.key === "Enter" && event.target.matches("#visual-answer")) {
        event.preventDefault();
        submitAnswer();
      }
    });
  }

  bind();
  loadGenerators().catch(error => {
    $("#visual-status").textContent = error.message;
    console.error("Visual Lab could not load.", error);
  });
}());
