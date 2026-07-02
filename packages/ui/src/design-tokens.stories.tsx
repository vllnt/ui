import type { Meta, StoryObj } from "@storybook/react";

import tokens from "../../design/tokens.json";

function DesignTokensDocs() {
  const colors = Object.entries(tokens.color.semantic);
  const spacing = Object.entries(tokens.spacing.scale);
  const radius = Object.entries(tokens.radius);

  return (
    <div className="max-w-5xl space-y-8 p-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          VLLNT UI design system
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Design tokens</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Storybook mirrors packages/design/tokens.json. The root DESIGN.md file
          remains the human guide; this page exposes the same token contract for
          component authors.
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold">Semantic color</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {colors.map(([name, token]) => (
            <div
              className="rounded-lg border border-border bg-card p-4"
              key={name}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">{name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {token.role}
                  </p>
                </div>
                <code className="rounded bg-muted px-2 py-1 text-xs">
                  {token.cssVariable}
                </code>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Light</dt>
                  <dd className="font-mono">{token.light}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Dark</dt>
                  <dd className="font-mono">{token.dark}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">Spacing</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <tbody>
                {spacing.map(([name, value]) => (
                  <tr
                    className="border-b border-border last:border-b-0"
                    key={name}
                  >
                    <th className="bg-muted p-3 text-left font-medium">
                      space-{name}
                    </th>
                    <td className="p-3 font-mono">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Radius</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <tbody>
                {radius.map(([name, value]) => (
                  <tr
                    className="border-b border-border last:border-b-0"
                    key={name}
                  >
                    <th className="bg-muted p-3 text-left font-medium">
                      radius-{name}
                    </th>
                    <td className="p-3 font-mono">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Typography</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Font family, weight, and scale are theme-overridable CSS variables — a
          brand restyles the Text / Heading / Display / Prose primitives by
          overriding these tokens alone, no library edits.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {Object.entries(tokens.typography.fontFamily).map(([name, token]) => (
            <div
              className="rounded-lg border border-border bg-card p-4"
              key={name}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium">{name}</h3>
                <code className="rounded bg-muted px-2 py-1 text-xs">
                  {token.cssVariable}
                </code>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{token.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(tokens.typography.scale).map(([name, step]) => (
                <tr
                  className="border-b border-border last:border-b-0"
                  key={name}
                >
                  <th className="bg-muted p-3 text-left font-medium">{name}</th>
                  <td className="p-3 font-mono text-xs">{step.cssVariable}</td>
                  <td className="p-3 font-mono text-xs">{step.fontSize}</td>
                  <td className="p-3 font-mono text-xs">{step.lineHeight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const meta = {
  component: DesignTokensDocs,
  parameters: {
    docs: {
      description: {
        component:
          "Machine-readable VLLNT UI design tokens mirrored from packages/design/tokens.json.",
      },
    },
  },
  title: "Design/Design Tokens",
} satisfies Meta<typeof DesignTokensDocs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Tokens: Story = {};
