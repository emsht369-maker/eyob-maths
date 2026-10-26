(function() {
  "use strict";

  const S = window.VisualSVG;
  const esc = value => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;"
  })[char]);
  const label = (value, y) => S.text(200, y || 248, value, 13, { className: "v-label v-caption" });
  const graph = (content, aria, desc) => S.wrap(content, aria, desc);
  const make = function(id, rng) {
    const a = rng.int(1, 4), b = rng.int(-5, 5), x = rng.int(-3, 3);
    let answer, prompt, spec, diagram, solutionDiagram, explainSteps, hint, type = "typed", clickTarget = null,
      answerAccept = [], promptMatrix = null, answerPlaceholder = "";

    if (id === "tangent-slope") {
      const y = a * x * x + b, slope = 2 * a * x;
      const px = 200 + x * 24, py = 132 - y * 2;
      diagram = graph(
        S.segment(30, 220, 370, 220, false, "v-axis") +
        S.segment(200, 26, 200, 228, false, "v-axis") +
        S.point(px, py, `(${x}, ${y})`) +
        S.segment(px - 24, py + slope * 2, px + 24, py - slope * 2, true, "v-rise-run") +
        label(`f(x) = ${a}x² ${b < 0 ? "− " + -b : "+ " + b}`, 34),
        "A quadratic curve with a tangent at a marked point",
        "The point where the tangent touches the curve is labelled."
      );
      solutionDiagram = graph(
        S.segment(30, 220, 370, 220, false, "v-axis") +
        S.segment(200, 26, 200, 228, false, "v-axis") +
        S.point(px, py, `(${x}, ${y})`) +
        S.segment(px - 24, py + slope * 2, px + 24, py - slope * 2, false, "v-rise-run") +
        label(`f′(${x}) = 2 × ${a} × ${x} = ${slope}`, 250),
        "The tangent slope annotated using the derivative",
        "The tangent slope is computed from the derivative at the marked x-coordinate."
      );
      answer = String(slope);
      prompt = `For f(x) = ${a}x² ${b < 0 ? "− " + -b : "+ " + b}, find the tangent slope when x = ${x}.`;
      hint = "Differentiate the quadratic, then substitute the marked x-value.";
      explainSteps = [`For ax² + b, the derivative is 2ax.`, `Here a = ${a}, so f′(x) = ${2 * a}x.`, `Substitute x = ${x}: f′(${x}) = ${slope}.`];
      spec = { kind: id, a, b, x, y, slope };
    } else if (id === "riemann-trapezoid") {
      const intervals = rng.int(2, 7), width = rng.int(1, 4), quadratic = rng() < 0.5;
      const offset = Math.abs(b);
      const height = t => a * (quadratic ? t * t : t) + offset;
      const useTrap = rng() < 0.5;
      let sum = 0, parts = "";
      const maxHeight = height(intervals * width), scaleY = 180 / Math.max(1, maxHeight);
      for (let i = 0; i < intervals; i += 1) {
        const left = i * width, right = (i + 1) * width;
        const y1 = height(left), y2 = height(right);
        const x1 = 45 + i * 310 / intervals, x2 = 45 + (i + 1) * 310 / intervals;
        const top1 = 218 - y1 * scaleY, top2 = 218 - y2 * scaleY;
        if (useTrap) {
          sum += width * (y1 + y2) / 2;
          parts += `<polygon points="${x1},218 ${x1},${top1} ${x2},${top2} ${x2},218" class="v-shade"/>`;
        } else {
          sum += width * y1;
          parts += `<rect x="${x1}" y="${top1}" width="${x2 - x1}" height="${218 - top1}" class="v-shade"/>`;
        }
      }
      parts += label(quadratic ? `f(x) = ${a}x² + ${offset}` : `f(x) = ${a}x + ${offset}`, 30);
      diagram = graph(parts + S.segment(40, 218, 370, 218, false, "v-axis"),
        useTrap ? "Trapezium strips under a curve" : "Left rectangle strips under a curve",
        "Equal-width strips approximate the area beneath the drawn function.");
      const shown = Number.isInteger(sum) ? String(sum) : sum.toFixed(1);
      answer = shown;
      prompt = `Approximate the area from x = 0 to x = ${intervals * width} using ${useTrap ? "the trapezium rule" : "left rectangles"} with ${intervals} strips.`;
      hint = useTrap ? "For each strip, average the two end heights and multiply by the width." : "Use each strip's left-hand height times the common width.";
      explainSteps = [`There are ${intervals} strips, each ${width} units wide.`, useTrap ?
        "For each strip use width × (left height + right height) ÷ 2." :
        "For each strip use width × the height at its left edge.",
      `Add the ${intervals} strip areas shown in the diagram.`, `The approximation is ${shown} square units.`];
      spec = { kind: id, a, b: offset, intervals, width, quadratic, method: useTrap ? "trapezium" : "left", total: sum };
      solutionDiagram = graph(parts + label(`Approximate area = ${shown}`, 248),
        "The numerical area approximation annotated",
        "The highlighted strips combine to give the displayed approximation.");
    } else if (id === "derivative-turning" || id === "function-minimum") {
      const h = rng.int(-5, 5), k = rng.int(-8, 8), sign = id === "function-minimum" ? 1 : rng() < 0.5 ? 1 : -1;
      const turning = id === "derivative-turning" ? (sign > 0 ? "minimum" : "maximum") : String(k);
      const px = 200 + h * 20, py = 130 - k * 6;
      const curve = S.segment(px - 60, py - sign * 54, px, py, false, "v-line") +
        S.segment(px, py, px + 60, py - sign * 54, false, "v-line");
      diagram = graph(S.segment(px, 28, px, 232, true, "v-grid") + curve +
        S.point(px, py, `(${h}, ${k})`) + label(`f(x) = ${sign > 0 ? "" : "−"}(x ${h < 0 ? "+ " + -h : "− " + h})² ${k < 0 ? "− " + -k : "+ " + k}`, 30),
        "A parabola with a marked turning point",
        "The dashed line marks the axis of symmetry through the turning point.");
      answer = String(turning);
      prompt = id === "derivative-turning" ?
        "Is the marked stationary point a minimum or a maximum?" :
        `What is the minimum value of f(x) = (x − ${h})² ${k < 0 ? "− " + -k : "+ " + k}?`;
      hint = "Use the sign of the squared term and read the y-coordinate of the vertex.";
      explainSteps = [
        `The vertex is at (${h}, ${k}).`,
        sign > 0 ? "The squared term has a positive coefficient, so the curve opens upwards." :
          "The squared term has a negative coefficient, so the curve opens downwards.",
        id === "derivative-turning" ? `The stationary point is a ${turning}.` : `The lowest y-value is ${k}.`
      ];
      spec = { kind: id, h, k, sign, answer: turning };
      solutionDiagram = graph(S.segment(px, 28, px, 232, true, "v-grid") + curve +
        S.point(px, py, `turning point (${h}, ${k})`) + label(`Answer: ${turning}`, 250),
        "The turning point and answer are marked",
        "The annotated vertex and curve direction show the requested result.");
    } else if (id === "partial-contour-slope") {
      const dx = rng.int(-6, 6) || 2, dy = rng.int(-6, 6) || -3, along = rng() < 0.5 ? "x" : "y";
      const value = along === "x" ? dx : dy;
      let contours = "";
      for (let level = -2; level <= 2; level += 1) {
        const magnitude = Math.hypot(dx, dy);
        const shiftX = level * dx / magnitude * 14, shiftY = -level * dy / magnitude * 14;
        const directionX = dy / magnitude * 120, directionY = dx / magnitude * 70;
        contours += S.segment(200 + shiftX - directionX, 130 + shiftY - directionY,
          200 + shiftX + directionX, 130 + shiftY + directionY, false, "v-grid");
      }
      diagram = graph(contours + S.arrow(200, 130, 250, 130, "x") +
        S.arrow(200, 130, 200, 82, "y") + label(`z = ${dx}x + ${dy}y`, 28),
        "Contour lines for a tilted linear surface",
        "Parallel contours show equal changes in the function value.");
      answer = String(value);
      prompt = `For z = ${dx}x + ${dy}y, find the partial derivative in the ${along}-direction.`;
      hint = "Hold the other coordinate fixed. The coefficient of the changing coordinate is the partial derivative.";
      explainSteps = [`A partial derivative changes one coordinate and holds the other fixed.`,
        `The coefficient of ${along} in z = ${dx}x + ${dy}y is ${value}.`,
        `So the partial derivative in the ${along}-direction is ${value}.`];
      spec = { kind: id, dx, dy, along, value };
      solutionDiagram = graph(contours + S.arrow(200, 130, along === "x" ? 270 : 200, along === "x" ? 130 : 65, `${along}: ${value}`) +
        label(`∂z/∂${along} = ${value}`, 248),
        "The selected direction and partial derivative are annotated",
        "The arrow shows the direction in which the partial derivative is measured.");
    } else if (id === "contour-gradient") {
      const gx = rng.int(-6, 6) || 2, gy = rng.int(-6, 6) || 3;
      const target = `${gx},${gy}`;
      let contours = "";
      for (let n = -2; n <= 2; n += 1) {
        const cx = 200 + n * gx * 5, cy = 130 - n * gy * 5;
        const magnitude = Math.hypot(gx, gy), vx = gy / magnitude * 88, vy = gx / magnitude * 62;
        contours += S.segment(cx - vx, cy - vy, cx + vx, cy + vy, false, "v-grid");
      }
      diagram = graph(contours + S.point(200, 130, "P") + label("Equal-value contours", 24),
        "A contour map around a marked point",
        "The contours are closer in the direction where the function increases most rapidly.");
      answer = target;
      prompt = `At P, the surface is z = ${gx}x + ${gy}y. Give the gradient direction as x-component, y-component.`;
      hint = "The gradient points perpendicular to contour lines, toward increasing values.";
      explainSteps = [`For z = ${gx}x + ${gy}y, the gradient is (∂z/∂x, ∂z/∂y).`,
        `The x-component is ${gx} and the y-component is ${gy}.`,
        `The gradient direction is (${gx}, ${gy}).`];
      spec = { kind: id, gx, gy, direction: [gx, gy] };
      solutionDiagram = graph(contours + S.arrow(200, 130, 200 + gx * 14, 130 - gy * 14, "∇z") +
        label(`∇z = (${gx}, ${gy})`, 248),
        "The gradient arrow is drawn across the contour map",
        "The arrow points in the direction of greatest increase and is perpendicular to the contours.");
    } else if (id === "matrix-transform-square" || id === "determinant-area") {
      const m11 = rng.int(-3, 3), m12 = rng.int(-3, 3), m21 = rng.int(-3, 3), m22 = rng.int(-3, 3);
      const det = m11 * m22 - m12 * m21;
      if (id === "matrix-transform-square") {
        const points = [[0, 0], [1, 0], [1, 1], [0, 1]];
        const transformed = points.map(([u, v]) => [m11 * u + m12 * v, m21 * u + m22 * v]);
        const fitted = S.fittedPlane(points.concat(transformed), 0.75, { originLabel: false });
        const toScreen = (x, y) => fitted.toScreen(x, y);
        const originalSvg = points.map(point => toScreen(point[0], point[1]).join(",")).join(" ");
        const imageSvg = transformed.map(point => toScreen(point[0], point[1]).join(",")).join(" ");
        const centroid = [0.5, 0.5], imageCentroid = [transformed.reduce((sum, point) => sum + point[0], 0) / 4,
          transformed.reduce((sum, point) => sum + point[1], 0) / 4];
        const originalName = { 0: "O", 1: "A(1,0)", 3: "B(0,1)", 2: "C(1,1)" };
        const imageName = { 1: "A′", 3: "B′", 2: "C′" };
        const askArea = rng() < 0.2;
        const pointIndex = [1, 3, 2][rng.int(0, 2)];
        const pointValue = points[pointIndex], image = transformed[pointIndex];
        const originalLabels = points.map((point, index) => fitted.labelAt(toScreen(...point), originalName[index],
          toScreen(...centroid), 13, "v-original-corner-label")).join("");
        const seenImages = new Set();
        const imageLabels = [1, 3, 2].filter(index => askArea || index !== pointIndex).filter(index => {
          const key = transformed[index].join(",");
          if (!askArea && key === image.join(",")) return false;
          if (seenImages.has(key)) return false;
          seenImages.add(key);
          return true;
        }).map(index =>
          fitted.labelAt(toScreen(...transformed[index]), imageName[index], toScreen(...imageCentroid), 13,
            "v-image-corner-label")).join("");
        const baseSvg = fitted.grid + `<polygon class="v-empty matrix-original" data-vertices="${points.map(point => point.join(",")).join(";")}" points="${originalSvg}"/>` + originalLabels;
        const imageShape = `<polygon class="v-region matrix-image" data-vertices="${transformed.map(point => point.join(",")).join(";")}" points="${imageSvg}"/>` + imageLabels;
        diagram = graph(baseSvg + imageShape + label("Blue: original · Green: image", 252),
        "A unit square and its matrix-transformed image",
        "The outline is the unit square; the shaded polygon is its image under the displayed matrix.");
        answer = askArea ? String(Math.abs(det)) : `${image[0]},${image[1]}`;
        promptMatrix = [[m11, m12], [m21, m22]];
        prompt = askArea ? "The matrix [[matrix]] acts on column vectors: (x, y) → (ax + by, cx + dy). It transforms the unit square shown. Find the area scale factor."
          : `The matrix [[matrix]] acts on column vectors: (x, y) → (ax + by, cx + dy). It transforms the unit square. Find the image of ${originalName[pointIndex]}.`;
        hint = askArea ? "The area scale factor is the absolute value of the determinant." : "Multiply the matrix by the named corner's column vector.";
        explainSteps = askArea ? ["For a 2×2 matrix, det = ad − bc.",
          `Substitute: det = ${m11}×${m22} − ${m12}×${m21} = ${det}.`,
          `Area scale factor = |${det}| = ${Math.abs(det)}.`] :
          [`Write ${originalName[pointIndex]} as the column vector (${pointValue[0]}, ${pointValue[1]}).`,
            `New x = ${m11}×${pointValue[0]} + ${m12}×${pointValue[1]} = ${image[0]}.`,
            `New y = ${m21}×${pointValue[0]} + ${m22}×${pointValue[1]} = ${image[1]}.`];
        spec = { kind: id, matrix: [[m11, m12], [m21, m22]], point: askArea ? null : pointValue,
          image: askArea ? null : image, original: points, transformed, asked: askArea ? "area" : "corner" };
        const imagePoint = toScreen(...image);
        solutionDiagram = graph(baseSvg + `<polygon points="${imageSvg}" class="v-region"/>` +
          (askArea ? label(`Area scale factor = ${Math.abs(det)}`, 24) : S.point(imagePoint[0], imagePoint[1]) +
            S.text(imagePoint[0] + 16, imagePoint[1] - 12, `(${image[0]}, ${image[1]})`, 13,
              { className: "v-label v-corner-label" }) + label("Matrix image corner marked", 24)),
        askArea ? "The unit square and matrix image with their area scale" : "The transformed square with the requested image corner",
        askArea ? "The blue unit square and green image share one coordinate plane." : "The selected corner is labelled with its computed image coordinates.");
        const formatted = `(${image[0]}, ${image[1]})`;
        answer = `${image[0]},${image[1]}`;
        if (!askArea) answerAccept = [formatted, `${image[0]},${image[1]}`, `(${image[0]},${image[1]})`];
        else answer = String(Math.abs(det));
        answerPlaceholder = askArea ? "Write the area scale factor" : "Write your answer as (x, y)";
      } else {
        const unit = [[0, 0], [1, 0], [1, 1], [0, 1]];
        const transformed = unit.map(([u, v]) => [m11 * u + m12 * v, m21 * u + m22 * v]);
        const fitted = S.fittedPlane(unit.concat(transformed), 0.75, { originLabel: false });
        const originalSvg = unit.map(point => fitted.toScreen(...point).join(",")).join(" ");
        const imageSvg = transformed.map(point => fitted.toScreen(...point).join(",")).join(" ");
        const originalCenter = fitted.toScreen(0.5, 0.5);
        const imageCenter = fitted.toScreen(transformed.reduce((sum, point) => sum + point[0], 0) / 4,
          transformed.reduce((sum, point) => sum + point[1], 0) / 4);
        const sourceLabels = { 0: "O", 1: "A(1,0)", 3: "B(0,1)", 2: "C(1,1)" };
        const originalLabels = unit.map((point, index) => fitted.labelAt(fitted.toScreen(...point), sourceLabels[index], originalCenter, 13,
          "v-original-corner-label")).join("");
        const seenImagePoints = new Set();
        const imageLabels = [1, 3, 2].filter(index => {
          const key = transformed[index].join(",");
          if (seenImagePoints.has(key)) return false;
          seenImagePoints.add(key);
          return true;
        }).map(index => fitted.labelAt(fitted.toScreen(...transformed[index]),
          ["", "A′", "C′", "B′"][index], imageCenter, 13, "v-image-corner-label")).join("");
        answer = String(Math.abs(det));
        promptMatrix = [[m11, m12], [m21, m22]];
        prompt = "Find the area scale factor of [[matrix]] acting on column vectors (x, y) → (ax + by, cx + dy).";
        hint = "Take the absolute value of the determinant.";
        explainSteps = [`For a 2×2 matrix, det = ad − bc.`, `det = ${m11}×${m22} − ${m12}×${m21} = ${det}.`,
          `Area scale factor = |det| = ${Math.abs(det)}.`];
        const diagramSvg = fitted.grid + `<polygon points="${originalSvg}" class="v-outline"/>` + originalLabels +
          `<polygon points="${imageSvg}" class="v-region matrix-image"/>` + imageLabels +
          label("Blue: original · Green: image", 252);
        diagram = graph(diagramSvg,
        "The transformed unit square used to show area scaling",
        "The blue unit square and green matrix image share one labelled coordinate plane.");
        solutionDiagram = graph(diagramSvg +
          label(`|det| = ${Math.abs(det)}`, 24),
        "The transformed square annotated with its area scale",
        "The displayed area scale is the absolute value of the determinant.");
        spec = { kind: id, matrix: [[m11, m12], [m21, m22]], determinant: det, areaScale: Math.abs(det) };
      }
    } else if (id === "eigenvector-direction") {
      const axis = rng.pick(["x", "y"]), eigenvalue = rng.int(-4, 4) || 2, otherEigenvalue = rng.int(-4, 4) || -1;
      const vector = axis === "x" ? [1, 0] : [0, 1];
      const image = vector.map(value => value * eigenvalue);
      const fitted = S.fittedPlane([[0, 0], vector, image], 1);
      const origin = fitted.toScreen(0, 0), vectorEnd = fitted.toScreen(...vector), imageEnd = fitted.toScreen(...image);
      const baseVector = fitted.grid + S.arrow(origin[0], origin[1], vectorEnd[0], vectorEnd[1], "v");
      diagram = graph(baseVector,
      "An eigenvector shown before the transformation",
      "The vector lies along a coordinate axis of a diagonal matrix.");
      answer = String(eigenvalue);
      promptMatrix = [[axis === "x" ? eigenvalue : otherEigenvalue, 0], [0, axis === "y" ? eigenvalue : otherEigenvalue]];
      prompt = `The vector v = (${vector[0]}, ${vector[1]}) is an eigenvector of A = [[matrix]]. What is its eigenvalue?`;
      hint = "A eigenvalue tells how much its eigenvector is scaled.";
      explainSteps = [`For an eigenvector, Av = λv.`, `The ${axis}-axis component is multiplied by ${eigenvalue}.`,
        `So the eigenvalue is ${eigenvalue}; a negative value reverses direction.`];
      spec = { kind: id, axis, eigenvalue, otherEigenvalue, vector, image };
      solutionDiagram = graph(baseVector + S.arrow(origin[0], origin[1], imageEnd[0], imageEnd[1], "Av") +
        label(`Av = ${eigenvalue}v`, 248),
      "The eigenvector and its scaled image",
      "The original and transformed vectors share a line, showing the invariant direction.");
    } else if (id === "matrix-vector-grid") {
      const matrix = [[rng.int(-2, 2), rng.int(-2, 2)], [rng.int(-2, 2), rng.int(-2, 2)]];
      const vector = [rng.int(-2, 2) || 1, rng.int(-2, 2) || -1];
      const result = matrix.map(row => row[0] * vector[0] + row[1] * vector[1]);
      answer = result.join(",");
      promptMatrix = matrix;
      answerPlaceholder = "Write your answer as (x, y)";
      prompt = `Multiply [[matrix]] by (${vector.join(", ")}). Give the two output entries.`;
      hint = "Each output entry is one matrix row dotted with the vector.";
      explainSteps = [`First row: ${matrix[0][0]}×${vector[0]} + ${matrix[0][1]}×${vector[1]} = ${result[0]}.`,
        `Second row: ${matrix[1][0]}×${vector[0]} + ${matrix[1][1]}×${vector[1]} = ${result[1]}.`,
        `The output column is (${result[0]}, ${result[1]}).`];
      const table = `<rect x="70" y="70" width="260" height="110" class="v-empty"/>` +
        S.segment(200, 70, 200, 180, false, "v-grid") + S.segment(70, 125, 330, 125, false, "v-grid") +
        S.text(130, 108, `${matrix[0][0]}  ${matrix[0][1]}`, 20) + S.text(270, 108, String(vector[0]), 20) +
        S.text(130, 163, `${matrix[1][0]}  ${matrix[1][1]}`, 20) + S.text(270, 163, String(vector[1]), 20) +
        label("row · column = output", 218);
      diagram = graph(table, "A matrix and vector displayed as row-column multiplication", "Each row is paired with the vector column.");
      solutionDiagram = graph(table + S.text(200, 248, `Output = (${result[0]}, ${result[1]})`, 15),
        "The matrix-vector grid annotated with its output",
        "The two row-column dot products form the output vector.");
      spec = { kind: id, matrix, vector, result };
    } else if (id === "complex-argand") {
      const triples = [[3, 4], [5, 12], [8, 15], [7, 24], [20, 21]];
      const [real, imaginary] = rng.pick(triples), operation = rng.pick(["add", "modulus", "conjugate"]);
      const otherReal = rng.int(-5, 5), otherImaginary = rng.int(-5, 5);
      const magnitude = Math.hypot(real, imaginary);
      let vector;
      if (operation === "add") {
        answer = `${real + otherReal},${imaginary + otherImaginary}`;
        prompt = `Add (${real} + ${imaginary}i) and (${otherReal} + ${otherImaginary}i). Give real part, imaginary part.`;
        explainSteps = [`Add the real parts: ${real} + ${otherReal} = ${real + otherReal}.`,
          `Add the imaginary parts: ${imaginary} + ${otherImaginary} = ${imaginary + otherImaginary}.`,
          `The sum has parts ${answer}.`];
        vector = [real + otherReal, imaginary + otherImaginary];
      } else if (operation === "modulus") {
        answer = String(magnitude);
        prompt = `Find the modulus of z = ${real} + ${imaginary}i.`;
        explainSteps = [`On an Argand diagram, the real part is x and the imaginary part is y.`,
          `Use |z| = √(${real}² + ${imaginary}²).`,
          `The modulus is ${magnitude}.`];
        vector = [real, imaginary];
      } else {
        answer = `${real},${-imaginary}`;
        prompt = `Give the real part and imaginary part of the conjugate of z = ${real} + ${imaginary}i.`;
        explainSteps = [`The conjugate keeps the real part ${real}.`,
          `It changes the sign of the imaginary part: ${imaginary} becomes ${-imaginary}.`,
          `The conjugate has parts ${answer}.`];
        vector = [real, -imaginary];
      }
      const coordinateScale = 95 / Math.max(Math.abs(real), Math.abs(imaginary), Math.abs(otherReal),
        Math.abs(otherImaginary), ...vector.map(Math.abs), 1);
      const map = (pointValue) => [200 + pointValue[0] * coordinateScale, 130 - pointValue[1] * coordinateScale];
      const start = map([0, 0]), end = map([real, imaginary]);
      const base = S.segment(35, 130, 365, 130, false, "v-axis") + S.segment(200, 25, 200, 235, false, "v-axis") +
        S.arrow(start[0], start[1], end[0], end[1], "z") + S.point(end[0], end[1], `${real} + ${imaginary}i`);
      diagram = graph(base, "An Argand diagram with a complex number as a vector", "The horizontal axis is real and the vertical axis is imaginary.");
      const finalPoint = map(vector);
      solutionDiagram = graph(S.segment(35, 130, 365, 130, false, "v-axis") +
        S.segment(200, 25, 200, 235, false, "v-axis") +
        S.arrow(start[0], start[1], finalPoint[0], finalPoint[1], "answer") +
        S.point(finalPoint[0], finalPoint[1], answer) + label(`Answer: ${answer}`, 248),
      "The Argand diagram annotated with the requested result",
      "The plotted vector shows the answer coordinates.");
      hint = "Treat the real and imaginary parts as the horizontal and vertical coordinates.";
      spec = { kind: id, operation, real, imaginary, otherReal, otherImaginary, magnitude, result: vector };
    } else if (id === "sequence-term-graph") {
      const first = rng.int(-10, 10), difference = rng.int(-6, 6) || 2, termNumber = rng.int(5, 12);
      const term = first + (termNumber - 1) * difference;
      const scaleY = 90 / Math.max(Math.abs(first), Math.abs(first + 7 * difference), Math.abs(term), 1);
      let points = "";
      for (let n = 1; n <= 8; n += 1) {
        const value = first + (n - 1) * difference;
        points += S.point(45 + (n - 1) * 43, 130 - value * scaleY, `(${n},${value})`, { radius: 4, dx: 0, dy: -10 });
      }
      diagram = graph(points + S.segment(35, 130, 375, 130, false, "v-axis") +
        label(`Sequence starts ${first}; common difference ${difference}`, 24),
      "A term-position graph for an arithmetic sequence",
      "Each plotted point shows the term number and its sequence value.");
      answer = String(term);
      prompt = `The sequence starts at ${first} and changes by ${difference} each time. Find term ${termNumber}.`;
      hint = "Use the nth-term rule first + (n − 1) × common difference.";
      explainSteps = [`The nth term is a + (n − 1)d.`, `Substitute a = ${first}, d = ${difference}, n = ${termNumber}.`,
        `Term ${termNumber} = ${first} + (${termNumber} − 1)×${difference} = ${term}.`];
      spec = { kind: id, first, difference, termNumber, term };
      solutionDiagram = graph(points + S.arrow(45, 130, 45 + (termNumber - 1) * 18, 130 - term * scaleY, `term ${termNumber}`) +
        label(`${first} + (${termNumber} − 1)×${difference} = ${term}`, 248),
      "The sequence graph annotated with the requested term",
      "The nth-term calculation gives the value for the selected position.");
    } else if (id === "series-bars") {
      const sequenceType = rng.pick(["arithmetic", "geometric"]), first = rng.int(1, 6), count = rng.int(3, 7);
      const change = sequenceType === "arithmetic" ? rng.int(-3, 5) : rng.pick([2, 3]);
      const terms = Array.from({ length: count }, (_, index) =>
        sequenceType === "arithmetic" ? first + index * change : first * change ** index);
      const total = terms.reduce((sum, value) => sum + value, 0);
      const scale = 140 / Math.max(...terms.map(Math.abs), 1);
      let bars = "";
      terms.forEach((value, index) => {
        const height = Math.abs(value) * scale, y = value >= 0 ? 205 - height : 205;
        bars += `<rect x="${46 + index * 44}" y="${y}" width="30" height="${height}" class="${value >= 0 ? "v-fill" : "v-empty"}"/>` +
          S.text(61 + index * 44, 226, String(value), 10);
      });
      diagram = graph(bars + S.segment(32, 205, 368, 205, false, "v-axis") + label("Each bar is one term", 28),
        "Sequence terms shown as bars",
        "The sum is found by adding the values represented by all the bars.");
      answer = String(total);
      prompt = `Find the sum of the first ${count} terms of this ${sequenceType} sequence.`;
      hint = sequenceType === "arithmetic" ? "Use the first term and common difference to generate each term." :
        "Multiply each term by the common ratio to get the next term.";
      explainSteps = [`The first term is ${first}.`, sequenceType === "arithmetic" ?
        `Add ${change} each time to get ${terms.join(", ")}.` : `Multiply by ${change} each time to get ${terms.join(", ")}.`,
      `Add the ${count} terms: ${total}.`];
      spec = { kind: id, sequenceType, first, change, count, terms, sum: total };
      solutionDiagram = graph(bars + S.text(200, 250, `Sum = ${terms.join(" + ")} = ${total}`, 12),
        "The term bars annotated with their total",
        "The displayed term values add to the requested finite sum.");
    } else if (id === "combinatorics-routes") {
      const across = rng.int(2, 6), up = rng.int(2, 6);
      let paths = "", grid = "";
      const left = 85, bottom = 225, step = 34;
      for (let col = 0; col <= across; col += 1) grid += S.segment(left + col * step, bottom, left + col * step, bottom - up * step, false, "v-grid");
      for (let row = 0; row <= up; row += 1) grid += S.segment(left, bottom - row * step, left + across * step, bottom - row * step, false, "v-grid");
      paths = S.arrow(left, bottom, left + across * step, bottom - up * step, "routes");
      let numerator = 1, denominator = 1;
      for (let i = 1; i <= Math.min(across, up); i += 1) {
        numerator *= across + up - Math.min(across, up) + i;
        denominator *= i;
      }
      const ways = numerator / denominator;
      diagram = graph(grid + S.point(left, bottom, "Start", { radius: 3, dx: -25, dy: 15 }) +
        S.point(left + across * step, bottom - up * step, "Finish", { radius: 3, dx: 30, dy: -8 }),
      "A lattice grid with a start and finish",
      "Each route uses only right and upward moves along the grid lines.");
      answer = String(ways);
      prompt = `How many shortest routes go ${across} steps right and ${up} steps up?`;
      hint = "Every route is an ordering of the right moves and upward moves.";
      explainSteps = [`A shortest route has ${across + up} moves.`, `Choose which ${across} positions are right moves.`,
        `The count is (${across + up})! ÷ (${across}! ${up}!) = ${ways}.`];
      spec = { kind: id, across, up, routes: ways };
      solutionDiagram = graph(grid + paths + label(`Choose ${across} of ${across + up}: ${ways} routes`, 248),
        "The lattice route count is annotated",
        "The binomial count chooses positions for one move type.");
    } else if (id === "modular-clock") {
      const start = rng.int(1, 12), amount = rng.int(1, 55), operation = rng() < 0.5 ? "+" : "−";
      const value = ((start - 1 + (operation === "+" ? amount : -amount)) % 12 + 12) % 12 + 1;
      let face = "";
      for (let hour = 1; hour <= 12; hour += 1) {
        const angle = (hour - 3) * Math.PI / 6;
        face += S.text(200 + 82 * Math.cos(angle), 130 + 82 * Math.sin(angle), String(hour), 15);
      }
      diagram = graph(`<circle cx="200" cy="130" r="94" class="v-empty"/>` + face +
        S.arrow(200, 130, 200 + 50 * Math.cos((start - 3) * Math.PI / 6), 130 + 50 * Math.sin((start - 3) * Math.PI / 6), "start"),
      "A twelve-hour clock face with a starting position",
      "Clock arithmetic wraps after 12 and proceeds around the face.");
      answer = String(value);
      prompt = `Starting at ${start}, move ${amount} hour${amount === 1 ? "" : "s"} ${operation === "+" ? "clockwise" : "backwards"}. What number do you land on?`;
      hint = "Reduce the movement modulo 12, then wrap around the clock.";
      explainSteps = [`A clock has 12 positions, so work modulo 12.`, `${start} ${operation} ${amount} wraps around the face.`,
        `The landing position is ${value}.`];
      spec = { kind: id, start, amount, operation, result: value };
      solutionDiagram = graph(`<circle cx="200" cy="130" r="94" class="v-empty"/>` + face +
        S.arrow(200, 130, 200 + 58 * Math.cos((value - 3) * Math.PI / 6), 130 + 58 * Math.sin((value - 3) * Math.PI / 6), `answer ${value}`) +
        label(`${start} ${operation} ${amount} ≡ ${value} (mod 12)`, 248),
      "The clock answer is highlighted",
      "The arrow shows the final clock position after wrapping.");
    } else if (id === "prime-sieve") {
      const lower = rng.int(1, 90), upper = lower + 9;
      const primes = [];
      for (let value = Math.max(2, lower); value <= upper; value += 1) {
        let prime = true;
        for (let divisor = 2; divisor * divisor <= value; divisor += 1) if (value % divisor === 0) prime = false;
        if (prime) primes.push(value);
      }
      let cells = "";
      for (let value = lower; value <= upper; value += 1) {
        const index = value - lower, col = index % 5, band = Math.floor(index / 5);
        const x0 = 38 + col * 66, y0 = 72 + band * 56;
        cells += `<rect x="${x0}" y="${y0}" width="56" height="42" class="${primes.includes(value) ? "v-fill" : "v-empty"}"/>` +
          S.text(x0 + 28, y0 + 27, String(value), 15);
      }
      diagram = graph(cells + label("Prime numbers are shaded", 208),
        "A grid of numbers with primes highlighted",
        "The selected row contains a set of consecutive integers; prime numbers are shaded.");
      answer = String(primes.length);
      prompt = `How many primes are in the highlighted group from ${lower} to ${upper}?`;
      hint = "A prime has exactly two positive factors. Check divisibility by smaller primes.";
      explainSteps = [`Check each integer from ${lower} to ${upper}.`, `The primes in this group are ${primes.join(", ")}.`,
        `There are ${primes.length} primes.`];
      spec = { kind: id, lower, upper, primes, count: primes.length };
      solutionDiagram = graph(cells + label(`${primes.length} primes: ${primes.join(", ")}`, 208),
        "The highlighted prime group with its count",
        "The shaded primes in the selected ten-number group are listed.");
    } else if (id === "factor-tree") {
      const factors = [2, 3, 5, 7, 11, 13], p = rng.pick(factors), q = rng.pick(factors), r = rng.pick(factors);
      const factorList = [p, q, r].sort((u, v) => u - v);
      const product = factorList.reduce((productValue, factor) => productValue * factor, 1);
      const powers = new Map();
      factorList.forEach(factor => powers.set(factor, (powers.get(factor) || 0) + 1));
      answer = Array.from(powers, ([prime, power]) => power === 1 ? String(prime) : `${prime}^${power}`).join("×");
      const tree = S.segment(200, 55, 115, 105, false, "v-line") + S.segment(200, 55, 285, 105, false, "v-line") +
        S.segment(285, 105, 242, 158, false, "v-line") + S.segment(285, 105, 328, 158, false, "v-line") +
        S.text(200, 48, String(product), 18) + S.text(115, 101, String(factorList[0]), 15) +
        S.text(285, 101, String(factorList[1] * factorList[2]), 15) +
        S.text(242, 177, String(factorList[1]), 15) + S.text(328, 177, String(factorList[2]), 15);
      diagram = graph(tree, "A factor tree splitting a number into prime factors", "The leaves of the tree are prime factors.");
      prompt = `Write ${product} as a product of prime factors.`;
      hint = "Keep splitting composite branches until every leaf is prime.";
      explainSteps = [`The tree branches into ${factorList[0]} and ${factorList[1] * factorList[2]}.`,
        `Split the composite branch into ${factorList[1]} and ${factorList[2]}.`,
        `Collect repeated primes: ${answer}.`];
      spec = { kind: id, factors: factorList, product, answer };
      solutionDiagram = graph(tree + label(`Prime factorisation: ${answer}`, 238),
        "The completed factor tree and prime factorisation",
        "The prime leaves combine to give the requested product.");
    } else if (id === "logic-venn-truth") {
      const onlyA = rng.int(1, 8), onlyB = rng.int(1, 8), both = rng.int(1, 8), neither = rng.int(1, 8);
      const operation = rng.pick(["AND", "OR", "NOT A"]);
      const result = operation === "AND" ? both : operation === "OR" ? onlyA + onlyB + both : onlyB + neither;
      const overlay = operation === "AND" ? S.text(200, 138, "AND", 14) :
        operation === "OR" ? S.text(200, 138, "OR", 14) : S.text(280, 150, "NOT A", 12);
      diagram = graph(`<rect x="45" y="42" width="310" height="174" class="v-empty"/>` +
        `<circle cx="160" cy="130" r="58" class="v-region"/>` +
        `<circle cx="240" cy="130" r="58" class="v-region"/>` +
        S.text(135, 130, String(onlyA), 16) + S.text(200, 130, String(both), 16) +
        S.text(265, 130, String(onlyB), 16) + S.text(330, 198, String(neither), 14) +
        S.text(130, 72, "A", 13) + S.text(270, 72, "B", 13) + overlay,
      "A two-set Venn diagram with region counts",
      "The overlap belongs to both sets; outside the circles is neither set.");
      answer = String(result);
      prompt = `How many elements satisfy ${operation}?`;
      hint = operation === "AND" ? "AND means the overlap." : operation === "OR" ? "OR includes either circle, including the overlap once." : "NOT A means everything outside circle A.";
      explainSteps = [`The A-only region has ${onlyA}; the overlap has ${both}.`,
        `The B-only region has ${onlyB}; neither has ${neither}.`,
        operation === "AND" ? `AND selects the overlap: ${both}.` : operation === "OR" ?
          `OR adds the three circle regions: ${onlyA} + ${both} + ${onlyB} = ${result}.` :
          `NOT A includes B-only and neither: ${onlyB} + ${neither} = ${result}.`];
      spec = { kind: id, onlyA, onlyB, both, neither, operation, result };
      solutionDiagram = graph(`<rect x="45" y="42" width="310" height="174" class="v-empty"/>` +
        `<circle cx="160" cy="130" r="58" class="v-region"/>` +
        `<circle cx="240" cy="130" r="58" class="v-region"/>` +
        S.text(135, 130, String(onlyA), 16) + S.text(200, 130, String(both), 16) +
        S.text(265, 130, String(onlyB), 16) + S.text(330, 198, String(neither), 14) +
        S.text(200, 248, `${operation} count = ${result}`, 14),
      "The Venn logic operation and answer are labelled",
      "The selected set regions are combined according to the stated logic operation.");
    } else if (id === "slope-field-match") {
      const equations = ["0", "x", "−x", "y", "−y"], equation = rng.pick(equations);
      const slopeAt = (u, v) => equation === "0" ? 0 : equation === "x" ? u / 3 :
        equation === "−x" ? -u / 3 : equation === "y" ? v / 3 : -v / 3;
      let field = "";
      for (let u = -3; u <= 3; u += 1) for (let v = -3; v <= 3; v += 1) {
        const px = 200 + u * 42, py = 130 - v * 30, slope = slopeAt(u, v);
        field += S.segment(px - 8, py + slope * 8, px + 8, py - slope * 8, false, "v-line");
      }
      diagram = graph(field + S.segment(42, 130, 358, 130, false, "v-axis") +
        S.segment(200, 28, 200, 232, false, "v-axis"),
      "A slope field with short direction segments",
      "Each small segment shows the local slope of a differential equation.");
      answer = equation === "0" ? "0" : equation;
      prompt = "Which differential equation dy/dx is represented by this slope field?";
      hint = "Check whether the segment slope changes with x, with y, or with neither.";
      explainSteps = [equation === "0" ? "Every segment is horizontal, so the slope is zero." :
        `The slope changes with ${equation.endsWith("x") ? "the horizontal coordinate x" : "the vertical coordinate y"}.`,
      `The sign pattern matches ${equation}.`, `So dy/dx = ${equation}.`];
      spec = { kind: id, equation };
      solutionDiagram = graph(field + S.segment(42, 130, 358, 130, false, "v-axis") +
        S.segment(200, 28, 200, 232, false, "v-axis") +
        label(`dy/dx = ${equation}`, 248),
      "The slope field matched to its equation",
      "The equation label is confirmed by the way the local slopes vary.");
    } else if (id === "ode-growth-decay") {
      const rate = rng.pick([-0.5, -0.4, -0.25, -0.2, 0.2, 0.25, 0.4, 0.5]);
      const initial = rng.int(1, 5), growth = rate > 0, end = initial * Math.exp(rate * 5);
      const scale = 150 / Math.max(initial, end);
      const coords = [];
      for (let time = 0; time <= 5; time += 0.25) {
        const value = initial * Math.exp(rate * time);
        coords.push(`${45 + time * 62},${210 - value * scale}`);
      }
      diagram = graph(`<path d="M ${coords[0]} L ${coords.slice(1).join(" ")}" class="v-line"/>` +
        S.segment(40, 210, 370, 210, false, "v-axis") +
        S.segment(45, 28, 45, 220, false, "v-axis") +
        label(`dy/dt = ${rate}y; y(0) = ${initial}`, 24),
      "An exponential solution curve for a differential equation",
      "The sign of the rate determines whether the curve grows or decays.");
      answer = growth ? "growth" : "decay";
      prompt = `For dy/dt = ${rate}y with y(0) = ${initial}, is this exponential growth or decay?`;
      hint = "Look at the sign of the constant multiplying y.";
      explainSteps = [`The differential equation has the form dy/dt = ky with k = ${rate}.`,
        rate > 0 ? "A positive k makes the solution increase as time passes." :
          "A negative k makes the solution decrease as time passes.",
        `This is exponential ${answer}.`];
      spec = { kind: id, rate, initial, classification: answer };
      solutionDiagram = graph(`<path d="M ${coords[0]} L ${coords.slice(1).join(" ")}" class="v-line"/>` +
        S.segment(40, 210, 370, 210, false, "v-axis") + S.segment(45, 28, 45, 220, false, "v-axis") +
        label(`k ${rate > 0 ? "> 0" : "< 0"}: ${answer}`, 248),
      "The exponential curve annotated with growth or decay",
      "The curve direction agrees with the sign of the differential-equation rate.");
    } else if (id === "newton-method") {
      const rootsSquared = [2, 3, 5, 6, 7, 10, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];
      const n = rng.pick(rootsSquared), x0 = rng.int(5, 10), x1 = (x0 + n / x0) / 2;
      const f = value => value * value - n, scale = 95 / Math.max(n, 100 - n, 1);
      let curve = "";
      for (let value = 0; value <= 10; value += 0.5) {
        const px = 50 + value * 30, py = 130 - f(value) * scale;
        curve += `${curve ? " " : "M "}${px} ${py}`;
      }
      const p0x = 50 + x0 * 30, p0y = 130 - f(x0) * scale;
      const p1x = 50 + x1 * 30, p1y = 130 - f(x1) * scale;
      diagram = graph(`<path d="${curve}" class="v-line"/>` +
        S.segment(40, 130, 370, 130, false, "v-axis") +
        S.point(p0x, p0y, `x₀ = ${x0}`) + S.point(p1x, p1y, `x₁ ≈ ${x1.toFixed(2)}`),
      "Newton iteration on a quadratic curve",
      "The first Newton step moves the estimate closer to the positive root.");
      answer = x1.toFixed(2);
      prompt = `For f(x) = x² − ${n}, use one Newton step from x₀ = ${x0}. Give x₁ to 2 decimal places.`;
      hint = "Use x₁ = x₀ − f(x₀)/f′(x₀), with f′(x) = 2x.";
      explainSteps = [`f(${x0}) = ${x0}² − ${n} = ${f(x0)} and f′(${x0}) = ${2 * x0}.`,
        `x₁ = ${x0} − ${f(x0)}/${2 * x0} = ${x1}.`,
        `To 2 decimal places, x₁ = ${answer}.`];
      spec = { kind: id, n, x0, x1 };
      solutionDiagram = graph(`<path d="${curve}" class="v-line"/>` +
        S.segment(40, 130, 370, 130, false, "v-axis") +
        S.segment(p0x, p0y, p1x, 130, true, "v-rise-run") +
        S.point(p0x, p0y, "x₀") + S.point(p1x, p1y, "x₁") +
        label(`Newton update: x₁ = ${answer}`, 248),
      "One Newton step and its updated estimate",
      "The tangent-line step gives the next x-axis estimate.");
    } else if (id === "log-exp-graph") {
      const base = rng.int(2, 5), exponent = rng.int(1, 5), value = base ** exponent;
      const scale = 145 / value;
      let curve = "";
      for (let power = 0; power <= exponent; power += 1) {
        const px = 50 + power * (300 / Math.max(5, exponent)), py = 210 - base ** power * scale;
        curve += `${curve ? " " : "M "}${px} ${py}`;
      }
      diagram = graph(`<path d="${curve}" class="v-line"/>` +
        S.segment(40, 210, 370, 210, false, "v-axis") +
        S.segment(50, 28, 50, 220, false, "v-axis") +
        S.point(50 + exponent * (300 / Math.max(5, exponent)), 65, `(${exponent}, ${value})`) +
        label(`y = ${base}ˣ`, 24),
      "An exponential graph with a marked point",
      "The marked x-coordinate is the exponent that produces the labelled y-value.");
      answer = String(exponent);
      prompt = `The graph shows y = ${base}ˣ. What is log base ${base} of ${value}?`;
      hint = "A logarithm asks which power produces the given value.";
      explainSteps = [`A logarithm is the inverse of an exponential.`, `${base} raised to which power gives ${value}?`,
        `${base}^${exponent} = ${value}, so log_${base}(${value}) = ${exponent}.`];
      spec = { kind: id, base, exponent, value };
      solutionDiagram = graph(`<path d="${curve}" class="v-line"/>` +
        S.segment(40, 210, 370, 210, false, "v-axis") +
        S.segment(50, 28, 50, 220, false, "v-axis") +
        S.point(50 + exponent * (300 / Math.max(5, exponent)), 65, `(${exponent}, ${value})`) +
        label(`log_${base}(${value}) = ${exponent}`, 248),
      "The exponential point annotated with the logarithm",
      "The exponent at the marked point is the logarithm value.");
    } else if (id === "polynomial-roots") {
      const firstRoot = rng.int(-5, 5), secondRoot = rng.int(-5, 5);
      const rootIndex = rng() < 0.5 ? 0 : 1, selectedRoot = rootIndex ? secondRoot : firstRoot;
      const maxY = Math.max(...Array.from({ length: 11 }, (_, index) => Math.abs((index - 5 - firstRoot) * (index - 5 - secondRoot))), 1);
      const scale = 95 / maxY;
      let curve = "";
      for (let value = -5; value <= 5; value += 0.5) {
        const px = 50 + (value + 5) * 30, py = 130 - (value - firstRoot) * (value - secondRoot) * scale;
        curve += `${curve ? " " : "M "}${px} ${py}`;
      }
      const rootX = 50 + (selectedRoot + 5) * 30;
      diagram = graph(`<path d="${curve}" class="v-line"/>` +
        S.segment(40, 130, 370, 130, false, "v-axis") +
        S.segment(rootX, 36, rootX, 226, true, "v-grid") +
        label(`f(x) = (x ${firstRoot < 0 ? "+ " + -firstRoot : "− " + firstRoot})(x ${secondRoot < 0 ? "+ " + -secondRoot : "− " + secondRoot})`, 24),
      "A quadratic polynomial with its roots on the x-axis",
      "The roots are where the graph meets the x-axis.");
      answer = String(selectedRoot);
      prompt = `For f(x) = (x − ${firstRoot})(x − ${secondRoot}), give the marked root.`;
      hint = "At a root, the function value is zero.";
      explainSteps = [`Set f(x) equal to zero.`, `A product is zero when either factor is zero.`,
        `The marked factor gives x = ${selectedRoot}.`];
      spec = { kind: id, firstRoot, secondRoot, rootIndex, root: selectedRoot };
      solutionDiagram = graph(`<path d="${curve}" class="v-line"/>` +
        S.segment(40, 130, 370, 130, false, "v-axis") +
        S.segment(rootX, 36, rootX, 226, true, "v-rise-run") +
        S.point(rootX, 130, `x = ${selectedRoot}`) + label("f(x) = 0 at an x-intercept", 248),
      "The selected polynomial root is annotated",
      "The marked x-intercept satisfies the factor theorem.");
    } else if (id === "place-value-rounding") {
      const numberTenths = rng.int(101, 9999), number = numberTenths / 10;
      const place = rng.pick(["tens", "ones", "tenths"]), unit = place === "tens" ? 10 : place === "ones" ? 1 : 0.1;
      const rounded = Number((Math.floor(number / unit + 0.5) * unit).toFixed(1));
      const minimum = Math.floor(number / unit) * unit - 2 * unit, maximum = minimum + 4 * unit;
      const valueX = value => 35 + (value - minimum) / (maximum - minimum) * 330;
      let ticks = "";
      for (let index = 0; index <= 4; index += 1) {
        const tick = minimum + index * unit;
        ticks += S.segment(valueX(tick), 119, valueX(tick), 142, false, "v-axis") +
          S.text(valueX(tick), 164, tick.toFixed(place === "tenths" ? 1 : 0), 11);
      }
      diagram = graph(S.segment(35, 130, 365, 130, false, "v-axis") + ticks +
        S.point(valueX(number), 130, String(number), { radius: 6, dy: -15 }),
      "A number line showing a decimal between neighbouring place-value marks",
      "The marked number is rounded to the requested place value.");
      answer = String(rounded);
      prompt = `Round ${number.toFixed(1)} to the nearest ${place === "ones" ? "whole number" : place}.`;
      hint = "Look at the digit immediately to the right of the place you are rounding to.";
      explainSteps = [`The number is ${number.toFixed(1)}.`, `The nearest ${place} mark is ${rounded}.`,
        `The rounded answer is ${rounded}.`];
      spec = { kind: id, numberTenths, place, number, rounded };
      solutionDiagram = graph(S.segment(35, 130, 365, 130, false, "v-axis") + ticks +
        S.point(valueX(number), 130, String(number), { radius: 5, dy: -15 }) +
        S.point(valueX(rounded), 130, String(rounded), { radius: 7, className: "v-point", dy: 22 }) +
        label(`Rounded to ${place}: ${rounded}`, 244),
      "The number line annotated with the rounded value",
      "The original number and its rounded position are both marked.");
    } else if (id === "negative-thermometer") {
      const starting = rng.int(-20, 15), change = rng.pick([-18, -12, -7, 6, 9, 14]), final = starting + change;
      const yOf = value => 130 - value * 2;
      diagram = graph(`<rect x="174" y="38" width="52" height="178" rx="25" class="v-empty"/>` +
        `<rect x="193" y="${Math.min(yOf(0), yOf(starting))}" width="14" height="${Math.abs(yOf(0) - yOf(starting))}" class="v-fill"/>` +
        S.segment(165, yOf(starting), 235, yOf(starting), true, "v-rise-run") +
        S.text(258, yOf(starting) + 4, `${starting}°`, 15) + label("Temperature", 26),
      "A thermometer showing a starting temperature",
      "The marked temperature changes by the stated rise or fall.");
      answer = String(final);
      prompt = `The temperature is ${starting}°C and changes by ${change}°C. What is the new temperature?`;
      hint = "A negative change is a fall; add the signed change to the starting value.";
      explainSteps = [`Start at ${starting}°C.`, `Add the signed change: ${starting} + (${change}) = ${final}.`,
        `The new temperature is ${final}°C.`];
      spec = { kind: id, starting, change, final };
      solutionDiagram = graph(`<rect x="174" y="38" width="52" height="178" rx="25" class="v-empty"/>` +
        `<rect x="193" y="${Math.min(yOf(0), yOf(final))}" width="14" height="${Math.abs(yOf(0) - yOf(final))}" class="v-fill"/>` +
        S.segment(165, yOf(starting), 235, yOf(starting), true, "v-grid") +
        S.segment(165, yOf(final), 235, yOf(final), false, "v-rise-run") +
        S.text(258, yOf(final) + 4, `${final}°C`, 15) + label(`${starting} + (${change}) = ${final}`, 246),
      "The new thermometer reading annotated",
      "The final temperature is marked after adding the signed change.");
    } else if (id === "bidmas-tree") {
      const a = rng.int(2, 12), b = rng.int(2, 9), c = rng.int(2, 9), bracketed = rng() < 0.5;
      const result = bracketed ? (a + b) * c : a + b * c;
      const operator = bracketed ? "×" : "+", firstLeft = bracketed ? "(" + a + " + " + b + ")" : String(a);
      const secondRight = bracketed ? String(c) : `${b} × ${c}`;
      const tree = S.segment(200, 68, 118, 120, false, "v-line") + S.segment(200, 68, 282, 120, false, "v-line") +
        S.text(200, 60, operator, 22) + S.text(118, 143, firstLeft, 18) + S.text(282, 143, secondRight, 18);
      diagram = graph(tree + label(bracketed ? `(${a} + ${b}) × ${c}` : `${a} + ${b} × ${c}`, 30),
        "An expression tree showing the order of operations",
        "The tree places the operation completed last at its root.");
      answer = String(result);
      prompt = `Evaluate ${bracketed ? `(${a} + ${b}) × ${c}` : `${a} + ${b} × ${c}`} using BIDMAS.`;
      hint = "Brackets come first. Otherwise multiply before adding.";
      explainSteps = bracketed ? [`Evaluate the brackets: ${a} + ${b} = ${a + b}.`,
        `Multiply the bracket result by ${c}.`, `${a + b} × ${c} = ${result}.`] :
        [`Multiplication comes before addition.`, `${b} × ${c} = ${b * c}.`,
        `${a} + ${b * c} = ${result}.`];
      spec = { kind: id, a, b, c, bracketed, result };
      solutionDiagram = graph(tree + S.text(200, 211, `Answer = ${result}`, 18) +
        label("Follow the tree from the leaves to its root", 248),
      "The expression tree with the final result",
      "The operation tree is evaluated from its leaves to calculate the answer.");
    } else if (id === "algebra-tiles") {
      const a = rng.int(1, 9), b = rng.int(1, 9), coefficient = a + b;
      const tiles = `<rect x="45" y="80" width="100" height="68" class="v-region"/>` +
        `<rect x="255" y="80" width="100" height="68" class="v-region"/>` +
        S.text(95, 121, `x × ${a}`, 18) + S.text(305, 121, `x × ${b}`, 18) +
        S.text(200, 179, "combine like x-tiles", 14);
      diagram = graph(tiles, "Algebra tiles showing two groups of x tiles",
        "The x tiles from both groups combine to make the coefficient of x.");
      answer = String(coefficient);
      prompt = `Using the tiles, what is the coefficient of x in (x + ${a})(x + ${b})?`;
      hint = "Combine the x-tiles from the two cross-products.";
      explainSteps = [`The cross-products are ${a}x and ${b}x.`,
        `Like terms combine: ${a}x + ${b}x = (${a} + ${b})x.`,
        `The coefficient of x is ${coefficient}.`];
      spec = { kind: id, a, b, coefficient };
      solutionDiagram = graph(tiles + S.text(200, 224, `${a}x + ${b}x = ${coefficient}x`, 16) +
        label(`Coefficient: ${coefficient}`, 250),
      "The algebra tiles annotated with the combined x coefficient",
      "The two sets of x tiles combine to the displayed coefficient.");
    } else if (id === "completing-square") {
      const h = rng.int(-5, 5), k = rng.int(-8, 8), px = 200 + h * 24, py = 130 - k * 6;
      const curve = S.segment(px - 70, py + 52, px, py, false, "v-line") +
        S.segment(px, py, px + 70, py + 52, false, "v-line");
      diagram = graph(curve + S.segment(px, 34, px, 228, true, "v-grid") +
        S.point(px, py, `(${h}, ${k})`) + label(`y = (x ${h < 0 ? "+ " + -h : "− " + h})² ${k < 0 ? "− " + -k : "+ " + k}`, 26),
      "A completed-square graph with a marked vertex",
      "The vertex coordinates show the horizontal and vertical translations.");
      answer = `${h},${k}`;
      prompt = `The graph is y = (x − ${h})² + ${k}. Give the turning point as x, y.`;
      hint = "In y = (x − h)² + k, the turning point is (h, k).";
      explainSteps = [`The squared expression is zero when x = ${h}.`,
        `At that x-value, y = ${k}.`, `The turning point is (${h}, ${k}).`];
      spec = { kind: id, h, k, turningPoint: [h, k] };
      solutionDiagram = graph(curve + S.segment(px, 34, px, 228, true, "v-grid") +
        S.point(px, py, `turning point (${h}, ${k})`) + label("Read the vertex from the graph", 248),
      "The completed-square vertex is identified",
      "The dashed symmetry line passes through the marked turning point.");
    } else if (id === "iteration-staircase") {
      const initial = rng.int(1, 10), constant = rng.int(2, 10), steps = rng.int(2, 4);
      const values = [initial];
      for (let index = 0; index < steps; index += 1) values.push((values[index] + constant) / 2);
      const mapX = value => 40 + value * 25, mapY = value => 220 - value * 16;
      let cobweb = S.segment(mapX(0), mapY(0), mapX(12), mapY(12), true, "v-grid") +
        S.segment(mapX(0), mapY(constant / 2), mapX(12), mapY((12 + constant) / 2), false, "v-line");
      for (let index = 0; index < steps; index += 1) {
        const x0 = mapX(values[index]), y0 = mapY(values[index]);
        const x1 = mapX(values[index]), y1 = mapY(values[index + 1]);
        const x2 = mapX(values[index + 1]), y2 = mapY(values[index + 1]);
        cobweb += S.segment(x0, y0, x1, y1, false, "v-rise-run") + S.segment(x1, y1, x2, y2, false, "v-rise-run");
      }
      diagram = graph(cobweb + label(`xₙ₊₁ = (xₙ + ${constant}) ÷ 2`, 24),
      "An iteration staircase between y equals x and the iteration graph",
      "The staircase alternates between the iteration rule and the line y equals x.");
      answer = values[steps].toFixed(3);
      prompt = `Start at x₀ = ${initial} and use xₙ₊₁ = (xₙ + ${constant}) ÷ 2. Find x${steps} to 3 decimal places.`;
      hint = "Substitute each new value into the iteration rule before moving to the next step.";
      explainSteps = [`x₀ = ${initial}.`, ...values.slice(1).map((value, index) =>
        `x${index + 1} = (x${index} + ${constant}) ÷ 2 = ${value.toFixed(3)}.`),
      `To 3 decimal places, x${steps} = ${answer}.`].slice(0, 6);
      spec = { kind: id, initial, constant, steps, values };
      solutionDiagram = graph(cobweb + label(`x${steps} = ${answer}`, 248),
      "The completed iteration staircase with its final value",
      "Each step lands on the next iterate, approaching a fixed point.");
    } else if (id === "inequality-region") {
      const lowerX = rng.int(-3, 1), lowerY = rng.int(-3, 1);
      const limit = lowerX + lowerY + rng.int(3, 8);
      const corners = [[lowerX, lowerY], [lowerX, limit - lowerX], [limit - lowerY, lowerY]];
      const scale = 90 / Math.max(...corners.flat().map(Math.abs), 4);
      const mapped = corners.map(([u, v]) => [200 + u * scale, 130 - v * scale]);
      let latticeCount = 0;
      for (let u = lowerX; u <= limit - lowerY; u += 1) {
        for (let v = lowerY; v <= limit - u; v += 1) latticeCount += 1;
      }
      const region = `<polygon points="${mapped.map(pair => pair.join(",")).join(" ")}" class="v-shade"/>`;
      diagram = graph(region + S.segment(104, 130, 296, 130, false, "v-axis") +
        S.segment(200, 42, 200, 218, false, "v-axis") +
        label(`x ≥ ${lowerX}, y ≥ ${lowerY}, x + y ≤ ${limit}`, 24) +
        S.text(278, 84, "R", 18),
      "A shaded feasible region satisfying three inequalities",
      "Region R is the intersection of the two lower bounds and the diagonal upper bound.");
      answer = String(latticeCount);
      prompt = `How many integer coordinate points lie in region R, where x ≥ ${lowerX}, y ≥ ${lowerY}, and x + y ≤ ${limit}?`;
      hint = "For each integer x, count the allowed integer y-values from the lower bound to the diagonal.";
      explainSteps = [`The vertices are (${lowerX}, ${lowerY}), (${lowerX}, ${limit - lowerX}), and (${limit - lowerY}, ${lowerY}).`,
        `Count integer y-values for each integer x from ${lowerX} to ${limit - lowerY}.`,
        `Including boundary points, there are ${latticeCount} integer points in R.`];
      spec = { kind: id, lowerX, lowerY, limit, vertices: corners, latticeCount };
      solutionDiagram = graph(region + S.segment(104, 130, 296, 130, false, "v-axis") +
        S.segment(200, 42, 200, 218, false, "v-axis") +
        label(`Integer lattice points in R: ${latticeCount}`, 248),
      "The feasible region annotated with its lattice-point count",
      "Integer coordinate points inside or on the boundary are counted.");
    } else if (id === "loci-bisectors") {
      const horizontal = rng() < 0.5, centerX = rng.int(-2, 2), centerY = rng.int(-2, 2);
      const [halfDistance, halfHeight] = rng.pick([[3, 4], [4, 3]]);
      const first = horizontal ? [centerX - halfDistance, centerY] : [centerX, centerY - halfDistance];
      const second = horizontal ? [centerX + halfDistance, centerY] : [centerX, centerY + halfDistance];
      const targets = horizontal ? [[centerX, centerY - halfHeight], [centerX, centerY + halfHeight]] :
        [[centerX - halfHeight, centerY], [centerX + halfHeight, centerY]];
      const range = { minX: -7, maxX: 7, minY: -7, maxY: 7 };
      const c1 = S.mapPoint(first[0], first[1], range), c2 = S.mapPoint(second[0], second[1], range);
      const t1 = S.mapPoint(targets[0][0], targets[0][1], range), t2 = S.mapPoint(targets[1][0], targets[1][1], range);
      const circles = `<ellipse cx="${c1[0]}" cy="${c1[1]}" rx="${400 * 5 / 14}" ry="${260 * 5 / 14}" class="v-grid" fill="none"/>` +
        `<ellipse cx="${c2[0]}" cy="${c2[1]}" rx="${400 * 5 / 14}" ry="${260 * 5 / 14}" class="v-grid" fill="none"/>`;
      diagram = graph(S.plane(range) + circles + S.point(c1[0], c1[1], "A") + S.point(c2[0], c2[1], "B"),
      "Two equal-radius arcs crossing above and below a segment",
      "Click the two arc intersections to mark the construction points for the perpendicular bisector.");
      type = "click";
      clickTarget = { type: "points", points: targets, tolerance: 1, range };
      answer = targets.map(pointValue => pointValue.join(",")).join(";");
      prompt = `Construct the perpendicular bisector of AB. Click both arc intersections.`;
      hint = "Use the same radius from A and B; the two equal-radius arcs meet at points equally far from both endpoints.";
      explainSteps = [`A is (${first.join(", ")}) and B is (${second.join(", ")}).`,
        "The same compass radius from both endpoints creates two equal-radius arcs.",
        "The intersections lie on the perpendicular bisector, equally far from A and B."];
      spec = { kind: id, horizontal, centerX, centerY, halfDistance, halfHeight, first, second, targets };
      solutionDiagram = graph(S.plane(range) + circles +
        S.segment(t1[0], t1[1], t2[0], t2[1], false, "v-rise-run") +
        S.point(t1[0], t1[1], "intersection") + S.point(t2[0], t2[1], "intersection"),
      "The perpendicular bisector construction marked through both arc intersections",
      "The constructed line passes through the two points equidistant from A and B.");
    } else if (id === "nets-solids") {
      const sides = rng.int(3, 8), metric = rng.pick(["faces", "edges", "vertices"]);
      const rotationIndex = rng.int(0, 5), rotation = rotationIndex * Math.PI / 6;
      const values = { faces: sides + 2, edges: 3 * sides, vertices: 2 * sides };
      const bars = Array.from({ length: sides }, (_, index) =>
        `<rect x="${54 + index * 42}" y="100" width="42" height="58" class="v-region"/>`).join("");
      const cap = centerY => Array.from({ length: sides }, (_, index) => {
        const angle = 2 * Math.PI * index / sides - Math.PI / 2 + rotation;
        return `${200 + 32 * Math.cos(angle)},${centerY + 32 * Math.sin(angle)}`;
      }).join(" ");
      const caps = `<polygon points="${cap(65)}" class="v-fill"/>` +
        `<polygon points="${cap(193)}" class="v-fill"/>`;
      diagram = graph(bars + caps + label(`${sides}-sided prism net`, 42),
      "A prism net with a strip of rectangular side faces",
      "A prism has one rectangular side face for each edge of its polygonal end.");
      answer = String(values[metric]);
      prompt = `This net folds into a ${sides}-sided prism. How many ${metric} does it have?`;
      hint = "A prism has two matching polygon ends and one side face per edge of the end.";
      explainSteps = [`The polygonal end has ${sides} sides.`, `A prism has ${sides} side faces and 2 ends.`,
        metric === "faces" ? `Faces = ${sides} + 2 = ${values.faces}.` :
          metric === "edges" ? `Edges = 3 × ${sides} = ${values.edges}.` :
            `Vertices = 2 × ${sides} = ${values.vertices}.`];
      spec = { kind: id, sides, metric, rotationIndex, faces: values.faces, edges: values.edges, vertices: values.vertices };
      solutionDiagram = graph(bars + caps + label(`${values.faces} faces · ${values.edges} edges · ${values.vertices} vertices`, 224) +
        label(`Number of ${metric}: ${answer}`, 248),
      "The prism net annotated with its face, edge and vertex counts",
      "The prism counts are shown beside the net.");
    } else if (id === "volume-solids") {
      const shape = rng.pick(["prism", "cylinder", "cone", "sphere"]);
      const length = rng.int(2, 12), radius = rng.int(2, 8), height = rng.int(2, 10);
      const volume = shape === "prism" ? length * radius * height :
        shape === "cylinder" ? Math.PI * radius * radius * height :
          shape === "cone" ? Math.PI * radius * radius * height / 3 :
            4 * Math.PI * radius ** 3 / 3;
      diagram = graph(shape === "prism" ?
        `<polygon points="100,76 250,76 292,108 142,108" class="v-outline"/>` +
          `<polygon points="142,108 292,108 292,190 142,190" class="v-region"/>` +
          `<polygon points="100,76 142,108 142,190 100,158" class="v-fill"/>` :
        shape === "sphere" ? `<circle cx="200" cy="130" r="72" class="v-outline"/>` +
          S.segment(200, 130, 272, 130, true, "v-grid") :
          `<ellipse cx="200" cy="76" rx="70" ry="22" class="v-outline"/>` +
          (shape === "cone" ? S.segment(130, 76, 200, 204, false, "v-line") + S.segment(270, 76, 200, 204, false, "v-line") :
            S.segment(130, 76, 130, 190, false, "v-line") + S.segment(270, 76, 270, 190, false, "v-line") +
              `<ellipse cx="200" cy="190" rx="70" ry="22" class="v-outline"/>`) +
          S.segment(200, 76, 200 + radius * 8, 76, true, "v-rise-run") +
        label(shape === "prism" ? `length ${length}, width ${radius}, height ${height}` :
          shape === "sphere" ? `radius ${radius}` : `radius ${radius}, height ${height}`, 28) +
        S.text(200, 234, "Diagram NOT accurately drawn", 11),
      `A labelled ${shape} volume diagram`,
      "The labelled dimensions are used in the volume formula for this solid.");
      answer = volume.toFixed(2);
      prompt = shape === "prism" ?
        `Find the volume of this prism: ${length} cm by ${radius} cm by ${height} cm.` :
        `Find the volume of this ${shape} with radius ${radius} cm${shape === "sphere" ? "" : ` and height ${height} cm`}. Give your answer to 2 decimal places.`;
      hint = shape === "prism" ? "Volume of a prism is cross-sectional area times length." :
        shape === "cylinder" ? "Use V = πr²h." : shape === "cone" ? "Use V = πr²h ÷ 3." : "Use V = 4πr³ ÷ 3.";
      explainSteps = shape === "prism" ?
        [`Use volume = length × width × height.`, `${length} × ${radius} × ${height} = ${volume}.`,
          `The volume is ${answer} cm³.`] :
        [`Use the ${shape} volume formula with r = ${radius}${shape === "sphere" ? "" : ` and h = ${height}`}.`,
          `Substitute the labelled dimensions and π.`, `To 2 decimal places, the volume is ${answer} cm³.`];
      spec = { kind: id, shape, length, radius, height, volume };
      solutionDiagram = graph(diagram.replace(/<\/svg>$/, "").replace(/^<svg[^>]*>/, "") +
        label(`Volume = ${answer} cm³`, 248),
      `The ${shape} diagram annotated with its calculated volume`,
      "The labelled dimensions are substituted into the matching volume formula.");
    } else if (id === "plans-elevations") {
      const heights = Array.from({ length: 3 }, () => rng.int(1, 4)), view = rng.pick(["front", "side", "plan"]);
      const total = heights.reduce((sum, value) => sum + value, 0);
      let blocks = "";
      heights.forEach((count, column) => {
        for (let level = 0; level < count; level += 1) {
          blocks += `<rect x="${75 + column * 46}" y="${190 - level * 34}" width="42" height="32" class="v-region"/>`;
        }
      });
      const sideHeight = Math.max(...heights), count = view === "plan" ? heights.length :
        view === "front" ? heights.reduce((sum, value) => sum + value, 0) : sideHeight;
      diagram = graph(blocks + S.segment(58, 192, 218, 192, false, "v-axis") +
        label(`Front view: ${heights.join(", ")} cubes deep`, 30) +
        S.text(292, 120, `Plan: ${heights.length} positions`, 13) +
        S.text(292, 151, `Side: height ${sideHeight}`, 13),
      "A three-column stack with its plan and elevation clues",
      "The columns have the labelled heights; plan and side views summarise the stack.");
      answer = String(count);
      prompt = `How many cubes are shown in the ${view} view?`;
      hint = view === "plan" ? "A plan counts the occupied positions from above." :
        view === "side" ? "From the side, the tallest stack sets the visible height." : "Count all the visible front-face squares.";
      explainSteps = [`The stack heights are ${heights.join(", ")}.`, view === "plan" ?
        `There are ${heights.length} occupied positions in the plan.` : view === "side" ?
          `The greatest height is ${sideHeight}.` : `Add the visible column heights: ${heights.join(" + ")} = ${total}.`,
      `The ${view} view answer is ${count}.`];
      spec = { kind: id, heights, view, count };
      solutionDiagram = graph(blocks + label(`${view} view count = ${count}`, 248),
      "The stack diagram annotated with the requested view count",
      "The requested orthographic view count is calculated from the column heights.");
    } else if (id === "symmetry") {
      const sides = rng.int(3, 9), askRotational = rng() < 0.5, angle = 2 * Math.PI / sides;
      const rotationIndex = rng.int(0, 5), rotation = rotationIndex * Math.PI / 12;
      const points = Array.from({ length: sides }, (_, index) =>
        [200 + 78 * Math.cos(angle * index - Math.PI / 2 + rotation), 130 + 78 * Math.sin(angle * index - Math.PI / 2 + rotation)]);
      const polygon = `<polygon points="${points.map(pointValue => pointValue.join(",")).join(" ")}" class="v-outline"/>`;
      const axisDx = 86 * Math.sin(rotation), axisDy = 86 * Math.cos(rotation);
      const axis = S.segment(200 - axisDx, 130 - axisDy, 200 + axisDx, 130 + axisDy, true, "v-grid");
      const value = sides;
      diagram = graph(polygon + axis +
        label(`Regular ${sides}-sided polygon`, 28),
      "A regular polygon with a line of symmetry",
      "A regular polygon has one reflection symmetry line per side and the same rotational order.");
      answer = String(value);
      prompt = askRotational ? `What is the order of rotational symmetry of a regular ${sides}-sided polygon?` :
        `How many lines of symmetry does a regular ${sides}-sided polygon have?`;
      hint = "For a regular polygon, each side contributes one matching symmetry position.";
      explainSteps = [`The shape is regular, so its sides and angles match.`,
        `It maps onto itself after each of ${sides} equal turns.` ,
        `Its ${askRotational ? "rotational order" : "number of symmetry lines"} is ${value}.`];
      spec = { kind: id, sides, rotationIndex, asked: askRotational ? "rotational" : "lines", answer: value };
      solutionDiagram = graph(polygon + S.segment(200 - axisDx, 130 - axisDy, 200 + axisDx, 130 + axisDy, true, "v-rise-run") +
        label(`${value} matching symmetries`, 248),
      "The regular polygon's symmetry is annotated",
      "The marked axis is one of the polygon's matching symmetries.");
    } else if (id === "congruence-similarity") {
      const scaleFactor = rng.int(2, 6), smallSide = rng.int(2, 12), askArea = rng() < 0.5;
      const answerValue = askArea ? scaleFactor ** 2 : smallSide * scaleFactor;
      const smallSize = 3 * smallSide, largeSide = smallSize * scaleFactor, largeStart = 200 - largeSide / 2;
      const triangles = `<polygon points="70,190 ${70 + smallSize},190 70,${190 - smallSize}" class="v-empty"/>` +
        `<polygon points="${largeStart},190 ${largeStart + largeSide},190 ${largeStart},${190 - largeSide}" class="v-region"/>`;
      diagram = graph(triangles +
        S.text(70 + smallSize / 2, 212, `${smallSide} cm`, 12) +
        S.text(200, 212, `${smallSide * scaleFactor} cm`, 12) +
        label(`Length scale factor = ${scaleFactor}`, 30) +
        S.text(200, 248, "Diagram NOT accurately drawn", 11),
      "Two similar right triangles with corresponding lengths",
      "The labelled dimensions are not represented to scale.");
      answer = String(answerValue);
      prompt = askArea ? `The length scale factor is ${scaleFactor}. What is the area scale factor?` :
        `A ${smallSide} cm side is enlarged by scale factor ${scaleFactor}. Find its corresponding length.`;
      hint = askArea ? "Area scales by the square of the length scale factor." :
        "Multiply a length by the scale factor.";
      explainSteps = askArea ? [`Length scale factor = ${scaleFactor}.`,
        `Area scale factor = ${scaleFactor}².`, `The area scale factor is ${answerValue}.`] :
        [`Original length = ${smallSide} cm.`, `Multiply by ${scaleFactor}.`,
          `${smallSide} × ${scaleFactor} = ${answerValue} cm.`];
      spec = { kind: id, scaleFactor, smallSide, asked: askArea ? "area" : "length", result: answerValue };
      solutionDiagram = graph(triangles +
        label(askArea ? `Area factor = ${scaleFactor}² = ${answerValue}` :
          `${smallSide} × ${scaleFactor} = ${answerValue} cm`, 232) +
        S.text(200, 250, "Diagram NOT accurately drawn", 11),
      "Similar triangles annotated with the scale calculation",
      "The length or area scale factor gives the requested result.");
    } else if (id === "sine-cosine-rules") {
      const sideB = rng.int(4, 12), sideC = rng.int(4, 12), angle = rng.pick([60, 90, 120]);
      const sideA = Math.sqrt(sideB ** 2 + sideC ** 2 - 2 * sideB * sideC * Math.cos(angle * Math.PI / 180));
      const shown = sideA.toFixed(2);
      const scale = 10, angleRadians = angle * Math.PI / 180;
      const ax = 200 - (sideB + sideC * Math.cos(angleRadians)) * scale / 2;
      const ay = 200, bx = ax + sideB * scale;
      const cx = ax + sideC * Math.cos(angleRadians) * scale;
      const cy = ay - sideC * Math.sin(angleRadians) * scale;
      const triangle = `<polygon points="${ax},${ay} ${bx},${ay} ${cx},${cy}" class="v-region"/>`;
      diagram = graph(triangle +
        S.text((ax + bx) / 2, 220, `${sideB} cm`, 12) +
        S.text((ax + cx) / 2 - 10, (ay + cy) / 2, `${sideC} cm`, 12) +
        S.text(ax + 18, ay - 9, `${angle}°`, 12) + label("Find the opposite side", 30),
      "A triangle with two sides and their included angle labelled",
      "The triangle is drawn to scale from the two labelled sides and included angle.");
      answer = shown;
      prompt = `Find the side opposite ${angle}°. Give your answer to 2 decimal places.`;
      hint = "Use c² = a² + b² − 2ab cos C. Set the calculator to degrees.";
      explainSteps = [`The included angle is ${angle}°, between sides ${sideB} cm and ${sideC} cm.`,
        `Use the cosine rule: c² = ${sideB}² + ${sideC}² − 2 × ${sideB} × ${sideC} × cos ${angle}°.`,
        `Take the positive square root and round to 2 decimal places: ${shown} cm.`];
      spec = { kind: id, sideB, sideC, angle, sideA };
      solutionDiagram = graph(triangle +
        label(`c = ${shown} cm`, 248),
      "The triangle is annotated with its cosine-rule side length",
      "The cosine rule gives the calculated opposite side.");
    } else if (id === "sine-area") {
      const sideA = rng.int(4, 16), sideB = rng.int(4, 16), angle = rng.pick([30, 90, 150]);
      const area = sideA * sideB * Math.sin(angle * Math.PI / 180) / 2;
      const shown = Number.isInteger(area) ? String(area) : area.toFixed(1);
      const scale = 9, angleRadians = angle * Math.PI / 180;
      const ax = 200 - (sideA + sideB * Math.cos(angleRadians)) * scale / 2;
      const ay = 200, bx = ax + sideA * scale;
      const cx = ax + sideB * Math.cos(angleRadians) * scale;
      const cy = ay - sideB * Math.sin(angleRadians) * scale;
      const triangle = `<polygon points="${ax},${ay} ${bx},${ay} ${cx},${cy}" class="v-region"/>`;
      diagram = graph(triangle +
        S.text((ax + bx) / 2, 220, `${sideA} cm`, 12) +
        S.text((ax + cx) / 2 - 10, (ay + cy) / 2, `${sideB} cm`, 12) +
        S.text(ax + 16, ay - 8, `${angle}°`, 12) + label("Included angle", 30),
      "A triangle with two sides and the included angle marked",
      "The triangle is drawn to scale from the two labelled sides and included angle.");
      answer = shown;
      prompt = `Find the triangle's area. Use ½ab sin C.`;
      hint = "Use the two sides that enclose the marked angle.";
      explainSteps = [`Use area = ½ab sin C.`, `Substitute: ½ × ${sideA} × ${sideB} × sin ${angle}°.`,
        `The area is ${shown} cm².`];
      spec = { kind: id, sideA, sideB, angle, area };
      solutionDiagram = graph(triangle +
        label(`Area = ${shown} cm²`, 248),
      "The triangle is annotated with its sine-area result",
      "Half the product of the two sides and the sine of the included angle is the area.");
    } else if (id === "3d-pythagoras") {
      const cuboids = [];
      for (let lengthValue = 1; lengthValue <= 12; lengthValue += 1) {
        for (let widthValue = 1; widthValue <= 12; widthValue += 1) {
          for (let heightValue = 1; heightValue <= 12; heightValue += 1) {
            const diagonalSquared = lengthValue ** 2 + widthValue ** 2 + heightValue ** 2;
            if (Number.isInteger(Math.sqrt(diagonalSquared))) {
              cuboids.push([lengthValue, widthValue, heightValue]);
            }
          }
        }
      }
      const [length, width, height] = rng.pick(cuboids), askAngle = rng() < 0.5;
      const baseDiagonal = Math.hypot(length, width), diagonal = Math.hypot(baseDiagonal, height);
      const angle = Math.atan2(height, baseDiagonal) * 180 / Math.PI;
      const shown = askAngle ? angle.toFixed(1) : String(diagonal);
      diagram = graph(`<polygon points="92,92 248,92 298,126 142,126" class="v-outline"/>` +
        `<polygon points="142,126 298,126 298,211 142,211" class="v-region"/>` +
        `<polygon points="92,92 142,126 142,211 92,177" class="v-fill"/>` +
        S.segment(92, 92, 298, 211, true, "v-rise-run") +
        S.segment(142, 126, 298, 126, false, "v-axis") +
        S.text(200, 234, "Diagram NOT accurately drawn", 11) +
        label(`${length} cm × ${width} cm × ${height} cm cuboid`, 30),
      "A cuboid with three dimensions and a space diagonal",
      "The space diagonal joins opposite corners of the cuboid.");
      answer = shown;
      prompt = askAngle ? `Find the angle between the space diagonal and the base diagonal. Give your answer to 1 decimal place.` :
        `Find the length of the space diagonal of the ${length} by ${width} by ${height} cm cuboid.`;
      hint = askAngle ? "First find the base diagonal, then use tan θ = height ÷ base diagonal. Use degrees." :
        "Use Pythagoras twice: first across the base, then with the height.";
      explainSteps = [`Base diagonal = √(${length}² + ${width}²) = ${baseDiagonal} cm.`,
        askAngle ? `tan θ = ${height} ÷ ${baseDiagonal}. Set the calculator to degrees.` :
          `Space diagonal = √(${baseDiagonal}² + ${height}²) = ${diagonal} cm.`,
        askAngle ? `θ = ${shown}° to 1 decimal place.` : `The space diagonal is ${shown} cm.`];
      spec = { kind: id, length, width, height, asked: askAngle ? "angle" : "diagonal", diagonal, angle };
      solutionDiagram = graph(`<polygon points="92,92 248,92 298,126 142,126" class="v-outline"/>` +
        `<polygon points="142,126 298,126 298,211 142,211" class="v-region"/>` +
        `<polygon points="92,92 142,126 142,211 92,177" class="v-fill"/>` +
        S.segment(92, 92, 298, 211, true, "v-rise-run") +
        label(askAngle ? `Angle = ${shown}°` : `Diagonal = ${shown} cm`, 248) +
        S.text(200, 234, "Diagram NOT accurately drawn", 11),
      "The cuboid's space diagonal is annotated with the result",
      "The three-dimensional Pythagoras calculation uses all three labelled lengths.");
    } else if (id === "compound-measures") {
      const measure = rng() < 0.5 ? "density" : "pressure";
      const unitRate = rng.int(2, 12), base = rng.int(2, 12), total = unitRate * base;
      const isDensity = measure === "density";
      const firstLabel = isDensity ? "mass" : "force", secondLabel = isDensity ? "volume" : "area";
      const firstUnit = isDensity ? "kg" : "N", secondUnit = isDensity ? "m³" : "m²";
      const resultUnit = isDensity ? "kg/m³" : "N/m²";
      diagram = graph(`<rect x="98" y="74" width="204" height="126" rx="12" class="v-region"/>` +
        label(`${firstLabel}: ${total} ${firstUnit}`, 108) +
        label(`${secondLabel}: ${base} ${secondUnit}`, 148) +
        label(`${measure[0].toUpperCase() + measure.slice(1)} = ? ${resultUnit}`, 188),
      `A labelled ${measure} calculation`,
      "The given total is divided by the matching area or volume.");
      answer = String(unitRate);
      prompt = `A ${isDensity ? "material has mass" : "surface has force"} ${total} ${firstUnit} and ${secondLabel} ${base} ${secondUnit}. Find the ${measure}.`;
      hint = `Use ${measure} = ${firstLabel} ÷ ${secondLabel}.`;
      explainSteps = [`Write ${measure} = ${firstLabel} ÷ ${secondLabel}.`,
        `${total} ÷ ${base} = ${unitRate}.`, `The ${measure} is ${unitRate} ${resultUnit}.`];
      spec = { kind: id, measure, total, base, answer: unitRate };
      solutionDiagram = graph(`<rect x="98" y="74" width="204" height="126" rx="12" class="v-region"/>` +
        label(`${total} ÷ ${base} = ${unitRate} ${resultUnit}`, 145) +
        label(`${measure[0].toUpperCase() + measure.slice(1)} = ${unitRate} ${resultUnit}`, 188),
      `The ${measure} calculation is shown on the diagram`,
      "Divide the measured mass or force by the volume or area.");
    } else if (id === "two-way-tables") {
      const cells = Array.from({ length: 4 }, () => rng.int(2, 15));
      const rows = [cells[0] + cells[1], cells[2] + cells[3]];
      const columns = [cells[0] + cells[2], cells[1] + cells[3]];
      const total = rows[0] + rows[1];
      const asked = rng.pick(["rowA", "rowB", "columnA", "total", "cell"]);
      const answerValue = asked === "rowA" ? rows[0] : asked === "rowB" ? rows[1] :
        asked === "columnA" ? columns[0] : asked === "total" ? total : cells[0];
      const table = `<rect x="116" y="74" width="168" height="120" class="v-outline"/>` +
        [1, 2].map(index => S.segment(116, 74 + index * 40, 284, 74 + index * 40, false, "v-grid")).join("") +
        [1, 2].map(index => S.segment(116 + index * 56, 74, 116 + index * 56, 194, false, "v-grid")).join("") +
        S.text(170, 66, "A", 13) + S.text(226, 66, "B", 13) +
        S.text(95, 105, "Row 1", 11) + S.text(95, 145, "Row 2", 11) +
        cells.map((value, index) => S.text(144 + (index % 2) * 56, 103 + Math.floor(index / 2) * 40, String(value), 14)).join("");
      const askText = { rowA: "Find the total in Row 1.", rowB: "Find the total in Row 2.",
        columnA: "Find the total in column A.", total: "Find the grand total.", cell: "How many are in Row 1 and column A?" }[asked];
      diagram = graph(table, "A two-by-two frequency table with four labelled counts",
        "The four inner cells contain the counts; totals can be found by adding rows or columns.");
      answer = String(answerValue);
      prompt = askText;
      hint = "Add the relevant row or column cells. For the grand total, add all four cells.";
      explainSteps = [`The four counts are ${cells.join(", ")}.`, asked === "cell" ?
        `The requested cell is the first count, ${cells[0]}.` : `Add the requested cells to get ${answerValue}.`,
      `The answer is ${answerValue}.`];
      spec = { kind: id, cells, rows, columns, total, asked, answer: answerValue };
      solutionDiagram = graph(table + label(`${askText} Answer = ${answerValue}`, 238),
        "The two-way table is annotated with the requested total",
        "The answer is read from one cell or calculated by summing its row or column.");
    } else if (id === "capture-recapture") {
      const marked = rng.int(2, 8) * 10, secondSample = rng.int(4, 12) * 5;
      const product = marked * secondSample;
      const candidates = [5, 10, 15, 20, 25, 30, 40].filter(value =>
        value <= Math.min(marked, secondSample) && product % value === 0);
      const recaptured = rng.pick(candidates), estimate = product / recaptured;
      diagram = graph(`<circle cx="128" cy="120" r="62" class="v-region"/>` +
        `<circle cx="220" cy="120" r="62" class="v-fill"/>` +
        label(`Marked first: ${marked}`, 38) + label(`Second sample: ${secondSample}`, 204) +
        S.text(182, 112, `Recaptured: ${recaptured}`, 12),
      "Two animal samples with the recaptured marked animals shown in the overlap",
      "The overlap counts animals that were marked in the first sample and caught again.");
      answer = String(estimate);
      prompt = `First, ${marked} animals are marked and released. Later, ${secondSample} are caught, and ${recaptured} are marked. Estimate the population.`;
      hint = "Estimated population = first marked × second sample ÷ marked animals recaptured.";
      explainSteps = [`Use estimate = ${marked} × ${secondSample} ÷ ${recaptured}.`,
        `${marked} × ${secondSample} = ${product}.`, `${product} ÷ ${recaptured} = ${estimate} animals.`];
      spec = { kind: id, marked, secondSample, recaptured, estimate };
      solutionDiagram = graph(`<circle cx="128" cy="120" r="62" class="v-region"/>` +
        `<circle cx="220" cy="120" r="62" class="v-fill"/>` +
        label(`${marked} × ${secondSample} ÷ ${recaptured} = ${estimate}`, 220),
      "The capture-recapture estimate is annotated",
      "Multiply the two sample counts and divide by the recaptured marked count.");
    }

    return {
      type, seed: rng.seed, prompt, promptMatrix, promptForTutor: promptMatrix ? prompt.replace("[[matrix]]",
        `[[${promptMatrix[0].map(value => String(value).replace(/-/g, "−")).join(", ")}], [${promptMatrix[1].map(value => String(value).replace(/-/g, "−")).join(", ")}]]`) : prompt,
      answerPlaceholder, diagram, answer, accept: answerAccept, tolerance: 0.02, clickTarget,
      explainSteps, hint, solutionDiagram, spec, marks: 1
    };
  };

  window.VisualAdvanced = { make };
  window.VISUAL_GENERATORS = window.VISUAL_GENERATORS || [];
  window.VISUAL_GENERATORS.push({
    id: "tangent-slope", title: "Tangent slope at a point", area: "Calculus",
    skill: "Tangent lines and derivatives", tier: "H", level: "Hard",
    make: rng => window.VisualAdvanced.make("tangent-slope", rng)
  });
}());
