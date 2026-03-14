// math-applets/src/lib/text_to_svg.ts

/**
 * Interface for a 2D point
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Interface for SVG path command
 */
export interface SVGPathCommand {
  type: string;
  values: number[];
}

/**
 * Options for text rendering
 */
export interface TextToSVGOptions {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  width?: number;
  height?: number;
  padding?: number;
  precision?: number; // Precision for point sampling
}

/**
 * Default options for text rendering
 */
const DEFAULT_OPTIONS: TextToSVGOptions = {
  fontSize: 72,
  fontFamily: "Arial, sans-serif",
  fontWeight: "normal",
  fontStyle: "normal",
  fillColor: "#000000",
  strokeColor: "none",
  strokeWidth: 0,
  width: 800,
  height: 200,
  padding: 20,
  precision: 1.0, // Lower values = more points
};

/**
 * Renders text to an SVG string
 * @param text The text to render
 * @param options Rendering options
 * @returns SVG string containing the text
 */
export function textToSVG(
  text: string,
  options: TextToSVGOptions = {},
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Create a canvas element to measure and render text
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // Set canvas dimensions
  canvas.width = opts.width!;
  canvas.height = opts.height!;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set font properties
  const fontStyle = opts.fontStyle === "italic" ? "italic" : "normal";
  const fontWeight = opts.fontWeight || "normal";
  const fontSize = opts.fontSize!;
  const fontFamily = opts.fontFamily!;

  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = opts.fillColor!;
  ctx.strokeStyle = opts.strokeColor!;
  ctx.lineWidth = opts.strokeWidth!;

  // Measure text
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize; // Approximate height

  // Calculate position to center text
  const x = (canvas.width - textWidth) / 2;
  const y = (canvas.height + textHeight) / 2 - metrics.actualBoundingBoxDescent;

  // Draw text
  if (opts.strokeWidth! > 0 && opts.strokeColor !== "none") {
    ctx.strokeText(text, x, y);
  }
  ctx.fillText(text, x, y);

  // Get image data and trace outlines
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const paths = traceImageDataToPaths(imageData, opts.precision!);

  // Create SVG with paths
  const svgPaths = paths
    .map((path) => `M${path.map((p) => `${p.x},${p.y}`).join(" L")} Z`)
    .join(" ");

  return `<?xml version="1.0" encoding="UTF-8"?><svg width="${opts.width}" height="${opts.height}" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0, ${opts.height}) scale(1, -1)"><path d="${svgPaths}" fill="${opts.fillColor}" stroke="${opts.strokeColor}" stroke-width="${opts.strokeWidth}"/></g></svg>`;
}

/**
 * Traces image data to create vector paths
 * @param imageData Canvas image data
 * @param precision Sampling precision (lower = more points)
 * @returns Array of point arrays representing paths
 */
function traceImageDataToPaths(
  imageData: ImageData,
  precision: number,
): Point2D[][] {
  const paths: Point2D[][] = [];
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // Create a visited map
  const visited = new Array(width * height).fill(false);

  // Threshold for considering a pixel as part of the text
  const threshold = 128;

  // Find all connected components (letters/parts of letters)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];

      if (alpha > threshold && !visited[y * width + x]) {
        // Found a new connected component
        const path = traceContour(
          x,
          y,
          width,
          height,
          data,
          visited,
          threshold,
          precision,
        );
        if (path.length > 0) {
          paths.push(path);
        }
      }
    }
  }

  return paths;
}

/**
 * Traces the contour of a connected component using marching squares algorithm
 */
function traceContour(
  startX: number,
  startY: number,
  width: number,
  height: number,
  data: Uint8ClampedArray,
  visited: boolean[],
  threshold: number,
  precision: number,
): Point2D[] {
  const path: Point2D[] = [];
  const stack: [number, number][] = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;

    if (x < 0 || x >= width || y < 0 || y >= height) {
      continue;
    }

    const index = y * width + x;
    if (visited[index]) {
      continue;
    }

    const pixelIndex = index * 4;
    const alpha = data[pixelIndex + 3];

    if (alpha > threshold) {
      visited[index] = true;
      path.push({ x, y });

      // Add neighbors (8-directional for better contour following)
      if (precision <= 1.0) {
        // High precision: check all 8 directions
        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
        stack.push([x + 1, y + 1]);
        stack.push([x - 1, y + 1]);
        stack.push([x + 1, y - 1]);
        stack.push([x - 1, y - 1]);
      } else {
        // Lower precision: only check 4 directions
        stack.push([x + Math.round(precision), y]);
        stack.push([x - Math.round(precision), y]);
        stack.push([x, y + Math.round(precision)]);
        stack.push([x, y - Math.round(precision)]);
      }
    }
  }

  // Simplify the path using Douglas-Peucker algorithm
  return simplifyPath(path, precision * 2);
}

/**
 * Simplifies a path using the Douglas-Peucker algorithm
 */
function simplifyPath(path: Point2D[], tolerance: number): Point2D[] {
  if (path.length <= 2) {
    return path;
  }

  // Find the point with the maximum distance
  let maxDistance = 0;
  let maxIndex = 0;
  const first = path[0];
  const last = path[path.length - 1];

  for (let i = 1; i < path.length - 1; i++) {
    const distance = perpendicularDistance(path[i], first, last);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    const left = simplifyPath(path.slice(0, maxIndex + 1), tolerance);
    const right = simplifyPath(path.slice(maxIndex), tolerance);

    // Combine results, removing duplicate point at maxIndex
    return left.slice(0, -1).concat(right);
  } else {
    // All points are within tolerance, return only first and last
    return [first, last];
  }
}

/**
 * Calculates the perpendicular distance from a point to a line segment
 */
function perpendicularDistance(
  point: Point2D,
  lineStart: Point2D,
  lineEnd: Point2D,
): number {
  const area = Math.abs(
    (lineEnd.y - lineStart.y) * point.x -
      (lineEnd.x - lineStart.x) * point.y +
      lineEnd.x * lineStart.y -
      lineEnd.y * lineStart.x,
  );

  const lineLength = Math.sqrt(
    Math.pow(lineEnd.x - lineStart.x, 2) + Math.pow(lineEnd.y - lineStart.y, 2),
  );

  return area / lineLength;
}

/**
 * Parses an SVG string and extracts path data as points
 * @param svgString The SVG string to parse
 * @param sampleDistance Distance between sampled points
 * @returns Array of points from the SVG paths
 */
export function svgToPoints(
  svgString: string,
  sampleDistance: number = 1.0,
): Point2D[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svgElement = doc.documentElement;

  if (!svgElement || svgElement.tagName !== "svg") {
    throw new Error("Invalid SVG string");
  }

  // Find all path elements
  const paths = svgElement.querySelectorAll("path");
  const allPoints: Point2D[] = [];

  paths.forEach((path) => {
    const d = path.getAttribute("d");
    if (d) {
      const pathPoints = parseSVGPath(d, sampleDistance);
      allPoints.push(...pathPoints);
    }
  });

  return allPoints;
}

/**
 * Parses SVG path data and samples points along the path
 */
function parseSVGPath(pathData: string, sampleDistance: number): Point2D[] {
  const points: Point2D[] = [];
  const commands = parsePathCommands(pathData);

  let currentX = 0;
  let currentY = 0;

  for (const command of commands) {
    const { type, values } = command;

    switch (type) {
      case "M": // Move to (absolute)
        if (values.length >= 2) {
          currentX = values[0];
          currentY = values[1];
          points.push({ x: currentX, y: currentY });
        }
        break;

      case "m": // Move to (relative)
        if (values.length >= 2) {
          currentX += values[0];
          currentY += values[1];
          points.push({ x: currentX, y: currentY });
        }
        break;

      case "L": // Line to (absolute)
        if (values.length >= 2) {
          currentX = values[0];
          currentY = values[1];
          points.push({ x: currentX, y: currentY });
        }
        break;

      case "l": // Line to (relative)
        if (values.length >= 2) {
          currentX += values[0];
          currentY += values[1];
          points.push({ x: currentX, y: currentY });
        }
        break;

      case "H": // Horizontal line to (absolute)
        if (values.length >= 1) {
          currentX = values[0];
          points.push({ x: currentX, y: currentY });
        }
        break;

      case "h": // Horizontal line to (relative)
        if (values.length >= 1) {
          currentX += values[0];
          points.push({ x: currentX, y: currentY });
        }
        break;

      case "V": // Vertical line to (absolute)
        if (values.length >= 1) {
          currentY = values[0];
          points.push({ x: currentX, y: currentY });
        }
        break;

      case "v": // Vertical line to (relative)
        if (values.length >= 1) {
          currentY += values[0];
          points.push({ x: currentX, y: currentY });
        }
        break;

      case "C": // Cubic Bezier curve (absolute)
        if (values.length >= 6) {
          const curvePoints = sampleCubicBezier(
            { x: currentX, y: currentY },
            { x: values[0], y: values[1] },
            { x: values[2], y: values[3] },
            { x: values[4], y: values[5] },
            sampleDistance,
          );
          points.push(...curvePoints.slice(1)); // Skip first point (already added)
          currentX = values[4];
          currentY = values[5];
        }
        break;

      case "c": // Cubic Bezier curve (relative)
        if (values.length >= 6) {
          const curvePoints = sampleCubicBezier(
            { x: currentX, y: currentY },
            { x: currentX + values[0], y: currentY + values[1] },
            { x: currentX + values[2], y: currentY + values[3] },
            { x: currentX + values[4], y: currentY + values[5] },
            sampleDistance,
          );
          points.push(...curvePoints.slice(1));
          currentX += values[4];
          currentY += values[5];
        }
        break;

      case "Z":
      case "z": // Close path
        // Connect back to first point
        if (points.length > 0) {
          points.push({ ...points[0] });
        }
        break;
    }
  }

  return points;
}

/**
 * Parses SVG path commands from a path data string
 */
function parsePathCommands(pathData: string): SVGPathCommand[] {
  const commands: SVGPathCommand[] = [];
  const commandRegex = /([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g;
  let match;

  while ((match = commandRegex.exec(pathData)) !== null) {
    const type = match[1];
    const valuesStr = match[2].trim();

    if (valuesStr) {
      // Parse numbers (can be separated by commas, spaces, or both)
      const values = valuesStr
        .split(/[\s,]+/)
        .filter((v) => v !== "")
        .map(parseFloat);

      commands.push({ type, values });
    } else {
      commands.push({ type, values: [] });
    }
  }

  return commands;
}

/**
 * Samples points along a cubic Bezier curve
 */
function sampleCubicBezier(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  sampleDistance: number,
): Point2D[] {
  const points: Point2D[] = [p0];

  // Estimate curve length
  const estimatedLength = estimateBezierLength(p0, p1, p2, p3);
  const numSamples = Math.max(2, Math.ceil(estimatedLength / sampleDistance));

  for (let i = 1; i <= numSamples; i++) {
    const t = i / numSamples;
    const point = cubicBezierPoint(p0, p1, p2, p3, t);
    points.push(point);
  }

  return points;
}

/**
 * Estimates the length of a cubic Bezier curve
 */
function estimateBezierLength(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
): number {
  // Simple estimation using chord length and control point distances
  const chord = Math.sqrt(Math.pow(p3.x - p0.x, 2) + Math.pow(p3.y - p0.y, 2));

  const controlNet =
    Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)) +
    Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) +
    Math.sqrt(Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2));

  return (chord + controlNet) / 2;
}

/**
 * Calculates a point on a cubic Bezier curve at parameter t
 */
function cubicBezierPoint(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  t: number,
): Point2D {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;

  const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;

  return { x, y };
}

/**
 * Main function: converts text to points
 * @param text The text to convert
 * @param options Rendering options
 * @param sampleDistance Distance between sampled points
 * @returns Array of points representing the text
 */
export function textToPoints(
  text: string,
  options: TextToSVGOptions = {},
  sampleDistance: number = 1.0,
): Point2D[] {
  // First, render text to SVG
  const svg = textToSVG(text, options);

  // Then parse SVG to get points
  return svgToPoints(svg, sampleDistance);
}
