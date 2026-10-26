(window.VISUAL_GENERATORS = window.VISUAL_GENERATORS || []).push({
  id: "matrix-vector-grid", title: "Matrix-vector multiplication", area: "Linear Algebra",
  skill: "Multiply a matrix by a vector", tier: "H", level: "Hard",
  make: rng => window.VisualAdvanced.make("matrix-vector-grid", rng)
});
