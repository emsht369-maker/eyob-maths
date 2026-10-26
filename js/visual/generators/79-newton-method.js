(window.VISUAL_GENERATORS = window.VISUAL_GENERATORS || []).push({
  id: "newton-method", title: "Newton's method", area: "Calculus",
  skill: "One Newton iteration from a graph", tier: "H", level: "Hard",
  make: rng => window.VisualAdvanced.make("newton-method", rng)
});
