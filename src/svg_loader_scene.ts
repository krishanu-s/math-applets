// math-applets/src/svg_loader_scene.ts

/**
 * Simple scene demonstrating SVG loading
 */

import { MoveBy, Write, WriteGroup } from "./lib/animation";
import { delay, prepare_canvas, Scene } from "./lib/base";
import { SVGPathMObject, TexMObject } from "./lib/vectorized";
import {
  SVGLoader,
  createSVGFileInput,
  ParsedPathInfo,
} from "./lib/vectorized/svg_loader";

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

          let latex_mobj = new TexMObject();
          await latex_mobj.from_latex(latex, scene.scale());
          latex_mobj.set_center([-2, 4]);
          latex_mobj.set_width(4.0);

          await new Write("latex_mobj", latex_mobj, 30).play(scene);
          // // Group them
          // scene.group(Object.keys(svg_group), "svg_group");

          // // Move
          await new MoveBy("latex_mobj", [2, -4], 20).play(scene);
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
        const svgString = await SVGLoader.loadFromURL("./svg_samples/ex_5.svg");

        // Parse and extract paths
        const svgElement = SVGLoader.parseSVG(svgString);
        const pathInfoAll = SVGLoader.extractPaths(svgElement);

        let parsedPathInfoAll = [];
        let total_length = 0;
        let p;

        // // Parse each path info object into a
        // let allCommands: Array<{ type: string; values: number[] }> = [];
        for (const pathInfo of pathInfoAll) {
          p = SVGLoader.parsePathInfo(pathInfo);
          parsedPathInfoAll.push(p);
          total_length += p.commands.length;
        }

        for (let i = 0; i < parsedPathInfoAll.length; i++) {
          let svg_mobject = new SVGPathMObject();
          svg_mobject.from_path(
            parsedPathInfoAll[i] as ParsedPathInfo,
            scene.scale(),
          );
          svg_mobject.homothety_around([0, 0], 0.5);
          svg_mobject.move_by([-4.5, 4.5]);
          await new Write(`obj_${i}`, svg_mobject, 30).play(scene);
        }
        scene.draw();
      }

      // Example 1: Load SVG from dist directory
      async function loadExampleSVG() {
        try {
          // Load an example SVG from the dist directory
          const svgString = await SVGLoader.loadFromURL(
            "./svg_samples/ex_3.svg",
          );

          console.log("SVG string:", svgString);

          // Draw it to canvas
          await SVGLoader.drawToCanvas(canvas, svgString, 50, 50);

          // Parse and extract points
          const svgElement = SVGLoader.parseSVG(svgString);
          const paths = SVGLoader.extractPaths(svgElement);
          console.log("Paths:", paths);

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
          SVGLoader.drawToCanvas(canvas, svgString, 320, 70)
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
            const svgString = await SVGLoader.loadFromURL(file);
            console.log("Contents:", svgString);
            await SVGLoader.drawToCanvas(canvas, svgString, 50, yOffset);
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
        await svgMobjectDemo();
        await mathJaxDemo();

        console.log("SVG loader examples completed!");
      }

      runExamples().catch(console.error);
    })(500, 500);
  });
})();
