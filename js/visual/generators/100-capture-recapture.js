(window.VISUAL_GENERATORS = window.VISUAL_GENERATORS || []).push({
  id: "capture-recapture", title: "Capture-recapture estimate", area: "Statistics",
  skill: "Estimate a population from two samples", tier: "H", level: "Hard",
  make: rng => window.VisualAdvanced.make("capture-recapture", rng)
});
