import type { AstroIntegration, AstroConfig } from "astro";
import { genSprite, defaults } from "./core";

export interface SVGsOptions {
  input?: string | string[];
  compress?: Precision;
}

export type Precision = "low" | "medium" | "high";

export default function svgs(options?: SVGsOptions): AstroIntegration {
  let config: AstroConfig;
  const opts = { ...defaults, ...options };
  return {
    name: "astro-svgs",
    hooks: {
      "astro:config:setup": ({ config: cfg }) => {
        config = cfg;
      },
      "astro:server:setup": async () => {
        await genSprite(opts, config);
      },
      "astro:build:setup": async () => {
        await genSprite(opts, config);
      },
    },
  };
}
