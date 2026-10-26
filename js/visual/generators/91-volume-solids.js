(window.VISUAL_GENERATORS = window.VISUAL_GENERATORS || []).push({
  id: "volume-solids", title: "Volume of 3D solids", area: "Geometry",
  skill: "Volume of prisms, cylinders, cones and spheres", tier: "FH", level: "Hard",
  make: rng => window.VisualAdvanced.make("volume-solids", rng)
});
