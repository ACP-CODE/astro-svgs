import type { InjectedType } from "astro";
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
