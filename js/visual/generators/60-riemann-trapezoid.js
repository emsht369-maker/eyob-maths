(window.VISUAL_GENERATORS = window.VISUAL_GENERATORS || []).push({
  id: "riemann-trapezoid", title: "Area under a curve", area: "Calculus",
  skill: "Riemann sums and the trapezium rule", tier: "H", level: "Hard",
  make: rng => window.VisualAdvanced.make("riemann-trapezoid", rng)
});
