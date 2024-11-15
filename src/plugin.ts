import type { AstroConfig, AstroIntegrationLogger } from "astro";
import type { Plugin } from "vite";
import { type SVGsOptions, name } from ".";
import { compose } from "./core";

export const create = (
  options: SVGsOptions,
  config: AstroConfig,
  logger: AstroIntegrationLogger,
): Plugin => {
  const virtualModuleId = "virtual:astro-svgs";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  const base = "/@svgs/sprite.svg";
  let fileId: string, hash: string, data: string, filePath: string;

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
        return `export const file = '${filePath ?? `${base}?v=${hash}`}';`;
      }
    },

    async handleHotUpdate({ file, server }) {
      ({ data, hash } = await compose(options, logger));

      const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
      if (mod) {
        server.moduleGraph.invalidateModule(mod);
      }

      server.ws.send({ type: "full-reload" });
      return [];
    },
  };
};
