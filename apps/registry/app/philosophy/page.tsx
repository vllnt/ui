import { MDXContent, Sidebar } from "@vllnt/ui";

import { getSidebarSections } from "@/lib/sidebar-sections";

export default async function PhilosophyPage() {
  const philosophy = `# Philosophy

VLLNT UI is built on a set of core principles that guide every design decision and implementation choice.

## Minimalist Design

Less is more. Every component is designed with simplicity at its core. We believe that good design should be invisible—it should work seamlessly without drawing unnecessary attention to itself. Our components are:

- Clean and uncluttered
- Focused on essential functionality
- Free from decorative elements
- Purposeful in every detail

## Dark Mode First

Dark mode isn't an afterthought—it's the primary design direction. Every component is crafted with dark backgrounds in mind, ensuring optimal readability and visual comfort. Light mode is available, but dark mode is where VLLNT UI truly shines.

- Designed for low-light environments
- Reduced eye strain
- Modern aesthetic
- Professional appearance

## No Emoji Style

We maintain a professional, text-based approach. Emojis and decorative icons are kept to a minimum, ensuring our components remain timeless and universally applicable.

- Text-first communication
- Professional tone
- Universal compatibility
- Clean typography

## Fast Components

Performance is not negotiable. Every component is optimized for speed and efficiency:

- Lightweight implementations
- Minimal dependencies
- Optimized rendering
- Fast load times

## Technical Excellence

Beyond aesthetics, VLLNT UI prioritizes:

- **Type Safety**: Built with TypeScript for reliability
- **Accessibility**: WCAG compliant components
- **Customization**: Easy to extend and modify
- **Modern Standards**: Built on latest web technologies

## Getting Started

All components follow these principles. When you use VLLNT UI, you're not just adding components—you're adopting a philosophy of clean, fast, and purposeful design.
`;

  return (
    <>
      <Sidebar sections={getSidebarSections()} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Philosophy</h1>
            <p className="text-muted-foreground text-lg">
              The principles that guide VLLNT UI design and development.
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg dark:prose-headings:text-white prose-p:leading-7 prose-blockquote:mt-6 prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:italic prose-ul:my-6 prose-ul:ml-6 prose-ul:list-disc prose-ol:my-6 prose-ol:ml-6 prose-ol:list-decimal prose-code:relative prose-code:rounded prose-code:bg-muted prose-code:px-[0.3rem] prose-code:py-[0.2rem] prose-code:text-sm  prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:bg-black prose-pre:py-4  prose-pre:text-sm prose-pre:text-white prose-pre:shadow-lg dark:prose-pre:bg-zinc-900 prose-hr:my-8 prose-hr:border-border prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-border prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:font-medium prose-td:border prose-td:border-border prose-td:p-2 prose-img:rounded-lg prose-img:border prose-img:border-border prose-img:shadow-lg prose-a:font-medium prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-primary/80 prose-strong:font-semibold prose-em:italic prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
              <MDXContent content={philosophy} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
