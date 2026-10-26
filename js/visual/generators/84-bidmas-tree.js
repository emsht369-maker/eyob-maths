(window.VISUAL_GENERATORS = window.VISUAL_GENERATORS || []).push({
  id: "bidmas-tree", title: "BIDMAS expression tree", area: "Number",
  skill: "Order of operations", tier: "F", level: "Easy",
  make: rng => window.VisualAdvanced.make("bidmas-tree", rng)
});
