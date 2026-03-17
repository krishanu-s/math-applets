// Vectorized MObjects which capture mathematical expressions, rendered from LaTeX code.
// We use MathJax v4 to render LaTeX to SVG.

import { extractSVGPaths, ParsedPathInfo, SVGLoader } from "./svg_loader";
import { SVGPathMObject, SVGPathMObjectGroup } from "./svg_mobject";
import { MObjectGroup } from "../base";

// MathJax type declarations
declare global {
  interface Window {
    MathJax: any;
  }
}

// Helper to ensure SVG has namespace
function ensureSVGNamespace(svgString: string): string {
  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    return svgString.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return svgString;
}

// Wait for MathJax to load (it's loaded in the HTML)
export function waitForMathJax(): Promise<void> {
  return new Promise((resolve) => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      resolve();
      return;
    }

    // Check every 100ms
    const checkInterval = setInterval(() => {
      if (window.MathJax && window.MathJax.typesetPromise) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve(); // Continue anyway
    }, 5000);
  });
}

// Simple render function using MathJax v4 API
async function renderLatexToSVG(
  latex: string,
  displayMode: boolean = true,
): Promise<string> {
  if (!window.MathJax || !window.MathJax.typesetPromise) {
    throw new Error(
      "MathJax not loaded. Make sure MathJax script is included in HTML.",
    );
  }

  const div = document.createElement("div");
  div.style.visibility = "hidden";
  div.style.position = "absolute";
  div.style.top = "-9999px";

  // Use proper delimiters
  if (displayMode) {
    div.innerHTML = `\\[${latex}\\]`;
  } else {
    div.innerHTML = `\\(${latex}\\)`;
  }

  document.body.appendChild(div);

  try {
    // Use typesetPromise - this should work with MathJax v4
    await window.MathJax.typesetPromise([div]);

    // Find SVG element
    const svgElement = div.querySelector("svg");
    if (!svgElement) {
      // Try to find any SVG in the element
      const svgs = div.getElementsByTagName("svg");
      if (svgs.length > 0) {
        return ensureSVGNamespace(svgs[0].outerHTML);
      }
      throw new Error("No SVG element found");
    }

    return ensureSVGNamespace(svgElement.outerHTML);
  } finally {
    document.body.removeChild(div);
  }
}

// A MObjectGroup which contains a single SVGPathMObject for each character in the LaTeX expression.
export class TeXMObject extends SVGPathMObjectGroup {
  async from_latex(latex: string, scale: number) {
    this.clear();

    // Render
    const svgString = await renderLatexToSVG(latex, true);

    // Parse string to SVG element
    const svgElement = SVGLoader.parseSVG(svgString);

    // Extract individual path elements from the SVG and parse them
    const paths = extractSVGPaths(svgElement).map((pathInfo) =>
      SVGLoader.parsePathInfo(pathInfo),
    );

    // Put all of the paths into a single path object so they're drawn sequentially.
    // TODO In future, add more options to how a group of paths is drawn.
    let mobj = new SVGPathMObject().from_svg_path(
      paths[0] as ParsedPathInfo,
      scale,
    );
    for (let i = 1; i < paths.length; i++) {
      mobj.adjoin_to(
        new SVGPathMObject().from_svg_path(paths[i] as ParsedPathInfo, scale),
      );
      // this.add_mobj(
      //   `expr_${i}`,
      //   new SVGPathMObject().from_svg_path(paths[i] as ParsedPathInfo, scale),
      // );
    }
    this.add_mobj("expr", mobj);
    // Calculate the width, height, and center of the LaTeX expression
    this._recalculate_size();

    return this;
  }
}
