"use client";

import * as React from "react";

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { track } from "@vercel/analytics";

import type { PlaygroundExample } from "@/lib/playground";

type SandpackPlaygroundProps = {
  componentName: string;
  example: PlaygroundExample;
  packageVersion: string;
  surface: "inline" | "route";
};

function buildDependencies(packageVersion: string): Record<string, string> {
  return {
    "@vitejs/plugin-react": "latest",
    "@vllnt/ui": packageVersion,
    autoprefixer: "^10.4.20",
    "class-variance-authority": "^0.7.1",
    clsx: "^2.1.1",
    "lucide-react": "^0.468.0",
    postcss: "^8.5.0",
    react: "^19.2.0",
    "react-dom": "^19.2.0",
    "tailwind-merge": "^3.3.1",
    tailwindcss: "^3.4.17",
    vite: "latest",
  };
}

function buildFiles(
  exampleCode: string,
  packageVersion: string,
): Record<string, string> {
  return {
    "/package.json": JSON.stringify(
      {
        dependencies: buildDependencies(packageVersion),
        devDependencies: {},
        scripts: {
          dev: "vite",
        },
      },
      undefined,
      2,
    ),
    "/postcss.config.js": `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,
    "/src/Demo.tsx": exampleCode,
    "/src/main.tsx": `import * as React from "react";
import { createRoot } from "react-dom/client";

import "@vllnt/ui/styles.css";
import "@vllnt/ui/themes/default.css";
import "./styles.css";
import { Demo } from "./Demo";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <main className="min-h-screen bg-background p-6 text-foreground">
      <Demo />
    </main>
  </React.StrictMode>,
);
`,
    "/src/styles.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

body {
  margin: 0;
  min-width: 320px;
}
`,
    "/tailwind.config.js": `import uiPreset from "@vllnt/ui/tailwind-preset";

/** @type {import("tailwindcss").Config} */
export default {
  darkMode: ["class"],
  presets: [uiPreset],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@vllnt/ui/dist/**/*.{js,mjs,cjs}",
    "./node_modules/@vllnt/ui/src/**/*.{ts,tsx}",
  ],
};
`,
  };
}

export function SandpackPlayground({
  componentName,
  example,
  packageVersion,
  surface,
}: SandpackPlaygroundProps): React.ReactElement {
  React.useEffect(() => {
    track("playground_open", {
      component: componentName,
      packageVersion,
      surface,
    });
  }, [componentName, packageVersion, surface]);

  const dependencies = React.useMemo(
    () => buildDependencies(packageVersion),
    [packageVersion],
  );
  const files = React.useMemo(
    () => buildFiles(example.code, packageVersion),
    [example.code, packageVersion],
  );

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="border-b bg-muted/30 px-4 py-3">
        <p className="text-sm font-medium">{example.title}</p>
        <p className="text-xs text-muted-foreground">{example.description}</p>
      </div>
      <SandpackProvider
        customSetup={{
          dependencies,
        }}
        files={files}
        options={{
          activeFile: "/src/Demo.tsx",
          externalResources: [],
          recompileDelay: 400,
          recompileMode: "delayed",
          visibleFiles: ["/src/Demo.tsx", "/src/main.tsx", "/src/styles.css"],
        }}
        template="react-ts"
        theme="auto"
      >
        <SandpackLayout className="!m-0 !rounded-none !border-0">
          <SandpackCodeEditor
            className="min-h-[460px] flex-1"
            closableTabs={false}
            showLineNumbers
            showTabs
            wrapContent
          />
          <SandpackPreview
            className="min-h-[460px] flex-1"
            showOpenInCodeSandbox={false}
            showRefreshButton
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
