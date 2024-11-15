# Overviews
[![Build Status](https://github.com/ACP-CODE/astro-svgs/actions/workflows/ci.yaml/badge.svg?style=flat-square)](https://github.com/ACP-CODE/astro-svgs/actions/workflows/ci.yaml)
[![NPM Version](https://img.shields.io/npm/v/astro-svgs?label=astro-svgs&labelColor=dark&color=light)
](https://www.npmjs.com/package/astro-svgs)

It's a compact solution for SVG sprites in Astro. It bundles SVGs into one file, includes built-in components for easy use, and supports handleHotUpdate for smooth development.

## Installation

> This package is compatible with *astro@3.0.0* and above and only supports the latest Integrations API.

Get started quickly with the help of the `astro add` command tool

```shell
$ npx astro add astro-svgs
```

## Usage

<details>
<summary>Manual Configuration</summary>
<br>

- **STEP1**: Alternatively, you can manually install it by running the following command in your terminal:
<br><br>

```shell
$ npm install astro-svgs
```

- **STEP2**: To use this integration, add it to your `astro.config.*` file using the integrations property:
```js
// @ts-check
import { defineConfig } from "astro/config";
import svgs from "astro-svgs";

export default defineConfig({
  integrations: [svgs()],
});
```

- **STEP3**: Then provide the svg files you need to generate `sprite.svg` to the default `src/svgs` folder

```shell
/
├── src/
│   ├── svgs/
│   │   ├── a.svg
│   │   ├── b.svg
│   │   └── c.svg
│   └── pages/
│       └── index.astro
└── package.json
```

- **STEP4**: Now you can use the icon in the sprite through the built-in component `Icon.astro`

```js
---
import Icon from 'astro-svgs/Icon.astro';
import Layout from '~/Layouts/Layout.astro';
---
<Layout>
  {/* name is the `file name` of the icon you need*/}
  <Icon name={"a"} class="<CustomClassName>" />
</Layout>
```

> If everything goes well, when you start the server with `npm run dev` , you will be able to get the virtual `sprite.svg` content through `http://localhost:4321/@svgs/sprite.svg` , which supports hot updates through `handleHotUpdate`
</details>

<details>
<summary>API Reference</summary>
<br>
All the interfaces are here.
<br><br>

```js
// @ts-check
import { defineConfig } from "astro/config";
import svgs from "astro-svgs";

export default defineConfig({
  integrations: [
    svgs({
      /**
       * The folder where the svg files that
       * need to generate `sprite.svg` are located
       */
      input: ["src/assets/sprites", "src/assets/images"]
      /**
       * default value
       */
      compress: "high" 
    })
  ],
});
```
Wait, how do you control the output? It will be automatically generated in the `AstroConfig.build.assets` directory when you build via vite, for example `_astro/sprite.43a97aac.svg`

</details>

## Contributing

Submit your issues or feedback on our [GitHub]() channel.

## License

MIT
