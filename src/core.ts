import fs from "fs/promises";
import path from "path";
import type { SVGsOptions } from ".";
import { minify, beautify, md5 } from "./helpers";
import type { AstroIntegrationLogger } from "astro";

export const defaults: SVGsOptions = {
  input: "src/svgs",
  compress: "high",
};

interface Sprite {
  data: string;
  hash: string;
}

export const compose = async (
  { input, compress }: SVGsOptions,
  logger: AstroIntegrationLogger,
): Promise<Sprite> => {
  let data = "",
    hash = "";

  try {
    // Make sure `input` is a valid array
    const inputs = Array.isArray(input) ? input : [input];
    const svgFiles: string[] = [];

    for (const inputPath of inputs) {
      // Check if `inputPath` is valid
      if (!inputPath || !(await fs.stat(inputPath).catch(() => false))) {
        logger.warn(`Invalid directory: ${inputPath}`);
        continue;
      }

      const dirFiles = (await fs.readdir(inputPath)).filter((file) =>
        file.endsWith(".svg"),
      );
      svgFiles.push(...dirFiles.map((file) => path.join(inputPath, file)));
    }

    const spriteContent = (
      await Promise.all(
        svgFiles.map(async (filePath) => {
          let fileContent = await fs.readFile(filePath, "utf8");

          const symbolId = path
            .basename(filePath, ".svg")
            .replace(/[^a-zA-Z0-9_-]/g, "_");

          // Match the viewBox value
          const viewBoxMatch = fileContent.match(/viewBox="([^"]+)"/);
          const viewBox = viewBoxMatch ? `viewBox="${viewBoxMatch[1]}"` : "";

          // Remove the <svg> wrapper and clean up the content
          fileContent = fileContent
            .replace(/<\?xml[^>]*\?>\s*/g, "")
            .replace(/<svg[^>]*>/, "")
            .replace(/<\/svg>\s*$/, "")
            .replace(/\s*id="[^"]*"/g, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/g, "");

          // Return the symbol with the correct viewBox and id
          return `<symbol id="${symbolId}" ${viewBox}>${fileContent}</symbol>`;
        }),
      )
    ).join(compress ? "" : "\n");

    data = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>${spriteContent}</defs></svg>`;

    data = compress ? minify(data, compress) : beautify(data);
    hash = md5(data);
  } catch (error) {
    console.error("Error generating SVG sprite:", error);
  }

  return { data, hash };
};
