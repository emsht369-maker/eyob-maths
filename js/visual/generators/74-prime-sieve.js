(window.VISUAL_GENERATORS = window.VISUAL_GENERATORS || []).push({
  id: "prime-sieve", title: "Prime sieve on a grid", area: "Number",
  skill: "Identify primes with a sieve", tier: "FH", level: "Medium",
  make: rng => window.VisualAdvanced.make("prime-sieve", rng)
});
