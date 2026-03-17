// Vectorized text rendering.

import { MObject, Scene } from "../base";
import { extractSVGPaths, ParsedPathInfo, SVGLoader } from "./svg_loader";

import { SVGPathMObject, SVGPathMObjectGroup } from "./svg_mobject";
import * as opentype from "opentype.js";

// *** FONTS ***
export const FONT_URLS = {
  // Google Fonts TTF versions
  ROBOTO_TTF:
    "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kvnz.woff",

  // From fonts.google.com, you can download TTF files
  // Or use these CDN URLs for TTF:
  ROBOTO_CDN_TTF:
    "https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/roboto/Roboto-Regular.ttf",

  // Open Sans TTF
  OPEN_SANS_TTF:
    "https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVQUwaEQbjB_mQ.woff",

  // Arial alternative (public domain font similar to Arial)
  LIBERATION_SANS:
    "https://cdn.jsdelivr.net/gh/liberationfonts/liberation-fonts@master/liberation-sans/LiberationSans-Regular.ttf",

  // DejaVu Sans (free font)
  DEJAVU_SANS:
    "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37/ttf/DejaVuSans.ttf",
};
// Retrieves a font from a URL and returns it as an opentype.Font object.
export async function get_font_from_url(
  fontUrl: string,
): Promise<opentype.Font> {
  return await opentype.load(fontUrl);
}

function renderTextToSVG(text: string, font: opentype.Font): string {
  // Create SVG path object
  const path = font.getPath(text, 0, 0, 72);

  // Convert to SVG path data
  const pathData = path.toPathData(2);

  // Get bounding box for SVG dimensions
  const bbox = path.getBoundingBox();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${bbox.x2 - bbox.x1}" height="${bbox.y2 - bbox.y1}">
    <g transform="translate(${-bbox.x1}, ${-bbox.y1})">
      <path d="${pathData}" fill="black"/>
    </g>
  </svg>`;
}

// TODO Text rendering.
export class TextMObject extends SVGPathMObjectGroup {
  async from_text(text: string, scale: number, font: opentype.Font) {
    this.clear();

    // Render
    const svgString = renderTextToSVG(text, font);

    // Parse string to SVG element
    const svgElement = SVGLoader.parseSVG(svgString);

    // Extract individual path elements from the SVG and parse them
    const paths = extractSVGPaths(svgElement).map((pathInfo) =>
      SVGLoader.parsePathInfo(pathInfo),
    );

    for (let i = 0; i < paths.length; i++) {
      this.add_mobj(
        `char_${i}`,
        new SVGPathMObject().from_svg_path(paths[i] as ParsedPathInfo, scale),
      );
    }
    // Calculate the width, height, and center of the text expression -- for resizing
    this._recalculate_size();

    return this;
  }
}
