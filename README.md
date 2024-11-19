# Overview

[![Build Status](https://github.com/ACP-CODE/astro-svgs/actions/workflows/ci.yaml/badge.svg?style=flat-square)](https://github.com/ACP-CODE/astro-svgs/actions/workflows/ci.yaml)
[![NPM Version](https://img.shields.io/npm/v/astro-svgs?label=astro-svgs&labelColor=dark&color=light)](https://www.npmjs.com/package/astro-svgs)

A compact, flexible solution for managing SVG sprites in Astro projects.

It automates symbol ID management, supports hot reloading, and generates optimized SVG sprites with minimal setup. It includes built-in components and an open API, allowing easy customization to suit your needs.

## Installation

Quickly install with the `astro add` command:

```shell
$ npx astro add astro-svgs
```

## Usage

<details>
<summary>Manual Setup</summary>

#### Setup

- **Step 1**: To install manually, run:

  ```shell
  $ npm install astro-svgs
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
  │   ├── svgs/
  │   │   ├── a.svg
  │   │   ├── b.svg
  │   │   └── c.svg
  │   └── pages/
  │       └── index.astro
  └── package.json
  ```

- **Step 4**: Use the built-in `Icon.astro` component to render icons from the sprite:

  ```js
  ---
  import Layout from '~/Layouts/Layout.astro';
  import Icon from 'astro-svgs/Icon.astro';
  ---
  <Layout>
    {/* Set the name as the `file name` of the desired icon */}
    <Icon name="a" class="<CustomClassName>" />
  </Layout>
  ```

#### Live Access

> [!NOTE]
>
> Set `compress` to `import.meta.env.DEV ? 'beauty' : 'high'` for clearer SVGs in development.

Start the server with `npm run dev`, then access the virtual `sprite.svg` at `http://localhost:4321/@svgs/sprite.svg`.

</details>

<details>
<summary>API Reference</summary>
<br>

All configuration options are provided here.

```js
// @ts-check
import { defineConfig } from "astro/config";
import svgs from "astro-svgs";

export default defineConfig({
  integrations: [
    svgs({
      /**
       * Folder paths containing SVG files to generate `sprite.svg`
       * @default "src/svgs"
       */
      input: ["src/assets/sprites", "src/assets/images"],
      /**
       * @default: "high"
       */
      compress: import.meta.env.DEV ? "beauty" : "high",
    }),
  ],
});
```

> **Output**: The sprite file will automatically be generated in `config.build.assets` during the build process (e.g., `_astro/sprite.43a97aac.svg`).

</details>

## Need help or Feedback?

If you have questions or feedback, feel free to submit an issue on our [GitHub](https://github.com/ACP-CODE/astro-svgs) repository.

## Changelog

For the full changelog, see the [Releases](https://github.com/ACP-CODE/astro-svgs/releases/) page.

## License

MIT
