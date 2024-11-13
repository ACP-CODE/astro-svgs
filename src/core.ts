import fs from "fs/promises";
import path from "path";
import type { SVGsOptions } from ".";
import { minify, beautify } from "./helpers";
import type { AstroConfig } from "astro";

export const defaults: SVGsOptions = {
  input: "src/svgs",
  compress: "high",
};

export const genSprite = async (
  { input = "", compress }: SVGsOptions,
  config: AstroConfig,
) => {
  try {
    const inputs = Array.isArray(input) ? input : [input];
    const svgFiles: string[] = [];

    for (const inputPath of inputs) {
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

    let sprite = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>${spriteContent}</defs></svg>`;

    sprite = compress ? minify(sprite, compress) : beautify(sprite);

    const dest = new URL(config.build.assets, config.publicDir);
    await fs.mkdir(dest, { recursive: true });

    const file = path.join(dest.pathname, "sprite.svg");
    await fs.writeFile(file, sprite, "utf8");

  } catch (error) {
    console.error("Error generating SVG sprite:", error);
  }
};
