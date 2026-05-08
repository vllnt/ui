import type { Meta, StoryObj } from "@storybook/react-vite";

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

const SAMPLE = `export function UserProfile({ name }: { name: string }) {
  return <div className="profile">Hello, {name}</div>;
}`;

const noop = (): void => {
  return;
};

const meta = {
  args: {
    language: "tsx",
    onEdit: noop,
    subtitle: "Generated component",
    title: "UserProfile.tsx",
    type: "code",
    value: SAMPLE,
  },
  argTypes: {
    type: {
      control: "select",
      options: [
        "code",
        "document",
        "diagram",
        "table",
        "html",
        "image",
        "custom",
      ],
    },
  },
  component: AIArtifact,
  title: "AI/AIArtifact",
} satisfies Meta<typeof AIArtifact>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <AIArtifact {...args}>
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
    </AIArtifact>
  ),
};

export const ReadOnly: Story = {
  args: {
    onEdit: undefined,
  },
  render: (args) => (
    <AIArtifact {...args}>
      <AIArtifactToolbar>
        <AIArtifactCopyButton />
        <AIArtifactEditButton />
        <AIArtifactDownloadButton />
      </AIArtifactToolbar>
      <AIArtifactContent>
        <pre className="font-mono text-xs leading-relaxed">{SAMPLE}</pre>
      </AIArtifactContent>
    </AIArtifact>
  ),
};

export const Document: Story = {
  args: {
    language: "md",
    subtitle: "Generated brief",
    title: "Project brief",
    type: "document",
    value: "# Project brief\n\nThis is a generated outline.",
  },
  render: (args) => (
    <AIArtifact {...args}>
      <AIArtifactToolbar>
        <AIArtifactCopyButton />
        <AIArtifactDownloadButton />
        <AIArtifactFullscreenButton />
      </AIArtifactToolbar>
      <AIArtifactContent>
        <article className="prose prose-sm dark:prose-invert">
          <h1>Project brief</h1>
          <p>This is a generated outline that the user can refine.</p>
          <ul>
            <li>Goal — articulate the problem</li>
            <li>Scope — single-quarter</li>
          </ul>
        </article>
      </AIArtifactContent>
    </AIArtifact>
  ),
};

export const Minimal: Story = {
  args: {
    language: undefined,
    onEdit: undefined,
    subtitle: undefined,
    title: "Notes",
    type: "document",
    value: "",
  },
};
