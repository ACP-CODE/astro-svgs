import type { AstroIntegration } from "astro";
import { defaults } from "./core";
import { create } from "./plugin";
import { virtual } from "./modules";

export const name = "astro-svgs";

export interface SVGsOptions {
  /**
   * Specify the folder where the svg file is located.
   * @default "src/svgs"
   */
  input?: string | string[];
  /**
   * Compression level of `sprite.svg` file.
   * @default
   * isDev ? 'beautify' : 'high',
   */
  compress?: Precision;
}

export type Precision = "low" | "medium" | "high" | "beautify";

export class Error1 extends Error {
  hint?: string;

  constructor(message: string) {
    super(message);
  }
}

export default function svgs(options?: SVGsOptions): AstroIntegration {
  let opts = { ...defaults, ...options };
  return {
    name,
    hooks: {
      "astro:config:setup": async ({ config, command: cmd, updateConfig }) => {
        opts.compress = cmd === "dev" ? "beautify" : opts?.compress;
        updateConfig({
          vite: {
            plugins: [create(opts, config)],
          },
        });
      },
      "astro:config:done": async ({ injectTypes }) => {
        injectTypes(await virtual(opts));
      },
    },
  };
}
