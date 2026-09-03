import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";

import type { ReducedMotionService } from "../primitives/use-reduced-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion/accordion";
import { AnimatedList } from "./animated-list/animated-list";
import { AnimatedTestimonials } from "./animated-testimonials/animated-testimonials";
import { Carousel } from "./carousel/carousel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible/collapsible";
import { ExpandableCards } from "./expandable-cards/expandable-cards";
import { FAQ as Faq } from "./faq/faq";
import { FloatingToolbar } from "./floating-toolbar/floating-toolbar";
import { InteractiveTimeline } from "./interactive-timeline/interactive-timeline";
import {
  calculateScrollProgress,
  ScrollProgress,
} from "./scroll-progress/scroll-progress";
import { Slideshow } from "./slideshow/slideshow";
import { TreeView } from "./tree-view/tree-view";

const reducedMotionService: ReducedMotionService = {
  addEventListener: (_eventName, listener) => {
    listener(true);
    return { remove: jest.fn() };
  },
  isReduceMotionEnabled: () =>
    new Promise((resolve) => {
      void resolve;
    }),
};

const pagingLabels = {
  next: "Next item",
  position: (index: number, total: number) => `${index} of ${total}`,
  previous: "Previous item",
  region: "Featured items",
};

describe("native interactive data and content components", () => {
  it("calculates and renders caller-driven scroll progress", () => {
    expect(
      calculateScrollProgress({
        contentOffset: { y: 300 },
        contentSize: { height: 1000 },
        layoutMeasurement: { height: 400 },
      }),
    ).toBe(0.5);
    render(<ScrollProgress label="Article progress" value={0.5} />);
    expect(screen.getByLabelText("Article progress")).toHaveProp(
      "accessibilityValue",
      { max: 100, min: 0, now: 50 },
    );
  });

  it("invokes floating toolbar actions with disabled semantics", () => {
    const rename = jest.fn();
    render(
      <FloatingToolbar
        actions={[
          { id: "rename", label: "Rename item", onPress: rename },
          {
            disabled: true,
            id: "delete",
            label: "Delete item",
            onPress: jest.fn(),
          },
        ]}
        labels={{ region: "Selection actions" }}
        x={12}
        y={24}
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Rename item" }));
    expect(rename).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Delete item" })).toBeDisabled();
  });

  it("filters and selects caller-identified timeline events", () => {
    const onSelectedIdChange = jest.fn();
    render(
      <InteractiveTimeline
        categories={[{ id: "release", label: "Releases" }]}
        endDate={new Date("2026-12-31")}
        events={[
          {
            categoryId: "release",
            id: "v1",
            startDate: new Date("2026-06-01"),
            title: "Version one",
            trackId: "product",
          },
        ]}
        formatDate={(date) => date.toISOString().slice(0, 10)}
        labels={{
          region: "Product timeline",
          zoomIn: "Zoom in",
          zoomOut: "Zoom out",
        }}
        onSelectedIdChange={onSelectedIdChange}
        startDate={new Date("2026-01-01")}
        tracks={[{ id: "product", label: "Product" }]}
      />,
    );
    fireEvent.press(
      screen.getByRole("button", { name: "Version one, 2026-06-01" }),
    );
    expect(onSelectedIdChange).toHaveBeenCalledWith("v1");
    fireEvent.press(screen.getByRole("checkbox", { name: "Releases" }));
    expect(
      screen.queryByRole("button", { name: "Version one, 2026-06-01" }),
    ).toBeNull();
  });

  it("expands branches and supports multiple tree selection", () => {
    const onSelectedIdsChange = jest.fn();
    render(
      <TreeView
        labels={{
          collapseNode: (node) => `Collapse ${node.label}`,
          expandNode: (node) => `Expand ${node.label}`,
          region: "Project files",
        }}
        nodes={[
          {
            id: "src",
            label: "Source",
            nodes: [{ id: "button", label: "Button file" }],
          },
        ]}
        onSelectedIdsChange={onSelectedIdsChange}
        selectionMode="multiple"
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Expand Source" }));
    fireEvent.press(screen.getByRole("button", { name: "Button file" }));
    expect(onSelectedIdsChange).toHaveBeenCalledWith(["button"]);
    expect(screen.getByRole("button", { name: "Button file" })).toHaveProp(
      "accessibilityState",
      { disabled: undefined, selected: true },
    );
  });

  it("shares controlled disclosure behavior across accordion and collapsible", () => {
    const onOpenIdsChange = jest.fn();
    render(
      <View>
        <Accordion
          onOpenIdsChange={onOpenIdsChange}
          openIds={[]}
          reducedMotionService={reducedMotionService}
        >
          <AccordionItem id="details">
            <AccordionTrigger label="Show details" />
            <AccordionContent>
              <Text>Accordion details</Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Collapsible id="notes" reducedMotionService={reducedMotionService}>
          <CollapsibleTrigger label="Show notes">
            <Text>Notes</Text>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Text>Native notes</Text>
          </CollapsibleContent>
        </Collapsible>
      </View>,
    );
    fireEvent.press(screen.getByRole("button", { name: "Show details" }));
    expect(onOpenIdsChange).toHaveBeenCalledWith(["details"]);
    expect(screen.queryByText("Accordion details")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Show notes" }));
    expect(screen.getByText("Native notes")).toBeOnTheScreen();
  });

  it("renders stable animated list items and advances testimonials", () => {
    render(
      <View>
        <AnimatedList
          items={[
            { content: <Text>First update</Text>, id: "first" },
            { content: <Text>Second update</Text>, id: "second" },
          ]}
          label="Updates"
          reducedMotionService={reducedMotionService}
        />
        <AnimatedTestimonials
          labels={pagingLabels}
          reducedMotionService={reducedMotionService}
          testimonials={[
            { id: "one", name: "Ari", quote: "First quote", title: "Designer" },
            { id: "two", name: "Bo", quote: "Second quote", title: "Engineer" },
          ]}
        />
      </View>,
    );
    expect(screen.getByText("First update")).toBeOnTheScreen();
    expect(screen.getByText("Second update")).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("button", { name: "Next item" }));
    expect(screen.getByText("Second quote")).toBeOnTheScreen();
  });

  it("pages native carousel content and preserves controlled ownership", () => {
    const onSelectedIdChange = jest.fn();
    render(
      <Carousel
        items={[
          { content: <Text>Alpha slide</Text>, id: "alpha", label: "Alpha" },
          { content: <Text>Beta slide</Text>, id: "beta", label: "Beta" },
        ]}
        labels={pagingLabels}
        onSelectedIdChange={onSelectedIdChange}
        reducedMotionService={reducedMotionService}
        selectedId="alpha"
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Next item" }));
    expect(onSelectedIdChange).toHaveBeenCalledWith("beta");
    expect(screen.getByText("1 of 2")).toBeOnTheScreen();
  });

  it("expands cards and FAQ answers with localized labels", () => {
    render(
      <View>
        <ExpandableCards
          cards={[
            {
              content: <Text>Card body</Text>,
              id: "card",
              title: "Card title",
            },
          ]}
          labels={{
            collapseCard: (item) => `Collapse ${item.title}`,
            expandCard: (item) => `Expand ${item.title}`,
            region: "Cards",
          }}
          reducedMotionService={reducedMotionService}
        />
        <Faq
          items={[
            {
              answer: <Text>Because it is native.</Text>,
              id: "why",
              question: "Why?",
            },
          ]}
          labels={{
            collapseAnswer: (item) => `Collapse ${item.question}`,
            expandAnswer: (item) => `Expand ${item.question}`,
            region: "Questions",
          }}
          reducedMotionService={reducedMotionService}
          title="Common questions"
        />
      </View>,
    );
    fireEvent.press(screen.getByRole("button", { name: "Expand Card title" }));
    fireEvent.press(screen.getByRole("button", { name: "Expand Why?" }));
    expect(screen.getByText("Card body")).toBeOnTheScreen();
    expect(screen.getByText("Because it is native.")).toBeOnTheScreen();
  });

  it("uses the shared native modal layer for slideshow navigation", () => {
    const onCurrentSectionIdChange = jest.fn();
    const onComplete = jest.fn();
    render(
      <Slideshow
        completedIds={new Set(["intro"])}
        defaultCurrentSectionId="intro"
        defaultOpen
        labels={{
          closeSections: "Close sections",
          exit: "Exit tutorial",
          finish: "Finish tutorial",
          markComplete: "Mark complete",
          markIncomplete: "Mark incomplete",
          next: "Next section",
          openSections: "Open sections",
          position: (index, total) => `${index} of ${total}`,
          previous: "Previous section",
          sections: "Tutorial sections",
        }}
        onComplete={onComplete}
        onCurrentSectionIdChange={onCurrentSectionIdChange}
        onToggleComplete={jest.fn()}
        reducedMotionService={reducedMotionService}
        sections={[
          {
            content: <Text>Introduction content</Text>,
            id: "intro",
            title: "Introduction",
          },
          {
            content: <Text>Finish content</Text>,
            id: "finish",
            title: "Finish",
          },
        ]}
        title="Native tutorial"
      />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Next section" }));
    expect(onCurrentSectionIdChange).toHaveBeenCalledWith("finish");
    expect(screen.getByText("Finish content")).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("button", { name: "Finish tutorial" }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
