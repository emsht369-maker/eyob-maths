(window.VISUAL_GENERATORS = window.VISUAL_GENERATORS || []).push({
  id: "complex-argand", title: "Complex numbers on an Argand diagram", area: "Number",
  skill: "Complex number operations and modulus", tier: "H", level: "Hard",
  make: rng => window.VisualAdvanced.make("complex-argand", rng)
});
