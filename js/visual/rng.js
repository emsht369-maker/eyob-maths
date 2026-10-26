(function() {
  "use strict";

  function seeded(seed) {
    let state = (Number(seed) >>> 0) || 1;
    const random = function() {
      state = (state + 0x6D2B79F5) >>> 0;
      let value = state;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
    random.seed = Number(seed) >>> 0;
    random.int = (min, max) => min + Math.floor(random() * (max - min + 1));
    random.pick = items => items[random.int(0, items.length - 1)];
    random.nice = (min, max, avoidZero) => {
      let value = random.int(min, max);
      if (avoidZero && value === 0) value = value < max ? value + 1 : value - 1;
      return value;
    };
    random.reject = (predicate, attempts) => {
      for (let i = 0; i < (attempts || 30); i += 1) {
        const value = random();
        if (!predicate(value)) return value;
      }
      throw new Error("Could not find an acceptable seeded random value.");
    };
    return random;
  }

  window.VisualRNG = { seeded };
}());
