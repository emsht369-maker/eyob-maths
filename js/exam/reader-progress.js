(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MathMasterExamProgress = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function hasRealAnswer(text, photoCount) {
    return String(text || "").trim().length >= 10 || Number(photoCount) > 0;
  }

  function awardOnce(progress, flag) {
    const flags = progress.awarded || (progress.awarded = {});
    if (flags[flag]) return false;
    flags[flag] = true;
    return true;
  }

  return Object.freeze({ hasRealAnswer, awardOnce });
});
