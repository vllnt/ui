/** @type {import('@storybook/test-runner').TestRunnerConfig} */
const pageConsoleErrors = new Map();

const config = {
  async preVisit(page, context) {
    const errors = [];
    pageConsoleErrors.set(context.id, errors);
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
  },
  async postVisit(page, context) {
    const errors = pageConsoleErrors.get(context.id) ?? [];
    pageConsoleErrors.delete(context.id);

    if (errors.length > 0) {
      throw new Error(
        `Console errors in ${context.id}:\n${errors.join("\n")}`,
      );
    }
  },
};

export default config;
