(function (root) {
  "use strict";

  const groups = [
    { key: "machine-learning", pattern: /\b(machine learning|ml-dot-product|neural network|gradient descent|sigmoid|classification|feature weights?|dot product|linear algebra|eigenvectors?)\b/, ids: ["dot-product-angle", "vectors-grid", "matrix-vector-grid", "gradient-descent", "sigmoid-graph", "regression", "matrix-transform-square", "eigenvector-direction"] },
    { key: "calculus", pattern: /\b(calculus|derivative|differentiation|integration|tangent|gradient descent|contour|riemann|optimisation|optimization)\b/, ids: ["tangent-slope", "riemann-trapezoid", "derivative-turning", "function-minimum", "partial-contour-slope", "contour-gradient"] },
    { key: "statistics", pattern: /\b(statistic|average|mean|median|mode|range|quartile|box plot|histogram|frequency|scatter|correlation|regression|sampling|capture.recapture|two.way table|pictogram|normal distribution)\b/, ids: ["bar-chart-reading", "box-plot", "scatter-graph", "histogram", "cumulative-frequency", "stem-leaf", "frequency-polygon", "regression", "normal-distribution", "two-way-tables", "capture-recapture"] },
    { key: "probability", pattern: /\b(probability|chance|sample space|tree diagram|venn|conditional|outcome|combinatorics|routes|lattice path)\b/, ids: ["probability-tree", "venn-diagram", "sample-space", "combinatorics-routes", "logic-venn-truth", "two-way-tables"] },
    { key: "matrix", pattern: /\b(matrix|matrices|determinant|eigenvector|eigenvalue)\b/, ids: ["matrix-transform-square", "determinant-area", "eigenvector-direction", "matrix-vector-grid"] },
    { key: "complex", pattern: /\b(complex number|argand|imaginary|conjugate|modulus)\b/, ids: ["complex-argand", "vectors-grid", "polar-coordinates"] },
    { key: "vectors", pattern: /\b(vector|dot product|scalar product)\b/, ids: ["vectors-grid", "dot-product-angle", "matrix-vector-grid", "eigenvector-direction"] },
    { key: "sequences", pattern: /\b(sequence|series|nth term|arithmetic progression|geometric progression|iteration|newton)\b/, ids: ["sequence-term-graph", "series-bars", "iteration-staircase", "newton-method"] },
    { key: "logic", pattern: /\b(logic|proof|set theory|sets|and.or.not|truth table|venn)\b/, ids: ["logic-venn-truth", "venn-diagram", "probability-tree"] },
    { key: "number-theory", pattern: /\b(number theory|prime|factor tree|factorisation|factorization|modular|divisib|hcf|gcf|lcm)\b/, ids: ["prime-sieve", "factor-tree", "modular-clock", "place-value-rounding"] },
    { key: "fractions", pattern: /\b(fraction|decimal|percentage|percent|ratio|proportion|recipe|best buy|sharing)\b/, ids: ["shade-fraction", "equivalent-fractions", "fraction-number-line", "fraction-add-subtract", "percentages", "ratio-tape"] },
    { key: "trigonometry", pattern: /\b(trigonometry|trig|sine rule|cosine rule|bearing|soh|cah|toa)\b/, ids: ["right-trigonometry", "pythagoras", "bearings", "sine-cosine", "sine-cosine-rules", "sine-area", "3d-pythagoras"] },
    { key: "geometry", pattern: /\b(geometry|shape|angle|triangle|circle|sector|arc|area|perimeter|volume|surface|solid|net|loci|construction|symmetry|congruence|similar|transformation|elevation|plan|pythagoras|density|pressure|compound measure)\b/, ids: ["geometric-transformations", "circle-theorems", "area-sector", "similar-shapes", "pythagoras", "right-trigonometry", "loci-bisectors", "nets-solids", "volume-solids", "plans-elevations", "symmetry", "congruence-similarity", "bearings", "sine-cosine-rules", "sine-area", "3d-pythagoras", "compound-measures"] },
    { key: "real-graphs", pattern: /\b(distance.time|speed.time|conversion|currency|real.life|travel|rate|density|pressure|compound measure)\b/, ids: ["distance-time", "speed-time", "conversion-graph", "scatter-graph"] },
    { key: "functions", pattern: /\b(graph|coordinate|quadratic|cubic|function|equation|gradient|slope|intercept|simultaneous|polynomial|exponential|logarithm|sine|cosine|transformation)\b/, ids: ["coordinates-read", "plot-line-click", "slope-graph", "quadratic-graph", "function-graphs", "simultaneous-graphs", "graph-transformations", "polynomial-roots", "log-exp-graph", "sine-cosine"] },
    { key: "algebra", pattern: /\b(algebra|equation|expression|inequalit|expand|factoris|factoriz|bidmas|bodmas|indices|index|iteration|rounding|place value|standard form|surds)\b/, ids: ["bidmas-tree", "algebra-tiles", "completing-square", "inequality-region", "line-equation", "simultaneous-graphs", "place-value-rounding", "negative-thermometer", "iteration-staircase"] },
    { key: "number", pattern: /\b(number|arithmetic|integer|round|place value|negative|prime|factor|standard form|surds|index|indices|fraction|decimal)\b/, ids: ["place-value-rounding", "negative-thermometer", "factor-tree", "prime-sieve", "modular-clock", "percentages", "fraction-number-line", "shade-fraction"] }
  ];

  const fallback = {
    Number: ["place-value-rounding", "negative-thermometer", "factor-tree", "prime-sieve"],
    Algebra: ["bidmas-tree", "algebra-tiles", "completing-square", "inequality-region"],
    Ratio: ["ratio-tape", "percentages", "similar-shapes", "conversion-graph"],
    Geometry: ["geometric-transformations", "pythagoras", "circle-theorems", "area-sector", "volume-solids"],
    Probability: ["probability-tree", "sample-space", "venn-diagram", "logic-venn-truth"],
    Statistics: ["bar-chart-reading", "box-plot", "scatter-graph", "histogram", "frequency-polygon"],
    default: ["coordinates-read", "plot-line-click", "function-graphs"]
  };
  const mlRoomVisuals = {
    "ml-dot-product": ["dot-product-angle", "vectors-grid", "matrix-vector-grid", "gradient-descent", "sigmoid-graph", "regression", "matrix-transform-square", "eigenvector-direction"],
    "ml-matrix-vectors": ["matrix-vector-grid", "matrix-transform-square", "determinant-area", "eigenvector-direction"],
    "ml-linear-regression": ["regression", "scatter-graph", "function-graphs"],
    "ml-gradient-descent": ["gradient-descent", "function-minimum", "tangent-slope", "contour-gradient", "partial-contour-slope"]
  };

  const escapeHtml = value => String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const titleFor = id => id.replace(/-/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());

  function idsFor(record) {
    const text = [record.title, record.area, record.description, record.topics, record.idea]
      .filter(Boolean).join(" ").replace(/&amp;/g, "&").toLowerCase();
    if (/^(algebraic proof|proof|proofs|definition|definitions|exam command words?)$/i.test(String(record.title || "").trim())) return [];
    const machineLearning = String(record.path || "").toLowerCase() === "ml" || /^ml-/.test(String(record.id || ""));
    if (machineLearning && mlRoomVisuals[record.id]) return mlRoomVisuals[record.id].slice();
    const group = (machineLearning ? groups.filter(item => item.key === "machine-learning") : groups.filter(item => item.key !== "machine-learning"))
      .find(item => item.pattern.test(text));
    const ids = group ? group.ids : (fallback[record.area] || fallback.default);
    return [...new Set(ids)].slice(0, machineLearning ? 8 : Math.max(3, Math.min(4, ids.length)));
  }

  function render(record) {
    const items = idsFor(record);
    if (!items.length) return "";
    const title = escapeHtml(record.title || "this topic");
    const machineLearning = String(record.path || "").toLowerCase() === "ml" || /^ml-/.test(String(record.id || ""));
    return `<section class="visual-map-card" aria-label="Visual practice for ${title}"><h3>Visual practice for ${title}</h3><p>${machineLearning ? "Choose a diagram to explore vectors, model scores, learning steps and probabilities:" : "Open an original diagram question:"}</p><ul>${items.slice(0, machineLearning ? 8 : 3).map(id =>
      `<li><a href="/visual.html?generator=${encodeURIComponent(id)}">${escapeHtml(titleFor(id))} ↗</a></li>`
    ).join("")}</ul></section>`;
  }

  root.VisualMap = { idsFor, render };
  if (typeof module !== "undefined" && module.exports) module.exports = root.VisualMap;
})(typeof window !== "undefined" ? window : globalThis);
