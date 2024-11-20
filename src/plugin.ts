import type { AstroConfig } from "astro";
import type { Plugin } from "vite";
import { type SVGsOptions, name } from ".";
import { compose } from "./core";
import { genTypeFile } from "./modules";

export function create(options: SVGsOptions, config: AstroConfig): Plugin {
  const virtualModuleId = `virtual:${name}`;
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  const base = "/@svgs/sprite.svg";
  let fileId: string, data: string, hash: string, filePath: string, typeFileUpdated: boolean;;
  const inputs = Array.isArray(options.input) ? options.input : [options.input];

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

      server.watcher.on("unlink", async (file) => {
        typeFileUpdated = await genTypeFile(file, options, config);
      });

      server.watcher.on("add", async (file) => {
        typeFileUpdated = await genTypeFile(file, options, config);
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
      const wathFile = inputs.some((input) => file.includes(input!)) && file.endsWith(".svg");

      if (wathFile || typeFileUpdated) {
        const { data: Data, hash: Hash } = await compose(options);

        if (Hash !== hash) {
          hash = Hash;
          data = Data;
          filePath = `${base}?v=${hash}`;

          const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
          }

          server.ws.send({ type: "full-reload" });
        }

        return []; // Returns null to avoid further processing
      }
    },
  };
}
