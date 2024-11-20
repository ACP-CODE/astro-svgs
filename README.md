# Overview

[![NPM Version](https://img.shields.io/npm/v/astro-svgs?label=astro-svgs&labelColor=dark&color=light)](https://www.npmjs.com/package/astro-svgs)
[![Build Status](https://github.com/ACP-CODE/astro-svgs/actions/workflows/ci.yaml/badge.svg?style=flat-square)](https://github.com/ACP-CODE/astro-svgs/actions/workflows/ci.yaml)

A compact, flexible solution for managing SVG sprites in Astro projects.

It automates symbol ID management, supports hot reloading, and generates optimized SVG sprites with minimal setup. It includes built-in components and an open API, allowing easy customization to suit your needs.

## Installation

Quickly install with the `astro add` command:

```shell
npx astro add astro-svgs
```

If you run into issues, try with [Manual Setup](#setup) guide.

## Usage

<details>
<summary>Manual Setup</summary>

#### Setup

- **Step 1**: To install manually, run:

  ```shell
  npm install astro-svgs
  ```

- **Step 2**: Add the integration to your Astro config file (`astro.config.*`):

  ```js
  // @ts-check
  import { defineConfig } from "astro/config";
  import svgs from "astro-svgs";

  export default defineConfig({
    integrations: [svgs()],
  });
  ```

- **Step 3**: Place your SVG files in the default `src/svgs` folder:

  ```plaintext
  /
  ├── src/
  │   ├── pages/
  │   │   └── index.astro
  │   └── svgs/
  │       ├── a.svg
  │       ├── b.svg
  │       └── *.svg
  └── package.json
  ```

- **Step 4**: Use the built-in `Icon.astro` component to render icons from the sprite:

  ```ts
  ---
  import Layout from '~/Layouts/Layout.astro';
  import { Icon } from 'astro-svgs/Icon.astro';
  ---
  <Layout>
    {/* Type hints and checks are provided by `.astro/integrations/astro-svgs/types.d.ts`. */}
    <Icon name="a" class="<CustomClassName>" />
  </Layout>
  ```

#### Live Access

Start the server with `npm run dev`, then access the virtual `sprite.svg` at `http://localhost:4321/@svgs/sprite.svg`.

</details>

<details>
<summary>API Reference</summary>

### Integration API

Full configuration reference

```js
// @ts-check
import { defineConfig } from "astro/config";
import svgs from "astro-svgs";

export default defineConfig({
  build: {
    assets: "_astro",
    // assetsPrefix: env.SITE_URL,
  }
  integrations: [
    svgs({
      /**
       * Folder paths containing SVG files to generate `sprite.svg`
       * @default "src/svgs"
       */
      input: ["src/assets/sprites", "src/assets/icons"],
      /**
       * @default
       * isDev ? "beatfify" : "high"
       */
      compress: "beautify",
    }),
  ],
});
```

> **Output**: The sprite file will automatically be built in `config.build.assets` during the build process (e.g., `_astro/sprite.43a97aac.svg`).

### Component API

#### `file`

**type**: `string` the sprite.svg file path.

#### `SymbolId`

**type**: `Union Type` The svg file unique name you want to use.

#### Eg1: `src/components/Icon.astro`

Creating a simple custom `Icon.astro` using the component API.

```ts
---
import { file, type SymbolId } from 'virtual:astro-svgs';
export interface Props {
    name: SymbolId;
}

const { name } = Astro.props;
---
<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <use xlink:href={`${file}#${name}`} xmlns:xlink="http://www.w3.org/1999/xlink" />
</svg>
```

> The virtual module definition is automatically generated when the server starts with npm run dev and is located at `.astro/integrations/astro-svgs/types.d.ts`.

</details>

## Need help or Feedback?

If you have questions or feedback, feel free to submit an issue on our [GitHub](https://github.com/ACP-CODE/astro-svgs) repository.

## Changelog

For the full changelog, see the [Releases](https://github.com/ACP-CODE/astro-svgs/releases/) page.

## License

MIT
