/**
 * Lint rule: a component gets its `displayName` from `named`, as a pure call.
 *
 * `const Card = ...; Card.displayName = "Card";` is a statement with a side
 * effect, so a bundler keeps `Card` and everything it uses in every bundle that
 * loads the module, even when nothing imports `Card`. The same name through
 * `const Card = named("Card", ...)` is an initializer, and a `@__PURE__`
 * annotation before the call tells the bundler it may drop `Card` when unused.
 *
 * Statics hang on the component the same way: `named("Tabs", TabsRoot, () => ({ List }))`,
 * never a `Tabs.List = TabsList` statement, which would keep every part alive.
 *
 * Webpack reads the annotation only when every argument is pure: a literal, an
 * identifier, a function or an annotated call. An object or array literal is
 * not, so with one in the call webpack keeps the component and everything it
 * uses, whatever esbuild or terser would do. The statics therefore come as a
 * function, and plain data such as a look goes in a const above the call.
 *
 * The rule reports four mistakes at the top level of a module:
 * - a `X.displayName = ...` statement;
 * - a `X.Part = ...` statement;
 * - a call to `named`, or to a dialog part builder, without the annotation;
 * - an annotated call with an argument that webpack does not take as pure.
 */

const PURE_ANNOTATION = /^\s*[#@]__PURE__\s*$/;

const FACTORY =
  "/^(named|dialog(Root|Trigger|Close|Portal|Overlay|Box|Title|Description))$/";

const PURE_NODES = new Set([
  "ArrowFunctionExpression",
  "FunctionExpression",
  "Identifier",
  "Literal",
]);

const messages = {
  annotation:
    "Put `/* @__PURE__ */` before this `{{name}}(...)` call, so a bundler can drop the component when nothing imports it.",
  impure:
    "Webpack does not take {{kind}} as pure, so it ignores the `/* @__PURE__ */` annotation on this `{{name}}(...)` call and keeps the component in every bundle that loads the module. Pass statics as a function, as in `() => ({ List: TabsList })`, and move plain data to a const above the call.",
  static:
    'Hang `{{name}}` on its component through the third argument of `named`, as in `named("Tabs", TabsRoot, () => ({ List: TabsList }))`. A top-level `{{name}}` assignment statement keeps the component and every part in every bundle that loads the module.',
  statement:
    'Declare the name with `const {{name}} = /* @__PURE__ */ named("{{name}}", ...)` from lib/named. A top-level `{{name}}.displayName = ...` statement keeps `{{name}}` and everything it uses in every bundle that loads the module.',
};

export default {
  create(context) {
    const { sourceCode } = context;

    const hasAnnotation = (node) =>
      sourceCode
        .getCommentsBefore(node)
        .some((comment) => PURE_ANNOTATION.test(comment.value));

    // What webpack's `isPure` accepts, as far as these calls use it.
    const isPure = (node) => {
      if (PURE_NODES.has(node.type)) {
        return true;
      }
      if (node.type === "TemplateLiteral") {
        return node.expressions.length === 0;
      }
      if (
        node.type === "TSAsExpression" ||
        node.type === "TSNonNullExpression"
      ) {
        return isPure(node.expression);
      }
      if (node.type === "CallExpression") {
        return hasAnnotation(node) && node.arguments.every(isPure);
      }
      return false;
    };

    const checkAnnotation = (node) => {
      if (!hasAnnotation(node)) {
        context.report({
          data: { name: node.callee.name },
          messageId: "annotation",
          node,
        });
        return;
      }
      for (const argument of node.arguments.filter((item) => !isPure(item))) {
        context.report({
          data: {
            kind: sourceCode.getText(argument).startsWith("{")
              ? "an object literal"
              : "this argument",
            name: node.callee.name,
          },
          messageId: "impure",
          node: argument,
        });
      }
    };

    return {
      [`Program > ExpressionStatement > AssignmentExpression[left.type="MemberExpression"][left.object.type="Identifier"]`](
        node,
      ) {
        const isName = node.left.property.name === "displayName";
        context.report({
          data: {
            name: sourceCode.getText(isName ? node.left.object : node.left),
          },
          messageId: isName ? "statement" : "static",
          node,
        });
      },
      [`Program > VariableDeclaration > VariableDeclarator > CallExpression[callee.name=${FACTORY}]`]:
        checkAnnotation,
      [`Program > ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > CallExpression[callee.name=${FACTORY}]`]:
        checkAnnotation,
    };
  },
  meta: {
    docs: {
      description:
        "Require displayName through a pure annotated `named` call, not a statement.",
    },
    messages,
    schema: [],
    type: "problem",
  },
};
