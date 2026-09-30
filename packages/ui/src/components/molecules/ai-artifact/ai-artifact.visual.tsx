import { expect, test } from "@playwright/experimental-ct-react";

import {
  AIArtifact,
  AIArtifactContent,
  AIArtifactCopyButton,
  AIArtifactDownloadButton,
  AIArtifactEditButton,
  AIArtifactFullscreenButton,
  AIArtifactToolbar,
  AIArtifactVersion,
  AIArtifactVersions,
} from "./ai-artifact";

const noop = (): void => {
  return;
};

const SAMPLE = `export function UserProfile({ name }: { name: string }) {
  return <div className="profile">Hello, {name}</div>;
}`;

test.describe("AIArtifact Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <AIArtifact
        language="tsx"
        onEdit={noop}
        subtitle="Generated component"
        title="UserProfile.tsx"
        type="code"
        value={SAMPLE}
      >
        <AIArtifactToolbar>
          <AIArtifactCopyButton />
          <AIArtifactEditButton />
          <AIArtifactDownloadButton />
          <AIArtifactFullscreenButton />
        </AIArtifactToolbar>
        <AIArtifactContent>
          <pre className="font-mono text-xs leading-relaxed">{SAMPLE}</pre>
        </AIArtifactContent>
        <AIArtifactVersions>
          <AIArtifactVersion label="v1" />
          <AIArtifactVersion active label="v2" />
        </AIArtifactVersions>
      </AIArtifact>,
    );
    await expect(component).toHaveScreenshot("ai-artifact-default.png");
  });

  test("minimal", async ({ mount }) => {
    const component = await mount(
      <AIArtifact title="Notes" type="document" value="" />,
    );
    await expect(component).toHaveScreenshot("ai-artifact-minimal.png");
  });
});
