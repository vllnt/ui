import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Text } from "react-native";

import { Checklist } from "./checklist/checklist";
import { CompletionDialog } from "./completion-dialog/completion-dialog";
import { Exercise } from "./exercise/exercise";
import { Flashcard } from "./flashcard/flashcard";
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help/keyboard-shortcuts-help";
import {
  ProgressTracker,
  ProgressTrackerModule,
  ProgressTrackerModules,
  ProgressTrackerOverview,
} from "./progress-tracker/progress-tracker";
import { Quiz } from "./quiz/quiz";
import { Rating } from "./rating/rating";
import { SearchDialog } from "./search-dialog/search-dialog";
import { Step, StepByStep } from "./step-by-step/step-by-step";
import { Stepper } from "./stepper/stepper";
import { Tour } from "./tour/tour";
import { TutorialComplete } from "./tutorial-complete/tutorial-complete";
import { TutorialFilters } from "./tutorial-filters/tutorial-filters";

const tourLabels = {
  finish: "Finish",
  goToStep: (step: { title: string }) => `Go to ${step.title}`,
  hint: "Hint",
  next: "Next",
  previous: "Previous",
  stepProgress: (current: number, total: number) => `${current} of ${total}`,
  tour: "Tour",
};

const filterLabels = {
  activeFilters: "Active filters",
  clear: "Clear",
  clearAll: "Clear all",
  difficulty: { all: "All", easy: "Easy" },
  difficultyLabel: "Difficulty",
  searchFilter: (query: string) => `Search ${query}`,
  searchLabel: "Search tutorials",
  searchPlaceholder: "Search tutorials",
  tagsLabel: "Tags",
};

const quizLabels = {
  checkAnswer: "Check answer",
  correct: "Correct",
  hint: "Show hint",
  incorrect: "Not correct",
  option: (option: { label: string }) => option.label,
  options: "Answers",
  tryAgain: "Try again",
};

const searchLabels = {
  clear: "Clear search",
  close: "Close search",
  componentsGroup: "Components",
  docsEmpty: "No docs",
  docsGroup: "Docs",
  empty: "No results",
  minimumDocsQuery: (minimum: number) => `Type ${minimum} characters`,
  open: "Open search",
  result: (item: { title: string }) => item.title,
  scope: "Search scope",
  scopeOption: {
    components: "Components",
    docs: "Docs",
    everything: "Everything",
  },
  searchingDocs: "Searching docs",
  searchPlaceholder: "Search",
  title: "Search",
};

const progressLabels = {
  completedModules: (completed: number, total: number) =>
    `${completed} of ${total} modules`,
  currentLesson: (lesson: string) => `Current ${lesson}`,
  exercises: "Exercises",
  lessons: "Lessons",
  modules: "Modules",
  momentum: "Momentum",
  overallProgress: "Overall progress",
  progressPercent: (percent: number) => `${percent}% complete`,
  status: {
    available: "Available",
    completed: "Completed",
    "in-progress": "In progress",
    locked: "Locked",
  },
  streak: (days: number) => `${days} day streak`,
};

function ignoreResolvedItems(
  items: readonly { id: string; title: string }[],
): void {
  void items;
}

describe("native learning composites direct imports", () => {
  it("supports controlled and uncontrolled step interactions with stable ids", () => {
    const onTourStep = jest.fn();
    const onChecked = jest.fn();
    render(
      <>
        <Tour
          labels={tourLabels}
          onCurrentStepChange={onTourStep}
          steps={[
            {
              description: <Text>First body</Text>,
              id: "first",
              title: "First",
            },
            {
              description: <Text>Second body</Text>,
              id: "second",
              title: "Second",
            },
          ]}
        />
        <Checklist
          defaultCheckedIds={[]}
          items={[{ id: "read", label: "Read chapter" }]}
          labels={{
            allCompleted: "Everything complete",
            item: (item, checked) =>
              `${item.label} ${checked ? "done" : "not done"}`,
            progress: (checked, total) => `${checked}/${total}`,
          }}
          onCheckedIdsChange={onChecked}
        />
        <Stepper
          labels={{
            step: (step, state) => `${step.title} ${state}`,
            stepper: "Lesson steps",
          }}
          steps={[
            { id: "intro", title: "Intro" },
            { id: "practice", title: "Practice" },
          ]}
        />
      </>,
    );

    fireEvent.press(screen.getByRole("button", { name: "Next" }));
    expect(onTourStep).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ id: "second" }),
    );
    fireEvent.press(
      screen.getByRole("checkbox", { name: "Read chapter not done" }),
    );
    expect(onChecked).toHaveBeenCalledWith(["read"]);
    expect(
      screen.getByRole("button", { name: "Practice upcoming" }),
    ).toHaveProp("nativeID", "stepper-step-practice");
  });

  it("exposes quiz, exercise, flashcard, rating, and step-by-step state", () => {
    const onAnswer = jest.fn();
    const onRating = jest.fn();
    render(
      <>
        <Quiz
          labels={quizLabels}
          onAnswer={onAnswer}
          options={[{ correct: true, id: "one", label: "One" }]}
          question="Choose one"
        />
        <Exercise
          labels={{
            difficulty: { easy: "Easy", hard: "Hard", medium: "Medium" },
            hideSolution: "Hide solution",
            hint: "Hint",
            markComplete: "Mark complete",
            markIncomplete: "Mark incomplete",
            showHint: "Show hint",
            showSolution: "Show solution",
            solution: "Solution",
          }}
          title="Practice"
        >
          <Text>Task</Text>
        </Exercise>
        <Flashcard
          answer={<Text>Answer body</Text>}
          labels={{
            answer: "Answer",
            answerInstruction: "Check recall",
            flip: "Flip",
            hint: (hint) => `Hint ${hint}`,
            prompt: "Prompt",
            promptInstruction: "Recall first",
            revealAnswer: "Reveal answer",
            showPrompt: "Show prompt",
            study: "Study",
          }}
          question={<Text>Question body</Text>}
          title="Card"
        />
        <Rating
          label="Rating"
          labels={{
            option: (value, max) => `${value} of ${max}`,
            value: (value, max) => `${value}/${max}`,
          }}
          onValueChange={onRating}
        />
        <StepByStep
          interactive
          labels={{
            progress: (done, total) => `${done}/${total}`,
            toggleStep: (title, complete) =>
              `${title} ${complete ? "complete" : "incomplete"}`,
          }}
        >
          <Step id="setup" title="Set up">
            <Text>Install tools</Text>
          </Step>
        </StepByStep>
      </>,
    );

    fireEvent.press(screen.getByRole("radio", { name: "One" }));
    fireEvent.press(screen.getByRole("button", { name: "Check answer" }));
    expect(onAnswer).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ id: "one" }),
    );
    fireEvent.press(screen.getByRole("button", { name: "Mark complete" }));
    expect(
      screen.getByRole("button", { name: "Mark incomplete" }),
    ).toBeOnTheScreen();
    fireEvent.press(
      screen.getByRole("button", { name: "Flip: Reveal answer" }),
    );
    expect(screen.getByText("Answer body")).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("radio", { name: "3 of 5" }));
    expect(onRating).toHaveBeenCalledWith(3);
    fireEvent.press(
      screen.getByRole("checkbox", { name: "Set up incomplete" }),
    );
    expect(
      screen.getByRole("checkbox", { name: "Set up complete" }),
    ).toBeChecked();
  });

  it("delegates filtering, completion navigation, and progress module navigation", () => {
    const onFilter = jest.fn();
    const onSection = jest.fn();
    const onModule = jest.fn();
    render(
      <>
        <TutorialFilters
          currentDifficulty="all"
          currentTags={[]}
          difficultyOptions={["all", "easy"]}
          labels={filterLabels}
          onFilterChange={onFilter}
          searchQuery=""
          tags={["native"]}
        />
        <TutorialComplete
          completedSectionIds={["intro"]}
          completionPercent={100}
          labels={{
            backToTutorials: "Back",
            completionSummary: (title, percent) => `${title} ${percent}%`,
            relatedContent: "Related",
            restart: "Restart",
            reviewSection: (title, done) =>
              `${title} ${done ? "done" : "not done"}`,
            reviewSections: "Review",
            share: "Share",
            tutorialComplete: "Complete",
            tutorialFinished: "Finished",
          }}
          onBack={jest.fn()}
          onGoToSection={onSection}
          onRestart={jest.fn()}
          sections={[{ id: "intro", title: "Introduction" }]}
          title="Native basics"
        />
        <ProgressTracker
          labels={progressLabels}
          modules={[
            {
              id: "module",
              lessons: 2,
              progress: 50,
              status: "in-progress",
              title: "Module",
            },
          ]}
          overallProgress={50}
          title="Course"
        >
          <ProgressTrackerOverview />
          <ProgressTrackerModules>
            <ProgressTrackerModule
              id="module"
              lessons={2}
              onPress={onModule}
              progress={50}
              status="in-progress"
              title="Module"
            />
          </ProgressTrackerModules>
        </ProgressTracker>
      </>,
    );

    fireEvent.changeText(screen.getByLabelText("Search tutorials"), "forms");
    expect(onFilter).toHaveBeenCalledWith({ search: "forms" });
    expect(screen.getByRole("button", { name: "Restart" })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("button", { name: "Introduction done" }));
    expect(onSection).toHaveBeenCalledWith(
      expect.objectContaining({ id: "intro" }),
      0,
    );
    fireEvent.press(screen.getByRole("button", { name: "Module" }));
    expect(onModule).toHaveBeenCalledWith(
      expect.objectContaining({ id: "module" }),
    );
  });

  it("uses safe native modal close routes and honest hardware-keyboard guidance", () => {
    const onCompletionClose = jest.fn();
    const onHelpClose = jest.fn();
    render(
      <>
        <CompletionDialog
          cancelLabel="Skip"
          closeLabel="Close completion"
          confirmLabel="Done"
          defaultOpen
          description={<Text>Finished lesson</Text>}
          onCancel={jest.fn()}
          onConfirm={jest.fn()}
          onRequestClose={onCompletionClose}
          title="Complete lesson"
        />
        <KeyboardShortcutsHelp
          defaultOpen
          labels={{
            close: "Close keyboard help",
            hardwareKeyboardGuidance:
              "These actions are available when a hardware keyboard is connected.",
            title: "Hardware keyboard",
          }}
          onRequestClose={onHelpClose}
          shortcuts={[{ description: "Move next", id: "next", keys: ["Tab"] }]}
        />
      </>,
    );

    expect(
      screen.getByText(
        "These actions are available when a hardware keyboard is connected.",
      ),
    ).toBeOnTheScreen();
    fireEvent(screen.getByLabelText("Complete lesson"), "accessibilityEscape");
    expect(onCompletionClose).toHaveBeenCalledWith("accessibilityEscape");
    fireEvent.press(
      screen.getByRole("button", { name: "Close keyboard help" }),
    );
    expect(onHelpClose).toHaveBeenCalledWith("requestClose");
  });

  it("filters local results and ignores stale docs responses", async () => {
    let resolveFirst: (
      items: readonly { id: string; title: string }[],
    ) => void = ignoreResolvedItems;
    const documentationSearch = jest.fn((query: string) =>
      query === "first"
        ? new Promise<readonly { id: string; title: string }[]>((resolve) => {
            resolveFirst = resolve;
          })
        : Promise.resolve([{ id: "second-doc", title: "Second doc" }]),
    );
    render(
      <SearchDialog
        defaultOpen
        defaultScope="everything"
        docsSearch={documentationSearch}
        items={[
          { id: "card", title: "Card" },
          { id: "dialog", title: "Dialog" },
        ]}
        labels={searchLabels}
        onSelect={jest.fn()}
      />,
    );

    const input = screen.getByDisplayValue("");
    fireEvent.changeText(input, "first");
    await waitFor(() => {
      expect(documentationSearch).toHaveBeenCalledWith("first");
    });
    fireEvent.changeText(input, "second");
    await waitFor(() => {
      expect(screen.getByText("Second doc")).toBeOnTheScreen();
    });
    resolveFirst([{ id: "first-doc", title: "First doc" }]);
    await waitFor(() => {
      expect(screen.queryByText("First doc")).not.toBeOnTheScreen();
    });
  });
});
