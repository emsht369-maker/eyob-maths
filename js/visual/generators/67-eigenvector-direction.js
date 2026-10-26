(window.VISUAL_GENERATORS = window.VISUAL_GENERATORS || []).push({
  id: "eigenvector-direction", title: "Eigenvector direction", area: "Linear Algebra",
  skill: "Invariant vector directions", tier: "H", level: "Hard",
  make: rng => window.VisualAdvanced.make("eigenvector-direction", rng)
});
