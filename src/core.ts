import fs from "fs/promises";
import path from "path";
import { type SVGsOptions, Error1, name } from ".";
import { mkdir, getSvgFiles, minify, format, md5 } from "./helpers";
// import { logger } from "./utils/logger";

export const defaults: SVGsOptions = {
  input: "src/svgs",
  compress: "high",
};

interface Sprite {
  data: string;
  hash: string;
  symbolIds: string[];
}

export async function compose({
  input,
  compress,
}: SVGsOptions): Promise<Sprite> {
  let data = "",
    hash = "",
    symbolIds: string[] = [];

  try {
    let err: Error1;

    const inputs = Array.isArray(input) ? input : [input];
    const svgFiles: { inputDir: string; filePath: string }[] = [];

    for (const inputDir of inputs) {
      if (!inputDir || !(await fs.stat(inputDir).catch(() => false))) {
        if (inputDir === "src/svgs") {
          await mkdir(inputDir);
        } else {
          err = new Error1(`Invalid directory`);
          err.hint = `Ensure \`${inputDir}\` exists and is accessible.`;
          throw err;
        }
      }

      const dirFiles = await getSvgFiles(inputDir);
      svgFiles.push(...dirFiles.map((filePath) => ({ inputDir, filePath })));
    }

    const defsSet = new Set<string>(); // For storing unique <defs> content
    const symbolBodySet = new Set<string>(); // Set for unique SVG bodies based on content hash

    const symbols = (
      await Promise.all(
        svgFiles.map(async ({ inputDir, filePath }) => {
          let body = await fs.readFile(filePath, "utf8");

          // Validate if file content is a valid SVG
          if (!body.includes("<svg")) {
            // logger.add("Invalid SVG file(s)", `- ${filePath}`);
            return ""; // Skip invalid SVG content
          }

          // Extract and store <defs> content if exists
          const defsMatch = body.match(/<defs>([\s\S]*?)<\/defs>/);
          if (defsMatch) {
            defsSet.add(defsMatch[1]); // Add unique defs content
          }

          // Generate a hash of the body content to detect duplicates
          const bodyHash = md5(body); // Generate a hash of the SVG body content

          // If the same content already exists, skip adding it
          if (symbolBodySet.has(bodyHash)) {
            return ""; // Skip if the content is a duplicate
          }

          // Add the content hash to the set to prevent future duplicates
          symbolBodySet.add(bodyHash);

          // Generate symbolId, either file name or path-based if content differs
          const fileName = path.basename(filePath, ".svg");
          let symbolId: string;

          if (bodyHash) {
            symbolId = fileName;
          } else {
            const relativePath = path.relative(inputDir, filePath);
            symbolId = relativePath
              .replace(/\.svg$/, "")
              .replace(/[^a-zA-Z0-9_-]/g, "_");
            // .replace(/[\/\\]/g, ":")
            // .replace(/[^a-zA-Z0-9_-]/g, ":");
          }

          // Check for viewBox, or derive from width/height if absent
          const viewBoxMatch = body.match(/viewBox="([^"]+)"/);
          let viewBox = "";

          if (viewBoxMatch) {
            viewBox = `viewBox="${viewBoxMatch[1]}"`;
          } else {
            const widthMatch = body.match(/width="([^"]+)"/);
            const heightMatch = body.match(/height="([^"]+)"/);
            if (widthMatch && heightMatch) {
              const width = parseFloat(widthMatch[1]);
              const height = parseFloat(heightMatch[1]);
              if (!isNaN(width) && !isNaN(height)) {
                viewBox = `viewBox="0 0 ${width} ${height}"`;
              }
            }
          }

          // Clean SVG content
          body = body
            .replace(/<\?xml[^>]*\?>\s*/g, "")
            .replace(/<svg[^>]*>/, "")
            .replace(/<\/svg>\s*$/, "")
            .replace(/\s*id="[^"]*"/g, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/g, "")
            .replace(/<defs>[\s\S]*?<\/defs>/g, "") // Remove original <defs>
            .replace(/<!--[\s\S]*?-->/g, "");

          // Add the symbolId and body to the final list
          symbolIds.push(symbolId);
          return `<symbol id="${symbolId}" ${viewBox}>${body}</symbol>`;
        }),
      )
    )
      .filter(Boolean)
      .join("\n");

    // Combine all unique defs content into a single <defs> block
    let defs =
      defsSet.size > 0 ? `<defs>${Array.from(defsSet).join("")}</defs>` : "";
    defs = defs.replace(/<!--[\s\S]*?-->/g, "");

    // Assemble the final SVG sprite data
    data = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${defs}${symbols}</svg>`;
    data = compress !== "beautify" ? minify(data, compress!) : format(data);
    hash = md5(data);
  } catch (err) {
    if (err instanceof Error1) {
      throw err;
    }
  }

  // logger.print(name);

  return { data, hash, symbolIds };
}
