import type { AstroIntegration } from "astro";
import { defaults } from "./core";
import { create } from "./plugin";

export const name = "astro-svgs";

export interface SVGsOptions {
  input?: string | string[];
  compress?: Precision;
}

export type Precision = "low" | "medium" | "high" | "beautify";

export default function svgs(options?: SVGsOptions): AstroIntegration {
  const opts = { ...defaults, ...options };

  return {
    name,
    hooks: {
      "astro:config:setup": async ({ config, updateConfig, logger }) => {
        updateConfig({
          vite: {
            plugins: [create(opts, config, logger)],
          },
        });
      },
    },
  };
}
