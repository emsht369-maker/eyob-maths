(window.VISUAL_GENERATORS = window.VISUAL_GENERATORS || []).push({
  id: "modular-clock", title: "Modular arithmetic on a clock", area: "Number",
  skill: "Add and subtract modulo 12", tier: "FH", level: "Medium",
  make: rng => window.VisualAdvanced.make("modular-clock", rng)
});
