(function() {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const esc = value => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;"
  })[char]);
  const attrs = values => Object.entries(values || {}).map(([key, value]) =>
    `${key}="${esc(value)}"`
  ).join(" ");
  const element = (name, values, content) =>
    `<${name}${Object.keys(values || {}).length ? " " + attrs(values) : ""}>${content || ""}</${name}>`;

  function polishLabels(content) {
    const labels = [];
    const lines = [...content.matchAll(/<line\b([^>]*)\/>/g)].map(match => {
      const a = match[1];
      return { x1: Number((a.match(/\bx1="([^"]+)/) || [])[1]), y1: Number((a.match(/\by1="([^"]+)/) || [])[1]),
        x2: Number((a.match(/\bx2="([^"]+)/) || [])[1]), y2: Number((a.match(/\by2="([^"]+)/) || [])[1]),
        className: (a.match(/\bclass="([^"]+)/) || [])[1] || "" };
    }).filter(line => [line.x1, line.y1, line.x2, line.y2].every(Number.isFinite));
    const polygons = [...content.matchAll(/<polygon\b([^>]*)\/>/g)].map(match => {
      const attrsText = match[1];
      const raw = (attrsText.match(/\bpoints="([^"]+)/) || [])[1] || "";
      return { className: (attrsText.match(/\bclass="([^"]+)/) || [])[1] || "",
        points: raw.trim().split(/\s+/).map(pair => pair.split(",").map(Number)).filter(pair => pair.length === 2 && pair.every(Number.isFinite)) };
    }).filter(poly => poly.points.length >= 3);
    const circles = [...content.matchAll(/<circle\b([^>]*)\/>/g)].map(match => {
      const a = match[1];
      return { x: Number((a.match(/\bcx="([^"]+)/) || [])[1]), y: Number((a.match(/\bcy="([^"]+)/) || [])[1]),
        r: Number((a.match(/\br="([^"]+)/) || [])[1]), className: (a.match(/\bclass="([^"]+)/) || [])[1] || "" };
    }).filter(circle => [circle.x, circle.y, circle.r].every(Number.isFinite));
    const intersectsBox = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    const boxFor = (x, y, value, size, anchor) => {
      const decoded = value.replace(/&(?:amp|lt|gt|quot|apos);/g, entity => ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'" }[entity]));
      // Leave generous room for browser font metrics (especially primes and
      // coordinate labels); SVG text boxes are wider than their glyph ink.
      const width = Math.max(size, [...decoded].length * size * 0.96);
      const left = anchor === "start" ? x : anchor === "end" ? x - width : x - width / 2;
      return { left, right: left + width, top: y - size * 1.15, bottom: y + size * 0.4 };
    };
    const pointInPolygon = (x, y, points) => {
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i], [xj, yj] = points[j];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    };
    const orient = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const onSegment = (a, b, point) => point[0] >= Math.min(a[0], b[0]) - 1e-8 && point[0] <= Math.max(a[0], b[0]) + 1e-8 &&
      point[1] >= Math.min(a[1], b[1]) - 1e-8 && point[1] <= Math.max(a[1], b[1]) + 1e-8;
    const segmentsCross = (a, b, c, d) => {
      const abC = orient(a, b, c), abD = orient(a, b, d), cdA = orient(c, d, a), cdB = orient(c, d, b);
      if (abC * abD < 0 && cdA * cdB < 0) return true;
      return Math.abs(abC) < 1e-8 && onSegment(a, b, c) || Math.abs(abD) < 1e-8 && onSegment(a, b, d) ||
        Math.abs(cdA) < 1e-8 && onSegment(c, d, a) || Math.abs(cdB) < 1e-8 && onSegment(c, d, b);
    };
    const boxHitsPoly = (box, points) => {
      const corners = [[box.left, box.top], [box.right, box.top], [box.right, box.bottom], [box.left, box.bottom]];
      if (corners.some(point => pointInPolygon(point[0], point[1], points)) || points.some(([x, y]) =>
        x >= box.left && x <= box.right && y >= box.top && y <= box.bottom)) return true;
      return points.some((point, index) => {
        const next = points[(index + 1) % points.length];
        return corners.some((corner, edge) => segmentsCross(point, next, corner, corners[(edge + 1) % corners.length]));
      });
    };
    const boxHitsLine = (box, line) => {
      const a = [line.x1, line.y1], b = [line.x2, line.y2];
      if (a[0] >= box.left && a[0] <= box.right && a[1] >= box.top && a[1] <= box.bottom) return true;
      if (b[0] >= box.left && b[0] <= box.right && b[1] >= box.top && b[1] <= box.bottom) return true;
      const edges = [ [[box.left, box.top], [box.right, box.top]], [[box.right, box.top], [box.right, box.bottom]],
        [[box.right, box.bottom], [box.left, box.bottom]], [[box.left, box.bottom], [box.left, box.top]] ];
      return edges.some(edge => segmentsCross(a, b, edge[0], edge[1]));
    };
    const blocked = box => labels.some(other => intersectsBox(box, other.box)) ||
      lines.some(line => /\bv-axis\b|\bv-line\b/.test(line.className) && boxHitsLine(box, line)) ||
      polygons.some(poly => /\bv-outline\b|\bv-region\b|\bv-empty\b/.test(poly.className) && boxHitsPoly(box, poly.points)) ||
      circles.some(circle => /\bv-point\b/.test(circle.className) && intersectsBox(box,
        { left: circle.x - circle.r, right: circle.x + circle.r, top: circle.y - circle.r, bottom: circle.y + circle.r }));

    return content.replace(/<text\b([^>]*)>([\s\S]*?)<\/text>/g, (whole, rawAttrs, value) => {
      if (!/\bclass="[^"]*\bv-label\b/.test(rawAttrs)) return whole;
      const x = Number((rawAttrs.match(/\bx="([^"]+)/) || [])[1]);
      const y = Number((rawAttrs.match(/\by="([^"]+)/) || [])[1]);
      const size = Number((rawAttrs.match(/\bfont-size="([^"]+)/) || [])[1]) || 15;
      const anchor = (rawAttrs.match(/\btext-anchor="([^"]+)/) || [])[1] || "middle";
      if (![x, y, size].every(Number.isFinite)) return whole;
      const cls = (rawAttrs.match(/\bclass="([^"]+)/) || [])[1] || "";
      const offsets = [];
      if (/\bv-x-tick-label\b/.test(cls)) {
        for (let step = 1; step <= 8; step += 1) offsets.push([step * size * 0.9, 0], [-step * size * 0.9, 0]);
      } else if (/\bv-y-tick-label\b/.test(cls)) {
        for (let step = 1; step <= 8; step += 1) offsets.push([0, step * size * 1.1], [0, -step * size * 1.1]);
      } else {
        for (let ring = 1; ring <= 18; ring += 1) for (const [dx, dy] of [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]])
          offsets.push([dx * size * 1.1 * ring, dy * size * 1.1 * ring]);
      }
      const candidates = [[0, 0], ...offsets];
      for (const [dx, dy] of candidates) {
        const nextX = x + dx, nextY = y + dy, box = boxFor(nextX, nextY, value, size, anchor);
        if (box.left < 2 || box.right > 398 || box.top < 2 || box.bottom > 258 || blocked(box)) continue;
        labels.push({ box });
        return whole.replace(rawAttrs, rawAttrs.replace(/\bx="[^"]+"/, `x="${nextX}"`).replace(/\by="[^"]+"/, `y="${nextY}"`));
      }
      return "";
    });
  }

  function wrap(content, label, description, viewBox) {
    return `<svg xmlns="${NS}" viewBox="${viewBox || "0 0 400 260"}" role="img" aria-label="${esc(label)}" focusable="false"><defs><marker id="v-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="currentColor"/></marker></defs>${polishLabels(content)}<desc>${esc(description)}</desc></svg>`;
  }

  function text(x, y, value, size, options) {
    const settings = options || {};
    const requested = size || 15;
    const mobileMinimum = settings.className && typeof window.innerWidth === "number" && window.innerWidth <= 480 ? 15 : requested;
    return element("text", { x, y, "font-size": Math.max(requested, mobileMinimum), "text-anchor": settings.anchor || "middle",
      class: settings.className || "" }, esc(value));
  }

  function point(x, y, label, options) {
    const settings = options || {};
    const dot = `<circle cx="${x}" cy="${y}" r="${settings.radius || 5}" class="${settings.className || "v-point"}"/>`;
    return dot + (label ? text(x + (settings.dx || 12), y + (settings.dy || -10), label, 13,
      { className: "v-label v-point-label" }) : "");
  }

  function segment(x1, y1, x2, y2, dashed, className) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${className || "v-line"}"${dashed ? " stroke-dasharray=\"7 5\"" : ""}/>`;
  }

  function arrow(x1, y1, x2, y2, label) {
    const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy) || 1;
    const labelX = (x1 + x2) / 2 + (dy / length) * 22;
    const labelY = (y1 + y2) / 2 - (dx / length) * 22;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="v-line" marker-end="url(#v-arrow)"/>` +
      (label ? text(labelX, labelY, label, 13, { className: "v-label v-vector-label" }) : "");
  }

  function line(x1, y1, x2, y2, dashed, label) {
    return segment(x1, y1, x2, y2, dashed) + (label ? text((x1 + x2) / 2, (y1 + y2) / 2 - 10, label, 13,
      { className: "v-label v-line-label" }) : "");
  }

  function plane(options) {
    const o = Object.assign({ minX: -5, maxX: 5, minY: -4, maxY: 4, step: 1, axes: true, labels: true }, options || {});
    const x0 = 200 - (200 * o.minX / (o.maxX - o.minX));
    const y0 = 130 + (130 * o.minY / (o.maxY - o.minY));
    let out = "";
    for (let x = o.minX; x <= o.maxX; x += o.step) {
      const px = 400 * (x - o.minX) / (o.maxX - o.minX);
      out += `<line x1="${px}" y1="12" x2="${px}" y2="248" class="v-grid"/>`;
      if (o.labels && x % (o.labelStep || o.step) === 0) out += text(px, Math.min(250, y0 + 18), x, 10);
    }
    for (let y = o.minY; y <= o.maxY; y += o.step) {
      const py = 260 * (o.maxY - y) / (o.maxY - o.minY);
      out += `<line x1="8" y1="${py}" x2="392" y2="${py}" class="v-grid"/>`;
      if (o.labels && y % (o.labelStep || o.step) === 0) out += text(Math.max(13, x0 - 13), Math.min(255, py + 4), y, 10);
    }
    if (o.axes) {
      out += segment(8, y0, 392, y0, false, "v-axis") + segment(x0, 12, x0, 248, false, "v-axis");
      out += arrow(366, y0, 391, y0, "x") + arrow(x0, 38, x0, 12, "y");
    }
    return out;
  }

  function mapPoint(x, y, range) {
    const r = Object.assign({ minX: -5, maxX: 5, minY: -4, maxY: 4 }, range || {});
    return [400 * (x - r.minX) / (r.maxX - r.minX), 260 * (r.maxY - y) / (r.maxY - r.minY)];
  }

  function fittedPlane(points, padding, options) {
    options = options || {};
    const values = points && points.length ? points : [[0, 0]];
    const pad = padding == null ? 0.75 : padding;
    const minX = Math.min(0, ...values.map(point => point[0])) - pad;
    const maxX = Math.max(0, ...values.map(point => point[0])) + pad;
    const minY = Math.min(0, ...values.map(point => point[1])) - pad;
    const maxY = Math.max(0, ...values.map(point => point[1])) + pad;
    const left = 44, right = 372, top = 18, bottom = 230;
    const scale = Math.min((right - left) / (maxX - minX), (bottom - top) / (maxY - minY));
    const ox = (left + right - (minX + maxX) * scale) / 2;
    const oy = (top + bottom + (minY + maxY) * scale) / 2;
    const toScreen = (x, y) => [ox + x * scale, oy - y * scale];
    const mobile = typeof window.innerWidth === "number" && window.innerWidth <= 480;
    const tickSize = mobile ? 15 : 10;
    // A two-unit cadence keeps the coordinate grid readable beside labels on
    // dense or highly sheared images, including desktop diagrams.
    const tickStep = 2;
    const gridMinX = Math.floor(minX), gridMaxX = Math.ceil(maxX);
    const gridMinY = Math.floor(minY), gridMaxY = Math.ceil(maxY);
    let grid = "";
    for (let x = gridMinX; x <= gridMaxX; x += 1) {
      const px = toScreen(x, 0)[0];
      if (px < left || px > right) continue;
      grid += `<line x1="${px}" y1="${top}" x2="${px}" y2="${bottom}" class="v-grid"/>`;
      if (x !== 0 && x % tickStep === 0) grid += text(px, Math.min(250, oy + tickSize + 4), x, tickSize,
        { className: "v-label v-tick-label v-x-tick-label" });
    }
    for (let y = gridMinY; y <= gridMaxY; y += 1) {
      const py = toScreen(0, y)[1];
      if (py < top || py > bottom) continue;
      grid += `<line x1="${left}" y1="${py}" x2="${right}" y2="${py}" class="v-grid"/>`;
      if (y !== 0 && y % tickStep === 0) grid += text(Math.max(13, ox - tickSize * 1.4), py + tickSize * 0.35, y, tickSize,
        { className: "v-label v-tick-label v-y-tick-label" });
    }
    if (oy >= top && oy <= bottom) grid += segment(left, oy, right, oy, false, "v-axis");
    if (ox >= left && ox <= right) grid += segment(ox, top, ox, bottom, false, "v-axis");
    if (options.originLabel !== false && ox >= left && ox <= right && oy >= top && oy <= bottom)
      grid += text(Math.min(390, ox + 15), Math.max(12, oy - 9), "O", mobile ? 15 : 12,
        { className: "v-label v-origin-label" });
    grid += text(right + 12, Math.min(248, oy + 4), "x", mobile ? 15 : 11, { className: "v-label v-axis-label" }) +
      text(Math.max(10, ox + 9), top + 7, "y", mobile ? 15 : 11, { className: "v-label v-axis-label" });
    const labelAt = (point, value, center, size, className) => {
      const dx = point[0] - center[0], dy = point[1] - center[1], length = Math.hypot(dx, dy) || 1;
      const offset = Math.max(size || 13, (size || 13) * 0.9);
      return text(point[0] + dx / length * offset, point[1] + dy / length * offset, value, size || 13,
        { className: `v-label ${className || "v-corner-label"}` });
    };
    return { scale, ox, oy, toScreen, grid, labelAt, bounds: { left, right, top, bottom }, range: { minX, maxX, minY, maxY } };
  }

  function polygon(points, className, labels) {
    const pts = points.map(p => p.join(",")).join(" ");
    let out = `<polygon points="${pts}" class="${className || "v-region"}"/>`;
    (labels || []).forEach(item => { out += text(item.x, item.y, item.text, 13); });
    return out;
  }

  function shadedHalfPlane(points, dashed) {
    return polygon(points, "v-shade") + (dashed ? "" : `<polyline points="${points.map(p => p.join(",")).join(" ")}" class="v-line"/>`);
  }

  function arc(cx, cy, radius, startDegrees, endDegrees, label) {
    const toPoint = degrees => {
      const angle = degrees * Math.PI / 180;
      return [cx + radius * Math.cos(angle), cy - radius * Math.sin(angle)];
    };
    const a = toPoint(startDegrees);
    const b = toPoint(endDegrees);
    const large = Math.abs(endDegrees - startDegrees) > 180 ? 1 : 0;
    return `<path d="M ${a[0]} ${a[1]} A ${radius} ${radius} 0 ${large} 0 ${b[0]} ${b[1]}" class="v-angle"/>` +
      (label ? text(cx + (radius + 16) * Math.cos((startDegrees + endDegrees) * Math.PI / 360), cy - (radius + 16) * Math.sin((startDegrees + endDegrees) * Math.PI / 360), label, 13,
        { className: "v-label v-angle-label" }) : "");
  }

  function bar(parts, shaded, label) {
    const left = 30, top = 104, width = 340, height = 52, partWidth = width / parts;
    let out = "";
    for (let i = 0; i < parts; i += 1) {
      out += `<rect x="${left + i * partWidth}" y="${top}" width="${partWidth}" height="${height}" class="${i < shaded ? "v-fill" : "v-empty"}"/>`;
    }
    return wrap(text(200, 72, label || `${shaded} of ${parts} equal parts`, 17) + out, "A fraction bar model", `${parts} equal sections, with ${shaded} shaded.`);
  }

  function circle(cx, cy, radius, label, shadedParts, parts) {
    const count = parts || 1;
    let out = `<circle cx="${cx}" cy="${cy}" r="${radius}" class="v-empty"/>`;
    if (shadedParts) {
      const angle = 2 * Math.PI * shadedParts / count;
      const x = cx + radius * Math.sin(angle);
      const y = cy - radius * Math.cos(angle);
      const large = shadedParts / count > 0.5 ? 1 : 0;
      out += `<path d="M ${cx} ${cy} L ${cx} ${cy - radius} A ${radius} ${radius} 0 ${large} 1 ${x} ${y} Z" class="v-fill"/>`;
    }
    for (let i = 1; i < count; i += 1) {
      const a = 2 * Math.PI * i / count;
      out += segment(cx, cy, cx + radius * Math.sin(a), cy - radius * Math.cos(a), false, "v-grid");
    }
    return wrap(text(cx, cy + radius + 28, label, 16) + out, "A circle fraction model", label);
  }

  function numberLine(min, max, step, marks) {
    let out = arrow(24, 128, 376, 128, "");
    for (let value = min; value <= max; value += step) {
      const x = 24 + 352 * (value - min) / (max - min);
      const label = Number(value.toFixed(3)).toString();
      out += segment(x, 119, x, 137, false, "v-axis") + text(x, 158, label, 12);
    }
    (marks || []).forEach(mark => {
      const x = 24 + 352 * (mark.value - min) / (max - min);
      out += `<circle cx="${x}" cy="128" r="7" class="${mark.closed ? "v-point" : "v-empty-point"}"/>`;
      if (mark.direction) out += arrow(x, 128, mark.direction === "right" ? 374 : 26, 128, "");
      if (mark.label) out += text(x, 98, mark.label, 14);
    });
    return wrap(out, "A labelled number line", "The number line shows equal steps and marked values.");
  }

  function bracket(x1, x2, y, label) {
    return `<path d="M ${x1} ${y - 6} V ${y} H ${x2} V ${y - 6}" class="v-line"/>` + text((x1 + x2) / 2, y + 18, label, 13);
  }

  function rightAngle(x, y, size) {
    const s = size || 14;
    return `<path d="M ${x} ${y - s} L ${x + s} ${y - s} L ${x + s} ${y}" class="v-angle"/>`;
  }

  function polarGrid(radius, pointValue, label) {
    let out = `<circle cx="200" cy="130" r="${radius}" class="v-polar"/>`;
    for (let r = radius / 4; r < radius; r += radius / 4) out += `<circle cx="200" cy="130" r="${r}" class="v-polar"/>`;
    for (let degrees = 0; degrees < 360; degrees += 30) {
      const angle = degrees * Math.PI / 180;
      out += segment(200, 130, 200 + radius * Math.cos(angle), 130 - radius * Math.sin(angle), false, "v-polar");
      out += text(200 + (radius + 14) * Math.cos(angle), 130 - (radius + 14) * Math.sin(angle), `${degrees}°`, 9);
    }
    if (pointValue) out += point(pointValue.x, pointValue.y, label || "P");
    return out;
  }

  window.VisualSVG = { wrap, text, point, segment, arrow, line, plane, mapPoint, fittedPlane, polygon, shadedHalfPlane, arc, bar, circle, numberLine, bracket, rightAngle, polarGrid };
}());
