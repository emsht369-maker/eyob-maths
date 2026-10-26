(function() {
  "use strict";

  function toSvgPoint(clientX, clientY, bounds, viewBox, preserveAspectRatio) {
    const [minX, minY, width, height] = viewBox;
    if (![clientX, clientY, bounds.left, bounds.top, bounds.width, bounds.height, minX, minY, width, height].every(Number.isFinite) ||
        bounds.width <= 0 || bounds.height <= 0 || width <= 0 || height <= 0) {
      throw new Error("Cannot map a click to an invalid SVG viewport.");
    }
    const align = (preserveAspectRatio || "xMidYMid meet").trim().split(/\s+/);
    if (align[0] === "none") {
      return [
        minX + (clientX - bounds.left) / bounds.width * width,
        minY + (clientY - bounds.top) / bounds.height * height
      ];
    }
    const mode = align[1] === "slice" ? "slice" : "meet";
    const scale = mode === "slice" ?
      Math.max(bounds.width / width, bounds.height / height) :
      Math.min(bounds.width / width, bounds.height / height);
    const xSpace = bounds.width - width * scale;
    const ySpace = bounds.height - height * scale;
    const xAlign = align[0].startsWith("xMin") ? 0 : align[0].startsWith("xMax") ? 1 : 0.5;
    const yAlign = align[0].endsWith("YMin") ? 0 : align[0].endsWith("YMax") ? 1 : 0.5;
    return [
      minX + (clientX - bounds.left - xSpace * xAlign) / scale,
      minY + (clientY - bounds.top - ySpace * yAlign) / scale
    ];
  }

  function toGridPoint(point, viewBox, range) {
    const [, , viewWidth, viewHeight] = viewBox;
    const x = Math.round(range.minX + point[0] / viewWidth * (range.maxX - range.minX));
    const y = Math.round(range.maxY - point[1] / viewHeight * (range.maxY - range.minY));
    return [
      Math.max(range.minX, Math.min(range.maxX, x)),
      Math.max(range.minY, Math.min(range.maxY, y))
    ];
  }

  function toNumberLineValue(point, denominator, viewBox, startX, endX) {
    const position = Math.max(0, Math.min(1, (point[0] - startX) / (endX - startX)));
    return Math.round(position * denominator) / denominator;
  }

  window.VisualClick = { toSvgPoint, toGridPoint, toNumberLineValue };
}());
