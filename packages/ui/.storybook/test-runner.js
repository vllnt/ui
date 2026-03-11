/** @type {import('@storybook/test-runner').TestRunnerConfig} */
const config = {
  async postVisit(page, context) {
    const consoleErrors = await page.evaluate(() => {
      const errors = [];
      return errors;
    });

    if (consoleErrors.length > 0) {
      throw new Error(
        `Console errors in ${context.id}:\n${consoleErrors.join("\n")}`,
      );
    }
  },
};

export default config;
