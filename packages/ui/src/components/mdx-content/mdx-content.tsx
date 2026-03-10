import { evaluate } from "@mdx-js/mdx";
import type React from "react";
import * as runtime from "react/jsx-runtime";
import ReactMarkdown, { type Components } from "react-markdown";

import { CodeBlock } from "../code-block/code-block";

type MDXContentProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components?: Record<string, React.ComponentType<any>>;
  content: string;
  enableMDX?: boolean;
};

const MDXComponents: Components = {
  a: ({ children, href, ...props }: React.ComponentProps<"a">) => (
    <a
      className="text-primary underline underline-offset-4 hover:text-primary/80 font-medium"
      href={href}
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote
      className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6 py-2 text-sm"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }: React.ComponentProps<"code">) => {
    if (typeof className === "string" && className.startsWith("language-")) {
      const language = className.replace(/^language-/, "");
      const text =
        typeof children === "string"
          ? children.replace(/\n$/, "")
          : String(children ?? "");
      return <CodeBlock language={language}>{text}</CodeBlock>;
    }
    return (
      <code
        className="bg-muted px-1 py-0.5 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },
  em: ({ children, ...props }: React.ComponentProps<"em">) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  h1: ({ children, ...props }: React.ComponentProps<"h1">) => (
    <h1 className="text-2xl font-bold mt-8 mb-4" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.ComponentProps<"h2">) => (
    <h2 className="text-xl font-bold mt-6 mb-3" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.ComponentProps<"h3">) => (
    <h3 className="text-lg font-bold mt-4 mb-2" {...props}>
      {children}
    </h3>
  ),
  hr: ({ ...props }: React.ComponentProps<"hr">) => (
    <hr className="my-8 border-border" {...props} />
  ),
  li: ({ children, ...props }: React.ComponentProps<"li">) => (
    <li
      className="mb-2 leading-relaxed text-muted-foreground text-sm pl-2"
      {...props}
    >
      {children}
    </li>
  ),
  ol: ({ children, ...props }: React.ComponentProps<"ol">) => (
    <ol
      className="list-decimal list-outside mb-6 space-y-2 ml-6 text-muted-foreground text-sm"
      {...props}
    >
      {children}
    </ol>
  ),
  p: ({ children, ...props }: React.ComponentProps<"p">) => (
    <p
      className="mb-6 leading-relaxed text-muted-foreground text-sm max-w-none"
      {...props}
    >
      {children}
    </p>
  ),
  pre: ({ children }: React.ComponentProps<"pre">) => (
    <div className="contents">{children}</div>
  ),
  strong: ({ children, ...props }: React.ComponentProps<"strong">) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  ),
  ul: ({ children, ...props }: React.ComponentProps<"ul">) => (
    <ul
      className="list-disc list-outside mb-6 space-y-2 ml-6 text-muted-foreground text-sm"
      {...props}
    >
      {children}
    </ul>
  ),
};

const proseClasses = [
  "prose prose-lg dark:prose-invert max-w-none",
  "prose-headings:font-bold prose-headings:tracking-tight",
  "prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4",
  "prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3",
  "prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2",
  "prose-p:leading-relaxed prose-p:mb-6 prose-p:text-muted-foreground prose-p:text-sm prose-p:max-w-none",
  "prose-ul:my-6 prose-ul:ml-6 prose-ul:list-disc prose-ul:list-outside",
  "prose-ol:my-6 prose-ol:ml-6 prose-ol:list-decimal prose-ol:list-outside",
  "prose-li:mb-2 prose-li:leading-relaxed prose-li:pl-2",
  "prose-strong:font-semibold prose-em:italic",
  "prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-primary/80",
  "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono",
  "prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:bg-black prose-pre:py-4 prose-pre:font-mono prose-pre:text-sm prose-pre:text-white prose-pre:shadow-lg dark:prose-pre:bg-zinc-900",
  "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-6 prose-blockquote:py-2",
  "prose-hr:my-8 prose-hr:border-border",
  "prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-border",
  "prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:font-medium",
  "prose-td:border prose-td:border-border prose-td:p-2",
  "prose-img:rounded-lg prose-img:border prose-img:border-border prose-img:shadow-lg",
].join(" ");

function removeImportStatements(
  content: string,
  componentNames: string[],
): string {
  let processed = content.replaceAll(/^import\s+.*CodeBlock.*from.*$/gm, "");
  componentNames.forEach((name) => {
    processed = processed.replaceAll(
      new RegExp(`^import\\s+.*${name}.*from.*$`, "gm"),
      "",
    );
  });
  return processed;
}

function buildCustomComponents(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  injectedComponents: Record<string, React.ComponentType<any>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, React.ComponentType<any>> {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CodeBlock: CodeBlock as React.ComponentType<any>,
    ...injectedComponents,
  };
}

export async function MDXContent({
  components = {},
  content,
  enableMDX = true,
}: MDXContentProps) {
  const componentNames = Object.keys(components);
  const processedContent = removeImportStatements(content, componentNames);
  const contentWithoutCodeBlocks = processedContent.replaceAll(
    /```[\S\s]*?```/g,
    "",
  );
  const hasJSX = /<[A-Z][A-Za-z]*/.test(contentWithoutCodeBlocks);

  const customComponents = buildCustomComponents(components);
  const allComponents = { ...MDXComponents, ...customComponents };

  if (enableMDX && hasJSX) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let Component: React.ComponentType<{ components: any }> | undefined;

    try {
      const result = await evaluate(processedContent, {
        ...runtime,
        baseUrl: import.meta.url,
      });
      Component = result.default;
    } catch (error) {
      console.error("Error rendering MDX:", error);
    }

    if (Component) {
      return (
        <div className={proseClasses}>
          <Component components={allComponents} />
        </div>
      );
    }

    return (
      <div className={proseClasses}>
        <ReactMarkdown components={allComponents}>{content}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className={proseClasses}>
      <ReactMarkdown components={allComponents}>{content}</ReactMarkdown>
    </div>
  );
}
