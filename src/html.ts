const HTML_FRAGMENT_BRAND: unique symbol = Symbol("HTML_FRAGMENT_BRAND");

export type HtmlFragment = {
  readonly [HTML_FRAGMENT_BRAND]: undefined;
  readonly render: () => string;
};

export type HtmlTemplateValue =
  string | number | null | HtmlFragment | readonly HtmlTemplateValue[];

type HtmlFragmentRenderer = (
  renderHtmlTemplateValue: (value: unknown) => string,
) => string;

const htmlFragmentRenderers = new WeakMap<object, HtmlFragmentRenderer>();

export const html = (
  [firstString = "", ...remainingStrings]: TemplateStringsArray,
  ...values: HtmlTemplateValue[]
): HtmlFragment =>
  createHtmlFragment((renderHtmlTemplateValue) =>
    remainingStrings.reduce(
      (renderedHtml, string, index) =>
        renderedHtml + renderHtmlTemplateValue(values[index]) + string,
      firstString,
    ),
  );

const createHtmlFragment = (renderer: HtmlFragmentRenderer): HtmlFragment => {
  const fragment: HtmlFragment = Object.freeze({
    [HTML_FRAGMENT_BRAND]: undefined,
    render: () => {
      const arraysBeingRendered = new WeakSet<readonly unknown[]>();
      const renderHtmlTemplateValue = (value: unknown): string => {
        if (value === null) return "";
        if (typeof value === "string" || typeof value === "number")
          return escapeHtmlText(value);

        if (Array.isArray(value)) {
          if (arraysBeingRendered.has(value))
            throw new TypeError("Cannot render a cyclic HTML template array.");

          arraysBeingRendered.add(value);

          try {
            return Array.from(value).map(renderHtmlTemplateValue).join("");
          } finally {
            arraysBeingRendered.delete(value);
          }
        }

        if (typeof value === "object") {
          const nestedRenderer = htmlFragmentRenderers.get(value);

          if (nestedRenderer !== undefined)
            return nestedRenderer(renderHtmlTemplateValue);
        }

        throw new TypeError(
          `Unsupported HTML template value type: ${typeof value}.`,
        );
      };

      return renderer(renderHtmlTemplateValue);
    },
  });

  htmlFragmentRenderers.set(fragment, renderer);

  return fragment;
};

const escapeHtmlText = (value: string | number): string =>
  String(value).replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
