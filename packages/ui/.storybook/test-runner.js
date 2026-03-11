/** @type {import('@storybook/test-runner').TestRunnerConfig} */
module.exports = {
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
