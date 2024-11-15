import type { AstroConfig } from "astro";
import type { Plugin } from "vite";
import { type SVGsOptions, name } from ".";
import { compose } from "./core";
import { createHash } from "crypto";

export function md5(content: string): string {
  return createHash("md5").update(content).digest("hex").slice(0, 8);
}

async function getSpriteAndHash(options: SVGsOptions) {
  const sprite = await compose(options);
  const hash = md5(sprite);
  return { sprite, hash };
}

export const create = (options: SVGsOptions, config: AstroConfig): Plugin => {
  const virtualModuleId = "virtual:astro-svgs";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  const base = "/@svgs/sprite.svg";
  let fileId: string, hash: string, sprite: string, filePath: string;

  return {
    name,

    async configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        ({ sprite, hash } = await getSpriteAndHash(options));
        if (req.url?.startsWith(base)) {
          res.setHeader("Content-Type", "image/svg+xml");
          res.setHeader("Cache-Control", "no-cache");
          res.end(sprite);
        } else {
          next();
        }
      });
    },

    async buildStart() {
      ({ sprite, hash } = await getSpriteAndHash(options));

      if (!this.meta.watchMode) {
        fileId = this.emitFile({
          type: "asset",
          fileName: `${config.build.assets}/sprite.${hash}.svg`,
          source: sprite,
        });
        filePath = `/${this.getFileName(fileId)}`;
      }
    },

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    async load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const file = '${filePath ?? `${base}?v=${hash}`}';`;
      }
    },

    async handleHotUpdate({ file, server }) {
      ({ sprite, hash } = await getSpriteAndHash(options));

      const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
      if (mod) {
        server.moduleGraph.invalidateModule(mod);
      }
      
      server.ws.send({ type: "full-reload" });
      return [];
    },
  };
};
