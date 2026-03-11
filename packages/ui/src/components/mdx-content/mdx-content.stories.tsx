// manual
/**
 * MDXContent is an async RSC — cannot render directly in Storybook.
 * This story renders a placeholder explaining the limitation.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";

function MDXContentPlaceholder() {
  return (
    <div className="rounded border border-dashed p-8 text-center text-muted-foreground">
      <p className="text-lg font-medium">MDXContent</p>
      <p className="mt-2 text-sm">
        This is an async React Server Component. It processes MDX content
        server-side and cannot render in Storybook.
      </p>
      <p className="mt-1 text-sm">See the registry app for a live preview.</p>
    </div>
  );
}

const meta = {
  component: MDXContentPlaceholder,
  title: "Components/MDXContent",
} satisfies Meta<typeof MDXContentPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
