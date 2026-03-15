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
      const values = (match[2].trim().match(/-?\d+(?:\.\d+)?/g) || []).map(
        Number,
      );

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

/**
 * Extended path information for MathJax SVG
 */
export interface MathJaxPathInfo {
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
  /** Element type: 'path', 'rect', 'circle', etc. */
  elementType: string;
  /** For rectangles: width and height */
  rectWidth?: number;
  rectHeight?: number;
  /** For circles: radius */
  radius?: number;
  /** Semantic information from MathJax */
  semanticType?: string;
  semanticRole?: string;
  latex?: string;
}

/**
 * Extract all graphical elements from MathJax SVG with proper handling
 */
export function extractMathJaxPaths(svgElement: SVGElement): MathJaxPathInfo[] {
  const paths: MathJaxPathInfo[] = [];

  // First, collect all path definitions from <defs>
  const defsMap = new Map<string, string>();
  const defs = svgElement.querySelector("defs");
  if (defs) {
    const defPaths = defs.querySelectorAll("path");
    defPaths.forEach((defPath) => {
      const id = defPath.getAttribute("id");
      const d = defPath.getAttribute("d");
      if (id && d) {
        defsMap.set(id, d);
      }
    });
  }

  // Helper to get computed style
  const getStyle = (element: Element, property: string): string => {
    const style = window.getComputedStyle(element);
    return style.getPropertyValue(property);
  };

  // Helper to parse transformation
  const parseTransform = (
    transform: string,
  ): { matrix?: DOMMatrix; translation?: Point2D } => {
    if (!transform) return {};

    try {
      const svgNS = "http://www.w3.org/2000/svg";
      const tempSvg = document.createElementNS(svgNS, "svg");
      const tempElement = document.createElementNS(svgNS, "g");
      tempSvg.appendChild(tempElement);
      document.body.appendChild(tempSvg);

      tempElement.setAttribute("transform", transform);
      const matrix = tempElement.getCTM();

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

  // Extract elements recursively
  const extractElements = (
    element: Element,
    parentTransform: string = "",
    depth: number = 0,
  ) => {
    // Get current element's transform
    const elementTransform = element.getAttribute("transform") || "";
    const combinedTransform = parentTransform
      ? elementTransform
        ? `${parentTransform} ${elementTransform}`
        : parentTransform
      : elementTransform;

    // Get semantic information
    const semanticType = element.getAttribute("data-semantic-type");
    const semanticRole = element.getAttribute("data-semantic-role");
    const latex = element.getAttribute("data-latex");

    // Handle different element types
    const tagName = element.tagName.toLowerCase();

    if (tagName === "use") {
      // Handle <use> elements that reference path definitions
      const href =
        element.getAttribute("xlink:href") || element.getAttribute("href");
      if (href && href.startsWith("#")) {
        const defId = href.substring(1);
        const pathData = defsMap.get(defId);

        if (pathData) {
          // Get styles from parent or element itself
          const parent = element.parentElement;
          const fill =
            element.getAttribute("fill") ||
            (parent ? parent.getAttribute("fill") : "") ||
            getStyle(element, "fill") ||
            "black";
          const stroke =
            element.getAttribute("stroke") ||
            (parent ? parent.getAttribute("stroke") : "") ||
            getStyle(element, "stroke") ||
            "black";

          let strokeWidth =
            element.getAttribute("stroke-width") ||
            (parent ? parent.getAttribute("stroke-width") : "") ||
            getStyle(element, "stroke-width") ||
            "0";
          strokeWidth = strokeWidth.replace("px", "");

          const transformInfo = parseTransform(combinedTransform);

          paths.push({
            data: pathData,
            fill,
            stroke,
            strokeWidth: Number(strokeWidth),
            transform: combinedTransform,
            transformMatrix: transformInfo.matrix,
            translation: transformInfo.translation,
            elementType: "path",
            semanticType,
            semanticRole,
            latex,
          });
        }
      }
    } else if (tagName === "path") {
      // Handle direct <path> elements
      const pathData = element.getAttribute("d");
      if (pathData) {
        const fill =
          element.getAttribute("fill") || getStyle(element, "fill") || "black";
        const stroke =
          element.getAttribute("stroke") ||
          getStyle(element, "stroke") ||
          "black";

        let strokeWidth =
          element.getAttribute("stroke-width") ||
          getStyle(element, "stroke-width") ||
          "0";
        strokeWidth = strokeWidth.replace("px", "");

        const transformInfo = parseTransform(combinedTransform);

        // Try to get bounding box
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
          fill,
          stroke,
          strokeWidth: Number(strokeWidth),
          transform: combinedTransform,
          transformMatrix: transformInfo.matrix,
          translation: transformInfo.translation,
          bbox,
          elementType: "path",
          semanticType,
          semanticRole,
          latex,
        });
      }
    } else if (tagName === "rect") {
      // Handle <rect> elements (like fraction bars)
      const x = parseFloat(element.getAttribute("x") || "0");
      const y = parseFloat(element.getAttribute("y") || "0");
      const width = parseFloat(element.getAttribute("width") || "0");
      const height = parseFloat(element.getAttribute("height") || "0");

      if (width > 0 && height > 0) {
        // Convert rectangle to path data
        const pathData = `M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z`;

        const fill =
          element.getAttribute("fill") || getStyle(element, "fill") || "black";
        const stroke =
          element.getAttribute("stroke") ||
          getStyle(element, "stroke") ||
          "black";

        let strokeWidth =
          element.getAttribute("stroke-width") ||
          getStyle(element, "stroke-width") ||
          "0";
        strokeWidth = strokeWidth.replace("px", "");

        const transformInfo = parseTransform(combinedTransform);

        // Get bounding box
        let bbox: DOMRect | undefined;
        try {
          if (element instanceof SVGRectElement) {
            bbox = element.getBBox();
          }
        } catch (error) {
          // Fallback to calculated bbox
          bbox = new DOMRect(x, y, width, height);
        }

        paths.push({
          data: pathData,
          fill,
          stroke,
          strokeWidth: Number(strokeWidth),
          transform: combinedTransform,
          transformMatrix: transformInfo.matrix,
          translation: transformInfo.translation,
          bbox,
          elementType: "rect",
          rectWidth: width,
          rectHeight: height,
          semanticType,
          semanticRole,
          latex,
        });
      }
    } else if (tagName === "circle") {
      // Handle <circle> elements
      const cx = parseFloat(element.getAttribute("cx") || "0");
      const cy = parseFloat(element.getAttribute("cy") || "0");
      const r = parseFloat(element.getAttribute("r") || "0");

      if (r > 0) {
        // Convert circle to path data (approximation with 8 segments)
        const segments = 8;
        let pathData = `M${cx + r},${cy}`;
        for (let i = 1; i <= segments; i++) {
          const angle = (i * 2 * Math.PI) / segments;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          pathData += ` L${x},${y}`;
        }
        pathData += " Z";

        const fill =
          element.getAttribute("fill") || getStyle(element, "fill") || "black";
        const stroke =
          element.getAttribute("stroke") ||
          getStyle(element, "stroke") ||
          "black";

        let strokeWidth =
          element.getAttribute("stroke-width") ||
          getStyle(element, "stroke-width") ||
          "0";
        strokeWidth = strokeWidth.replace("px", "");

        const transformInfo = parseTransform(combinedTransform);

        paths.push({
          data: pathData,
          fill,
          stroke,
          strokeWidth: Number(strokeWidth),
          transform: combinedTransform,
          transformMatrix: transformInfo.matrix,
          translation: transformInfo.translation,
          elementType: "circle",
          radius: r,
          semanticType,
          semanticRole,
          latex,
        });
      }
    }

    // Recursively process child elements
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
      extractElements(children[i], combinedTransform, depth + 1);
    }
  };

  // Start extraction from the main <g> element (usually the one with stroke/fill attributes)
  const mainGroup = svgElement.querySelector("g[stroke][fill]") || svgElement;
  extractElements(mainGroup);

  return paths;
}

/**
 * Group paths by semantic meaning (for fractions, variables, etc.)
 */
export function groupMathJaxPaths(paths: MathJaxPathInfo[]): {
  variables: MathJaxPathInfo[];
  fractionBars: MathJaxPathInfo[];
  operators: MathJaxPathInfo[];
  numbers: MathJaxPathInfo[];
  other: MathJaxPathInfo[];
} {
  const result = {
    variables: [] as MathJaxPathInfo[],
    fractionBars: [] as MathJaxPathInfo[],
    operators: [] as MathJaxPathInfo[],
    numbers: [] as MathJaxPathInfo[],
    other: [] as MathJaxPathInfo[],
  };

  for (const path of paths) {
    // Check if it's a fraction bar (rect element in a fraction)
    if (
      (path.elementType === "rect" && path.semanticType === "fraction") ||
      (path.rectHeight && path.rectHeight < 10)
    ) {
      // Thin rectangle
      result.fractionBars.push(path);
    }
    // Check if it's a variable (latinletter semantic role)
    else if (path.semanticRole === "latinletter") {
      result.variables.push(path);
    }
    // Check if it's a number
    else if (
      path.semanticRole === "integer" ||
      path.semanticRole === "number"
    ) {
      result.numbers.push(path);
    }
    // Check if it's an operator
    else if (
      path.semanticRole === "addition" ||
      path.semanticRole === "subtraction" ||
      path.semanticRole === "multiplication" ||
      path.semanticRole === "division" ||
      path.semanticRole === "equality"
    ) {
      result.operators.push(path);
    } else {
      result.other.push(path);
    }
  }

  return result;
}

/**
 * Extract fraction components (numerator, denominator, bar)
 */
export function extractFractionComponents(paths: MathJaxPathInfo[]): Array<{
  numerator: MathJaxPathInfo[];
  denominator: MathJaxPathInfo[];
  bar: MathJaxPathInfo | null;
  bbox: DOMRect | null;
}> {
  const fractions: Array<{
    numerator: MathJaxPathInfo[];
    denominator: MathJaxPathInfo[];
    bar: MathJaxPathInfo | null;
    bbox: DOMRect | null;
  }> = [];

  // Find all fraction bars
  const bars = paths.filter(
    (p) =>
      p.elementType === "rect" &&
      (p.semanticType === "fraction" || (p.rectHeight && p.rectHeight < 10)),
  );

  for (const bar of bars) {
    if (!bar.bbox) continue;

    const barCenterY = bar.bbox.y + bar.bbox.height / 2;
    const barLeft = bar.bbox.x;
    const barRight = bar.bbox.x + bar.bbox.width;

    // Find elements above the bar (numerator)
    const numerator = paths.filter((p) => {
      if (p === bar || !p.bbox) return false;
      return (
        p.bbox.y + p.bbox.height < barCenterY &&
        p.bbox.x + p.bbox.width > barLeft &&
        p.bbox.x < barRight
      );
    });

    // Find elements below the bar (denominator)
    const denominator = paths.filter((p) => {
      if (p === bar || !p.bbox) return false;
      return (
        p.bbox.y > barCenterY &&
        p.bbox.x + p.bbox.width > barLeft &&
        p.bbox.x < barRight
      );
    });

    // Calculate overall bounding box
    const allElements = [...numerator, bar, ...denominator].filter(
      (p) => p.bbox,
    );
    if (allElements.length > 0) {
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const elem of allElements) {
        if (elem.bbox) {
          minX = Math.min(minX, elem.bbox.x);
          minY = Math.min(minY, elem.bbox.y);
          maxX = Math.max(maxX, elem.bbox.x + elem.bbox.width);
          maxY = Math.max(maxY, elem.bbox.y + elem.bbox.height);
        }
      }

      fractions.push({
        numerator,
        denominator,
        bar,
        bbox: new DOMRect(minX, minY, maxX - minX, maxY - minY),
      });
    }
  }

  return fractions;
}
