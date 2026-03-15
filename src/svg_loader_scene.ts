// math-applets/src/svg_loader_scene.ts

/**
 * Simple scene demonstrating SVG loading
 */

import { WriteIn, WriteInGroup } from "./lib/animation";
import { delay, prepare_canvas, Scene, SVGPathMObject } from "./lib/base";
import {
  SimpleSVGLoader,
  createSVGFileInput,
  ParsedPathInfo,
  PathInfo,
  extractMathJaxPaths,
  groupMathJaxPaths,
  extractFractionComponents,
} from "./lib/svg_loader";

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
function waitForMathJax(): Promise<void> {
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
  await waitForMathJax();

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

(function () {
  document.addEventListener("DOMContentLoaded", async function () {
    (function svgLoaderDemo(width: number, height: number) {
      const name = "svg-loader-demo";
      const canvas = prepare_canvas(width, height, name);
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      // Clear canvas
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Example 5: Render MathJax
      async function mathJaxDemo() {
        let scene = new Scene(canvas);
        scene.set_frame_lims([-5, 5], [-5, 5]);

        // Convert LaTeX to SVG string
        try {
          const latex =
            "(x, y) = \\left( \\frac{m^2-1}{m^2+1}, -\\frac{2m}{m^2+1} \\right)";

          // Draw label
          ctx.fillStyle = "#000000";
          ctx.font = "16px Arial";
          ctx.fillText(`LaTeX: ${latex}`, 50, 125);

          // Render
          const svgString = await renderLatexToSVG(latex, true);

          // async function foo() {
          //   return new Promise((resolve, reject) => {
          //     // 2. Create a data URL
          //     const svgBlob = new Blob([svgString], {
          //       type: "image/svg+xml;charset=utf-8",
          //     });
          //     const url = URL.createObjectURL(svgBlob);

          //     // 3. Create an image and load the SVG
          //     const img = new Image();

          //     img.onload = () => {
          //       const ctx = canvas.getContext("2d");
          //       if (!ctx) {
          //         reject(new Error("Failed to get canvas context"));
          //         return;
          //       }

          //       // Draw the image
          //       if (width && height) {
          //         ctx.drawImage(img, 0, 0, width, height);
          //       } else {
          //         ctx.drawImage(img, 0, 0);
          //       }

          //       // Clean up
          //       URL.revokeObjectURL(url);
          //       resolve();
          //     };

          //     img.onerror = () => {
          //       URL.revokeObjectURL(url);
          //       reject(new Error("Failed to load SVG image"));
          //     };

          //     img.src = url;
          //   });
          // }
          // await foo();

          // console.log("SVG generated:", svgString);

          // // Draw to canvas
          // await SimpleSVGLoader.drawToCanvas(canvas, svgString, 50, 150);

          // Parse string to SVG element
          const svgElement = SimpleSVGLoader.parseSVG(svgString);

          const paths = extractMathJaxPaths(svgElement);
          const grouped = groupMathJaxPaths(paths);
          const fractions = extractFractionComponents(paths);

          // console.log(`Found ${paths.length} total elements`);
          // console.log(paths);
          // console.log(`- Variables: ${grouped.variables.length}`);
          // console.log(`- Fraction bars: ${grouped.fractionBars.length}`);
          // console.log(`- Operators: ${grouped.operators.length}`);
          // console.log(`- Numbers: ${grouped.numbers.length}`);
          // console.log(`- Fractions: ${fractions.length}`);

          // // Retrieve paths
          // console.log(svgElement);
          // const pathInfoAll = SimpleSVGLoader.extractPaths(svgElement);

          // // TODO Retrieve rectangles and other elements.

          // console.log("Paths:", pathInfoAll);

          let parsedPathInfoAll = [];
          let total_length = 0;
          let p;

          // // Parse each path info object into a
          // let allCommands: Array<{ type: string; values: number[] }> = [];
          for (const pathInfo of paths) {
            p = SimpleSVGLoader.parsePathInfo(pathInfo);
            parsedPathInfoAll.push(p);
            total_length += p.commands.length;
          }

          // console.log("Paths, parsed:", parsedPathInfoAll);

          // TODO Write in simultaneously
          let svg_group: Record<string, SVGPathMObject> = {};
          for (let i = 0; i < parsedPathInfoAll.length; i++) {
            let svg_mobject = new SVGPathMObject();
            svg_mobject.from_path(
              parsedPathInfoAll[i] as ParsedPathInfo,
              scene.scale(),
            );
            svg_mobject.homothety_around([0, 0], 0.02);
            svg_mobject.move_by([-4, 4]);
            svg_group[`obj_${i}`] = svg_mobject;
            // await new WriteIn(`obj_${i}`, svg_mobject, 10).play(scene);
          }
          await new WriteInGroup(svg_group, 30).play(scene);
        } catch (error) {
          console.error("Basic test failed:", error);

          ctx.fillStyle = "#ff0000";
          ctx.font = "14px Arial";
          ctx.fillText(`✗ Error: ${error.message}`, 50, 280);

          // Fallback: Draw error details
          ctx.fillStyle = "#666";
          ctx.font = "12px Arial";
          ctx.fillText("Make sure MathJax is loaded in HTML:", 50, 310);
          ctx.fillText(
            '<script defer src="https://cdn.jsdelivr.net/npm/mathjax@4/tex-svg.js"></script>',
            50,
            330,
          );
        }
      }

      // Example 4: Render an SVG MObject
      async function svgMobjectDemo() {
        let scene = new Scene(canvas);
        scene.set_frame_lims([-5, 5], [-5, 5]);

        // Load an example SVG from the dist directory
        const svgString = await SimpleSVGLoader.loadFromURL(
          "./svg_samples/ex_5.svg",
        );

        // Parse and extract paths
        const svgElement = SimpleSVGLoader.parseSVG(svgString);
        const pathInfoAll = SimpleSVGLoader.extractPaths(svgElement);

        let parsedPathInfoAll = [];
        let total_length = 0;
        let p;

        // // Parse each path info object into a
        // let allCommands: Array<{ type: string; values: number[] }> = [];
        for (const pathInfo of pathInfoAll) {
          p = SimpleSVGLoader.parsePathInfo(pathInfo);
          parsedPathInfoAll.push(p);
          total_length += p.commands.length;
        }

        let svg_group: Record<string, SVGPathMObject> = {};
        console.log("num", parsedPathInfoAll.length);
        for (let i = 0; i < parsedPathInfoAll.length; i++) {
          console.log(i);
          let svg_mobject = new SVGPathMObject();
          svg_mobject.from_path(
            parsedPathInfoAll[i] as ParsedPathInfo,
            scene.scale(),
          );
          svg_mobject.homothety_around([0, 0], 0.5);
          svg_mobject.move_by([-4.5, 4.5]);
          await new WriteIn(`obj_${i}`, svg_mobject, 30).play(scene);
        }

        // Animate drawing-in.

        // let svg_mobject = new SVGPathMObject();
        // svg_mobject.from_path(
        //   parsedPathInfoAll[0] as ParsedPathInfo,
        //   scene.scale(),
        // );
        // svg_mobject.move_by([-1, 1]);
        // svg_mobject.homothety_around([0, 0], 2);
        // console.log(svg_mobject.segments);
        // scene.add("svg_mobject", svg_mobject);
        // console.log(svg_mobject);
        scene.draw();
      }
      // Example 0: Animate drawing of a path step-by-step
      async function partialDraw() {
        try {
          // Load an example SVG from the dist directory
          const svgString = await SimpleSVGLoader.loadFromURL(
            "./svg_samples/ex_4.svg",
          );
          console.log(svgString);

          // Parse and extract paths
          const svgElement = SimpleSVGLoader.parseSVG(svgString);
          const pathInfoAll = SimpleSVGLoader.extractPaths(svgElement);

          let parsedPathInfoAll = [];
          let total_length = 0;
          let p;

          // // Parse each path info object into a
          // let allCommands: Array<{ type: string; values: number[] }> = [];
          for (const pathInfo of pathInfoAll) {
            p = SimpleSVGLoader.parsePathInfo(pathInfo);
            parsedPathInfoAll.push(p);
            total_length += p.commands.length;
          }

          // console.log("All commands:", allCommands);

          // Set style
          ctx.fillStyle = "#000000";
          ctx.strokeStyle = "#000000";

          // // Clear canvas
          // ctx.fillStyle = "#ffffff";
          // ctx.clearRect(0, 0, width, height);
          // ctx.fillStyle = "#000000";

          // // Partially draw
          // await SimpleSVGLoader.drawPartial(
          //   ctx,
          //   allCommands,
          //   allCommands.length,
          // );

          for (
            let numCommands = 1;
            numCommands <= total_length;
            numCommands += 1
          ) {
            console.log("Drawing partially with ", numCommands, "commands");
            // Clear canvas
            ctx.fillStyle = "#ffffff";
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "#000000";

            // Partially draw
            await SimpleSVGLoader.drawPartial(
              ctx,
              parsedPathInfoAll,
              numCommands,
            );
            // Insert delay
            await delay(10);
          }
        } catch (error) {
          console.error("Error loading example SVG:", error);
        }
      }

      // Example 1: Load SVG from dist directory
      async function loadExampleSVG() {
        try {
          // Load an example SVG from the dist directory
          const svgString = await SimpleSVGLoader.loadFromURL(
            "./svg_samples/ex_3.svg",
          );

          console.log("SVG string:", svgString);

          // Draw it to canvas
          await SimpleSVGLoader.drawToCanvas(canvas, svgString, 50, 50);

          // Parse and extract points
          const svgElement = SimpleSVGLoader.parseSVG(svgString);
          const paths = SimpleSVGLoader.extractPaths(svgElement);
          console.log("Paths:", paths);

          for (const path of paths) {
            let numCommands = 50;
            // // Draw the first N commands in the path
            // ctx.fillStyle = "#000000";

            // let commands = SimpleSVGLoader.parsePathCommands(path);
            // await SimpleSVGLoader.drawPartial(ctx, commands, numCommands);

            console.log("Path:", path);
            const points = SimpleSVGLoader.pathToPoints(path);
            console.log("Points in path:", points);
            // Draw a red dot at each point in the path
            ctx.fillStyle = "#ff0000";
            for (const point of points) {
              ctx.beginPath();
              ctx.arc(point.x + 50, point.y + 50, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          console.log(`Loaded SVG with ${paths.length} paths`);
        } catch (error) {
          console.error("Error loading example SVG:", error);
        }
      }

      // Example 2: File input for loading custom SVG
      function setupFileInput() {
        const container = document.getElementById(name);
        if (!container) return;

        const inputContainer = document.createElement("div");
        inputContainer.style.marginTop = "20px";
        inputContainer.style.padding = "10px";
        inputContainer.style.border = "1px solid #ccc";

        const label = document.createElement("div");
        label.textContent = "Load your own SVG:";
        label.style.marginBottom = "10px";

        const fileInput = createSVGFileInput((svgString, points) => {
          // Clear area and draw new SVG
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(300, 50, 400, 400);

          // Draw SVG
          SimpleSVGLoader.drawToCanvas(canvas, svgString, 320, 70)
            .then(() => {
              // Draw points
              ctx.fillStyle = "#ff0000";
              for (const point of points) {
                ctx.beginPath();
                ctx.arc(point.x + 320, point.y + 70, 2, 0, Math.PI * 2);
                ctx.fill();
              }

              console.log(`Loaded ${points.length} points from SVG`);
            })
            .catch(console.error);
        });

        inputContainer.appendChild(label);
        inputContainer.appendChild(fileInput);
        container.appendChild(inputContainer);
      }

      // Example 3: Load multiple SVGs
      async function loadMultipleSVGs() {
        const svgFiles = [
          // "./svg_samples/ex_1.svg",
          // "./svg_samples/ex_2.svg",
          // "./svg_samples/ex_3.svg",
          // "./svg_samples/ex_4.svg",
        ];

        let yOffset = 300;

        for (const file of svgFiles) {
          try {
            console.log("Filename:", file);
            const svgString = await SimpleSVGLoader.loadFromURL(file);
            console.log("Contents:", svgString);
            await SimpleSVGLoader.drawToCanvas(canvas, svgString, 50, yOffset);
            yOffset += 120;
          } catch (error) {
            console.error(`Error loading ${file}:`, error);
          }
        }
      }

      // Run examples
      async function runExamples() {
        console.log("Starting SVG loader examples...");

        // Draw title
        ctx.fillStyle = "#000000";
        ctx.font = "bold 16px Arial";
        // ctx.fillText("SVG Loader Demo", 50, 30);
        ctx.font = "12px Arial";
        // ctx.fillText("Red dots show extracted points", 50, 280);
        // await partialDraw();
        // await loadExampleSVG();
        // setupFileInput();
        // await loadMultipleSVGs();
        // await svgMobjectDemo();
        await mathJaxDemo();

        console.log("SVG loader examples completed!");
      }

      runExamples().catch(console.error);
    })(500, 500);
  });
})();
