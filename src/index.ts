import type { AstroIntegration, AstroConfig } from "astro";
import { defaults } from "./core";
import { create } from "./plugin";

export const name = "astro-svgs";

export interface SVGsOptions {
  input?: string | string[];
  compress?: Precision;
}

export type Precision = "low" | "medium" | "high";

export default function svgs(options?: SVGsOptions): AstroIntegration {
  // let config: AstroConfig;
  const opts = { ...defaults, ...options };

  return {
    name,
    hooks: {
      "astro:config:setup": async ({ config: cfg, updateConfig, logger }) => {
        updateConfig({
          vite: {
            plugins: [create(opts, cfg, logger)],
          },
        });
      },
    },
  };
}
