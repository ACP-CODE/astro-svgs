import fs from "fs/promises";
import path from "path";
import type { SVGsOptions } from ".";
import { minify, format, md5 } from "./helpers";
import type { AstroIntegrationLogger } from "astro";

export const defaults: SVGsOptions = {
  input: "src/svgs",
  compress: "high",
};

interface Sprite {
  data: string;
  hash: string;
  symbolIds: string[];
}

export async function compose(
  { input, compress }: SVGsOptions,
  logger: AstroIntegrationLogger,
): Promise<Sprite> {
  let data = "",
    hash = "",
    symbolIds: string[] = [];

  try {
    // Make sure `input` is a valid array
    const inputs = Array.isArray(input) ? input : [input];
    const svgFiles: string[] = [];

    for (const input of inputs) {
      // Check if `inputPath` is valid
      if (!input || !(await fs.stat(input).catch(() => false))) {
        logger.warn(`Invalid directory: ${input}`);
        continue;
      }

      const dirFiles = (await fs.readdir(input)).filter((file) =>
        file.endsWith(".svg"),
      );
      svgFiles.push(...dirFiles.map((file) => path.join(input, file)));
    }

    const sprites = (
      await Promise.all(
        svgFiles.map(async (filePath) => {
          let body = await fs.readFile(filePath, "utf8");

          const symbolId = path
            .basename(filePath, ".svg")
            .replace(/[^a-zA-Z0-9_-]/g, "_");

          // For typechecking  
          symbolIds.push(symbolId);

          // Match the viewBox value
          const viewBoxMatch = body.match(/viewBox="([^"]+)"/);
          const viewBox = viewBoxMatch ? `viewBox="${viewBoxMatch[1]}"` : "";

          // Remove the <svg> wrapper and clean up the content
          body = body
            .replace(/<\?xml[^>]*\?>\s*/g, "")
            .replace(/<svg[^>]*>/, "")
            .replace(/<\/svg>\s*$/, "")
            .replace(/\s*id="[^"]*"/g, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/g, "");

          // Return the symbol with the correct viewBox and id
          return `<symbol id="${symbolId}" ${viewBox}>${body}</symbol>`;
        }),
      )
    ).join("\n");

    data = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>${sprites}</defs></svg>`;

    data = compress !== "beautify" ? minify(data, compress!) : format(data);
    hash = md5(data);
  } catch (error) {
    console.error(error);
  }

  return { data, hash, symbolIds };
}
