import assert from "node:assert/strict";
import test from "node:test";
import { html } from "./html.ts";
import type { HtmlFragment, HtmlTemplateValue } from "./html.ts";

void test("exports only html at runtime", async () => {
  const moduleNamespace = await import("./html.ts");

  assert.deepEqual(Object.keys(moduleNamespace), ["html"]);
});

void test("preserves static markup, template segment ordering, and numbers", () => {
  assert.equal(html`<p>${1} then ${2}</p>`.render(), "<p>1 then 2</p>");
});

void test("escapes strings, including existing entities", () => {
  assert.equal(
    html`${`&<>"'&amp;`}`.render(),
    "&amp;&lt;&gt;&quot;&#39;&amp;amp;",
  );
});

void test("renders null as an empty string", () => {
  assert.equal(html`<p>${null}</p>`.render(), "<p></p>");
});

void test("renders nested fragments as markup", () => {
  const paragraph = html`<p>${"hello"}</p>`;

  assert.equal(
    html`<main>${paragraph}</main>`.render(),
    "<main><p>hello</p></main>",
  );
});

void test("renders nested arrays without separators", () => {
  const nestedValues = [
    "first",
    [2, null, "third"],
  ] satisfies HtmlTemplateValue;

  assert.equal(
    html`<ul>
      ${nestedValues}
    </ul>`.render(),
    "<ul>\n      first2third\n    </ul>",
  );
});

void test("observes array mutations made after fragment creation", () => {
  const items = ["first"];
  const list = html`<ul>
    ${items}
  </ul>`;

  items.push("second");

  assert.equal(list.render(), "<ul>\n    firstsecond\n  </ul>");
});

void test("does not cache a package-created nested fragment", () => {
  const childValues = ["first"];
  const child = html`<span>${childValues}</span>`;
  const parent = html`<p>${child}</p>`;

  assert.equal(parent.render(), "<p><span>first</span></p>");

  childValues[0] = "second";

  assert.equal(parent.render(), "<p><span>second</span></p>");
});

void test("rejects unsupported values at render time", () => {
  const unsupportedValues: unknown[] = [
    undefined,
    true,
    1n,
    Symbol("value"),
    () => "",
    Promise.resolve("value"),
    {},
  ];

  for (const unsupportedValue of unsupportedValues) {
    const fragment = htmlWithUncheckedTemplateValue(unsupportedValue);
    assert.throws(() => fragment.render(), TypeError);
  }
});

void test("does not inspect unsupported object getters while reporting a type error", () => {
  const unsupportedValue = {};
  Object.defineProperty(unsupportedValue, Symbol.toStringTag, {
    get: () => {
      throw new Error("This getter must not run.");
    },
  });

  assert.throws(
    () => htmlWithUncheckedTemplateValue(unsupportedValue).render(),
    /Unsupported HTML template value type: object\./,
  );
});

void test("rejects nested unsupported values and sparse array holes at render time", () => {
  const nestedUnsupportedValue = htmlWithUncheckedTemplateValue([
    "safe",
    [false],
  ]);
  const sparseValues = new Array<string>(3);
  sparseValues[0] = "safe";
  sparseValues[2] = "value";
  const sparseArray = html`${sparseValues}`;

  assert.throws(() => nestedUnsupportedValue.render(), TypeError);
  assert.throws(() => sparseArray.render(), TypeError);
});

void test("rejects cyclic arrays with a clear type error", () => {
  const values: unknown[] = [];
  values.push(values);

  assert.throws(
    () => htmlWithUncheckedTemplateValue(values).render(),
    /Cannot render a cyclic HTML template array\./,
  );
});

void test("detects an array cycle through a package-created fragment", () => {
  const values: unknown[] = [];
  const fragment = htmlWithUncheckedTemplateValue(values);
  values.push(fragment);

  assert.throws(
    () => fragment.render(),
    /Cannot render a cyclic HTML template array\./,
  );
});

void test("renders repeated non-cyclic array references", () => {
  const sharedValues = ["shared"];

  assert.equal(
    html`<p>${[sharedValues, sharedValues]}</p>`.render(),
    "<p>sharedshared</p>",
  );
});

void test("does not allow fragment render functions to be replaced", () => {
  const fragment = html`<p>${"safe"}</p>`;

  assert.equal(Object.isFrozen(fragment), true);
  assert.throws(() => {
    // @ts-expect-error The public fragment contract exposes a readonly renderer.
    fragment.render = () => "<p>replaced</p>";
  }, TypeError);
  assert.equal(fragment.render(), "<p>safe</p>");
});

void test("rejects structural fragment forgeries at render time", () => {
  const structuralForgery = { render: () => "<p>forged</p>" };

  // @ts-expect-error HtmlFragment values can only originate from html.
  const forgedFragment: HtmlFragment = structuralForgery;

  assert.throws(
    () => html`${forgedFragment}`.render(),
    /Unsupported HTML template value type: object\./,
  );
});

void test("rejects objects that copy a fragment brand symbol at render time", () => {
  const fragment = html`<p>${"safe"}</p>`;
  const copiedBrandForgery = {
    ...fragment,
    render: () => "<p>forged</p>",
  };

  assert.throws(
    () => html`${copiedBrandForgery}`.render(),
    /Unsupported HTML template value type: object\./,
  );
});

void test("rejects proxy-wrapped fragments at render time", () => {
  const fragment = html`<p>${"safe"}</p>`;
  const proxyWrappedFragment = new Proxy(fragment, {});

  assert.throws(
    () => html`${proxyWrappedFragment}`.render(),
    /Unsupported HTML template value type: object\./,
  );
});

const htmlWithUncheckedTemplateValue = (value: unknown): HtmlFragment =>
  // This test helper crosses the public template-value boundary with unsupported input.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  html`${value as HtmlTemplateValue}`;
