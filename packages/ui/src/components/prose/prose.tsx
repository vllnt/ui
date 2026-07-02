import { cn } from "../../lib/utils";

/** Props for {@link Prose}. */
export type ProseProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
};

const proseStyles = cn(
  "font-[family-name:var(--font-sans)] text-[length:var(--font-size-body)] leading-[var(--line-height-body)] text-foreground",
  "[&>*+*]:mt-4",
  "[&_h1]:mt-8 [&_h1]:font-[family-name:var(--font-display)] [&_h1]:[font-weight:var(--font-weight-heading)] [&_h1]:text-[length:var(--font-size-h1)] [&_h1]:leading-[var(--line-height-h1)] [&_h1]:tracking-tight",
  "[&_h2]:mt-8 [&_h2]:font-[family-name:var(--font-display)] [&_h2]:[font-weight:var(--font-weight-heading)] [&_h2]:text-[length:var(--font-size-h2)] [&_h2]:leading-[var(--line-height-h2)] [&_h2]:tracking-tight",
  "[&_h3]:mt-6 [&_h3]:font-[family-name:var(--font-display)] [&_h3]:[font-weight:var(--font-weight-heading)] [&_h3]:text-[length:var(--font-size-h3)] [&_h3]:leading-[var(--line-height-h3)] [&_h3]:tracking-tight",
  "[&_h4]:mt-6 [&_h4]:font-[family-name:var(--font-display)] [&_h4]:[font-weight:var(--font-weight-heading)] [&_h4]:text-[length:var(--font-size-h4)] [&_h4]:leading-[var(--line-height-h4)] [&_h4]:tracking-tight",
  "[&_p]:text-[length:var(--font-size-body)] [&_p]:leading-[var(--line-height-body)]",
  "[&_ul]:my-4 [&_ul]:ml-6 [&_ul]:list-disc [&_ol]:my-4 [&_ol]:ml-6 [&_ol]:list-decimal [&_li]:mt-2",
  "[&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4",
  "[&_blockquote]:mt-6 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-6 [&_blockquote]:italic",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-[0.3rem] [&_code]:py-[0.2rem] [&_code]:font-mono [&_code]:text-[0.9em]",
  "[&_strong]:font-semibold",
);

/**
 * Long-form content wrapper. Styles raw HTML descendants (headings, paragraphs,
 * lists, quotes, code) with the token-driven type scale, so markdown/CMS output
 * adopts the design system without per-element classes.
 *
 * Prose does not sanitize — sanitize any untrusted CMS/markdown HTML before
 * rendering it inside Prose.
 *
 * @example
 * <Prose>{parsedMarkdown}</Prose>
 */
const Prose = ({ className, ref, ...props }: ProseProps) => (
  <div className={cn(proseStyles, className)} ref={ref} {...props} />
);
Prose.displayName = "Prose";

export { Prose };
