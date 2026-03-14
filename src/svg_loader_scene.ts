// math-applets/src/svg_loader_scene.ts

/**
 * Simple scene demonstrating SVG loading
 */

import { delay, prepare_canvas } from "./lib/base";
import { SimpleSVGLoader, Point2D, createSVGFileInput } from "./lib/svg_loader";

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
        await partialDraw();
        // await loadExampleSVG();
        // setupFileInput();
        // await loadMultipleSVGs();

        console.log("SVG loader examples completed!");
      }

      runExamples().catch(console.error);
    })(800, 600);
  });
})();
