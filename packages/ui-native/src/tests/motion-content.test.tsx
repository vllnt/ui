import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Text as NativeText, View } from "react-native";

import { BlurReveal } from "../components/blur-reveal/blur-reveal";
import { CodeBlock } from "../components/code-block/code-block";
import { DocumentSiblingNav } from "../components/document-sibling-nav/document-sibling-nav";
import { RevealText } from "../components/reveal-text/reveal-text";
import { ScrambleText } from "../components/scramble-text/scramble-text";
import { ShareSection } from "../components/share-section/share-section";
import { ShimmerText } from "../components/shimmer-text/shimmer-text";
import { SpinningText } from "../components/spinning-text/spinning-text";
import { Terminal } from "../components/terminal/terminal";
import { TextAnimate } from "../components/text-animate/text-animate";
import { TextReveal } from "../components/text-reveal/text-reveal";
import { TextShimmer } from "../components/text-shimmer/text-shimmer";
import { Typewriter } from "../components/typewriter/typewriter";

const motionService = {
  addEventListener(
    eventName: "reduceMotionChanged",
    listener: (enabled: boolean) => void,
  ) {
    void eventName;
    void listener;
    return { remove() {} };
  },
  async isReduceMotionEnabled() {
    return false;
  },
};

const reducedMotionService = {
  addEventListener(
    eventName: "reduceMotionChanged",
    listener: (enabled: boolean) => void,
  ) {
    void eventName;
    void listener;
    return {
      remove() {
        return;
      },
    };
  },
  async isReduceMotionEnabled() {
    return true;
  },
};

describe("native motion and content utilities", () => {
  it("renders complete accessible text when motion is reduced", async () => {
    render(
      <View>
        <BlurReveal reducedMotionService={reducedMotionService}>
          <NativeText>Blur fallback</NativeText>
        </BlurReveal>
        <RevealText reducedMotionService={reducedMotionService}>
          <NativeText>Controlled reveal</NativeText>
        </RevealText>
        <ScrambleText
          reducedMotionService={reducedMotionService}
          text="SCRAMBLE"
        />
        <ShimmerText reducedMotionService={reducedMotionService}>
          Shimmer
        </ShimmerText>
        <SpinningText reducedMotionService={reducedMotionService}>
          Native ring
        </SpinningText>
        <TextAnimate reducedMotionService={reducedMotionService}>
          Animated words
        </TextAnimate>
        <TextReveal progress={0} reducedMotionService={reducedMotionService}>
          Readable words
        </TextReveal>
        <TextShimmer reducedMotionService={reducedMotionService}>
          Text shimmer
        </TextShimmer>
        <Typewriter
          reducedMotionService={reducedMotionService}
          text="Typed text"
        />
      </View>,
    );

    await waitFor(() => {
      expect(screen.getByText("SCRAMBLE")).toBeOnTheScreen();
      expect(screen.getByText("Typed text")).toBeOnTheScreen();
    });
    expect(screen.getByLabelText("Native ring")).toBeOnTheScreen();
    expect(screen.getByLabelText("Animated words")).toBeOnTheScreen();
    expect(screen.getByLabelText("Readable words")).toBeOnTheScreen();
  });

  it("stops text motion timers after completion", async () => {
    jest.useFakeTimers();
    render(
      <View>
        <ScrambleText
          duration={20}
          reducedMotionService={motionService}
          text="AB"
        />
        <Typewriter reducedMotionService={motionService} speed={10} text="CD" />
      </View>,
    );

    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByText("AB")).toBeOnTheScreen();
    expect(screen.getByText("CD")).toBeOnTheScreen();
    expect(jest.getTimerCount()).toBe(0);
    jest.useRealTimers();
  });

  it("keeps code plain unless a renderer is injected and uses an explicit clipboard", async () => {
    const setText = jest.fn(async (): Promise<void> => {
      await Promise.resolve();
    });
    render(
      <CodeBlock
        clipboard={{ getText: async () => "", setText }}
        code="const native = true;"
        copyLabels={{
          copied: "Code copied",
          copy: "Copy native code",
          unavailable: "Copy unavailable",
        }}
        language="typescript"
        showLanguage
      />,
    );

    expect(screen.getByText("const native = true;")).toHaveProp(
      "selectable",
      true,
    );
    fireEvent.press(screen.getByRole("button", { name: "Copy native code" }));
    await waitFor(() => {
      expect(setText).toHaveBeenCalledWith("const native = true;");
      expect(
        screen.getByRole("button", { name: "Code copied" }),
      ).toBeOnTheScreen();
    });
  });

  it("opens document links and the native share sheet through injected services", async () => {
    const openUrl = jest.fn(
      async (): Promise<{ readonly status: "opened" }> => ({
        status: "opened",
      }),
    );
    const share = jest.fn(
      async (): Promise<{ readonly status: "shared" }> => ({
        status: "shared",
      }),
    );
    render(
      <View>
        <DocumentSiblingNav
          labels={{
            navigation: "Article navigation",
            next: "Next article",
            previous: "Previous article",
          }}
          linking={{ openUrl }}
          next={{ href: "https://example.com/next", title: "Native follow-up" }}
        />
        <ShareSection
          content={{ message: "Native release", url: "https://example.com" }}
          labels={{
            share: "Share release",
            unavailable: "Sharing unavailable",
          }}
          shareService={{ share }}
          title="Share this release"
        />
      </View>,
    );

    fireEvent.press(
      screen.getByRole("link", { name: "Next article: Native follow-up" }),
    );
    fireEvent.press(screen.getByRole("button", { name: "Share release" }));

    await waitFor(() => {
      expect(openUrl).toHaveBeenCalledWith("https://example.com/next");
      expect(share).toHaveBeenCalledWith(
        { message: "Native release", url: "https://example.com" },
        undefined,
      );
    });
  });

  it("copies only terminal command lines and exposes unavailable copy truthfully", async () => {
    const setText = jest.fn(async (): Promise<void> => {
      await Promise.resolve();
    });
    const { rerender } = render(
      <Terminal
        clipboard={{ getText: async () => "", setText }}
        copyLabels={{
          copied: "Commands copied",
          copy: "Copy commands",
          unavailable: "Copy unavailable",
        }}
        lines={[
          { content: "pnpm test", type: "command" },
          { content: "Tests passed", type: "output" },
        ]}
        title="Test terminal"
      />,
    );

    fireEvent.press(screen.getByRole("button", { name: "Copy commands" }));
    await waitFor(() => {
      expect(setText).toHaveBeenCalledWith("pnpm test");
    });

    rerender(
      <Terminal
        copyLabels={{
          copied: "Commands copied",
          copy: "Copy commands",
          unavailable: "Copy unavailable",
        }}
        lines={[{ content: "pnpm build", type: "command" }]}
        title="Build terminal"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Copy unavailable" }),
    ).toBeDisabled();
  });
});
