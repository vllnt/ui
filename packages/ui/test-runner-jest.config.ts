import type { TestRunnerConfig } from "@storybook/test-runner";

const config: TestRunnerConfig = {
  async postVisit(page, context) {
    const a11yViolations = await page.evaluate(() => {
      const errors: string[] = [];
      const images = document.querySelectorAll("img:not([alt])");
      if (images.length > 0) {
        errors.push(`${images.length} image(s) missing alt text`);
      }
      const buttons = document.querySelectorAll(
        'button:not([aria-label]):not(:has(*))',
      );
      for (const btn of buttons) {
        if (!btn.textContent?.trim()) {
          errors.push("Button without text or aria-label");
        }
      }
      return errors;
    });

    if (a11yViolations.length > 0) {
      throw new Error(
        `Accessibility violations in ${context.id}:\n${a11yViolations.join("\n")}`,
      );
    }

    const consoleErrors = await page.evaluate(() => {
      return (window as unknown as { __STORYBOOK_CONSOLE_ERRORS__?: string[] })
        .__STORYBOOK_CONSOLE_ERRORS__ ?? [];
    });

    if (consoleErrors.length > 0) {
      throw new Error(
        `Console errors in ${context.id}:\n${consoleErrors.join("\n")}`,
      );
    }
  },
};

export default config;
