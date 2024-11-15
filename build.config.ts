import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["./src/index"],
  declaration: true,
  rollup: {
    emitCJS: false,
    esbuild: {
      // minify: true,
      // minifyIdentifiers: true,
    },
  },
});
