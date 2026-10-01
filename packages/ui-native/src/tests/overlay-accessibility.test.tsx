import { fireEvent, render, screen } from "@testing-library/react-native";
import { AccessibilityInfo, Text } from "react-native";

import { Command } from "../components/atoms/command/command";
import { CompletionDialog } from "../components/atoms/completion-dialog/completion-dialog";
import { ContextMenu } from "../components/atoms/context-menu/context-menu";
import { DropdownMenu } from "../components/atoms/dropdown-menu/dropdown-menu";
import { SearchDialog } from "../components/atoms/search-dialog/search-dialog";
import { AnimatedTabs } from "../components/molecules/animated-tabs/animated-tabs";
import { Combobox } from "../components/molecules/combobox/combobox";
import { DatePicker } from "../components/molecules/date-picker/date-picker";
import { ExpandableCards } from "../components/molecules/expandable-cards/expandable-cards";
import { FAQ as Faq } from "../components/molecules/faq/faq";
import { Menubar } from "../components/molecules/menubar/menubar";
import { Tabs, TabsList, TabsTrigger } from "../components/molecules/tabs/tabs";

import { flushMicrotasks, reducedMotion, searchLabels } from "./test-utils";

const hostNode = () => ({ measure: jest.fn() });
let announceSpy: jest.SpyInstance;
let focusSpy: jest.SpyInstance;
beforeEach(() => {
  announceSpy = jest.spyOn(AccessibilityInfo, "announceForAccessibility");
  focusSpy = jest.spyOn(AccessibilityInfo, "sendAccessibilityEvent");
  announceSpy.mockClear();
  focusSpy.mockClear();
});
afterEach(() => {
  announceSpy.mockRestore();
  focusSpy.mockRestore();
});

const menuItems = [
  { id: "copy", label: "Copy" },
  { destructive: true, id: "delete", label: "Delete" },
];

it("titles open menus, focuses the title, and marks destructive items without colour", async () => {
  render(
    <>
      <DropdownMenu
        cancelLabel="Cancel"
        defaultOpen
        destructiveLabel="Supprime"
        items={menuItems}
        label="File actions"
      />
      <ContextMenu
        cancelLabel="Cancel"
        defaultOpen
        items={menuItems}
        label="Row actions"
      />
    </>,
    { createNodeMock: hostNode },
  );
  await flushMicrotasks();
  for (const name of ["File actions", "Row actions"])
    expect(screen.getByRole("header", { name })).toBeOnTheScreen();
  expect(focusSpy).toHaveBeenCalledTimes(2);
  expect(announceSpy).not.toHaveBeenCalled();
  const [dropdownDelete, contextDelete] = screen.getAllByRole("menuitem", {
    name: "Delete",
  });
  expect(dropdownDelete).toHaveProp("accessibilityHint", "Supprime");
  expect(contextDelete).toHaveProp("accessibilityHint", "Destructive");
  expect(screen.queryByLabelText("File actions")).toBeNull();
});

it("announces command and combobox result counts and empty states", async () => {
  render(
    <>
      <Command
        cancelLabel="Close"
        defaultOpen
        emptyLabel="No commands"
        items={[
          { id: 1, label: "Open settings" },
          { destructive: true, id: 2, label: "Delete project" },
        ]}
        label="Command menu"
        placeholder="Search commands"
        resultsLabel={(count) => `${count} commands`}
      />
      <Combobox
        labels={{
          close: "Done",
          empty: "No status",
          open: "Status",
          options: "Statuses",
          placeholder: "Pick",
          results: (count) => `${count} statuses`,
          search: "Search statuses",
        }}
        options={[{ id: "ready", label: "Ready" }]}
        selection={{ defaultValue: undefined, mode: "uncontrolled" }}
      />
    </>,
  );
  expect(
    screen.getByRole("header", { name: "Command menu" }),
  ).toBeOnTheScreen();
  expect(screen.getByRole("menuitem", { name: "Delete project" })).toHaveProp(
    "accessibilityHint",
    "Destructive",
  );
  fireEvent.changeText(screen.getByLabelText("Search commands"), "open");
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenLastCalledWith("1 commands");
  fireEvent.changeText(screen.getByLabelText("Search commands"), "zzz");
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenLastCalledWith("No commands");
  fireEvent.press(screen.getByRole("button", { name: "Status" }));
  expect(screen.getByRole("header", { name: "Statuses" })).toBeOnTheScreen();
  fireEvent.changeText(screen.getByLabelText("Search statuses"), "rea");
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenLastCalledWith("1 statuses");
});

it("names menubar menus and closes an open sheet from its close button or backdrop", async () => {
  render(
    <Menubar
      closeLabel="Fermer"
      label="Main menu"
      menus={[
        { id: "file", items: [{ id: "new", label: "New" }], label: "File" },
      ]}
    />,
    { createNodeMock: hostNode },
  );
  const file = screen.getByRole("button", { name: "File" });
  expect(file).toHaveProp("accessibilityHint", "Main menu");
  expect(screen.queryByLabelText("Main menu")).toBeNull();
  fireEvent.press(file);
  expect(screen.getByRole("header", { name: "File" })).toBeOnTheScreen();
  await flushMicrotasks();
  expect(focusSpy).toHaveBeenCalledTimes(1);
  expect(announceSpy).not.toHaveBeenCalledWith("File");
  fireEvent.press(screen.getByRole("button", { name: "Fermer" }));
  expect(screen.queryByRole("menuitem", { name: "New" })).toBeNull();
  fireEvent.press(file);
  const [backdrop] = screen.UNSAFE_root.findAll(
    (node: {
      readonly props: Record<string, unknown>;
      readonly type: unknown;
    }) =>
      typeof node.type === "string" &&
      node.props.accessible === false &&
      typeof node.props.onClick === "function",
  );
  if (!backdrop) throw new Error("Expected a menubar backdrop.");
  fireEvent.press(backdrop);
  expect(screen.queryByRole("menuitem", { name: "New" })).toBeNull();
});

it("titles search, announces results, and keeps focus after clearing", async () => {
  render(
    <SearchDialog
      defaultOpen
      items={[{ id: "button", snippet: "Pressable action", title: "Button" }]}
      labels={{ ...searchLabels, results: (count) => `${count} results` }}
      onSelect={jest.fn()}
    />,
    { createNodeMock: hostNode },
  );
  expect(screen.getByRole("header", { name: "Search docs" })).toBeOnTheScreen();
  fireEvent.changeText(screen.getByLabelText("Search"), "butt");
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenLastCalledWith("1 results");
  expect(screen.getByRole("button", { name: "Button" })).toHaveProp(
    "accessibilityHint",
    "Pressable action",
  );
  fireEvent.changeText(screen.getByLabelText("Search"), "zzz");
  await flushMicrotasks();
  expect(announceSpy).toHaveBeenLastCalledWith("No results");
  fireEvent.press(screen.getByRole("button", { name: "Clear" }));
  expect(focusSpy).toHaveBeenCalledTimes(1);
});

it("reads dialog titles before pinned close buttons and titles picker sheets", () => {
  render(
    <>
      <CompletionDialog
        cancelLabel="Later"
        closeLabel="Close"
        confirmLabel="Done"
        defaultOpen
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        title="Lesson complete"
      />
      <DatePicker
        labels={{
          close: "Close picker",
          formatDayAccessibilityLabel: String,
          formatMonth: (date) => `${date.getMonth() + 1}`,
          formatValue: (date) => date.toISOString(),
          formatWeekday: String,
          nextMonth: "Next",
          open: "Choose date",
          placeholder: "No date",
          previousMonth: "Previous",
        }}
        selection={{ defaultValue: undefined, mode: "uncontrolled" }}
      />
    </>,
  );
  const order: unknown[] = screen
    .getAllByRole(/header|button/)
    .map(
      (node): unknown => node.props.accessibilityLabel ?? node.props.children,
    );
  expect(order.indexOf("Lesson complete")).toBeLessThan(order.indexOf("Close"));
  fireEvent.press(screen.getByRole("button", { name: "Choose date" }));
  expect(screen.getByRole("header", { name: "Choose date" })).toBeOnTheScreen();
});

it("moves container names of tabs, FAQ, and cards into hints", () => {
  render(
    <>
      <Tabs defaultValue="one">
        <TabsList accessibilityLabel="Sections">
          <TabsTrigger value="one">One</TabsTrigger>
        </TabsList>
      </Tabs>
      <AnimatedTabs
        reducedMotionService={reducedMotion(true)}
        tabs={[
          { label: "Code", value: "code" },
          { disabled: true, label: "Locked", value: "locked" },
        ]}
      />
      <Faq
        items={[{ answer: <Text>Yes</Text>, id: "q", question: "Why?" }]}
        labels={{
          collapseAnswer: (item) => `Hide ${item.question}`,
          expandAnswer: (item) => `Show ${item.question}`,
          region: "Questions",
        }}
        title="FAQ"
      />
      <ExpandableCards
        cards={[
          {
            content: <Text>Body</Text>,
            description: "Short summary",
            id: "a",
            title: "Alpha",
          },
        ]}
        labels={{
          collapseCard: (card) => `Collapse ${card.title}`,
          expandCard: (card) => `Expand ${card.title}`,
          region: "Cards",
        }}
      />
    </>,
  );
  expect(screen.getByRole("tab", { name: "One" })).toHaveProp(
    "accessibilityHint",
    "Sections",
  );
  expect(screen.getByRole("tab", { name: "Locked" })).toHaveStyle({
    opacity: 0.5,
  });
  expect(screen.getByRole("header", { name: "FAQ" })).toHaveProp(
    "accessibilityHint",
    "Questions",
  );
  expect(screen.getByRole("button", { name: "Expand Alpha" })).toHaveProp(
    "accessibilityHint",
    "Short summary. Cards",
  );
  expect(screen.queryByLabelText("Questions")).toBeNull();
  expect(screen.queryByLabelText("Cards")).toBeNull();
});
