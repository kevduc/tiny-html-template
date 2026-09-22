# tiny-html-template

Tiny, zero-dependency HTML tagged templates with lazy, composable fragments.

```sh
pnpm add @kevduc/tiny-html-template
```

```ts
import { html } from "@kevduc/tiny-html-template";

const message = "Hello";
const paragraph = html`<p>${message}</p>`;

console.log(paragraph.render());
// '<p>Hello</p>'
```

`html` creates an `HtmlFragment`. It does not render immediately. Calling `.render()` is the explicit boundary that produces a string.

## Composition

Fragments can be nested without escaping their markup. Strings and numbers are escaped. `null` renders as an empty string. Nested readonly arrays are concatenated without separators.

<!-- prettier-ignore -->
```ts
const items = ['one', 'two'];
const list = html`<ul>${items.map((item) => html`<li>${item}</li>`)}</ul>`;

console.log(list.render());
// '<ul><li>one</li><li>two</li></ul>'
```

Rendering is lazy and uncached. A fragment reads its interpolated arrays and child fragments when `.render()` runs.

## Editor support

For embedded HTML syntax highlighting in VS Code, you can optionally install [ES6 String HTML](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html). It recognizes this package's `html` tagged-template syntax.

## Supported environments

This package is ESM-only and supports Node.js 22.14.0 and later. It has no runtime dependencies and does not require a DOM.

## Security and non-goals

Interpolation escapes `&`, `<`, `>`, `"`, and `'` for HTML text and ordinary quoted attribute values. It is not a sanitizer. Validate URL semantics before interpolating URLs. HTML escaping alone does not make dynamic values safe in `srcdoc`, style or event-handler attributes, comments, tag names, attribute names, unquoted attributes, or script or style bodies. Those contexts require validation and encoding for the specific parser. Static template text is emitted verbatim and must contain only trusted markup; keep untrusted data in interpolations so it receives HTML escaping. Only fragments created by the same module instance are embedded as markup; other objects are rejected.

The package deliberately has no raw interpolation API, JSX transform, DOM renderer, async rendering, cache, or template-file loader.

## Development

```sh
git clone https://github.com/kevduc/tiny-html-template.git
cd tiny-html-template
corepack enable pnpm
pnpm install --frozen-lockfile --ignore-scripts
pnpm run prepare
pnpm run verify
```

Corepack activates the exact pnpm version pinned in `packageManager`.

See [RELEASING.md](./RELEASING.md) for release requirements.
