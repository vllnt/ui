import type { ReactElement } from "react";
import { Text as NativeText } from "react-native";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ActivityLog,
  AgentActivity,
  AgentStep,
  AgentStepDetail,
  AgentStepDetailText,
  AgentStepProgress,
  AgentStepTitle,
  AIArtifact,
  AIArtifactContent,
  AIArtifactCopyButton,
  AIArtifactDownloadButton,
  AIArtifactToolbar,
  AIArtifactVersion,
  AIArtifactVersions,
  AIChatInput,
  AIMessageBubble,
  AISourceCitation,
  AIStreamingText,
  AIToolCallDisplay,
  Alert,
  AlertDescription,
  AlertDialog,
  AlertTitle,
  AnimatedList,
  AnimatedTabs,
  AnimatedTestimonials,
  AnimatedText,
  AspectRatio,
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  Badge,
  Banner,
  BannerAction,
  BlurReveal,
  BottomBar,
  Breadcrumb,
  Button,
  ButtonGroup,
  Calendar,
  Callout,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Carousel,
  CategoryFilter,
  ChainOfThought,
  Checkbox,
  CheckboxGroup,
  Checklist,
  CodeBlock,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ColorPicker,
  Combobox,
  Command,
  CompletionDialog,
  ContentIntro,
  ContextMenu,
  ConversationEmpty,
  ConversationMessages,
  ConversationSuggestions,
  ConversationThread,
  CopyButton,
  CountdownTimer,
  CreditBadge,
  DataList,
  DateField,
  DatePicker,
  DateRangePicker,
  Dialog,
  DocumentSiblingNav,
  Drawer,
  DropdownMenu,
  EmptyState,
  Exercise,
  ExpandableCards,
  FAQ as Faq,
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  Fieldset,
  FieldsetContent,
  FieldsetLegend,
  FileUpload,
  FilterBar,
  Flashcard,
  FloatingActionButton,
  FloatingToolbar,
  Form,
  FormSubmit,
  GlassProgress,
  Grid,
  Heading,
  HorizontalScrollRow,
  InlineInput,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputOTP,
  InteractiveTimeline,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  KeyboardShortcutsHelp,
  Label,
  Link,
  ListBox,
  LiveFeed,
  Marquee,
  Menubar,
  Meter,
  MetricCluster,
  ModelSelector,
  MultiSelect,
  NativeSelect,
  NavigationMenu,
  NumberInput,
  NumberTicker,
  OverviewBoard,
  Pagination,
  Panel,
  PanelBody,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
  PasswordInput,
  PhoneInput,
  PlanBadge,
  Popover,
  PresenceStack,
  PresenceSyncIndicator,
  ProgressBar,
  ProgressCard,
  ProgressTracker,
  ProgressTrackerModule,
  ProgressTrackerModules,
  ProgressTrackerOverview,
  PromptInput,
  Quiz,
  RadioGroup,
  RadioGroupItem,
  RangeCalendar,
  Rating,
  Reasoning,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  RevealText,
  RoleBadge,
  ScrambleText,
  ScrollProgress,
  SearchBar,
  SearchDialog,
  SearchField,
  SegmentedControl,
  Select,
  Separator,
  SeverityBadge,
  ShareDialog,
  ShareSection,
  Sheet,
  ShimmerText,
  Sidebar,
  SidebarProvider,
  SidebarToggle,
  Skeleton,
  Slider,
  Slideshow,
  Spinner,
  SpinningText,
  StatCard,
  StatusBoard,
  StatusIndicator,
  Step,
  StepByStep,
  StepNavigation,
  Stepper,
  StickyMetric,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TagGroup,
  TagsInput,
  Terminal,
  Text,
  TextAnimate,
  Textarea,
  TextField,
  TextReveal,
  TextShimmer,
  ThinkingBlock,
  TimeField,
  TimelineScrubber,
  TimePicker,
  TLDRSection,
  Toast,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  Tooltip,
  TopBar,
  Tour,
  TreeView,
  TruncatedText,
  TutorialComplete,
  TutorialFilters,
  Typewriter,
  ViewSwitcher,
  WorkspaceSwitcher,
  WorldClockBar,
} from "../index";

import { codePreviewTabs, gridListOptions, searchLabels } from "./test-utils";

/** Renders one representative, consumer-labelled use of a component. */
export type AccessibilityFixture = () => ReactElement;

const fixedNow = "2026-01-01T12:00:00.000Z";
const noop = () => void 0;
const clipboard = { getText: async () => "", setText: async () => void 0 };
const linking = { openUrl: async () => ({ status: "opened" as const }) };
const copyLabels = {
  copied: "Copied",
  copy: "Copy",
  unavailable: "Unavailable",
};

const pagingLabels = {
  next: "Next item",
  pause: "Pause rotation",
  position: (index: number, total: number) => `${index} of ${total}`,
  previous: "Previous item",
  region: "Featured items",
  resume: "Resume rotation",
};

const selectLabels = {
  close: "Close choices",
  open: "Choose status",
  options: "Status choices",
  placeholder: "No status",
};

const calendarLabels = {
  formatDayAccessibilityLabel: (date: Date) =>
    `Choose ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
  formatMonth: (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}`,
  formatWeekday: (weekday: number) =>
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][weekday] ?? "",
  nextMonth: "Next month",
  previousMonth: "Previous month",
};

const pickerLabels = {
  ...calendarLabels,
  close: "Close picker",
  formatValue: (date: Date) => date.toISOString().slice(0, 10),
  open: "Choose date",
  placeholder: "No date",
};

const thinkingLabels = {
  collapse: "Hide thinking",
  expand: "Show thinking",
  streaming: "Thinking now",
  thinking: "Thinking",
};

const conversationLabels = {
  assistantMessage: "Assistant message",
  assistantTyping: "Assistant is typing",
  negativeFeedback: "Not helpful",
  positiveFeedback: "Helpful",
  retry: "Try again",
  scrollToBottom: "Read newest message",
  toolCalls: "Tools used",
  userMessage: "Your message",
};

const activityLabels = {
  activity: "Agent activity",
  collapse: "Hide details",
  elapsed: "Elapsed time",
  expand: "Show details",
  status: {
    completed: "Completed",
    error: "Failed",
    idle: "Idle",
    pending: "Pending",
    running: "Running",
    skipped: "Skipped",
    unavailable: "Service unavailable",
  },
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

const trackerModule = {
  id: "module",
  lessons: 2,
  progress: 50,
  status: "in-progress",
  title: "Module",
} as const;

/** Consumer-supplied decorative icon for icon slots. */
const glyphIcon = () => <Text>★</Text>;

const uploadLabels = {
  choose: "Choose files",
  empty: "No files selected",
  failed: "Files could not be selected",
  remove: (name: string) => `Remove ${name}`,
  unavailable: "File selection is unavailable",
};

const menuItems = [
  { id: "copy", label: "Copy" },
  { destructive: true, id: "delete", label: "Delete" },
  { disabled: true, id: "rename", label: "Rename" },
];

const feedbackAndStatus: Readonly<Record<string, AccessibilityFixture>> = {
  alert: () => (
    <Alert variant="destructive">
      <AlertTitle>Connection lost</AlertTitle>
      <AlertDescription>Check the network and retry.</AlertDescription>
    </Alert>
  ),
  "alert-dialog": () => (
    <AlertDialog
      actionLabel="Delete workspace"
      cancelLabel="Keep workspace"
      defaultOpen
      description="This cannot be undone."
      onAction={noop}
      title="Delete workspace?"
    />
  ),
  badge: () => <Badge variant="secondary">Experimental</Badge>,
  banner: () => (
    <>
      <Banner dismissible icon={glyphIcon()} variant="destructive">
        <Text>Outage</Text>
        <BannerAction onPress={noop}>
          <Text>Retry</Text>
        </BannerAction>
      </Banner>
      <Banner variant="info">
        <Text>Maintenance tonight</Text>
      </Banner>
    </>
  ),
  callout: () => (
    <>
      <Callout icon={glyphIcon()} title="Notice">
        Important details
      </Callout>
      <Callout variant="danger">Retry the request.</Callout>
    </>
  ),
  "countdown-timer": () => (
    <CountdownTimer
      deadline="2026-01-01T13:01:02.000Z"
      now={fixedNow}
      title="Launch"
      warningThresholdMs={30 * 60 * 1000}
    />
  ),
  "credit-badge": () => <CreditBadge amount="12" status="low" />,
  "empty-state": () => (
    <EmptyState
      description="Try another filter"
      icon={glyphIcon()}
      title="No results"
    >
      <Button onPress={noop}>Reset filters</Button>
    </EmptyState>
  ),
  "glass-progress": () => <GlassProgress value={40} />,
  meter: () => (
    <Meter
      label="Storage used"
      max={10}
      segments={5}
      value={7}
      valueText="7 GB"
    />
  ),
  "plan-badge": () => <PlanBadge state="trial" tier="growth" />,
  "presence-sync-indicator": () => (
    <PresenceSyncIndicator state="reconnecting" status="retry 2 of 5" />
  ),
  "progress-bar": () => <ProgressBar max={10} value={4} />,
  "role-badge": () => <RoleBadge accountRole="owner" />,
  "scroll-progress": () => (
    <ScrollProgress label="Article progress" value={0.5} />
  ),
  "severity-badge": () => <SeverityBadge level="critical" />,
  skeleton: () => <Skeleton accessibilityLabel="Loading profile" />,
  spinner: () => <Spinner accessibilityLabel="Loading answer" size="sm" />,
  "status-indicator": () => (
    <StatusIndicator announceChanges label="Operational" tone="success" />
  ),
  toast: () => (
    <Toast
      closeLabel="Dismiss notification"
      onToastsChange={noop}
      toasts={[
        {
          actionLabel: "Undo",
          description: "Your changes are stored.",
          id: "saved",
          onAction: noop,
          title: "Saved",
        },
        { id: "failed", title: "Sync failed", variant: "destructive" },
      ]}
    />
  ),
};

const dataDisplay: Readonly<Record<string, AccessibilityFixture>> = {
  "activity-log": () => (
    <ActivityLog
      items={[
        { action: "created", actor: "Ada", id: "one", timestamp: "12:00" },
        { action: "updated", actor: "Lin", id: "two", timestamp: "12:01" },
      ]}
      pageSize={1}
    />
  ),
  avatar: () => (
    <Avatar>
      <AvatarImage
        accessibilityLabel="Ada Lovelace"
        source={{ uri: "https://example.com/ada.png" }}
      />
      <AvatarFallback>
        <Text>AL</Text>
      </AvatarFallback>
    </Avatar>
  ),
  "avatar-group": () => (
    <AvatarGroup
      items={[
        { accessibilityLabel: "Ada", fallback: "AD", id: "ada" },
        { accessibilityLabel: "Lin", fallback: "LN", id: "lin" },
      ]}
      max={1}
      overflowLabel={(count) => `${count} more people`}
    />
  ),
  "data-list": () => (
    <DataList
      items={[
        { id: "region", label: "Region", value: "North America" },
        {
          id: "owner",
          label: "Owner",
          value: <NativeText accessibilityRole="text">Ada Lovelace</NativeText>,
        },
        {
          id: "docs",
          label: "Docs",
          value: (
            <Link href="https://example.com/docs" linking={linking}>
              Runbook
            </Link>
          ),
        },
      ]}
    />
  ),
  "live-feed": () => (
    <LiveFeed
      events={[
        {
          id: "latest",
          severity: "critical",
          timestamp: "2026-01-01T11:59:30.000Z",
          title: "Error spike",
        },
      ]}
      now={fixedNow}
    />
  ),
  "metric-cluster": () => (
    <MetricCluster
      metrics={[{ id: "latency", label: "p95", value: "180 ms" }]}
      title="Runtime"
    />
  ),
  "number-ticker": () => <NumberTicker value={1234} />,
  "overview-board": () => (
    <OverviewBoard
      heading="Operations"
      items={[
        {
          description: "Across all regions",
          heading: "Open incidents",
          icon: glyphIcon(),
          id: "incidents",
          metric: "2",
          tone: "danger",
        },
      ]}
    />
  ),
  "presence-stack": () => (
    <PresenceStack
      max={1}
      onOverflowPress={noop}
      users={[
        { id: "ada", initial: "A", name: "Ada", status: "active" },
        { id: "lin", initial: "L", name: "Lin", status: "away" },
      ]}
    />
  ),
  "progress-card": () => (
    <ProgressCard
      description="Learn native layout."
      max={4}
      onPress={noop}
      tags={[{ id: "native", label: "Native" }]}
      title="Layout course"
      value={2}
    />
  ),
  "stat-card": () => (
    <StatCard
      change="12%"
      icon={glyphIcon()}
      label="Requests"
      trend="up"
      value="1,240"
    />
  ),
  "status-board": () => (
    <StatusBoard
      items={[
        { id: "api", label: "API", status: "healthy", value: "99.99%" },
        { id: "queue", label: "Queue", status: "warning" },
      ]}
    />
  ),
  "sticky-metric": () => (
    <StickyMetric detail="per minute" label="Errors" value="14" />
  ),
  "world-clock-bar": () => (
    <WorldClockBar
      now={fixedNow}
      zones={[{ city: "UTC", id: "utc", locale: "en-GB", timeZone: "UTC" }]}
    />
  ),
};

const aiSurfaces: Readonly<Record<string, AccessibilityFixture>> = {
  "agent-activity": () => (
    <AgentActivity labels={activityLabels} status="running">
      <AgentStep defaultOpen icon={glyphIcon()} status="running">
        <AgentStepTitle>Call service</AgentStepTitle>
        <AgentStepProgress label="Service progress" value={50} />
        <AgentStepDetail>
          <AgentStepDetailText>Waiting for response</AgentStepDetailText>
        </AgentStepDetail>
      </AgentStep>
    </AgentActivity>
  ),
  "ai-artifact": () => (
    <AIArtifact
      language="tsx"
      onCopy={noop}
      onDownload={noop}
      title="UserProfile"
      value="export function UserProfile() {}"
    >
      <AIArtifactToolbar>
        <AIArtifactCopyButton />
        <AIArtifactDownloadButton />
      </AIArtifactToolbar>
      <AIArtifactContent>
        <Text>Artifact content</Text>
      </AIArtifactContent>
      <AIArtifactVersions>
        <AIArtifactVersion active label="v2" />
      </AIArtifactVersions>
    </AIArtifact>
  ),
  "ai-chat-input": () => (
    <>
      <AIChatInput
        inputLabel="Chat message"
        onSubmit={noop}
        submitLabel="Send"
      />
      <AIChatInput
        defaultValue="Hello"
        inputLabel="Offline chat message"
        onSubmit={noop}
        serviceState={{ message: "Chat is offline", status: "unavailable" }}
        submitLabel="Send offline"
      />
    </>
  ),
  "ai-message-bubble": () => (
    <>
      <AIMessageBubble author="VLLNT" messageRole="assistant" status="ready">
        Result available.
      </AIMessageBubble>
      <AIMessageBubble messageRole="user">Hello there.</AIMessageBubble>
    </>
  ),
  "ai-source-citation": () => (
    <AISourceCitation
      href="https://example.com/spec"
      onOpen={noop}
      snippet="Native source details"
      source="Product spec"
      title="Registry requirements"
    />
  ),
  "ai-streaming-text": () => (
    <AIStreamingText isStreaming text="Generating response" />
  ),
  "ai-tool-call-display": () => (
    <AIToolCallDisplay
      input='{"scope":"native"}'
      output='{"status":"ok"}'
      status="complete"
      toolName="audit.run"
    />
  ),
  "chain-of-thought": () => (
    <ChainOfThought
      statusLabels={{
        active: "Active",
        complete: "Complete",
        error: "Error",
        pending: "Pending",
      }}
      steps={[
        { id: "read", status: "complete", title: "Read request" },
        { id: "answer", status: "active", title: "Draft answer" },
      ]}
    />
  ),
  "conversation-thread": () => (
    <ConversationThread
      labels={conversationLabels}
      messages={[
        { content: "Hello", id: "user-1", role: "user" },
        {
          content: "Hi, how can I help?",
          id: "assistant-1",
          role: "assistant",
        },
      ]}
      onSend={noop}
      thinkingLabels={thinkingLabels}
    >
      <ConversationMessages />
      <ConversationEmpty>
        <ConversationSuggestions
          suggestions={[{ id: "hello", label: "Say hello", value: "Hello" }]}
        />
      </ConversationEmpty>
    </ConversationThread>
  ),
  "model-selector": () => (
    <ModelSelector
      defaultOpen
      defaultSelectedModelId="native"
      labels={{
        close: "Close models",
        description: "Choose one model",
        noModels: "No matching models",
        search: "Search models",
        selected: "Selected",
        title: "Choose model",
        unavailable: "Unavailable",
      }}
      models={[
        { id: "native", name: "Native model" },
        {
          id: "offline",
          name: "Offline model",
          serviceState: { message: "Maintenance", status: "unavailable" },
        },
      ]}
    />
  ),
  "prompt-input": () => (
    <PromptInput
      inputLabel="Prompt"
      onSubmit={noop}
      submitLabel="Send prompt"
    />
  ),
  reasoning: () => (
    <Reasoning
      defaultOpen
      duration="2 seconds"
      labels={{
        collapse: "Hide reasoning",
        expand: "Show reasoning",
        reasoned: "Reasoned",
        reasoning: "Reasoning",
      }}
      steps={[{ id: "step", text: "Check constraints" }]}
    />
  ),
  "thinking-block": () => (
    <ThinkingBlock
      defaultExpanded
      isStreaming
      labels={thinkingLabels}
      thinking="Private trace"
    />
  ),
};

const actions: Readonly<Record<string, AccessibilityFixture>> = {
  button: () => (
    <>
      <Button onPress={noop}>Save changes</Button>
      <Button disabled onPress={noop} size="icon">
        +
      </Button>
    </>
  ),
  "button-group": () => (
    <ButtonGroup label="Editing actions">
      <Button onPress={noop}>Save</Button>
      <Button onPress={noop} variant="outline">
        Cancel
      </Button>
    </ButtonGroup>
  ),
  "code-block": () => (
    <CodeBlock
      clipboard={clipboard}
      code="const native = true;"
      copyLabels={copyLabels}
      language="typescript"
      showLanguage
    />
  ),
  "copy-button": () => (
    <>
      <CopyButton clipboard={clipboard} value="native value" />
      <CopyButton value="unavailable" />
    </>
  ),
  "floating-action-button": () => (
    <FloatingActionButton accessibilityLabel="Create note" onPress={noop}>
      <NativeText>+</NativeText>
    </FloatingActionButton>
  ),
  "floating-toolbar": () => (
    <FloatingToolbar
      actions={[
        { id: "rename", label: "Rename item", onPress: noop },
        { disabled: true, id: "delete", label: "Delete item", onPress: noop },
      ]}
      labels={{ region: "Selection actions" }}
      x={12}
      y={24}
    />
  ),
  link: () => (
    <>
      <Link href="https://example.com/docs" linking={linking}>
        Docs
      </Link>
      <Link disabled href="https://example.com/locked" linking={linking}>
        Locked link
      </Link>
    </>
  ),
  "share-section": () => (
    <ShareSection
      content={{ message: "Native release", url: "https://example.com" }}
      labels={{ share: "Share release", unavailable: "Sharing unavailable" }}
      shareService={{ share: async () => ({ status: "shared" as const }) }}
      title="Share this release"
    />
  ),
  terminal: () => (
    <Terminal
      clipboard={clipboard}
      copyLabels={copyLabels}
      lines={[
        { content: "pnpm test", type: "command" },
        { content: "Tests passed", type: "output" },
      ]}
      title="Test terminal"
    />
  ),
  toggle: () => (
    <Toggle defaultPressed={false} onPressedChange={noop}>
      Bold
    </Toggle>
  ),
  "toggle-group": () => (
    <ToggleGroup
      accessibilityLabel="Alignment"
      defaultValue="start"
      onValueChange={noop}
      type="single"
    >
      <ToggleGroupItem value="start">Start</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
    </ToggleGroup>
  ),
  toolbar: () => (
    <Toolbar accessibilityLabel="Formatting">
      <ToolbarButton accessibilityLabel="Bold" onPress={noop}>
        <Text>Bold</Text>
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton accessibilityLabel="Italic" disabled>
        <Text>Italic</Text>
      </ToolbarButton>
    </Toolbar>
  ),
};

const textInputs: Readonly<Record<string, AccessibilityFixture>> = {
  "date-field": () => (
    <DateField
      labels={{
        error: "Enter a valid date",
        input: "Start date",
        placeholder: "YYYY-MM-DD",
      }}
      valueState={{ defaultValue: undefined, mode: "uncontrolled" }}
    />
  ),
  field: () => (
    <Field invalid>
      <FieldLabel>Username</FieldLabel>
      <FieldControl value="ada" />
      <FieldDescription>Public identifier</FieldDescription>
      <FieldError>Already used</FieldError>
    </Field>
  ),
  "file-upload": () => (
    <>
      <FileUpload
        filePicker={{ pickFiles: async () => [] }}
        files={{
          defaultValue: [{ name: "notes.txt", uri: "file:///notes.txt" }],
          mode: "uncontrolled",
        }}
        labels={uploadLabels}
      />
      <FileUpload
        files={{ defaultValue: [], mode: "uncontrolled" }}
        labels={uploadLabels}
      />
    </>
  ),
  "inline-input": () => (
    <InlineInput
      accessibilityLabel="Title"
      onChangeText={noop}
      onCommit={noop}
      value="Draft"
    />
  ),
  input: () => (
    <>
      <Input accessibilityLabel="Email" value="ada@example.com" />
      <Input accessibilityLabel="Disabled email" disabled value="locked" />
    </>
  ),
  "input-group": () => (
    <InputGroup>
      <InputGroupAddon>
        <Text>https://</Text>
      </InputGroupAddon>
      <InputGroupInput accessibilityLabel="Website" value="example.com" />
    </InputGroup>
  ),
  "input-otp": () => (
    <InputOTP
      accessibilityLabel="Security code"
      length={6}
      valueState={{ defaultValue: "12", mode: "uncontrolled" }}
    />
  ),
  "number-input": () => (
    <>
      <NumberInput accessibilityLabel="Quantity" max={10} min={0} value={2} />
      <NumberInput accessibilityLabel="Empty quantity" />
    </>
  ),
  "password-input": () => (
    <PasswordInput accessibilityLabel="Password" value="secret" />
  ),
  "phone-input": () => (
    <PhoneInput
      accessibilityLabel="Phone"
      country={{ code: "FI", dialCode: "+358", label: "Finland" }}
      onPressCountry={noop}
      value="5551234"
    />
  ),
  "search-bar": () => <SearchBar onSearch={noop} />,
  "search-field": () => (
    <SearchField accessibilityLabel="Filter" onValueChange={noop} value="Ada" />
  ),
  "tags-input": () => (
    <TagsInput
      labels={{
        add: "Add tag",
        input: "Tags",
        remove: (tag) => `Remove ${tag}`,
      }}
      tags={{ defaultValue: ["native"], mode: "uncontrolled" }}
    />
  ),
  "text-field": () => (
    <>
      <TextField error="Required" label="Name" value="" />
      <TextField label="Display name" value="Ada" />
    </>
  ),
  textarea: () => <Textarea accessibilityLabel="Biography" value="Notes" />,
  "time-field": () => (
    <TimeField
      labels={{ error: "Invalid time", input: "Time", placeholder: "HH:mm" }}
      valueState={{ defaultValue: undefined, mode: "uncontrolled" }}
    />
  ),
};

const choiceControls: Readonly<Record<string, AccessibilityFixture>> = {
  "category-filter": () => (
    <CategoryFilter
      categories={[
        { id: "all", label: "All" },
        { id: "open", label: "Open" },
      ]}
      label="Category"
      selection={{ defaultValue: "all", mode: "uncontrolled" }}
    />
  ),
  checkbox: () => (
    <>
      <Checkbox accessibilityLabel="Accept terms" defaultChecked />
      <Checkbox accessibilityLabel="Locked option" disabled />
    </>
  ),
  "checkbox-group": () => (
    <CheckboxGroup
      items={[
        { id: "email", label: "Email" },
        { id: "sms", label: "SMS" },
      ]}
      label="Channels"
      selection={{ defaultValue: new Set(["email"]), mode: "uncontrolled" }}
    />
  ),
  "color-picker": () => (
    <ColorPicker
      colors={[
        { color: "#ff0000", id: "red", label: "Red" },
        { color: "#0000ff", id: "blue", label: "Blue" },
      ]}
      label="Accent color"
      selection={{ defaultValue: "red", mode: "uncontrolled" }}
    />
  ),
  "list-box": () => (
    <ListBox
      label="Assignees"
      options={[
        { id: "ada", label: "Ada" },
        { id: "lin", label: "Lin" },
      ]}
      selection={{ defaultValue: new Set(["ada"]), mode: "uncontrolled" }}
    />
  ),
  "radio-group": () => (
    <RadioGroup accessibilityLabel="Delivery" defaultValue="standard">
      <RadioGroupItem value="standard">Standard</RadioGroupItem>
      <RadioGroupItem value="express">Express</RadioGroupItem>
      <RadioGroupItem disabled value="pickup">
        Pickup
      </RadioGroupItem>
    </RadioGroup>
  ),
  rating: () => (
    <Rating
      defaultValue={3}
      label="Lesson rating"
      labels={{
        option: (value, max) => `${value} of ${max} stars`,
        value: (value, max) => `${value}/${max}`,
      }}
      showValue
    />
  ),
  "segmented-control": () => (
    <SegmentedControl
      items={[
        { id: "grid", label: "Grid" },
        { id: "list", label: "List" },
      ]}
      label="Layout"
      selection={{ defaultValue: "grid", mode: "uncontrolled" }}
    />
  ),
  slider: () => (
    <>
      <Slider accessibilityLabel="Zoom" max={20} min={10} value={15} />
      <Slider accessibilityLabel="Locked slider" disabled value={5} />
    </>
  ),
  switch: () => (
    <Switch accessibilityLabel="Notifications" checked onCheckedChange={noop} />
  ),
  "tag-group": () => (
    <TagGroup
      items={[
        { id: "native", label: "Native" },
        { id: "web", label: "Web" },
      ]}
      label="Platforms"
      onRemove={noop}
      removeLabel={(label) => `Remove ${label}`}
      selection={{ defaultValue: new Set(["native"]), mode: "uncontrolled" }}
    />
  ),
  "timeline-scrubber": () => (
    <TimelineScrubber
      end={10}
      formatValue={(value) => `${value} seconds`}
      labels={{ decrement: "Earlier", increment: "Later", region: "Playback" }}
      start={0}
      valueState={{ defaultValue: 5, mode: "uncontrolled" }}
    />
  ),
};

const pickers: Readonly<Record<string, AccessibilityFixture>> = {
  calendar: () => (
    <Calendar
      labels={calendarLabels}
      month={new Date(2025, 0, 1)}
      selection={{ defaultValue: new Date(2025, 0, 2), mode: "uncontrolled" }}
    />
  ),
  combobox: () => (
    <Combobox
      labels={{
        ...selectLabels,
        close: "Close searchable choices",
        empty: "No matches",
        search: "Search statuses",
      }}
      options={[
        { id: "ready", label: "Ready" },
        { id: "draft", label: "Draft" },
      ]}
      selection={{ defaultValue: "ready", mode: "uncontrolled" }}
    />
  ),
  "date-picker": () => (
    <DatePicker
      labels={pickerLabels}
      selection={{ defaultValue: new Date(2025, 0, 2), mode: "uncontrolled" }}
    />
  ),
  "date-range-picker": () => (
    <DateRangePicker
      labels={{
        ...pickerLabels,
        close: "Close range",
        formatValue: (range) =>
          `${range.start.getDate()} to ${range.end?.getDate() ?? ""}`,
        open: "Choose range",
        placeholder: "No range",
      }}
      range={{
        defaultValue: {
          end: new Date(2025, 0, 4),
          start: new Date(2025, 0, 2),
        },
        mode: "uncontrolled",
      }}
    />
  ),
  "multi-select": () => (
    <MultiSelect
      labels={{
        ...selectLabels,
        empty: "No matches",
        search: "Search choices",
      }}
      options={[
        { id: "alpha", label: "Alpha" },
        { id: "beta", label: "Beta" },
      ]}
      selection={{ defaultValue: new Set(["alpha"]), mode: "uncontrolled" }}
    />
  ),
  "native-select": () => (
    <NativeSelect
      labels={selectLabels}
      options={[
        { id: "ready", label: "Ready" },
        { id: "draft", label: "Draft" },
      ]}
      selection={{ defaultValue: "ready", mode: "uncontrolled" }}
    />
  ),
  "range-calendar": () => (
    <RangeCalendar
      labels={calendarLabels}
      month={new Date(2025, 0, 1)}
      range={{
        defaultValue: {
          end: new Date(2025, 0, 12),
          start: new Date(2025, 0, 10),
        },
        mode: "uncontrolled",
      }}
    />
  ),
  select: () => (
    <Select
      errorText="Choose a status"
      invalid
      labels={selectLabels}
      options={[
        { id: "draft", label: "Draft" },
        { disabled: true, id: "ready", label: "Ready" },
      ]}
      selection={{ defaultValue: "draft", mode: "uncontrolled" }}
    />
  ),
  "time-picker": () => (
    <TimePicker
      labels={{
        close: "Close time",
        hour: "Hour",
        minute: "Minute",
        open: "Choose time",
        placeholder: "No time",
      }}
      selection={{ defaultValue: "07:30", mode: "uncontrolled" }}
    />
  ),
};

const overlays: Readonly<Record<string, AccessibilityFixture>> = {
  command: () => (
    <Command
      cancelLabel="Close commands"
      defaultOpen
      emptyLabel="No commands"
      items={[
        { id: 1, keywords: ["preferences"], label: "Open settings" },
        { destructive: true, id: 2, label: "Delete project" },
      ]}
      label="Command menu"
      placeholder="Search commands"
    />
  ),
  "completion-dialog": () => (
    <CompletionDialog
      cancelLabel="Skip"
      closeLabel="Close completion"
      confirmLabel="Done"
      defaultOpen
      description="Finished lesson"
      onCancel={noop}
      onConfirm={noop}
      title="Complete lesson"
    />
  ),
  "context-menu": () => (
    <ContextMenu
      cancelLabel="Cancel actions"
      defaultOpen
      items={menuItems}
      label="Row actions"
    />
  ),
  dialog: () => (
    <Dialog closeLabel="Close dialog" defaultOpen title="Preferences">
      <Text>Dialog body</Text>
    </Dialog>
  ),
  drawer: () => (
    <Drawer closeLabel="Close drawer" defaultOpen title="Drawer">
      <Text>Drawer body</Text>
    </Drawer>
  ),
  "dropdown-menu": () => (
    <DropdownMenu
      cancelLabel="Cancel menu"
      defaultOpen
      defaultSelectedId="copy"
      items={menuItems}
      label="File actions"
    />
  ),
  "keyboard-shortcuts-help": () => (
    <KeyboardShortcutsHelp
      defaultOpen
      labels={{
        close: "Close keyboard help",
        hardwareKeyboardGuidance: "Available with a hardware keyboard.",
        title: "Keyboard shortcuts",
      }}
      shortcuts={[{ description: "Search", id: "k", keys: ["Cmd", "K"] }]}
    />
  ),
  menubar: () => (
    <Menubar
      defaultOpenMenuId="file"
      label="Main menu"
      linking={linking}
      menus={[
        {
          id: "file",
          items: [
            { id: "new", label: "New file" },
            { disabled: true, id: "close", label: "Close file" },
          ],
          label: "File",
        },
      ]}
    />
  ),
  popover: () => (
    <Popover cancelLabel="Close details" defaultOpen label="Details">
      <Text>Details body</Text>
    </Popover>
  ),
  "search-dialog": () => (
    <SearchDialog
      defaultOpen
      items={[
        { id: "card", title: "Card" },
        { id: "dialog", title: "Dialog" },
      ]}
      labels={searchLabels}
      onSelect={noop}
    />
  ),
  "share-dialog": () => (
    <ShareDialog
      cancelLabel="Cancel"
      content={{ message: "Native UI" }}
      defaultOpen
      shareLabel="Share now"
      shareService={null}
      title="Share"
      unavailableLabel="Sharing unavailable"
    />
  ),
  sheet: () => (
    <Sheet closeLabel="Close sheet" defaultOpen side="left" title="Sheet">
      <Text>Sheet body</Text>
    </Sheet>
  ),
  tooltip: () => (
    <Tooltip
      closeLabel="Close help"
      defaultOpen
      helpHint="Shows help"
      label="Account help"
      trigger={<Text>Help</Text>}
      triggerLabel="Show account help"
    >
      <Text>Use your work email.</Text>
    </Tooltip>
  ),
};

const navigation: Readonly<Record<string, AccessibilityFixture>> = {
  "animated-tabs": () => (
    <AnimatedTabs defaultValue="code" tabs={codePreviewTabs} />
  ),
  "bottom-bar": () => (
    <BottomBar center={<Button onPress={noop}>Compose</Button>} />
  ),
  breadcrumb: () => (
    <Breadcrumb
      items={[
        { href: "app://home", id: "home", label: "Home" },
        { id: "settings", label: "Settings" },
      ]}
      linking={linking}
    />
  ),
  "document-sibling-nav": () => (
    <DocumentSiblingNav
      labels={{
        navigation: "Article navigation",
        next: "Next article",
        previous: "Previous article",
      }}
      linking={linking}
      next={{
        href: "https://example.com/next",
        meta: "5 min read",
        title: "Native follow-up",
      }}
      previous={{ href: "https://example.com/prev", title: "Native intro" }}
      variant="with-meta"
    />
  ),
  "horizontal-scroll-row": () => (
    <HorizontalScrollRow description="Recent projects" title="Workspaces">
      <Button onPress={noop}>Alpha</Button>
      <Button onPress={noop}>Beta</Button>
    </HorizontalScrollRow>
  ),
  "navigation-menu": () => (
    <NavigationMenu
      currentId="home"
      defaultOpenId="products"
      items={[
        { href: "app://home", id: "home", label: "Home" },
        {
          id: "products",
          label: "Products",
          panel: <Text>Product links</Text>,
        },
      ]}
      linking={linking}
    />
  ),
  pagination: () => (
    <Pagination
      currentPage={2}
      getHref={(page) => `app://pages/${page}`}
      linking={linking}
      totalPages={5}
    />
  ),
  sidebar: () => (
    <SidebarProvider defaultOpen>
      <Sidebar
        currentId="dashboard"
        sections={[
          {
            id: "main",
            items: [
              { id: "dashboard", label: "Dashboard" },
              { id: "settings", label: "Settings" },
            ],
          },
        ]}
      />
    </SidebarProvider>
  ),
  "sidebar-provider": () => (
    <SidebarProvider defaultOpen presentation="compact">
      <SidebarToggle />
    </SidebarProvider>
  ),
  "sidebar-toggle": () => (
    <SidebarProvider>
      <SidebarToggle accessibilityLabel="Navigation" />
    </SidebarProvider>
  ),
  "step-navigation": () => (
    <StepNavigation
      canNext
      canPrevious={false}
      currentStep={1}
      onNext={noop}
      onPrevious={noop}
      totalSteps={3}
    />
  ),
  tabs: () => (
    <Tabs defaultValue="overview" id="account">
      <TabsList accessibilityLabel="Account sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Text>Overview panel</Text>
      </TabsContent>
    </Tabs>
  ),
  "top-bar": () => <TopBar title="Project" />,
  "tree-view": () => (
    <TreeView
      defaultExpandedIds={["src"]}
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
      selectionMode="multiple"
    />
  ),
  "view-switcher": () => (
    <ViewSwitcher defaultValue="grid" options={gridListOptions} />
  ),
  "workspace-switcher": () => (
    <WorkspaceSwitcher
      defaultValue="alpha"
      workspaces={[
        { description: "Alpha workspace", id: "alpha", label: "Alpha" },
        { description: "Beta workspace", id: "beta", label: "Beta" },
      ]}
    />
  ),
};

const layout: Readonly<Record<string, AccessibilityFixture>> = {
  accordion: () => (
    <Accordion defaultOpenIds={["details"]}>
      <AccordionItem id="details">
        <AccordionTrigger label="Show details" />
        <AccordionContent>
          <Text>Accordion details</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  "aspect-ratio": () => (
    <AspectRatio ratio={16 / 9}>
      <Text>Preview</Text>
    </AspectRatio>
  ),
  card: () => (
    <Card>
      <CardHeader>
        <CardTitle>Native renderer</CardTitle>
        <CardDescription>Shared tokens.</CardDescription>
      </CardHeader>
      <CardContent>
        <Text tone="muted">Runs in Expo.</Text>
      </CardContent>
      <CardFooter>
        <Button onPress={noop}>Open</Button>
      </CardFooter>
    </Card>
  ),
  collapsible: () => (
    <Collapsible defaultOpen id="details">
      <CollapsibleTrigger label="Toggle details">
        <Text>Toggle details</Text>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Text>Body</Text>
      </CollapsibleContent>
    </Collapsible>
  ),
  "expandable-cards": () => (
    <ExpandableCards
      cards={[{ content: <Text>Card body</Text>, id: "card", title: "Card" }]}
      labels={{
        collapseCard: (item) => `Collapse ${item.title}`,
        expandCard: (item) => `Expand ${item.title}`,
        region: "Cards",
      }}
    />
  ),
  faq: () => (
    <Faq
      defaultOpenIds={["why"]}
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
      title="Common questions"
    />
  ),
  fieldset: () => (
    <Fieldset disabled>
      <FieldsetLegend>Contact</FieldsetLegend>
      <FieldsetContent>
        <Input accessibilityLabel="Contact email" value="" />
      </FieldsetContent>
    </Fieldset>
  ),
  "filter-bar": () => (
    <FilterBar label="Filters">
      <Button onPress={noop} size="sm">
        Open
      </Button>
    </FilterBar>
  ),
  form: () => (
    <Form label="Profile" onSubmit={noop}>
      <Input accessibilityLabel="Name" value="Ada" />
      <FormSubmit>Save profile</FormSubmit>
    </Form>
  ),
  grid: () => (
    <Grid cols={2} gap={2}>
      <Text>One</Text>
      <Text>Two</Text>
    </Grid>
  ),
  heading: () => (
    <Heading level={2} size={3}>
      Account
    </Heading>
  ),
  item: () => (
    <Item variant="outline">
      <ItemMedia decorative>
        <NativeText>•</NativeText>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Account</ItemTitle>
        <ItemDescription>Profile details</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button onPress={noop} size="sm" variant="outline">
          Edit
        </Button>
      </ItemActions>
    </Item>
  ),
  label: () => <Label>Email</Label>,
  panel: () => (
    <Panel>
      <PanelHeader>
        <PanelTitle>Settings</PanelTitle>
        <PanelDescription>Workspace preferences</PanelDescription>
      </PanelHeader>
      <PanelBody>
        <Text>Body</Text>
      </PanelBody>
      <PanelFooter>
        <Text>Footer</Text>
      </PanelFooter>
    </Panel>
  ),
  resizable: () => (
    <ResizablePanelGroup>
      <ResizablePanel defaultSize={50} />
      <ResizableHandle accessibilityLabel="Resize workspace" withHandle />
      <ResizablePanel defaultSize={50} />
    </ResizablePanelGroup>
  ),
  separator: () => (
    <>
      <Separator />
      <Separator accessibilityLabel="Section break" decorative={false} />
    </>
  ),
  text: () => <Text>Body copy</Text>,
  "tldr-section": () => (
    <TLDRSection defaultExpanded label="Summary">
      Keep changes local.
    </TLDRSection>
  ),
  "truncated-text": () => (
    <TruncatedText maxWidth={120}>A long native artifact title</TruncatedText>
  ),
};

const motion: Readonly<Record<string, AccessibilityFixture>> = {
  "animated-list": () => (
    <AnimatedList
      items={[
        { content: <Text>First update</Text>, id: "first" },
        { content: <Text>Second update</Text>, id: "second" },
      ]}
      label="Updates"
    />
  ),
  "animated-testimonials": () => (
    <AnimatedTestimonials
      autoplay
      labels={pagingLabels}
      testimonials={[
        { id: "one", name: "Ari", quote: "First quote", title: "Designer" },
        { id: "two", name: "Bo", quote: "Second quote", title: "Engineer" },
      ]}
    />
  ),
  "animated-text": () => <AnimatedText text="Launch ready" />,
  "blur-reveal": () => (
    <BlurReveal>
      <Text>Revealed content</Text>
    </BlurReveal>
  ),
  carousel: () => (
    <Carousel
      items={[
        { content: <Text>Alpha slide</Text>, id: "alpha", label: "Alpha" },
        { content: <Text>Beta slide</Text>, id: "beta", label: "Beta" },
      ]}
      labels={pagingLabels}
    />
  ),
  marquee: () => (
    <Marquee>
      <Text>Alpha</Text>
      <Text>Beta</Text>
    </Marquee>
  ),
  "reveal-text": () => (
    <RevealText>
      <Text>Controlled reveal</Text>
    </RevealText>
  ),
  "scramble-text": () => <ScrambleText text="SCRAMBLE" />,
  "shimmer-text": () => <ShimmerText>Shimmer</ShimmerText>,
  "spinning-text": () => <SpinningText>Native ring</SpinningText>,
  "text-animate": () => <TextAnimate>Animated words</TextAnimate>,
  "text-reveal": () => <TextReveal progress={1}>Readable words</TextReveal>,
  "text-shimmer": () => <TextShimmer>Text shimmer</TextShimmer>,
  typewriter: () => <Typewriter text="Typed text" />,
};

const learning: Readonly<Record<string, AccessibilityFixture>> = {
  checklist: () => (
    <Checklist
      defaultCheckedIds={["read"]}
      items={[
        { id: "read", label: "Read chapter" },
        { id: "practice", label: "Practice" },
      ]}
      labels={{
        allCompleted: "Everything complete",
        item: (item) => item.label,
        progress: (checked, total) => `${checked} of ${total} done`,
      }}
    />
  ),
  "content-intro": () => (
    <ContentIntro
      completedSections={new Set(["setup"])}
      estimatedTime="8 min"
      onGoToSection={noop}
      onStart={noop}
      renderIntroContent={() => <Text>Read the overview.</Text>}
      sections={[
        { id: "setup", title: "Set up" },
        { id: "ship", title: "Ship" },
      ]}
      title="Native tutorial"
    />
  ),
  exercise: () => (
    <Exercise
      hint="Use a loop."
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
      solution={<Text>Answer</Text>}
      title="Practice"
    >
      <Text>Task</Text>
    </Exercise>
  ),
  flashcard: () => (
    <Flashcard
      answer={<Text>Answer body</Text>}
      hint="Think native"
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
  ),
  "interactive-timeline": () => (
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
      startDate={new Date("2026-01-01")}
      tracks={[{ id: "product", label: "Product" }]}
    />
  ),
  "progress-tracker": () => (
    <ProgressTracker
      labels={progressLabels}
      modules={[trackerModule]}
      overallProgress={50}
      title="Course"
    >
      <ProgressTrackerOverview />
      <ProgressTrackerModules>
        <ProgressTrackerModule {...trackerModule} onPress={noop} />
      </ProgressTrackerModules>
    </ProgressTracker>
  ),
  quiz: () => (
    <Quiz
      defaultSelectedId="one"
      defaultSubmitted
      explanation="One is the only option."
      hint="Count carefully"
      labels={{
        checkAnswer: "Check answer",
        correct: "Correct",
        hint: "Show hint",
        incorrect: "Not correct",
        option: (option) => option.label,
        options: "Answers",
        tryAgain: "Try again",
      }}
      options={[
        { correct: true, id: "one", label: "One" },
        { correct: false, id: "two", label: "Two" },
      ]}
      question="Choose one"
    />
  ),
  slideshow: () => (
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
      onComplete={noop}
      onToggleComplete={noop}
      sections={[
        {
          content: <Text>Introduction content</Text>,
          id: "intro",
          title: "Introduction",
        },
        { content: <Text>Finish content</Text>, id: "finish", title: "Finish" },
      ]}
      title="Native tutorial"
    />
  ),
  "step-by-step": () => (
    <StepByStep
      interactive
      labels={{
        progress: (done, total) => `${done} of ${total} steps`,
        toggleStep: (title, complete) =>
          `${title} ${complete ? "complete" : "incomplete"}`,
      }}
    >
      <Step id="setup" title="Set up">
        <Text>Install tools</Text>
      </Step>
    </StepByStep>
  ),
  stepper: () => (
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
  ),
  tour: () => (
    <Tour
      labels={{
        finish: "Finish",
        goToStep: (step) => `Go to ${step.title}`,
        hint: "Hint",
        next: "Next",
        previous: "Previous",
        stepProgress: (current, total) => `${current} of ${total}`,
        tour: "Tour",
      }}
      steps={[
        { description: <Text>First body</Text>, id: "first", title: "First" },
        {
          description: <Text>Second body</Text>,
          id: "second",
          title: "Second",
        },
      ]}
    />
  ),
  "tutorial-complete": () => (
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
      onBack={noop}
      onGoToSection={noop}
      onRestart={noop}
      sections={[
        { id: "intro", title: "Introduction" },
        { id: "next", title: "Next steps" },
      ]}
      title="Native basics"
    />
  ),
  "tutorial-filters": () => (
    <TutorialFilters
      currentDifficulty="all"
      currentTags={["native"]}
      difficultyOptions={["all", "easy"]}
      labels={{
        activeFilters: "Active filters",
        clear: "Clear",
        clearAll: "Clear all",
        difficulty: { all: "All", easy: "Easy" },
        difficultyLabel: "Difficulty",
        searchFilter: (query) => `Search ${query}`,
        searchLabel: "Search tutorials",
        searchPlaceholder: "Search tutorials",
        tagsLabel: "Tags",
      }}
      onFilterChange={noop}
      searchQuery="forms"
      tags={["native", "web"]}
    />
  ),
};

/**
 * One representative, consumer-labelled render per native component directory
 * (keyed by the `registry.json` component name). The accessibility contract
 * test walks each rendered host tree.
 */
export const accessibilityFixtures: Readonly<
  Record<string, AccessibilityFixture>
> = {
  ...feedbackAndStatus,
  ...dataDisplay,
  ...aiSurfaces,
  ...actions,
  ...textInputs,
  ...choiceControls,
  ...pickers,
  ...overlays,
  ...navigation,
  ...layout,
  ...motion,
  ...learning,
};

/**
 * Controls pressed (by accessible name, in order) after the first render so
 * the contract also checks overlays that lack a default-open prop.
 */
export const accessibilityFixtureActions: Readonly<
  Record<string, readonly string[]>
> = {
  combobox: ["Choose status"],
  "date-picker": ["Choose date"],
  "date-range-picker": ["Choose range"],
  "multi-select": ["Choose status"],
  "native-select": ["Choose status"],
  select: ["Choose status"],
  "time-picker": ["Choose time"],
};
