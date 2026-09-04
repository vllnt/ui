import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text as NativeText, View } from "react-native";

import {
  AIArtifact,
  AIArtifactContent,
  AIArtifactCopyButton,
  AIArtifactDownloadButton,
  AIArtifactToolbar,
  AIArtifactVersion,
  AIArtifactVersions,
} from "./ai-artifact/ai-artifact";
import { AIMessageBubble } from "./ai-message-bubble/ai-message-bubble";
import { AISourceCitation } from "./ai-source-citation/ai-source-citation";
import { AIStreamingText } from "./ai-streaming-text/ai-streaming-text";
import { AIToolCallDisplay } from "./ai-tool-call-display/ai-tool-call-display";
import { AspectRatio } from "./aspect-ratio/aspect-ratio";
import { Callout } from "./callout/callout";
import { ContentIntro } from "./content-intro/content-intro";
import { CreditBadge } from "./credit-badge/credit-badge";
import { FloatingActionButton } from "./floating-action-button/floating-action-button";
import { GlassProgress } from "./glass-progress/glass-progress";
import { PlanBadge } from "./plan-badge/plan-badge";
import { RoleBadge } from "./role-badge/role-badge";
import { Spinner } from "./spinner/spinner";
import { TLDRSection } from "./tldr-section/tldr-section";
import { TruncatedText } from "./truncated-text/truncated-text";

describe("native content, AI, and utility components", () => {
  it.each([
    [
      `${"-".repeat(20_000)}Report title${"!".repeat(20_000)}`,
      "report-title.txt",
    ],
    ["-".repeat(20_000), "artifact.txt"],
  ])("normalizes long artifact titles for download (%#)", (title, filename) => {
    const onDownload = jest.fn();
    render(
      <AIArtifact onDownload={onDownload} title={title} value="content">
        <AIArtifactDownloadButton />
      </AIArtifact>,
    );
    fireEvent.press(screen.getByRole("button", { name: "Download" }));
    expect(onDownload).toHaveBeenCalledWith("content", filename);
  });

  it("renders semantic badges and content surfaces", () => {
    render(
      <View>
        <Callout variant="danger">Retry the request.</Callout>
        <CreditBadge amount="12" status="low" />
        <PlanBadge state="trial" tier="growth" />
        <RoleBadge accountRole="owner" />
        <AIMessageBubble author="VLLNT" messageRole="assistant" status="ready">
          Result available.
        </AIMessageBubble>
      </View>,
    );

    expect(screen.getByRole("alert", { name: "Danger" })).toBeOnTheScreen();
    expect(screen.getByText("12 • Credits running low")).toBeOnTheScreen();
    expect(screen.getByText("Growth • Trial")).toBeOnTheScreen();
    expect(screen.getByText("Owner")).toBeOnTheScreen();
    expect(screen.getByText("Result available.")).toBeOnTheScreen();
  });

  it("clamps progress and preserves native aspect-ratio layout", () => {
    render(
      <View>
        <GlassProgress testID="progress" value={140} />
        <AspectRatio ratio={16 / 9} testID="ratio">
          <NativeText>Preview</NativeText>
        </AspectRatio>
      </View>,
    );

    expect(screen.getByRole("progressbar")).toHaveAccessibilityValue({
      max: 100,
      min: 0,
      now: 100,
    });
    expect(screen.getByTestId("progress-fill")).toHaveStyle({ width: "100%" });
    expect(screen.getByTestId("ratio")).toHaveStyle({ aspectRatio: 16 / 9 });
  });

  it("exposes truncation and streaming state accessibly", () => {
    const longTitle = "A complete and deliberately long native artifact title";
    render(
      <View>
        <TruncatedText maxWidth={120} testID="truncated">
          {longTitle}
        </TruncatedText>
        <AIStreamingText isStreaming text="Generating response" />
        <Spinner accessibilityLabel="Loading answer" size="sm" />
      </View>,
    );

    expect(screen.getByTestId("truncated")).toHaveProp("numberOfLines", 1);
    expect(screen.getByTestId("truncated")).toHaveProp("ellipsizeMode", "tail");
    expect(screen.getByLabelText(longTitle)).toBeOnTheScreen();
    expect(screen.getByLabelText("Generating response")).toHaveProp(
      "accessibilityLiveRegion",
      "polite",
    );
    expect(
      screen.getByRole("progressbar", { name: "Loading answer" }),
    ).toHaveProp("accessibilityState", { busy: true });
  });

  it("toggles disclosure and tool payload states", () => {
    render(
      <View>
        <TLDRSection label="Summary">Keep changes local.</TLDRSection>
        <AIToolCallDisplay
          input='{"scope":"native"}'
          output='{"status":"ok"}'
          status="complete"
          toolName="audit.run"
        />
      </View>,
    );

    expect(screen.queryByText("Keep changes local.")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Summary" }));
    expect(screen.getByText("Keep changes local.")).toBeOnTheScreen();

    expect(screen.queryByText('{"scope":"native"}')).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Tool input" }));
    expect(screen.getByText('{"scope":"native"}')).toBeOnTheScreen();
    expect(screen.getByText("complete")).toBeOnTheScreen();
  });

  it("navigates tutorial sections and starts from current progress", () => {
    const onGoToSection = jest.fn();
    const onStart = jest.fn();
    render(
      <ContentIntro
        completedSections={new Set(["setup"])}
        estimatedTime="8 min"
        onGoToSection={onGoToSection}
        onStart={onStart}
        renderIntroContent={() => <NativeText>Read the overview.</NativeText>}
        sections={[
          { id: "setup", title: "Set up" },
          { id: "ship", title: "Ship" },
        ]}
        title="Native tutorial"
      />,
    );

    expect(screen.getByText("1/2 completed")).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("button", { name: "Ship" }));
    fireEvent.press(screen.getByRole("button", { name: "Continue Tutorial" }));

    expect(onGoToSection).toHaveBeenCalledWith(1);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("uses explicit native adapters for citation and artifact actions", () => {
    const onOpen = jest.fn();
    const onCopy = jest.fn();
    render(
      <View>
        <AISourceCitation
          href="https://example.com/spec"
          onOpen={onOpen}
          snippet="Native source details"
          source="Product spec"
          title="Registry requirements"
        />
        <AIArtifact
          language="tsx"
          onCopy={onCopy}
          title="UserProfile"
          value="export function UserProfile() {}"
        >
          <AIArtifactToolbar>
            <AIArtifactCopyButton />
          </AIArtifactToolbar>
          <AIArtifactContent>
            <NativeText>Plain consumer-rendered content</NativeText>
          </AIArtifactContent>
          <AIArtifactVersions>
            <AIArtifactVersion active label="v2" />
          </AIArtifactVersions>
        </AIArtifact>
      </View>,
    );

    fireEvent.press(
      screen.getByRole("link", {
        name: "Registry requirements, Product spec",
      }),
    );
    fireEvent.press(screen.getByRole("button", { name: "Copy" }));

    expect(onOpen).toHaveBeenCalledWith("https://example.com/spec");
    expect(onCopy).toHaveBeenCalledWith("export function UserProfile() {}");
    expect(screen.getByRole("button", { name: "v2" })).toHaveProp(
      "accessibilityState",
      { selected: true },
    );
  });

  it("positions and invokes the floating native action", () => {
    const onPress = jest.fn();
    render(
      <View>
        <FloatingActionButton
          accessibilityLabel="Create note"
          onPress={onPress}
          position="bottom-left"
        >
          <NativeText>+</NativeText>
        </FloatingActionButton>
      </View>,
    );

    fireEvent.press(screen.getByRole("button", { name: "Create note" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
