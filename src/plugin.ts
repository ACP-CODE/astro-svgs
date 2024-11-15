import type { AstroConfig } from "astro";
import type { Plugin } from "vite";
import type { SVGsOptions } from ".";
import { compose } from "./core";
import { createHash } from 'crypto';

export function genHash(content: string): string {
  return createHash('md5').update(content).digest('hex').slice(0, 8);
}

export const create = (options: SVGsOptions, config: AstroConfig): Plugin => {
  const virtualModuleId = "virtual:astro-svgs";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;
  let fileId: string, hash: string;

  return {
    name: "astro-svgs",
    async buildStart() {
      const sprite = await compose(options);
      hash = genHash(sprite);
      if (this.meta.watchMode) return;
      fileId = this.emitFile({
        type: "asset",
        fileName: `${config.build.assets}/sprite.${hash}.svg`,
        source: sprite,
      });
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        if (this.meta.watchMode) {
          return `export const filePath = '/@svgs/sprite.svg?v=${hash}';`;
        } else {
          return `export const filePath = '/${this.getFileName(fileId)}';`;
        }
      }
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const sprite = await compose(options);
        const filePath = `/@svgs/sprite.svg?v=${hash}`;
        if (req.url === filePath) {
          res.setHeader("Content-Type", "image/svg+xml");
          res.end(sprite);
        } else {
          next();
        }
      });
    },
  }
};
