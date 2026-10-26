(window.VISUAL_GENERATORS = window.VISUAL_GENERATORS || []).push({
  id: "determinant-area", title: "Determinant as area scale", area: "Linear Algebra",
  skill: "Area scale factor of a matrix", tier: "H", level: "Hard",
  make: rng => window.VisualAdvanced.make("determinant-area", rng)
});
