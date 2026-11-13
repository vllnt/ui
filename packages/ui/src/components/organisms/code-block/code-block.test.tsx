import { createRef } from "react";

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CodeBlock, type CodeBlockProps } from "./code-block";

const harness = vi.hoisted(() => ({
  packageRootLoaded: vi.fn(),
}));

vi.mock("react-syntax-highlighter", async (importOriginal) => {
  harness.packageRootLoaded();
  return importOriginal();
});

const HIGHLIGHTER_LOAD_MS = 15_000;
const TEST_TIMEOUT_MS = 20_000;

async function renderHighlightedKeyword(): Promise<HTMLElement> {
  const { container } = render(<CodeBlock>const answer = 42;</CodeBlock>);
  return waitFor(
    () => {
      const keyword = container.querySelector<HTMLElement>("code .token");
      expect(keyword?.textContent).toBe("const");
      return keyword ?? container;
    },
    { timeout: HIGHLIGHTER_LOAD_MS },
  );
}

describe("CodeBlock", () => {
  it("renders a visible root that merges className", () => {
    const { container } = render(<CodeBlock className="custom-class" />);
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("shows the raw code in the fallback before the highlighter loads", () => {
    const { container } = render(<CodeBlock>const answer = 42;</CodeBlock>);
    expect(container.textContent).toContain("const answer = 42;");
  });

  it(
    "highlights with the Prism build and never loads the package root",
    async () => {
      await renderHighlightedKeyword();
      expect(harness.packageRootLoaded).not.toHaveBeenCalled();
    },
    TEST_TIMEOUT_MS,
  );
});

describe("CodeBlock syntax colours", () => {
  it(
    "colours tokens from theme-aware CSS variables instead of a JS-detected theme",
    async () => {
      const keyword = await renderHighlightedKeyword();
      expect(keyword.getAttribute("style")).toContain("--vllnt-code-keyword");
    },
    TEST_TIMEOUT_MS,
  );
});

type ClipboardLike = {
  writeText: (value: string) => Promise<void>;
};

function setClipboard(clipboard: ClipboardLike | undefined): () => void {
  const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: clipboard,
    writable: true,
  });
  return () => {
    if (original) {
      Object.defineProperty(navigator, "clipboard", original);
    } else {
      Reflect.deleteProperty(navigator, "clipboard");
    }
  };
}

function noop(): void {
  return;
}

const SNIPPET = "const a = 1;\nconst b = 2;\nconst c = 3;";
const COPY_NAME = "Copy code";
const COPIED_RESET_MS = 2000;

async function renderHighlighted(
  props: Partial<CodeBlockProps> = {},
): Promise<HTMLElement> {
  const { container } = render(<CodeBlock {...props}>{SNIPPET}</CodeBlock>);
  await waitFor(
    () => {
      expect(container.querySelector("code .token")).not.toBeNull();
    },
    { timeout: HIGHLIGHTER_LOAD_MS },
  );
  return container;
}

function getHeader(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>(".border-b");
}

describe("CodeBlock header", () => {
  it("renders the title, the language and a named Copy button when title is set", () => {
    const { container } = render(
      <CodeBlock language="tsx" title="app.tsx">
        {SNIPPET}
      </CodeBlock>,
    );
    const header = getHeader(container);
    expect(header).not.toBeNull();
    expect(header).toHaveTextContent("app.tsx");
    expect(header).toHaveTextContent("tsx");
    const button = screen.getByRole("button", { name: COPY_NAME });
    expect(header).toContainElement(button);
    expect(button).toHaveAccessibleName(COPY_NAME);
  });

  it("accepts a node as the title", () => {
    render(<CodeBlock title={<em>src/index.ts</em>}>{SNIPPET}</CodeBlock>);
    expect(screen.getByText("src/index.ts").tagName).toBe("EM");
  });

  it("renders no header and no language label without a title", () => {
    const { container } = render(<CodeBlock>{SNIPPET}</CodeBlock>);
    expect(getHeader(container)).toBeNull();
    expect(screen.queryByText("typescript")).toBeNull();
    expect(screen.getAllByRole("button", { name: COPY_NAME })).toHaveLength(1);
  });

  it("renders no header for an empty title", () => {
    const { container } = render(<CodeBlock title="">{SNIPPET}</CodeBlock>);
    expect(getHeader(container)).toBeNull();
    expect(screen.getAllByRole("button", { name: COPY_NAME })).toHaveLength(1);
  });

  it("shows the language over the code with showLanguage and no title", () => {
    const { container } = render(
      <CodeBlock language="python" showLanguage>
        {SNIPPET}
      </CodeBlock>,
    );
    expect(getHeader(container)).toBeNull();
    expect(screen.getByText("python")).toBeVisible();
  });

  it("shows the language once in the header even with showLanguage", () => {
    render(
      <CodeBlock language="python" showLanguage title="main.py">
        {SNIPPET}
      </CodeBlock>,
    );
    expect(screen.getAllByText("python")).toHaveLength(1);
  });

  it("renders a header for a title and no code", () => {
    const { container } = render(
      <CodeBlock title="empty.ts">{null}</CodeBlock>,
    );
    expect(getHeader(container)).toHaveTextContent("empty.ts");
    expect(screen.getByRole("button", { name: COPY_NAME })).toBeEnabled();
  });
});

describe("CodeBlock copy state", () => {
  let restoreClipboard: () => void = noop;
  const writeText = vi.fn<(value: string) => Promise<void>>();

  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue();
    restoreClipboard = setClipboard({ writeText });
  });

  afterEach(() => {
    restoreClipboard();
    vi.useRealTimers();
  });

  it("starts with an empty polite live region", () => {
    render(<CodeBlock>{SNIPPET}</CodeBlock>);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toBeEmptyDOMElement();
  });

  it("shows a visible Copied word in the live region after a copy and keeps the button name", async () => {
    render(<CodeBlock>{SNIPPET}</CodeBlock>);
    fireEvent.click(screen.getByRole("button", { name: COPY_NAME }));
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Copied");
    });
    expect(writeText).toHaveBeenCalledWith(SNIPPET);
    expect(screen.getByRole("status")).toBeVisible();
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("button")).toHaveAccessibleName(COPY_NAME);
  });

  it("copies from the header Copy button when title is set", async () => {
    render(<CodeBlock title="app.ts">{SNIPPET}</CodeBlock>);
    fireEvent.click(screen.getByRole("button", { name: COPY_NAME }));
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Copied");
    });
    expect(writeText).toHaveBeenCalledWith(SNIPPET);
    expect(screen.getByRole("button")).toHaveAccessibleName(COPY_NAME);
  });

  it("clears Copied after the reset delay", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<CodeBlock>{SNIPPET}</CodeBlock>);
    fireEvent.click(screen.getByRole("button", { name: COPY_NAME }));
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Copied");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(COPIED_RESET_MS);
    });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("never shows Copied when the clipboard API is unavailable", async () => {
    restoreClipboard();
    restoreClipboard = setClipboard(undefined);
    render(<CodeBlock>{SNIPPET}</CodeBlock>);
    const button = screen.getByRole("button", { name: COPY_NAME });
    expect(() => {
      fireEvent.click(button);
    }).not.toThrow();
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(button).toHaveAccessibleName(COPY_NAME);
  });

  it("never shows Copied when writeText rejects", async () => {
    writeText.mockRejectedValue(new Error("NotAllowedError"));
    render(<CodeBlock>{SNIPPET}</CodeBlock>);
    fireEvent.click(screen.getByRole("button", { name: COPY_NAME }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});

describe("CodeBlock wrap", () => {
  it("scrolls horizontally by default", () => {
    const { container } = render(<CodeBlock>{SNIPPET}</CodeBlock>);
    const pre = container.querySelector("pre");
    expect(pre).not.toHaveClass("whitespace-pre-wrap");
    expect(pre).not.toHaveClass("break-words");
  });

  it("wraps the fallback before the highlighter loads", () => {
    const { container } = render(<CodeBlock wrap>{SNIPPET}</CodeBlock>);
    const pre = container.querySelector("pre");
    expect(pre).toHaveClass("whitespace-pre-wrap");
    expect(pre).toHaveClass("break-words");
  });

  it(
    "wraps the highlighted code with wrap",
    async () => {
      const container = await renderHighlighted({ wrap: true });
      const code = container.querySelector("code");
      expect(code).toHaveClass("whitespace-pre-wrap");
      expect(code).toHaveClass("break-words");
      expect(code).toHaveStyle({ whiteSpace: "pre-wrap" });
    },
    TEST_TIMEOUT_MS,
  );

  it(
    "keeps the highlighted code on one line by default",
    async () => {
      const container = await renderHighlighted();
      const code = container.querySelector("code");
      expect(code).not.toHaveClass("whitespace-pre-wrap");
      expect(code).toHaveStyle({ whiteSpace: "pre" });
    },
    TEST_TIMEOUT_MS,
  );
});

describe("CodeBlock line numbers", () => {
  it(
    "renders no numbers by default",
    async () => {
      const container = await renderHighlighted();
      expect(container.querySelectorAll(".linenumber")).toHaveLength(0);
    },
    TEST_TIMEOUT_MS,
  );

  it(
    "numbers every line with showLineNumbers",
    async () => {
      const container = await renderHighlighted({ showLineNumbers: true });
      const numbers = [...container.querySelectorAll(".linenumber")].map(
        (element) => element.textContent,
      );
      expect(numbers).toEqual(["1", "2", "3"]);
    },
    TEST_TIMEOUT_MS,
  );

  it(
    "numbers wrapped lines too",
    async () => {
      const container = await renderHighlighted({
        showLineNumbers: true,
        wrap: true,
      });
      expect(container.querySelectorAll(".linenumber")).toHaveLength(3);
    },
    TEST_TIMEOUT_MS,
  );

  it(
    "keeps wrapped numbered lines out of flex rows, which split a line into columns",
    async () => {
      const container = await renderHighlighted({
        showLineNumbers: true,
        wrap: true,
      });
      expect(
        container.querySelector('code [style*="display: flex"]'),
      ).toBeNull();
    },
    TEST_TIMEOUT_MS,
  );

  it(
    "does not put the numbers in the copied text",
    async () => {
      const writeText = vi.fn<(value: string) => Promise<void>>();
      writeText.mockResolvedValue();
      const restore = setClipboard({ writeText });
      try {
        await renderHighlighted({ showLineNumbers: true });
        fireEvent.click(screen.getByRole("button", { name: COPY_NAME }));
        await waitFor(() => {
          expect(writeText).toHaveBeenCalledWith(SNIPPET);
        });
      } finally {
        restore();
      }
    },
    TEST_TIMEOUT_MS,
  );

  it("does not throw for empty code with showLineNumbers", () => {
    const { container } = render(<CodeBlock showLineNumbers>{[]}</CodeBlock>);
    expect(container.firstChild).toBeVisible();
  });
});

describe("CodeBlock default render", () => {
  it("keeps the root classes and a single Copy button without the new props", () => {
    const { container } = render(<CodeBlock>{SNIPPET}</CodeBlock>);
    expect(container.firstChild).toHaveClass(
      "relative",
      "w-full",
      "overflow-hidden",
      "rounded-md",
      "border",
      "bg-background",
    );
    expect(getHeader(container)).toBeNull();
    expect(container.querySelectorAll("button")).toHaveLength(1);
    expect(container.querySelector("pre")).toHaveClass("min-w-fit");
    expect(container.querySelector("pre")).not.toHaveClass(
      "whitespace-pre-wrap",
    );
  });

  it("forwards ref to the root element and sets a display name", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<CodeBlock ref={ref}>{SNIPPET}</CodeBlock>);
    expect(ref.current).toBe(container.firstChild);
    expect(CodeBlock.displayName).toBe("CodeBlock");
  });
});
