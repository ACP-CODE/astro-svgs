# astro-svgs

```shell
$ npm install astro-svgs
```

```js
// @ts-check
import { defineConfig } from 'astro/config';
import svgs from 'astro-svgs';

// https://astro.build/config
export default defineConfig({
  integrations: [
    svgs(),
  ],
});
````

```shell
/
├── public/
│   └── _astro/
│       └── sprite.svg
├── src/
│   ├── svgs/
│   │   ├── a.svg
│   │   ├── b.svg
│   │   └── c.svg
│   └── pages/
│       └── index.astro
└── package.json
```

```js
---
import Icon from 'astro-svgs/Icon.astro';
---
<Icon name={'a'} class={customClassName} />
<Icon name={'b'} class={customClassName} />
<Icon name={'c'} class={customClassName} />
```