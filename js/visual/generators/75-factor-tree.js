(window.VISUAL_GENERATORS = window.VISUAL_GENERATORS || []).push({
  id: "factor-tree", title: "Prime factors from a factor tree", area: "Number",
  skill: "Factor trees and prime factors", tier: "FH", level: "Medium",
  make: rng => window.VisualAdvanced.make("factor-tree", rng)
});
