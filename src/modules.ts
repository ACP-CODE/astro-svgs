import type { AstroConfig, InjectedType } from "astro";
import fs from "fs/promises";
import path from "path";
import { type SVGsOptions, name } from ".";
import { compose } from "./core";

export async function virtual(opts: SVGsOptions): Promise<InjectedType> {
  let filename = "types.d.ts";

  const { symbolIds } = await compose(opts);
  const SymbolId =
    symbolIds.length > 0
      ? symbolIds.map((id) => `\t| '${id}'`).join("\n\t")
      : "\t| null"; // Fallback for empty symbolIds

  const content =
    `declare module 'virtual:${name}' {\n\texport type SymbolId =\n\t${SymbolId};\n\texport const file: string;\n}`.trim();

  return { filename, content };
}

export async function genTypeFile(
  file: string,
  opts: SVGsOptions,
  cfg: AstroConfig,
): Promise<boolean> {
  const inputs = Array.isArray(opts.input) ? opts.input : [opts.input];

  if (
    !inputs.some((input) => file.includes(input!)) ||
    !file.endsWith(".svg")
  ) {
    return false; // No treatment
  }

  const { filename, content } = await virtual(opts);
  const typeFile = new URL(`.astro/integrations/${name}/${filename}`, cfg.root);

  try {
    await fs.mkdir(path.dirname(typeFile.pathname), { recursive: true });
    await fs.writeFile(typeFile, content);
  } catch (err) {
    console.error(err);
  }

  return true;
}
