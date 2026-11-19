/**
 * Lint rule A12: no status colour on words.
 *
 * Signature v1.3 puts status colour (danger, success, warning, info) on a
 * glyph, a dot or a border. Words stay in `foreground` or `muted-foreground`.
 * The rule flags a status text utility such as `text-destructive` or
 * `text-red-600` in a string of a component file.
 *
 * Allowed without a report:
 * - `text-destructive-foreground` and the other `*-foreground` roles: they are
 *   the text colour on top of a status fill.
 * - A utility behind an `svg` variant such as `[&>svg]:text-destructive`: it
 *   colours the glyph.
 * - A utility in the `className` of an element that has `aria-hidden`: a glyph
 *   or dot that screen readers skip is not words.
 */

const STATUS_ROLES = "destructive|success|warning|info";
const STATUS_PALETTE = "red|rose|orange|amber|yellow|lime|green|emerald|blue|sky";

const STATUS_TEXT_UTILITY = new RegExp(
  `^!?text-(?:${STATUS_ROLES}|(?:${STATUS_PALETTE})-\\d{2,3})(?:/[\\w.%[\\]-]+)?$`,
);

const SVG_VARIANT = /(?:^|[^a-z])svg(?:[^a-z]|$)/;

/**
 * Splits a Tailwind class on the colons that sit outside square brackets, so
 * `[&_svg:not(.x)]:text-info` yields the variant and the utility.
 *
 * @param {string} token One whitespace-free class.
 * @returns {string[]} Variants first, utility last.
 */
function splitClass(token) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < token.length; index += 1) {
    const character = token[index];
    if (character === "[") {
      depth += 1;
    } else if (character === "]") {
      depth -= 1;
    } else if (character === ":" && depth === 0) {
      parts.push(token.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(token.slice(start));
  return parts;
}

/**
 * Lists the classes of a string that put a status colour on words.
 *
 * @param {string} text Class string, for example a `className` value.
 * @returns {string[]} The offending classes, variants included.
 */
export function findStatusTextClasses(text) {
  const found = [];
  for (const token of text.split(/\s+/)) {
    if (token === "") {
      continue;
    }
    const parts = splitClass(token);
    const utility = parts.at(-1) ?? "";
    const variants = parts.slice(0, -1);
    if (
      STATUS_TEXT_UTILITY.test(utility) &&
      !variants.some((variant) => SVG_VARIANT.test(variant))
    ) {
      found.push(token);
    }
  }
  return found;
}

function hasAriaHidden(openingElement) {
  return openingElement.attributes.some(
    (attribute) =>
      attribute.type === "JSXAttribute" &&
      attribute.name.name === "aria-hidden" &&
      !(
        attribute.value?.type === "Literal" && attribute.value.value === "false"
      ),
  );
}

/** True when the string sits in the className of an `aria-hidden` element. */
function isInHiddenGlyph(sourceCode, node) {
  const attribute = sourceCode
    .getAncestors(node)
    .findLast(
      (ancestor) =>
        ancestor.type === "JSXAttribute" && ancestor.name.name === "className",
    );
  return attribute !== undefined && hasAriaHidden(attribute.parent);
}

const rule = {
  create(context) {
    const { sourceCode } = context;

    function check(node, text) {
      if (isInHiddenGlyph(sourceCode, node)) {
        return;
      }
      for (const className of findStatusTextClasses(text)) {
        context.report({ data: { className }, messageId: "statusOnWords", node });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === "string") {
          check(node, node.value);
        }
      },
      TemplateElement(node) {
        check(node, node.value.cooked ?? "");
      },
    };
  },
  meta: {
    docs: {
      description:
        "Disallow status text colours on words: status colour belongs on a glyph, a dot or a border.",
    },
    messages: {
      statusOnWords:
        "A12: `{{className}}` puts a status colour on words. Fix: use `text-foreground` (or `text-muted-foreground`) for the words, and put the status colour on the icon (`<Icon aria-hidden className=\"text-destructive\" />`), a dot, or the border (`border-destructive`).",
    },
    schema: [],
    type: "problem",
  },
};

export default rule;
