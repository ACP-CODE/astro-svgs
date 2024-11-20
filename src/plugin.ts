import type { AstroConfig } from "astro";
import type { Plugin } from "vite";
import fs from "fs/promises";
import path from "path";
import { type SVGsOptions, name } from ".";
import { compose } from "./core";
import { virtual } from "./modules";

export function create(options: SVGsOptions, config: AstroConfig): Plugin {
  const virtualModuleId = `virtual:${name}`;
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  const base = "/@svgs/sprite.svg";
  let fileId: string, data: string, hash: string, filePath: string;

  return {
    name,

    async configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        ({ data, hash } = await compose(options));
        if (req.url?.startsWith(base)) {
          res.setHeader("Content-Type", "image/svg+xml");
          res.setHeader("Cache-Control", "no-cache");
          res.end(data);
        } else {
          next();
        }
      });
    },

    async buildStart() {
      ({ data, hash } = await compose(options));

      if (!this.meta.watchMode) {
        fileId = this.emitFile({
          type: "asset",
          fileName: `${config.build.assets}/sprite.${hash}.svg`,
          source: data,
        });
        filePath = `${config.build.assetsPrefix ?? ""}/${this.getFileName(fileId)}`;
      }
    },

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    async load(id) {
      if (id === resolvedVirtualModuleId) {
        filePath = filePath ?? `${base}?v=${hash}`;
        return `export const file = "${filePath}";`;
      }
    },

    async handleHotUpdate({ file, server }) {
      const filePathDir = path.dirname(file);

      if (
        Array.isArray(options.input) &&
        options.input.some((input) => filePathDir.includes(input))
      ) {
        ({ hash, data } = await compose(options)); // 更新 hash 和 data
        filePath = `${base}?v=${hash}`; // 更新 filePath

        const { filename, content } = await virtual(options);
        const typeFile = new URL(
          `.astro/integrations/${name}/${filename}`,
          config.root,
        );
        await fs.writeFile(typeFile, content);

        const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
        }

        server.ws.send({ type: "full-reload" });
        return [];
      }
    },
  };
}
