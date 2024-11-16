import type { AstroConfig, AstroIntegrationLogger } from "astro";
import type { Plugin } from "vite";
import path from "path";
import { type SVGsOptions, name } from ".";
import { compose } from "./core";

export function create(
  options: SVGsOptions,
  config: AstroConfig,
  logger: AstroIntegrationLogger,
): Plugin {
  const virtualModuleId = `virtual:${name}`;
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  const base = "/@svgs/sprite.svg";
  let fileId: string, data: string, hash: string, filePath: string;

  return {
    name,

    async configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        ({ data, hash } = await compose(options, logger));
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
      ({ data, hash } = await compose(options, logger));

      if (!this.meta.watchMode) {
        fileId = this.emitFile({
          type: "asset",
          fileName: `${config.build.assets}/sprite.${hash}.svg`,
          source: data,
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
        filePath = filePath ?? `${base}?v=${hash}`;
        return `export const file = "${filePath}";`;
      }
    },

    async handleHotUpdate({ file, server }) {
      const filePath = path.dirname(file);
      if (
        Array.isArray(options.input) &&
        options.input.some((input) => filePath.includes(input))
      ) {
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
