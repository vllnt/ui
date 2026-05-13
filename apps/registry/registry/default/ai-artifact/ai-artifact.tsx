"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  use,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  Pencil,
} from "lucide-react";

import { cn } from "@vllnt/ui";
import { Badge } from "@vllnt/ui";
import { Button } from "@vllnt/ui";

const COPIED_TIMEOUT_MS = 2000;

/**
 * Artifact rendering type for {@link AIArtifact}. Drives the visual badge
 * but consumers render the actual content inside {@link AIArtifactContent}.
 *
 * @public
 */
export type AIArtifactType =
  | "code"
  | "custom"
  | "diagram"
  | "document"
  | "html"
  | "image"
  | "table";

/**
 * Localizable strings.
 *
 * @public
 */
export type AIArtifactLabels = {
  /** Aria-label after a successful copy. Defaults to `"Copied"`. */
  copied?: string;
  /** Aria-label for the copy control. Defaults to `"Copy"`. */
  copy?: string;
  /** Aria-label for the download control. Defaults to `"Download"`. */
  download?: string;
  /** Aria-label for the edit control. Defaults to `"Edit"`. */
  edit?: string;
  /** Aria-label for the fullscreen control when collapsed. Defaults to `"Enter fullscreen"`. */
  enterFullscreen?: string;
  /** Aria-label for the fullscreen control when expanded. Defaults to `"Exit fullscreen"`. */
  exitFullscreen?: string;
  /** Aria-label for the version list. Defaults to `"Versions"`. */
  versions?: string;
};

const DEFAULT_LABELS = {
  copied: "Copied",
  copy: "Copy",
  download: "Download",
  edit: "Edit",
  enterFullscreen: "Enter fullscreen",
  exitFullscreen: "Exit fullscreen",
  versions: "Versions",
} as const satisfies Required<AIArtifactLabels>;

type AIArtifactContextValue = {
  copied: boolean;
  copy: () => Promise<boolean>;
  download: () => void;
  filename: string;
  fullscreen: boolean;
  hasOnEdit: boolean;
  labels: Required<AIArtifactLabels>;
  onEdit: () => void;
  toggleFullscreen: () => void;
  type: AIArtifactType;
  value: string;
};

const NO_OP = (): void => {
  return;
};

const DEFAULT_CONTEXT: AIArtifactContextValue = {
  copied: false,
  copy: async () => false,
  download: NO_OP,
  filename: "artifact.txt",
  fullscreen: false,
  hasOnEdit: false,
  labels: DEFAULT_LABELS,
  onEdit: NO_OP,
  toggleFullscreen: NO_OP,
  type: "code",
  value: "",
};

const AIArtifactContext =
  createContext<AIArtifactContextValue>(DEFAULT_CONTEXT);

/**
 * Hook for reading the artifact's state from inside a custom child.
 *
 * @public
 */
export function useAIArtifact(): AIArtifactContextValue {
  return use(AIArtifactContext);
}

function pickExtension(type: AIArtifactType, language: string): string {
  if (language) return language;
  switch (type) {
    case "code":
      return "txt";
    case "custom":
      return "txt";
    case "diagram":
      return "mmd";
    case "document":
      return "md";
    case "html":
      return "html";
    case "image":
      return "png";
    case "table":
      return "csv";
  }
}

const SLUG_INVALID_CHARS = /[^\da-z]+/g;
const SLUG_TRIM = /^-+|-+$/g;

type FilenameInput = {
  filename?: string;
  language: string;
  title: ReactNode;
  type: AIArtifactType;
};

function buildFilename({
  filename,
  language,
  title,
  type,
}: FilenameInput): string {
  if (filename) return filename;
  const base =
    typeof title === "string" && title.length > 0 ? title : "artifact";
  const slug = base
    .toLowerCase()
    .replaceAll(SLUG_INVALID_CHARS, "-")
    .replaceAll(SLUG_TRIM, "");
  const safeBase = slug.length > 0 ? slug : "artifact";
  return `${safeBase}.${pickExtension(type, language)}`;
}

async function writeToClipboard(value: string): Promise<boolean> {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.clipboard?.writeText !== "function"
  ) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function downloadValueAsFile(value: string, filename: string): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * Props for {@link AIArtifact}.
 *
 * @public
 */
export type AIArtifactProps = {
  /** Initial fullscreen state. */
  defaultFullscreen?: boolean;
  /** Override the auto-derived filename for downloads. */
  filename?: string;
  /** Localizable strings. */
  labels?: AIArtifactLabels;
  /** Optional language tag rendered next to the title (e.g. `tsx`). */
  language?: string;
  /** Fires when the user clicks the edit control. */
  onEdit?: () => void;
  /** Subtitle / sub-headline. */
  subtitle?: ReactNode;
  /** Primary title. */
  title?: ReactNode;
  /** Artifact type — drives the badge and default download extension. */
  type?: AIArtifactType;
  /** Raw text content used by the copy + download controls. */
  value?: string;
} & ComponentPropsWithoutRef<"section">;

type ArtifactHeaderProps = {
  language: string;
  subtitle?: ReactNode;
  title?: ReactNode;
  type: AIArtifactType;
};

function ArtifactHeader({
  language,
  subtitle,
  title,
  type,
}: ArtifactHeaderProps): ReactNode {
  if (!title && !subtitle && !language) return null;
  return (
    <header className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        {title ? (
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h3>
        ) : null}
        <Badge variant="secondary">{language || type}</Badge>
      </div>
      {subtitle ? (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      ) : null}
    </header>
  );
}

/**
 * Rendered output area for AI-generated content — code previews, documents,
 * diagrams, or any custom artifact. Composes {@link Badge} + {@link Button}.
 *
 * The compound family pairs a root context with action buttons and a
 * content slot:
 *
 * - {@link AIArtifactToolbar} — wraps the action row.
 * - {@link AIArtifactCopyButton} / {@link AIArtifactDownloadButton} —
 *   wired to `value` + `filename` automatically.
 * - {@link AIArtifactEditButton} — fires `onEdit`; hidden when no
 *   handler exists.
 * - {@link AIArtifactFullscreenButton} — toggles `data-fullscreen` on the
 *   root so consumers can drive the layout via CSS.
 * - {@link AIArtifactContent} — scrollable body slot for the actual
 *   payload (code block, MDX, mermaid output, iframe, etc.).
 * - {@link AIArtifactVersions} / {@link AIArtifactVersion} — version
 *   navigator at the bottom.
 *
 * @example
 * ```tsx
 * <AIArtifact
 *   type="code"
 *   title="UserProfile.tsx"
 *   language="tsx"
 *   value={generatedCode}
 *   onEdit={openEditor}
 * >
 *   <AIArtifactToolbar>
 *     <AIArtifactCopyButton />
 *     <AIArtifactEditButton />
 *     <AIArtifactDownloadButton />
 *     <AIArtifactFullscreenButton />
 *   </AIArtifactToolbar>
 *   <AIArtifactContent>
 *     <CodeBlock language="tsx">{generatedCode}</CodeBlock>
 *   </AIArtifactContent>
 * </AIArtifact>
 * ```
 *
 * @public
 */
type ControllerOptions = {
  defaultFullscreen: boolean;
  filename?: string;
  labels: Required<AIArtifactLabels>;
  language: string;
  onEdit?: () => void;
  title: ReactNode;
  type: AIArtifactType;
  value: string;
};

function useArtifactController(
  options: ControllerOptions,
): AIArtifactContextValue {
  const {
    defaultFullscreen,
    filename,
    labels,
    language,
    onEdit,
    title,
    type,
    value,
  } = options;
  const [fullscreen, setFullscreen] = useState(defaultFullscreen);
  const [copied, setCopied] = useState(false);
  const resolvedFilename = useMemo(
    () => buildFilename({ filename, language, title, type }),
    [filename, language, title, type],
  );

  const copy = useCallback(async () => {
    const ok = await writeToClipboard(value);
    if (!ok) return false;
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, COPIED_TIMEOUT_MS);
    return true;
  }, [value]);

  const download = useCallback(() => {
    downloadValueAsFile(value, resolvedFilename);
  }, [resolvedFilename, value]);

  const toggleFullscreen = useCallback(() => {
    setFullscreen((current) => !current);
  }, []);

  const triggerEdit = useCallback(() => {
    onEdit?.();
  }, [onEdit]);

  return useMemo<AIArtifactContextValue>(
    () => ({
      copied,
      copy,
      download,
      filename: resolvedFilename,
      fullscreen,
      hasOnEdit: onEdit !== undefined,
      labels,
      onEdit: triggerEdit,
      toggleFullscreen,
      type,
      value,
    }),
    [
      copied,
      copy,
      download,
      fullscreen,
      labels,
      onEdit,
      resolvedFilename,
      toggleFullscreen,
      triggerEdit,
      type,
      value,
    ],
  );
}

export const AIArtifact = (
  props: AIArtifactProps & React.RefAttributes<HTMLElement>,
) => {
  const {
    children,
    className,
    defaultFullscreen = false,
    filename,
    labels,
    language = "",
    onEdit,
    ref,
    subtitle,
    title,
    type = "code",
    value = "",
    ...rest
  } = props;
  const resolvedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );
  const contextValue = useArtifactController({
    defaultFullscreen,
    filename,
    labels: resolvedLabels,
    language,
    onEdit,
    title,
    type,
    value,
  });

  return (
    <AIArtifactContext.Provider value={contextValue}>
      <section
        aria-label={typeof title === "string" ? title : undefined}
        className={cn(
          "flex flex-col gap-3 rounded-2xl border bg-background p-4",
          className,
        )}
        data-fullscreen={contextValue.fullscreen ? "true" : "false"}
        data-type={type}
        ref={ref}
        {...rest}
      >
        <ArtifactHeader
          language={language}
          subtitle={subtitle}
          title={title}
          type={type}
        />
        {children}
      </section>
    </AIArtifactContext.Provider>
  );
};
AIArtifact.displayName = "AIArtifact";

/**
 * Toolbar slot — wraps action buttons in a horizontal row.
 *
 * @public
 */
export const AIArtifactToolbar = ({
  className,
  ref,
  ...rest
}: ComponentPropsWithoutRef<"div"> & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-wrap items-center gap-1.5 border-b border-border pb-2",
      className,
    )}
    ref={ref}
    role="toolbar"
    {...rest}
  />
);
AIArtifactToolbar.displayName = "AIArtifactToolbar";

type ToolbarButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children" | "type"
>;

/**
 * Copy-to-clipboard control for the artifact's `value`. Visually flips to
 * a check after a successful copy.
 *
 * @public
 */
export const AIArtifactCopyButton = ({
  className,
  onClick,
  ref,
  ...rest
}: ToolbarButtonProps & React.RefAttributes<HTMLButtonElement>) => {
  const { copied, copy, labels } = useAIArtifact();
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      void copy();
    },
    [copy, onClick],
  );
  return (
    <Button
      aria-label={copied ? labels.copied : labels.copy}
      className={cn("size-8", className)}
      onClick={handleClick}
      ref={ref}
      size="icon"
      type="button"
      variant="ghost"
      {...rest}
    >
      {copied ? (
        <Check aria-hidden="true" className="size-4" />
      ) : (
        <Copy aria-hidden="true" className="size-4" />
      )}
    </Button>
  );
};
AIArtifactCopyButton.displayName = "AIArtifactCopyButton";

/**
 * Edit control. Renders nothing when the artifact has no `onEdit`
 * handler so consumers do not have to conditionally hide it.
 *
 * @public
 */
export const AIArtifactEditButton = ({
  className,
  onClick,
  ref,
  ...rest
}: ToolbarButtonProps & React.RefAttributes<HTMLButtonElement>) => {
  const { hasOnEdit, labels, onEdit } = useAIArtifact();
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      onEdit();
    },
    [onClick, onEdit],
  );
  if (!hasOnEdit) return null;
  return (
    <Button
      aria-label={labels.edit}
      className={cn("size-8", className)}
      onClick={handleClick}
      ref={ref}
      size="icon"
      type="button"
      variant="ghost"
      {...rest}
    >
      <Pencil aria-hidden="true" className="size-4" />
    </Button>
  );
};
AIArtifactEditButton.displayName = "AIArtifactEditButton";

/**
 * Download control — saves the artifact's `value` as a file with an
 * auto-derived (or overridden) filename.
 *
 * @public
 */
export const AIArtifactDownloadButton = ({
  className,
  onClick,
  ref,
  ...rest
}: ToolbarButtonProps & React.RefAttributes<HTMLButtonElement>) => {
  const { download, labels } = useAIArtifact();
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      download();
    },
    [download, onClick],
  );
  return (
    <Button
      aria-label={labels.download}
      className={cn("size-8", className)}
      onClick={handleClick}
      ref={ref}
      size="icon"
      type="button"
      variant="ghost"
      {...rest}
    >
      <Download aria-hidden="true" className="size-4" />
    </Button>
  );
};
AIArtifactDownloadButton.displayName = "AIArtifactDownloadButton";

/**
 * Fullscreen toggle. Updates the root's `data-fullscreen` attribute so
 * consumers can drive layout changes via CSS or React state on
 * {@link useAIArtifact}.
 *
 * @public
 */
export const AIArtifactFullscreenButton = ({
  className,
  onClick,
  ref,
  ...rest
}: ToolbarButtonProps & React.RefAttributes<HTMLButtonElement>) => {
  const { fullscreen, labels, toggleFullscreen } = useAIArtifact();
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      toggleFullscreen();
    },
    [onClick, toggleFullscreen],
  );
  return (
    <Button
      aria-label={fullscreen ? labels.exitFullscreen : labels.enterFullscreen}
      aria-pressed={fullscreen}
      className={cn("size-8", className)}
      onClick={handleClick}
      ref={ref}
      size="icon"
      type="button"
      variant="ghost"
      {...rest}
    >
      {fullscreen ? (
        <Minimize2 aria-hidden="true" className="size-4" />
      ) : (
        <Maximize2 aria-hidden="true" className="size-4" />
      )}
    </Button>
  );
};
AIArtifactFullscreenButton.displayName = "AIArtifactFullscreenButton";

/**
 * Scrollable body slot. Render the actual payload here (code block,
 * markdown, mermaid output, sandboxed iframe, etc.).
 *
 * @public
 */
export const AIArtifactContent = ({
  className,
  ref,
  ...rest
}: ComponentPropsWithoutRef<"div"> & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "min-h-[6rem] overflow-auto rounded-lg border border-border bg-muted/20 p-3 text-sm text-foreground",
      className,
    )}
    ref={ref}
    {...rest}
  />
);
AIArtifactContent.displayName = "AIArtifactContent";

/**
 * Version navigator container.
 *
 * @public
 */
export const AIArtifactVersions = ({
  children,
  className,
  ref,
  ...rest
}: ComponentPropsWithoutRef<"nav"> & React.RefAttributes<HTMLElement>) => {
  const { labels } = useAIArtifact();
  return (
    <nav
      aria-label={labels.versions}
      className={cn(
        "flex flex-wrap items-center gap-1.5 border-t border-border pt-2",
        className,
      )}
      ref={ref}
      {...rest}
    >
      {children}
    </nav>
  );
};
AIArtifactVersions.displayName = "AIArtifactVersions";

/**
 * Props for {@link AIArtifactVersion}.
 *
 * @public
 */
export type AIArtifactVersionProps = {
  /** When true, renders with active styling and `aria-current="true"`. */
  active?: boolean;
  /** Caption for the chip. */
  label: ReactNode;
} & Omit<ComponentPropsWithoutRef<"button">, "type">;

/**
 * Single chip inside an {@link AIArtifactVersions}. Emits `onClick` so
 * consumers can drive version state externally.
 *
 * @public
 */
export const AIArtifactVersion = ({
  active = false,
  className,
  label,
  ref,
  ...rest
}: AIArtifactVersionProps & React.RefAttributes<HTMLButtonElement>) => (
  <button
    aria-current={active ? "true" : undefined}
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-background text-muted-foreground hover:bg-accent",
      className,
    )}
    ref={ref}
    type="button"
    {...rest}
  >
    {label}
  </button>
);
AIArtifactVersion.displayName = "AIArtifactVersion";
