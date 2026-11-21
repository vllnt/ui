import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import diff from "react-syntax-highlighter/dist/esm/languages/prism/diff";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import PrismLight from "react-syntax-highlighter/dist/esm/prism-light";

// The full Prism build bundles every language (about 650 KB minified). This
// fixed set is a fraction of that. Each grammar also answers to its Prism
// aliases (ts, js, sh, shell, md, yml, py, html, xml and more). Any other
// language, and "text", renders as plain text without an error.
PrismLight.registerLanguage("bash", bash);
PrismLight.registerLanguage("css", css);
PrismLight.registerLanguage("diff", diff);
PrismLight.registerLanguage("javascript", javascript);
PrismLight.registerLanguage("json", json);
PrismLight.registerLanguage("jsx", jsx);
PrismLight.registerLanguage("markdown", markdown);
PrismLight.registerLanguage("markup", markup);
PrismLight.registerLanguage("python", python);
PrismLight.registerLanguage("sql", sql);
PrismLight.registerLanguage("tsx", tsx);
PrismLight.registerLanguage("typescript", typescript);
PrismLight.registerLanguage("yaml", yaml);
PrismLight.alias("bash", "zsh");

// A local binding, not `export { default } from "...prism-light"`. The package
// declares `sideEffects: ["*.css"]`, so Rollup and webpack skip a module that
// merely re-exports another, and the registrations above would never run.
const highlighter = PrismLight;

/**
 * Prism highlighter with the fixed language set registered, used by StaticCode.
 * CodeBlock lazy-loads the same set by package specifier (its registry shim
 * cannot import this file); code-block-languages.test.tsx keeps both lists equal.
 */
export { highlighter as CodeHighlighter };
