import { Vec2D } from "./base";

/**
 * Simple interface for a 2D point
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Extended path information including style and transformation
 */
export interface PathInfo {
  /** SVG path data (d attribute) */
  data: string;
  /** Fill color or style */
  fill: string;
  /** Stroke color or style */
  stroke: string;
  /** Stroke width */
  strokeWidth: number;
  /** Transformation matrix as string */
  transform: string;
  /** Parsed transformation matrix (if available) */
  transformMatrix?: DOMMatrix;
  /** Translation vector extracted from transform */
  translation?: Point2D;
  /** Bounding box of the path */
  bbox?: DOMRect;
}

/* The same, after parsing */
export interface ParsedPathInfo {
  /** SVG path commands (d attribute) */
  commands: Array<{ type: string; values: number[] }>;
  /** Fill color or style */
  fill: string;
  /** Stroke color or style */
  stroke: string;
  /** Stroke width */
  strokeWidth: number;
  /** Transformation matrix as string */
  transform: string;
  /** Parsed transformation matrix (if available) */
  transformMatrix?: DOMMatrix;
  /** Translation vector extracted from transform */
  translation?: Point2D;
  /** Bounding box of the path */
  bbox?: DOMRect;
}

/* Applies path options to the context before drawing that path.*/
export function applyPathInfo(
  ctx: CanvasRenderingContext2D,
  pathInfo: ParsedPathInfo,
) {
  ctx.fillStyle = pathInfo.fill;
  ctx.strokeStyle = pathInfo.stroke;
  ctx.lineWidth = Number(pathInfo.strokeWidth);
  // TODO Transformation matrix
  if (pathInfo.translation) {
    ctx.translate(pathInfo.translation.x, pathInfo.translation.y);
  }
}
export function unapplyPathInfo(
  ctx: CanvasRenderingContext2D,
  pathInfo: ParsedPathInfo,
) {
  // TODO Inverse transformation matrix
  if (pathInfo.translation) {
    ctx.translate(-pathInfo.translation.x, -pathInfo.translation.y);
  }
}

/**
 * Simple SVG loader utility
 */
export class SimpleSVGLoader {
  /**
   * Load SVG from a URL
   */
  static async loadFromURL(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load SVG: ${response.status}`);
    }
    return await response.text();
  }

  /**
   * Load SVG from a File object (from file input)
   */
  static async loadFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  /**
   * Parse SVG string to DOM element
   */
  static parseSVG(svgString: string): SVGElement {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");

    // Check for parsing errors
    const error = doc.querySelector("parsererror");
    if (error) {
      throw new Error("Failed to parse SVG");
    }

    return doc.documentElement as SVGElement;
  }

  /**
   * Extract all path data from SVG
   */
  static extractPaths(svgElement: SVGElement): PathInfo[] {
    const paths: PathInfo[] = [];

    // Helper function to get computed style
    const getStyle = (element: Element, property: string): string => {
      const style = window.getComputedStyle(element);
      return style.getPropertyValue(property);
    };

    // Helper function to parse transformation
    const parseTransform = (
      transform: string,
    ): { matrix?: DOMMatrix; translation?: Point2D } => {
      if (!transform) return {};

      try {
        // Create a temporary SVG element to parse transform
        const svgNS = "http://www.w3.org/2000/svg";
        const tempSvg = document.createElementNS(svgNS, "svg");
        const tempPath = document.createElementNS(svgNS, "path");
        tempSvg.appendChild(tempPath);
        document.body.appendChild(tempSvg);

        // Apply transform
        tempPath.setAttribute("transform", transform);

        // Get transformation matrix
        const matrix = tempPath.getCTM();

        // Remove temporary elements
        document.body.removeChild(tempSvg);

        if (matrix) {
          return {
            matrix,
            translation: { x: matrix.e, y: matrix.f },
          };
        }
      } catch (error) {
        console.warn("Failed to parse transform:", transform, error);
      }

      return {};
    };

    // Extract paths from SVG element
    const extractPathsFromElement = (
      element: Element,
      parentTransform: string = "",
    ) => {
      // Get current element's transform
      const elementTransform = element.getAttribute("transform") || "";
      const combinedTransform = parentTransform
        ? elementTransform
          ? `${parentTransform} ${elementTransform}`
          : parentTransform
        : elementTransform;

      // Check if this element is a path
      if (element.tagName === "path") {
        const pathData = element.getAttribute("d");
        if (pathData) {
          // Get styles
          const fill =
            element.getAttribute("fill") ||
            getStyle(element, "fill") ||
            "black";
          const stroke =
            element.getAttribute("stroke") ||
            getStyle(element, "stroke") ||
            "black";

          // Remove units (px, em, etc.) from stroke width
          let strokeWidth =
            element.getAttribute("stroke-width") ||
            getStyle(element, "stroke-width") ||
            "1";
          strokeWidth = strokeWidth.replace("px", "");

          // Parse transformation
          const transformInfo = parseTransform(combinedTransform);

          // Get bounding box if possible
          let bbox: DOMRect | undefined;
          try {
            if (element instanceof SVGPathElement) {
              bbox = element.getBBox();
            }
          } catch (error) {
            // Some paths might not have a valid bounding box
          }

          paths.push({
            data: pathData,
            fill: fill,
            stroke: stroke,
            strokeWidth: Number(strokeWidth),
            transform: combinedTransform,
            transformMatrix: transformInfo.matrix,
            translation: transformInfo.translation,
            bbox,
          });
        }
      }

      // Recursively process child elements (including groups)
      const children = element.children;
      for (let i = 0; i < children.length; i++) {
        extractPathsFromElement(children[i], combinedTransform);
      }
    };

    // Start extraction from root
    extractPathsFromElement(svgElement);

    return paths;
  }

  // Draw the first N commands in a path
  // Types (lowercase versions are relative coordinates): MLHVCSQTAZmlhvcsqtaz
  // M = Move To
  // L = Line To
  // H = Horizontal line to
  // V = Vertical line to
  // C = Cubic Bezier curve, specified as H1, H2, A
  // S = Smooth cubic Bezier curve to, specified as H2, A (if the last move was a C,
  // first handle is the reflection of the last handle over the current point,
  // and otherwise it's the current point)
  // Q = Quadratic Bezier curve to, specified as H, A
  // T = Smooth quadratic Bezier curve to, specified as A
  // A = Arc curve (rx, ry, angle)
  // Z = Close (connect to initial point with straight line)
  static drawPartial(
    ctx: CanvasRenderingContext2D,
    parsedPathInfoAll: Array<ParsedPathInfo>,
    numCommands: number,
  ) {
    // Keep track of current ctx position and previous handles
    let x = 0;
    let y = 0;
    let h1_x = 0;
    let h1_y = 0;
    let h2_x = 0;
    let h2_y = 0;
    ctx.beginPath();

    // Current command
    let path_info = parsedPathInfoAll[0];
    let i = 0;
    let j = 0;
    while (i < parsedPathInfoAll.length) {
      path_info = parsedPathInfoAll[i];
      i++;
      applyPathInfo(ctx, path_info);
      for (let cmd of path_info.commands) {
        if (j >= numCommands) {
          if (cmd.type != "Z") {
            ctx.stroke();
          }
          unapplyPathInfo(ctx, path_info);
          return;
        }
        if (cmd.type == "M") {
          [x, y] = cmd.values;
          ctx.moveTo(x, y);
        } else if (cmd.type == "L") {
          [x, y] = cmd.values;
          ctx.lineTo(x, y);
        } else if (cmd.type == "H") {
          y = cmd.values[0];
          ctx.lineTo(x, y);
        } else if (cmd.type == "V") {
          x = cmd.values[0];
          ctx.lineTo(x, y);
        } else if (cmd.type == "C") {
          [h1_x, h1_y] = [cmd.values[0], cmd.values[1]];
          [h2_x, h2_y] = [cmd.values[2], cmd.values[3]];
          [x, y] = [cmd.values[4], cmd.values[5]];
          ctx.bezierCurveTo(h1_x, h1_y, h2_x, h2_y, x, y);
        } else if (cmd.type == "S") {
          [h1_x, h1_y] = [2 * x - h2_x, 2 * y - h2_y];
          [h2_x, h2_y] = [cmd.values[0], cmd.values[1]];
          [x, y] = [cmd.values[2], cmd.values[3]];
          ctx.bezierCurveTo(h1_x, h1_y, h2_x, h2_y, x, y);
        } else if (cmd.type == "Q") {
          [h2_x, h2_y] = [cmd.values[0], cmd.values[1]];
          [x, y] = [cmd.values[2], cmd.values[3]];
          ctx.quadraticCurveTo(h2_x, h2_y, x, y);
        } else if (cmd.type == "T") {
          [h2_x, h2_y] = [2 * x - h2_x, 2 * y - h2_y];
          [x, y] = [cmd.values[0], cmd.values[1]];
          ctx.quadraticCurveTo(h2_x, h2_y, x, y);
        } else if (cmd.type == "A") {
          // TODO
          console.log("Type A", cmd.values);
        } else if (cmd.type == "Z") {
          ctx.closePath();
          ctx.fill();
        }
        j++;
      }
      unapplyPathInfo(ctx, path_info);
    }
  }

  /**
   * Convert SVG path to points (simplified - only handles M, L, H, V, Z commands)
   */
  static pathToPoints(pathData: string): Point2D[] {
    const points: Point2D[] = [];
    const commands = this.parsePathCommands(pathData);

    let x = 0;
    let y = 0;

    for (const cmd of commands) {
      switch (cmd.type.toUpperCase()) {
        case "M": // Move to
          if (cmd.values.length >= 2) {
            x = cmd.type === "M" ? cmd.values[0] : x + cmd.values[0];
            y = cmd.type === "M" ? cmd.values[1] : y + cmd.values[1];
            points.push({ x, y });
          }
          break;

        case "L": // Line to
          if (cmd.values.length >= 2) {
            x = cmd.type === "L" ? cmd.values[0] : x + cmd.values[0];
            y = cmd.type === "L" ? cmd.values[1] : y + cmd.values[1];
            points.push({ x, y });
          }
          break;

        case "H": // Horizontal line
          if (cmd.values.length >= 1) {
            x = cmd.type === "H" ? cmd.values[0] : x + cmd.values[0];
            points.push({ x, y });
          }
          break;

        case "V": // Vertical line
          if (cmd.values.length >= 1) {
            y = cmd.type === "V" ? cmd.values[0] : y + cmd.values[0];
            points.push({ x, y });
          }
          break;

        case "Z": // Close path
          if (points.length > 0) {
            points.push({ ...points[0] });
          }
          break;
      }
    }

    return points;
  }

  /**
   * Parse SVG path commands
   */
  private static parsePathCommands(
    pathData: string,
  ): Array<{ type: string; values: number[] }> {
    const commands: Array<{ type: string; values: number[] }> = [];
    const regex = /([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g;
    let match;

    while ((match = regex.exec(pathData)) !== null) {
      const type = match[1];
      const values = match[2]
        .trim()
        .split(/[\s,]+/)
        .filter((v) => v)
        .map(parseFloat);

      commands.push({ type, values });
    }

    return commands;
  }
  static parsePathInfo(pathInfo: PathInfo): ParsedPathInfo {
    return {
      commands: this.parsePathCommands(pathInfo.data),
      fill: pathInfo.fill,
      stroke: pathInfo.stroke,
      strokeWidth: pathInfo.strokeWidth,
      transform: pathInfo.transform,
      transformMatrix: pathInfo.transformMatrix as DOMMatrix | undefined,
      translation: pathInfo.translation as Point2D | undefined,
      bbox: pathInfo.bbox as DOMRect | undefined,
    };
  }

  /**
   * Draw SVG to canvas
   */
  static drawToCanvas(
    canvas: HTMLCanvasElement,
    svgString: string,
    x: number = 0,
    y: number = 0,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No canvas context"));
          return;
        }
        ctx.drawImage(img, x, y);
        URL.revokeObjectURL(url);
        resolve();
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load SVG"));
      };

      img.src = url;
    });
  }
}

/**
 * Example usage: Load SVG and get points
 */
export async function loadSVGAndGetPoints(url: string): Promise<Point2D[]> {
  // 1. Load SVG
  const svgString = await SimpleSVGLoader.loadFromURL(url);

  // 2. Parse to DOM
  const svgElement = SimpleSVGLoader.parseSVG(svgString);

  // 3. Extract paths
  const paths = SimpleSVGLoader.extractPaths(svgElement);

  // 4. Convert to points
  const allPoints: Point2D[] = [];
  for (const path of paths) {
    const points = SimpleSVGLoader.pathToPoints(path);
    allPoints.push(...points);
  }

  return allPoints;
}

/**
 * Example usage: Create file input for SVG
 */
export function createSVGFileInput(
  onLoad: (svgString: string, points: Point2D[]) => void,
): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".svg";

  input.addEventListener("change", async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      // Load SVG
      const svgString = await SimpleSVGLoader.loadFromFile(file);

      // Get points
      const svgElement = SimpleSVGLoader.parseSVG(svgString);
      const paths = SimpleSVGLoader.extractPaths(svgElement);
      const points: Point2D[] = [];
      for (const path of paths) {
        points.push(...SimpleSVGLoader.pathToPoints(path));
      }

      onLoad(svgString, points);
    } catch (error) {
      console.error("Error loading SVG:", error);
    }
  });

  return input;
}
