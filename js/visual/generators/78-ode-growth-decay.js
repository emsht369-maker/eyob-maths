(window.VISUAL_GENERATORS = window.VISUAL_GENERATORS || []).push({
  id: "ode-growth-decay", title: "Exponential growth and decay", area: "Calculus",
  skill: "Solutions of dy/dt = ky", tier: "H", level: "Hard",
  make: rng => window.VisualAdvanced.make("ode-growth-decay", rng)
});
