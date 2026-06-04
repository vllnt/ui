/* eslint-disable @typescript-eslint/naming-convention -- keys are npm package
   names and sandbox file paths, which are external contracts and cannot be
   camelCase (matches packages/ui tailwind-preset.ts). */
type CodeSandboxFile = {
  content: Record<string, unknown> | string;
};

export type CodeSandboxDefinePayload = {
  files: Record<string, CodeSandboxFile>;
};

const INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VLLNT UI Example</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

const MAIN_TSX = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@vllnt/ui/styles.css";
import "@vllnt/ui/themes/default.css";
import { Demo } from "./Demo";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <main className="min-h-screen bg-background p-6 text-foreground">
      <Demo />
    </main>
  </StrictMode>,
);
`;

const POSTCSS_CONFIG = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

const TAILWIND_CONFIG = `import uiPreset from "@vllnt/ui/tailwind-preset";

/** @type {import("tailwindcss").Config} */
export default {
  darkMode: ["class"],
  presets: [uiPreset],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@vllnt/ui/dist/**/*.{js,mjs,cjs}",
  ],
};
`;

const VITE_CONFIG = `import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
});
`;

const TSCONFIG = {
  compilerOptions: {
    esModuleInterop: true,
    jsx: "react-jsx",
    lib: ["DOM", "DOM.Iterable", "ES2022"],
    module: "ESNext",
    moduleResolution: "Bundler",
    skipLibCheck: true,
    strict: true,
    target: "ES2022",
  },
  include: ["src"],
};

function buildPackageJson(packageVersion: string): Record<string, unknown> {
  return {
    dependencies: {
      "@vllnt/ui": packageVersion,
      "class-variance-authority": "^0.7.1",
      clsx: "^2.1.1",
      "lucide-react": "^0.468.0",
      next: "^15.0.0",
      "next-themes": "^0.4.4",
      react: "^19.2.0",
      "react-dom": "^19.2.0",
      "tailwind-merge": "^3.3.1",
      tailwindcss: "^3.4.17",
      "tailwindcss-animate": "^1.0.7",
    },
    devDependencies: {
      "@vitejs/plugin-react": "^4.3.4",
      autoprefixer: "^10.4.20",
      postcss: "^8.5.0",
      typescript: "^5.7.2",
      vite: "^6.0.5",
    },
    scripts: {
      build: "vite build",
      dev: "vite",
    },
  };
}

/**
 * Build a CodeSandbox "define API" payload for an inline component example.
 *
 * Unlike the in-browser bundler, CodeSandbox runs a real container that
 * `npm install`s `@vllnt/ui` and compiles Tailwind, so the standard Vite
 * project below renders the example with full design-token styling.
 *
 * @param exampleCode - Source of the `Demo` component to render.
 * @param packageVersion - Version range to install for `@vllnt/ui`.
 * @returns Payload for `POST https://codesandbox.io/api/v1/sandboxes/define`.
 */
export function buildCodeSandboxDefinePayload(
  exampleCode: string,
  packageVersion: string,
): CodeSandboxDefinePayload {
  return {
    files: {
      "index.html": { content: INDEX_HTML },
      "package.json": { content: buildPackageJson(packageVersion) },
      "postcss.config.js": { content: POSTCSS_CONFIG },
      "src/Demo.tsx": { content: exampleCode },
      "src/main.tsx": { content: MAIN_TSX },
      "tailwind.config.js": { content: TAILWIND_CONFIG },
      "tsconfig.json": { content: TSCONFIG },
      "vite.config.ts": { content: VITE_CONFIG },
    },
  };
}
