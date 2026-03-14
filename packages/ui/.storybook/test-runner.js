/** @type {import('@storybook/test-runner').TestRunnerConfig} */
const pageConsoleErrors = new Map();
const pageConsoleWarnings = new Map();

const config = {
  async preVisit(page, context) {
    const errors = [];
    const warnings = [];
    pageConsoleErrors.set(context.id, errors);
    pageConsoleWarnings.set(context.id, warnings);
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
      if (msg.type() === "warning") {
        const text = msg.text();
        if (
          text.includes("Warning:") ||
          text.includes("Each child in a list") ||
          text.includes("validateDOMNesting") ||
          text.includes("aria-") ||
          text.includes("Unknown prop")
        ) {
          warnings.push(text);
        }
      }
    });
  },
  async postVisit(page, context) {
    const errors = pageConsoleErrors.get(context.id) ?? [];
    const warnings = pageConsoleWarnings.get(context.id) ?? [];
    pageConsoleErrors.delete(context.id);
    pageConsoleWarnings.delete(context.id);

    if (errors.length > 0) {
      throw new Error(
        `Console errors in ${context.id}:\n${errors.join("\n")}`,
      );
    }

    if (warnings.length > 0) {
      throw new Error(
        `React warnings in ${context.id}:\n${warnings.join("\n")}`,
      );
    }
  },
};

export default config;
