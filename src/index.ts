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
   * @default "high"
   * @example Dynamic setup based on environment
   * ```ts
   * compress: isDev ? 'beautify' : 'high',
   * ```
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
  const opts = { ...defaults, ...options };
  return {
    name,
    hooks: {
      "astro:config:setup": async ({ config, updateConfig }) => {
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
