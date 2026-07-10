"use client";

import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ActivityHeatmap,
  ActivityLog,
  AgentActivity,
  AgentStep,
  AgentStepDetail,
  AgentStepDuration,
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
  AISidebar,
  AISidebarClose,
  AISidebarContent,
  AISidebarFooter,
  AISidebarHeader,
  AISidebarProvider,
  AISidebarTitle,
  AISourceCitation,
  AIStreamingText,
  AIToolCallDisplay,
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertPulse,
  AlertTitle,
  AnimatedBeam,
  AnimatedGridPattern,
  AnimatedList,
  AnimatedTabs,
  AnimatedTestimonials,
  AnimatedText,
  AnimatedTooltip,
  Annotation,
  AspectRatio,
  AutoReload,
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  Badge,
  Banner,
  BannerAction,
  BentoCard,
  BentoGrid,
  BlurReveal,
  BorderBeam,
  BottomActivityStrip,
  BottomBar,
  Breadcrumb,
  Button,
  ButtonGroup,
  Calendar,
  Callout,
  CandlestickChart,
  CanvasView,
  Card,
  CardContent,
  CardDescription,
  CardFlip,
  CardFooter,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CategoryFilter,
  ChainOfThought,
  ChatDockSection,
  Checkbox,
  CheckboxGroup,
  CheckboxGroupItem,
  Checklist,
  ChoroplethLegend,
  ChoroplethMap,
  ChoroplethTooltip,
  ChronoEvent,
  ChronologicalTimeline,
  CivilizationCard,
  CodeBlock,
  CodePlayground,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ColorPicker,
  Combobox,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommentPin,
  CommonMistake,
  Comparison,
  ContentCard,
  ContextLens,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContributionGraph,
  ConversationHeader,
  ConversationMessages,
  ConversationThread,
  ConversationTitle,
  CookieConsent,
  CopyButton,
  CountdownTimer,
  CreditBadge,
  Curriculum,
  CurriculumLesson,
  CurriculumModule,
  Cursor,
  DataList,
  DataListItem,
  DataListLabel,
  DataListValue,
  DataTable,
  DateField,
  DatePicker,
  DateRangePicker,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Dock,
  DockIcon,
  DocumentSiblingNav,
  DotPattern,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  EraColumn,
  EraComparison,
  EraDomain,
  EraFigure,
  EraHighlight,
  Exercise,
  ExpandableCards,
  FAQ,
  FAQItem,
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
  Fieldset,
  FieldsetContent,
  FieldsetLegend,
  FileUpload,
  Flashcard,
  FloatingActionButton,
  FloatingNavbar,
  FloatingToolbar,
  FlowDiagram,
  FollowMode,
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  GanttChart,
  GaugeChart,
  GeographyQuizMap,
  GeographyQuizMapPrompt,
  GeographyQuizMapScore,
  GlassCard,
  GlassPanel,
  GlassProgress,
  Globe3D,
  GlobeMarker,
  Glossary,
  Grid,
  H3,
  HandoffBeacon,
  HeatMapOverlay,
  Highlight,
  HistoricalFigureCard,
  HistoricTimeline,
  HorizontalScrollRow,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  InfinitePlane,
  InlineCode,
  InlineInput,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InteractiveTimeline,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
  JarvisDock,
  Kbd,
  KeyboardShortcutsHelp,
  KeyConcept,
  KnowledgeCheck,
  Label,
  LangProvider,
  LearningObjectives,
  Link,
  LiquidGlass,
  ListBox,
  ListBoxItem,
  LiveCursor,
  LiveFeed,
  Magnetic,
  MagneticButton,
  Map2D,
  MapControls,
  MapLayer,
  MapMarker,
  MapTimeline,
  MapTimelineControls,
  MapTimelineEvent,
  MapTimelineLayer,
  MapTimelinePlayButton,
  MapTimelineSlider,
  MapZoomIn,
  MapZoomOut,
  MarketTreemap,
  Marquee,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  Meteors,
  Meter,
  MetricCluster,
  MetricGauge,
  ModelComparison,
  ModelComparisonColumn,
  ModelComparisonMeta,
  MultiSelect,
  MultiSelectLasso,
  Muted,
  NativeSelect,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NewsletterSignup,
  NumberInput,
  NumberTicker,
  ObjectInspector,
  OrderBook,
  OverviewBoard,
  P,
  Pagination,
  Panel,
  PanelBody,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
  ParallelTimeline,
  Particles,
  PasswordInput,
  PhoneInput,
  PieChart,
  PlanBadge,
  PlaybackGhost,
  PolicyDeliveryPanel,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Prerequisites,
  PresenceStack,
  PresenceSyncIndicator,
  PricingPlan,
  PricingTable,
  PrimarySourceAnnotation,
  PrimarySourceAnnotations,
  PrimarySourceToolbar,
  PrimarySourceViewer,
  PrimarySourceZoomIn,
  PrimarySourceZoomOut,
  ProfileSection,
  ProgressBar,
  ProgressiveBlur,
  ProgressTracker,
  ProgressTrackerModule,
  ProgressTrackerModules,
  ProgressTrackerOverview,
  ProgressTrackerStat,
  ProgressTrackerStats,
  PromptInput,
  PromptTemplates,
  PropertySection,
  ProTip,
  QrCode,
  Quiz,
  RadarChart,
  RadioGroup,
  RadioGroupItem,
  RangeCalendar,
  Rating,
  Reasoning,
  RelationshipInspector,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  RevealText,
  RoleBadge,
  RouteMap,
  RoutingAssignmentPanel,
  RunTimeline,
  RuntimeOverviewPanel,
  SankeyChart,
  ScopeSelector,
  ScrambleText,
  ScrollArea,
  SearchBar,
  SearchField,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  SelectContent,
  SelectionHalo,
  SelectionPresence,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  SeverityBadge,
  ShareDialog,
  ShareSection,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  ShimmerButton,
  ShimmerText,
  ShineBorder,
  ShinyButton,
  Sidebar,
  SidebarProvider,
  SidebarToggle,
  Skeleton,
  Slider,
  SnapGuides,
  Sparkles,
  SparklineGrid,
  Spinner,
  SpinningText,
  SpotlightCard,
  StatCard,
  StateBadgeOverlay,
  StatusBoard,
  StatusIndicator,
  Step,
  StepByStep,
  StepNavigation,
  Stepper,
  StickyMetric,
  StoryMap,
  StoryMapChapter,
  SubscriptionCard,
  Summary,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableOfContents,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TagGroup,
  TagGroupItem,
  TagsInput,
  Terminal,
  TextAnimate,
  Textarea,
  TextField,
  TextReveal,
  TextShimmer,
  ThemePresetProvider,
  ThemeProvider,
  ThemeSwitcher,
  ThemeToggle,
  ThinkingBlock,
  ThreadBubble,
  ThresholdRing,
  TickerTape,
  TiltCard,
  TimeField,
  Timeline,
  TimelineItem,
  TimelineScrubber,
  TimePicker,
  TLDRSection,
  Toast,
  ToastDescription,
  ToastTitle,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarSeparator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tour,
  TransactionList,
  TransactionListPinned,
  TransactionListSubscriptionRow,
  TreeView,
  TruncatedText,
  TutorialCard,
  Typewriter,
  UsageBreakdown,
  VideoEmbed,
  ViewportBookmarks,
  ViewSwitcher,
  WalletCard,
  Watchlist,
  WorldBreadcrumbs,
  WorldClockBar,
} from "@vllnt/ui";
import {
  AlertTriangle,
  Bold,
  ChevronsUpDown,
  Inbox,
  Italic,
  Plus,
  Search,
  Terminal as TerminalIcon,
  Underline,
} from "lucide-react";

type ComponentPreviewProps = {
  componentName: string;
};

const DATE_PICKER_PREVIEW_DATE = new Date("2026-04-19T00:00:00.000Z");
const HORIZONTAL_SCROLL_ROW_CARDS = Array.from({ length: 6 }, (_, index) => ({
  id: `featured-card-${index + 1}`,
  label: `Card ${index + 1}`,
}));

// Simple text-based preview for components that need complex context
function SimplePreview({ description }: { description: string }) {
  return (
    <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/30">
      <p>{description}</p>
    </div>
  );
}

// Graceful fallback for components without a dedicated preview: a muted wordmark
// tile derived from the component slug, so gallery cards still look intentional.
function noop() {
  // no-op handler for static gallery previews
}

function PlaceholderPreview({ componentName }: { componentName: string }) {
  const label = componentName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="flex h-full w-full items-center justify-center">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

function ButtonPreview() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}

function BadgePreview() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  );
}

function CanvasViewPreview() {
  return (
    <div className="w-full">
      <CanvasView className="h-80" defaultViewport={{ x: 32, y: 24, zoom: 1 }}>
        <div className="relative h-[800px] w-[1200px]">
          <div className="absolute left-12 top-10 w-56 rounded-xl border border-border bg-card p-4 text-sm shadow-sm">
            Pan with space-drag or scroll. Zoom with control + wheel.
          </div>
          <div className="absolute left-[26rem] top-[18rem] w-52 rounded-xl border border-border bg-card p-4 text-sm shadow-sm">
            Canvas objects live on a calm spatial surface.
          </div>
        </div>
      </CanvasView>
    </div>
  );
}

function CardPreview() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  );
}

function InputPreview() {
  return (
    <div className="w-full max-w-sm space-y-2">
      <Input placeholder="Email" type="email" />
      <Input placeholder="Password" type="password" />
    </div>
  );
}

function ComboboxPreview() {
  return (
    <div className="w-full max-w-sm">
      <Combobox
        options={[
          { label: "Next.js", value: "next.js" },
          { label: "React", value: "react" },
          { label: "SvelteKit", value: "sveltekit" },
        ]}
        value="react"
      />
    </div>
  );
}

function DatePickerPreview() {
  return (
    <div className="w-full max-w-sm">
      <DatePicker value={DATE_PICKER_PREVIEW_DATE} />
    </div>
  );
}

function FileUploadPreview() {
  return (
    <div className="w-full max-w-md">
      <FileUpload
        files={[
          new File(["contract"], "contract.pdf", { type: "application/pdf" }),
        ]}
        helperText="PNG, JPG, or PDF up to 10MB."
      />
    </div>
  );
}

function NumberInputPreview() {
  return (
    <div className="w-full max-w-xs">
      <NumberInput defaultValue={2} min={0} />
    </div>
  );
}

function PasswordInputPreview() {
  return (
    <div className="w-full max-w-sm">
      <PasswordInput placeholder="Enter password" value="super-secret" />
    </div>
  );
}

function BreadcrumbPreview() {
  return (
    <Breadcrumb
      items={[
        { href: "/", label: "Home" },
        { href: "/components", label: "Components" },
        { label: "Breadcrumb" },
      ]}
    />
  );
}

function DropdownMenuPreview() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ToastPreview() {
  return (
    <div className="space-y-2">
      <Toast>
        <ToastTitle>Toast Title</ToastTitle>
        <ToastDescription>Toast description goes here.</ToastDescription>
      </Toast>
    </div>
  );
}

function TLDRSectionPreview() {
  return (
    <TLDRSection label="TLDR">
      This is a collapsible section with a loading animation. When you first
      expand it, you&apos;ll see a shimmer effect before the content appears.
    </TLDRSection>
  );
}

function DialogPreview() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Example</DialogTitle>
          <DialogDescription>
            This is an example dialog component.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CodeBlockPreview() {
  return (
    <CodeBlock language="typescript">
      {`function greet(name: string) {
  return \`Hello, \${name}!\`
}`}
    </CodeBlock>
  );
}

function ProfileSectionPreview() {
  return (
    <ProfileSection
      dict={{ profile: { name: "John Doe", tagline: "Full-stack developer" } }}
      imageAlt="Profile"
      imageSource="/profile.png"
      socialLinks={[{ href: "https://github.com", label: "GitHub" }]}
    />
  );
}

function ThemeTogglePreview() {
  return (
    <ThemeToggle
      dict={{
        theme: {
          dark: "Dark",
          light: "Light",
          system: "System",
          toggle_theme: "Toggle theme",
        },
      }}
    />
  );
}

function LangProviderPreview() {
  return (
    <div className="space-y-2">
      <LangProvider defaultLanguage="en" supportedLanguages={["en", "fr"]} />
      <p className="text-sm text-muted-foreground">
        Sets the HTML lang attribute.
      </p>
    </div>
  );
}

function ThemeProviderPreview() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm">
          Theme Provider wraps your app for theme support.
        </p>
      </div>
    </ThemeProvider>
  );
}

function CommandPreview() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={() => {
          setOpen(true);
        }}
        variant="outline"
      >
        Open Command Menu
      </Button>
      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Settings</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

function TabsPreview() {
  return (
    <Tabs className="w-full max-w-md" defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="text-sm text-muted-foreground">
          Manage your account here.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="text-sm text-muted-foreground">
          Change your password here.
        </p>
      </TabsContent>
    </Tabs>
  );
}

function CalloutPreview() {
  return (
    <div className="space-y-4 w-full max-w-md">
      <Callout variant="info">This is an informational callout.</Callout>
      <Callout variant="warning">This is a warning callout.</Callout>
      <Callout variant="tip">This is a helpful tip.</Callout>
      <Callout variant="danger">This is a danger callout.</Callout>
    </div>
  );
}

function CheckboxPreview() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-x-2">
        <Checkbox id="terms" />
        <label className="text-sm" htmlFor="terms">
          Accept terms
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <Checkbox defaultChecked id="marketing" />
        <label className="text-sm" htmlFor="marketing">
          Receive emails
        </label>
      </div>
    </div>
  );
}

function FormPreview() {
  return (
    <div className="w-full max-w-sm">
      <Form invalid>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="name@company.com" type="email" />
          </FormControl>
          <FormDescription>Use your work email address.</FormDescription>
          <FormMessage>Please enter a valid email.</FormMessage>
        </FormItem>
      </Form>
    </div>
  );
}

function MultiSelectPreview() {
  return (
    <div className="w-full max-w-sm">
      <MultiSelect
        defaultValue={["react", "vue"]}
        options={[
          { label: "React", value: "react" },
          { label: "Vue", value: "vue" },
          { label: "Svelte", value: "svelte" },
        ]}
        searchable
      />
    </div>
  );
}

function TagsInputPreview() {
  return (
    <div className="w-full max-w-sm">
      <TagsInput
        aria-label="Framework tags"
        defaultValue={["React", "Vue"]}
        placeholder="Add a framework"
      />
    </div>
  );
}

function SegmentedControlPreview() {
  return (
    <div className="w-full max-w-sm">
      <SegmentedControl aria-label="Project view" defaultValue="board">
        <SegmentedControlItem value="board">Board</SegmentedControlItem>
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="timeline">Timeline</SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}

function TerminalPreview() {
  return (
    <Terminal
      lines={[
        { content: "npm install", type: "command" },
        { content: "Installing dependencies...", type: "output" },
        { content: "Done in 2.3s", type: "output" },
      ]}
    />
  );
}

// New real previews

function FAQPreview() {
  return (
    // eslint-disable-next-line react/jsx-pascal-case -- FAQ is an acronym
    <FAQ title="Common Questions">
      <FAQItem question="What is this component?">
        <p>A collapsible FAQ component for displaying questions and answers.</p>
      </FAQItem>
      <FAQItem question="How do I use it?">
        <p>Wrap FAQItem components inside the FAQ component.</p>
      </FAQItem>
    </FAQ>
  );
}

function QuizPreview() {
  return (
    <Quiz
      explanation={
        <p>Paris has been France&apos;s capital since the 12th century.</p>
      }
      hint="It's known as the City of Light"
      options={[
        { label: "London" },
        { correct: true, label: "Paris" },
        { label: "Berlin" },
      ]}
      question="What is the capital of France?"
    />
  );
}

function ChecklistPreview() {
  return (
    <Checklist
      items={[
        { id: "step1", label: "Install dependencies" },
        { id: "step2", label: "Configure environment" },
        { id: "step3", label: "Start development server" },
      ]}
      title="Setup Steps"
    />
  );
}

function StepByStepPreview() {
  return (
    <StepByStep title="Getting Started">
      <Step title="Install">Run npm install to install dependencies.</Step>
      <Step title="Configure">Set up your configuration files.</Step>
      <Step title="Build">Build your application for production.</Step>
    </StepByStep>
  );
}

function ProTipPreview() {
  return (
    <div className="space-y-4">
      <ProTip variant="tip">
        <p>Use TypeScript for better developer experience.</p>
      </ProTip>
      <CommonMistake
        fix={<p>Always add unique keys to list items.</p>}
        title="Forgetting keys"
      >
        <p>Rendering lists without keys causes issues.</p>
      </CommonMistake>
    </div>
  );
}

function ProgressBarPreview() {
  return (
    <div className="space-y-4 w-full max-w-md">
      <ProgressBar
        completedLabel="items"
        currentLabel="Progress"
        max={10}
        value={3}
      />
      <ProgressBar currentLabel="Complete!" isComplete max={10} value={10} />
    </div>
  );
}

function KeyConceptPreview() {
  return (
    <div className="space-y-4">
      <KeyConcept highlight term="Component">
        <p>A reusable piece of UI that encapsulates structure and behavior.</p>
      </KeyConcept>
      <Glossary title="Key Terms">
        <KeyConcept term="Props">
          <p>Data passed from parent to child components.</p>
        </KeyConcept>
        <KeyConcept term="State">
          <p>Data that changes over time within a component.</p>
        </KeyConcept>
      </Glossary>
    </div>
  );
}

function LearningObjectivesPreview() {
  return (
    <div className="space-y-4">
      <LearningObjectives
        estimatedTime="30 min"
        objectives={[
          "Understand React components",
          "Learn about props and state",
          "Build your first component",
        ]}
      />
      <Prerequisites
        items={["Basic JavaScript knowledge", "HTML/CSS fundamentals"]}
        level="beginner"
      />
      <Summary keyTakeaways={["Components are reusable", "Props flow down"]}>
        <p>We covered the basics of React components.</p>
      </Summary>
    </div>
  );
}

function ComparisonPreview() {
  return (
    <Comparison
      after={{
        items: ["Full TypeScript", "Easy to refactor"],
        title: "After",
        variant: "good",
      }}
      before={{
        items: ["No type safety", "Hard to maintain"],
        title: "Before",
        variant: "bad",
      }}
      title="Code Quality"
    />
  );
}

function ExercisePreview() {
  return (
    <Exercise
      difficulty="easy"
      hint="Use the useState hook"
      solution={
        <pre className="text-xs">const [count, setCount] = useState(0)</pre>
      }
      title="Create a Counter"
    >
      <p>Create a component that displays and increments a number.</p>
    </Exercise>
  );
}

function SidebarTogglePreview() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex items-center gap-4">
      <SidebarToggle
        onToggle={() => {
          setOpen(!open);
        }}
        open={open}
      />
      <span className="text-sm text-muted-foreground">
        Sidebar is {open ? "open" : "closed"}
      </span>
    </div>
  );
}

function ThinkingBlockPreview() {
  return (
    <ThinkingBlock
      isStreaming={false}
      thinking="Analyzing the request... Let me break this down into key concepts."
    />
  );
}

function InlineInputPreview() {
  const [value, setValue] = React.useState("Click to edit");
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Click the input to edit:</p>
      <InlineInput
        onChange={setValue}
        onCommit={(v) => {
          setValue(v);
        }}
        value={value}
      />
    </div>
  );
}

function VideoEmbedPreview() {
  return (
    <div className="w-full max-w-md">
      <VideoEmbed src="dQw4w9WgXcQ" title="Example Video" type="youtube" />
    </div>
  );
}

function BlogCardPreview() {
  return (
    <ContentCard
      href="/blog/getting-started"
      lang="en"
      post={{
        date: "2024-01-15",
        description: "Learn the fundamentals of React development.",
        slug: "getting-started",
        tags: ["React", "Tutorial"],
        title: "Getting Started with React",
      }}
    />
  );
}

function CategoryFilterPreview() {
  return (
    <CategoryFilter categories={["nextjs", "react", "typescript"]} lang="en" />
  );
}

function PaginationPreview() {
  return <Pagination baseUrl="/blog" currentPage={3} totalPages={10} />;
}

function UsageBreakdownPreview() {
  return (
    <UsageBreakdown
      description="Ranked resource consumption across the current workspace."
      items={[
        {
          id: "tokens",
          label: "Tokens",
          meta: "LLM",
          trend: { direction: "up", label: "+14%" },
          value: 420,
          valueLabel: "420k",
        },
        {
          id: "storage",
          label: "Storage",
          meta: "Vector DB",
          trend: { direction: "down", label: "-6%" },
          value: 260,
          valueLabel: "260 GB",
        },
        {
          id: "events",
          label: "Events",
          meta: "Tracking",
          value: 180,
          valueLabel: "180k",
        },
      ]}
      title="Usage breakdown"
    />
  );
}

function ActivityLogPreview() {
  return (
    <ActivityLog
      description="Recent analytics changes across your org."
      items={[
        {
          action: "updated",
          actor: "Alex Morgan",
          description: "Raised ingestion retention from 30 to 45 days.",
          id: "1",
          scope: "Workspace",
          target: "Analytics policy",
          timestamp: "2m ago",
          tone: "success",
        },
        {
          action: "paused",
          actor: "Riley Chen",
          description: "Temporarily disabled streaming exports after an alert.",
          id: "2",
          scope: "Project",
          target: "Billing pipeline",
          timestamp: "11m ago",
          tone: "warning",
        },
        {
          action: "revoked",
          actor: "Sam Patel",
          description:
            "Removed an expired API credential from production scope.",
          id: "3",
          scope: "Environment",
          target: "Collector token",
          timestamp: "24m ago",
          tone: "danger",
        },
      ]}
      pageSize={3}
      title="Activity log"
    />
  );
}

function SearchBarPreview() {
  return (
    <React.Suspense
      fallback={
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-muted rounded-md animate-pulse" />
          <div className="h-10 w-20 bg-muted rounded-md animate-pulse" />
        </div>
      }
    >
      <SearchBar
        onSearch={(q) => {
          console.info("Search:", q);
        }}
        placeholder="Search articles..."
      />
    </React.Suspense>
  );
}

function ShareSectionPreview() {
  return (
    <ShareSection
      platforms={[
        { key: "x", label: "X" },
        { key: "linkedin", label: "LinkedIn" },
      ]}
      shareOn="Share on"
      shareTitle="Share this article"
      title="My Article"
      url="https://example.com/article"
    />
  );
}

function CodePlaygroundPreview() {
  return (
    <CodePlayground
      description="A simple React button"
      filename="Button.tsx"
      language="typescript"
      title="Button Component"
    >
      {`function Button({ children }) {
  return <button>{children}</button>
}`}
    </CodePlayground>
  );
}

function FloatingActionButtonPreview() {
  return (
    <div className="relative h-24 border rounded-lg bg-muted/30">
      <FloatingActionButton
        aria-label="Add item"
        onClick={() => {
          alert("Clicked!");
        }}
        position="bottom-right"
      >
        <Plus className="size-5" />
      </FloatingActionButton>
    </div>
  );
}

function KeyboardShortcutsHelpPreview() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div>
      <Button
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Show Shortcuts
      </Button>
      <KeyboardShortcutsHelp
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        shortcuts={[
          { description: "Open command palette", keys: ["⌘", "K"] },
          { description: "Close dialog", keys: ["Esc"] },
        ]}
      />
    </div>
  );
}

function StepNavigationPreview() {
  const [step, setStep] = React.useState(2);
  return (
    <StepNavigation
      canNext={step < 5}
      canPrev={step > 1}
      currentStep={step}
      onNext={() => {
        setStep((currentStep) => currentStep + 1);
      }}
      onPrev={() => {
        setStep((currentStep) => currentStep - 1);
      }}
      stepLabel="Step"
      totalSteps={5}
    />
  );
}

function TableOfContentsPreview() {
  return (
    <TableOfContents
      sections={[
        { id: "intro", title: "Introduction" },
        { id: "setup", title: "Setup" },
        { id: "usage", title: "Usage" },
      ]}
    />
  );
}

function TutorialCardPreview() {
  return (
    <TutorialCard
      href="/tutorials/react-basics"
      labels={{
        completed: "completed",
        difficulty: {
          advanced: "Advanced",
          beginner: "Beginner",
          intermediate: "Intermediate",
        },
        sectionsCount: "sections",
      }}
      tutorial={{
        description: "Learn React fundamentals",
        difficulty: "beginner",
        estimatedTime: "2 hours",
        id: "react-basics",
        sectionCount: 5,
        tags: ["react", "javascript"],
        title: "React Basics",
      }}
    />
  );
}

function AreaChartPreview() {
  return (
    <div className="flex items-center justify-center h-[80px] w-[160px]">
      <svg className="w-full h-full" viewBox="0 0 160 80">
        <defs>
          <linearGradient gradientTransform="rotate(90)" id="area-grad">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,60 L40,40 L80,50 L120,20 L160,30 L160,80 L0,80 Z"
          fill="url(#area-grad)"
        />
        <path
          d="M0,60 L40,40 L80,50 L120,20 L160,30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

function BarChartPreview() {
  return (
    <div className="flex items-end justify-center gap-2 h-[80px] w-[160px]">
      <div
        className="w-8 bg-current opacity-60 rounded-t"
        style={{ height: "40%" }}
      />
      <div
        className="w-8 bg-current opacity-60 rounded-t"
        style={{ height: "60%" }}
      />
      <div
        className="w-8 bg-current opacity-60 rounded-t"
        style={{ height: "80%" }}
      />
      <div
        className="w-8 bg-current opacity-60 rounded-t"
        style={{ height: "50%" }}
      />
    </div>
  );
}

function LineChartPreview() {
  return (
    <div className="flex items-center justify-center h-[80px] w-[160px]">
      <svg className="w-full h-full" viewBox="0 0 160 80">
        <path
          d="M0,50 L40,30 L80,45 L120,15 L160,25"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="0" cy="50" fill="currentColor" r="3" />
        <circle cx="40" cy="30" fill="currentColor" r="3" />
        <circle cx="80" cy="45" fill="currentColor" r="3" />
        <circle cx="120" cy="15" fill="currentColor" r="3" />
        <circle cx="160" cy="25" fill="currentColor" r="3" />
      </svg>
    </div>
  );
}

function SidebarPreview() {
  return (
    <div className="w-64 border rounded-lg overflow-hidden">
      <Sidebar
        sections={[
          {
            items: [
              { href: "/", title: "Introduction" },
              { href: "/install", title: "Installation" },
            ],
            title: "Getting Started",
          },
        ]}
      />
    </div>
  );
}

function SidebarProviderPreview() {
  return (
    <SidebarProvider>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">
          Manages sidebar state with useSidebar() hook.
        </p>
      </div>
    </SidebarProvider>
  );
}

function MDXContentPreview() {
  return (
    <SimplePreview description="A component for rendering MDX content with custom styling." />
  );
}

function AccordionPreview() {
  return (
    <Accordion
      className="w-full max-w-[200px]"
      defaultValue="item-1"
      type="single"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger value="item-1">What is this?</AccordionTrigger>
        <AccordionContent value="item-1">
          A collapsible section.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

// New shadcn primitive previews

function TextareaPreview() {
  return (
    <div className="w-full max-w-sm">
      <Textarea placeholder="Type your message here..." />
    </div>
  );
}

function SelectPreview() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectContent>
    </Select>
  );
}

function RadioGroupPreview() {
  return (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center gap-x-2">
        <RadioGroupItem id="option-one" value="option-one" />
        <label className="text-sm" htmlFor="option-one">
          Option One
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <RadioGroupItem id="option-two" value="option-two" />
        <label className="text-sm" htmlFor="option-two">
          Option Two
        </label>
      </div>
    </RadioGroup>
  );
}

function SliderPreview() {
  return (
    <div className="w-full max-w-sm">
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
  );
}

function TogglePreview() {
  return (
    <div className="flex gap-2">
      <Toggle aria-label="Toggle bold">
        <Bold className="size-4" />
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <Italic className="size-4" />
      </Toggle>
      <Toggle aria-label="Toggle underline">
        <Underline className="size-4" />
      </Toggle>
    </div>
  );
}

function ToggleGroupPreview() {
  return (
    <ToggleGroup type="multiple">
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <Bold className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <Italic className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <Underline className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

function InputOTPPreview() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}

function TooltipPreview() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This is a tooltip</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function PopoverPreview() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Popover Title</h4>
          <p className="text-sm text-muted-foreground">
            This is a popover with some content.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SheetPreview() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>This is a sheet component.</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Sheet content goes here.
          </p>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function DrawerPreview() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>This is a drawer component.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            Drawer content goes here.
          </p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function AlertDialogPreview() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Open Alert</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function HorizontalScrollRowPreview() {
  return (
    <HorizontalScrollRow description="Browse our picks" title="Featured">
      {HORIZONTAL_SCROLL_ROW_CARDS.map((card) => (
        <div
          className="min-w-[180px] snap-start rounded-lg border bg-card p-4 text-sm"
          key={card.id}
        >
          {card.label}
        </div>
      ))}
    </HorizontalScrollRow>
  );
}

function ViewSwitcherPreview() {
  return (
    <ViewSwitcher
      defaultKey="list"
      options={[
        { key: "list", label: "List" },
        { key: "grid", label: "Grid" },
      ]}
      paramName="demo-view"
    />
  );
}

function ScopeSelectorPreview() {
  return (
    <div className="w-full max-w-sm">
      <ScopeSelector
        nodes={[
          {
            children: [
              {
                children: [
                  { id: "prod-us", label: "US East" },
                  { id: "prod-eu", label: "EU West" },
                ],
                id: "production",
                label: "Production",
              },
              {
                children: [{ id: "staging-us", label: "US East" }],
                id: "staging",
                label: "Staging",
              },
            ],
            id: "environments",
            label: "Environments",
          },
          {
            children: [
              { id: "team-growth", label: "Growth" },
              { id: "team-data", label: "Data" },
            ],
            id: "teams",
            label: "Teams",
          },
        ]}
      />
    </div>
  );
}

function HoverCardPreview() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@vllnt</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">VLLNT UI</h4>
          <p className="text-sm text-muted-foreground">
            A component library built with Radix UI and Tailwind CSS.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function ContextMenuPreview() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[100px] w-[200px] items-center justify-center rounded-md border border-dashed text-sm">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem>Back</ContextMenuItem>
        <ContextMenuItem>Forward</ContextMenuItem>
        <ContextMenuItem>Reload</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function MenubarPreview() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New Tab</MenubarItem>
          <MenubarItem>New Window</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

function NavigationMenuPreview() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-4 w-[200px]">
              <NavigationMenuLink className="text-sm">
                Introduction
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-4 w-[200px]">
              <NavigationMenuLink className="text-sm">
                View all
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function TablePreview() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>Active</TableCell>
          <TableCell className="text-right">$250.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jane Smith</TableCell>
          <TableCell>Pending</TableCell>
          <TableCell className="text-right">$150.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function AvatarPreview() {
  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage alt="User" src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </div>
  );
}

function AvatarGroupPreview() {
  return (
    <AvatarGroup
      items={[
        { alt: "Ada Lovelace", fallback: "AL" },
        { alt: "Grace Hopper", fallback: "GH" },
        { alt: "Margaret Hamilton", fallback: "MH" },
        { alt: "Katherine Johnson", fallback: "KJ" },
      ]}
      max={3}
    />
  );
}

function DataListPreview() {
  return (
    <div className="w-full max-w-2xl">
      <DataList>
        <DataListItem>
          <DataListLabel>Environment</DataListLabel>
          <DataListValue>Production</DataListValue>
        </DataListItem>
        <DataListItem>
          <DataListLabel>Owner</DataListLabel>
          <DataListValue>Platform engineering</DataListValue>
        </DataListItem>
        <DataListItem>
          <DataListLabel>Deploy window</DataListLabel>
          <DataListValue>Tuesday / Thursday · 09:00 UTC</DataListValue>
        </DataListItem>
      </DataList>
    </div>
  );
}

function StatusIndicatorPreview() {
  return (
    <div className="flex flex-wrap gap-3">
      <StatusIndicator tone="success">Operational</StatusIndicator>
      <StatusIndicator tone="warning">Pending</StatusIndicator>
      <StatusIndicator tone="danger">Incident</StatusIndicator>
      <StatusIndicator tone="info">Queued</StatusIndicator>
    </div>
  );
}

function StatCardPreview() {
  return (
    <div className="w-full max-w-sm">
      <StatCard
        change="+8.2%"
        description="Monthly recurring revenue"
        label="MRR"
        meta="vs last month"
        tone="success"
        trend="up"
        value="$42.8k"
      />
    </div>
  );
}

function DataTablePreview() {
  return (
    <div className="w-full max-w-4xl">
      <DataTable
        columns={[
          { accessorKey: "workspace", header: "Workspace" },
          { accessorKey: "status", header: "Status" },
          { accessorKey: "seats", header: "Seats" },
        ]}
        data={[
          { seats: 142, status: "active", workspace: "Northstar" },
          { seats: 28, status: "trial", workspace: "Signal" },
          { seats: 11, status: "paused", workspace: "Helix" },
        ]}
        enableSelection={true}
        filterableColumns={[
          {
            columnId: "status",
            label: "status",
            options: [
              { label: "Active", value: "active" },
              { label: "Trial", value: "trial" },
              { label: "Paused", value: "paused" },
            ],
          },
        ]}
        searchPlaceholder="Search workspaces"
      />
    </div>
  );
}

function SkeletonPreview() {
  return (
    <div className="flex items-center gap-x-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  );
}

function SeparatorPreview() {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium">VLLNT UI</h4>
        <p className="text-sm text-muted-foreground">A component library.</p>
      </div>
      <Separator />
      <div className="flex h-5 items-center gap-x-4 text-sm">
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
        <Separator orientation="vertical" />
        <div>Support</div>
      </div>
    </div>
  );
}

function AlertPreview() {
  return (
    <div className="space-y-4 w-full max-w-md">
      <Alert>
        <TerminalIcon className="size-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components using the CLI.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Something went wrong. Please try again.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function AspectRatioPreview() {
  return (
    <div className="w-[200px]">
      <AspectRatio
        className="bg-muted rounded-md flex items-center justify-center"
        ratio={16 / 9}
      >
        <span className="text-sm text-muted-foreground">16:9</span>
      </AspectRatio>
    </div>
  );
}

function ScrollAreaPreview() {
  return (
    <ScrollArea className="h-[150px] w-[200px] rounded-md border p-4">
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div className="text-sm" key={index}>
            Item {index + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function ResizablePreview() {
  return (
    <ResizablePanelGroup className="min-h-[100px] max-w-md rounded-lg border">
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-4">
          <span className="text-sm">Panel 1</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-4">
          <span className="text-sm">Panel 2</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function CollapsiblePreview() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Collapsible
      className="w-[250px] space-y-2"
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <div className="flex items-center justify-between gap-x-4">
        <h4 className="text-sm font-semibold">Collapsible Section</h4>
        <CollapsibleTrigger asChild>
          <Button aria-label="Toggle section" size="sm" variant="ghost">
            <ChevronsUpDown className="size-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-2 text-sm">Item 1</div>
        <div className="rounded-md border px-4 py-2 text-sm">Item 2</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function CarouselPreview() {
  return (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 3 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-2xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

function ActivityHeatmapPreview() {
  return (
    <ActivityHeatmap
      data={[
        { count: 1, date: "2026-03-01" },
        { count: 3, date: "2026-03-02" },
        { count: 6, date: "2026-03-03" },
        { count: 4, date: "2026-03-05" },
        { count: 9, date: "2026-03-08" },
        { count: 7, date: "2026-03-11" },
        { count: 2, date: "2026-03-13" },
      ]}
      endDate="2026-03-14T00:00:00.000Z"
      title="Deployment activity"
      weeks={2}
    />
  );
}

function CountdownTimerPreview() {
  return (
    <div className="w-full max-w-sm">
      <CountdownTimer
        deadline="2026-03-15T10:30:00.000Z"
        now="2026-03-15T10:00:00.000Z"
        startedAt="2026-03-15T09:00:00.000Z"
        title="SLA timer"
      />
    </div>
  );
}

function CreditBadgePreview() {
  return (
    <div className="flex flex-col items-start gap-2">
      <CreditBadge amount="420 credits" status="healthy" />
      <CreditBadge amount="24 credits" status="low" />
      <CreditBadge amount="0 credits" status="depleted" />
    </div>
  );
}

function FlashcardPreview() {
  return (
    <Flashcard
      answer="A hypothesis is a testable explanation for an observation."
      category="Science"
      question="What is a hypothesis?"
      title="Key vocabulary"
    />
  );
}

function MarketTreemapPreview() {
  return (
    <div className="w-full max-w-[320px]">
      <MarketTreemap
        items={[
          { change: 2.6, label: "NVDA", sector: "Semis", value: 980 },
          { change: 1.4, label: "MSFT", sector: "Software", value: 760 },
          { change: -1.4, label: "XOM", sector: "Energy", value: 520 },
          { change: 0.8, label: "JPM", sector: "Financials", value: 440 },
        ]}
      />
    </div>
  );
}

function OrderBookPreview() {
  return (
    <div className="w-full max-w-[320px]">
      <OrderBook
        asks={[
          { price: 185.24, size: 4.2 },
          { price: 185.31, size: 6.8 },
          { price: 185.39, size: 8.1 },
        ]}
        bids={[
          { price: 185.18, size: 5.4 },
          { price: 185.11, size: 7.1 },
          { price: 185.03, size: 9.2 },
        ]}
      />
    </div>
  );
}

function WalletCardPreview() {
  return (
    <WalletCard
      availableLabel="96 credits"
      balanceLabel="128 credits"
      note="Set up auto-refill to keep automations running through the month."
      pendingLabel="32 credits"
      primaryActionLabel="Buy credits"
      renewsLabel="Refreshes on May 1, 2026"
      secondaryActionLabel="Billing history"
      status="healthy"
    />
  );
}

function WatchlistPreview() {
  return (
    <div className="w-full max-w-[320px]">
      <Watchlist
        items={[
          {
            change: 1.42,
            name: "Apple Inc.",
            price: 182.33,
            starred: true,
            symbol: "AAPL",
          },
          {
            change: -0.64,
            name: "Microsoft",
            price: 431.8,
            symbol: "MSFT",
          },
          {
            change: 3.08,
            name: "NVIDIA",
            price: 512.9,
            starred: true,
            symbol: "NVDA",
          },
        ]}
      />
    </div>
  );
}

function MetricGaugePreview() {
  return (
    <div className="w-full max-w-sm">
      <MetricGauge label="CPU load" max={100} unit="%" value={72} />
    </div>
  );
}

function LiveFeedPreview() {
  return (
    <div className="w-full max-w-md">
      <LiveFeed
        events={[
          {
            id: "1",
            message: "Auth gateway p95 latency above 400ms for 5m.",
            severity: "critical",
            source: "pagerduty",
            timestamp: "2026-03-15T11:59:30.000Z",
            title: "Latency breach on gateway",
          },
          {
            id: "2",
            message: "Auto-scaler added 2 nodes to worker pool.",
            severity: "medium",
            source: "platform",
            timestamp: "2026-03-15T11:55:00.000Z",
            title: "Worker pool scaled up",
          },
          {
            id: "3",
            message: "Revert complete. SLA within target.",
            severity: "low",
            source: "deploy-bot",
            timestamp: "2026-03-15T11:40:00.000Z",
            title: "Rollback of v7.1.2 succeeded",
          },
        ]}
        now="2026-03-15T12:00:00.000Z"
        title="Incident feed"
      />
    </div>
  );
}

function SeverityBadgePreview() {
  return (
    <div className="flex flex-wrap gap-2">
      <SeverityBadge level="critical" />
      <SeverityBadge level="high" />
      <SeverityBadge level="medium" />
      <SeverityBadge level="low" />
      <SeverityBadge level="info" />
    </div>
  );
}

function StatusBoardPreview() {
  return (
    <StatusBoard
      items={[
        {
          description: "Traffic and auth requests are stable.",
          label: "Gateway",
          meta: "1m ago",
          status: "healthy",
          value: "99.98%",
        },
        {
          description: "Queue depth is trending upward.",
          label: "Worker pool",
          meta: "4 delayed jobs",
          status: "warning",
          value: "82%",
        },
        {
          description: "Fallback region currently disabled.",
          label: "Edge POP",
          meta: "Planned maintenance",
          status: "maintenance",
          value: "2/3 online",
        },
      ]}
      title="Service health"
    />
  );
}

function WorldClockBarPreview() {
  return (
    <WorldClockBar
      now="2026-03-15T12:00:00.000Z"
      zones={[
        { city: "San Francisco", timeZone: "America/Los_Angeles" },
        { city: "New York", timeZone: "America/New_York" },
        { city: "London", timeZone: "Europe/London" },
        { city: "Singapore", timeZone: "Asia/Singapore" },
      ]}
    />
  );
}

function CalendarPreview() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  return <Calendar mode="single" onSelect={setDate} selected={date} />;
}

function AnimatedTextPreview() {
  return (
    <div className="max-w-xl">
      <AnimatedText
        className="text-2xl font-semibold"
        text="Ship motion that still feels like the current system."
      />
    </div>
  );
}

function BorderBeamPreview() {
  return (
    <div className="relative w-full max-w-sm rounded-xl border bg-card p-6">
      <BorderBeam />
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">Status</div>
        <div className="text-lg font-semibold">Live preview</div>
      </div>
    </div>
  );
}

function MarqueePreview() {
  return (
    <div className="w-full max-w-lg rounded-lg border p-4">
      <Marquee>
        <span className="rounded-md border bg-muted px-3 py-2 text-sm">
          Alpha
        </span>
        <span className="rounded-md border bg-muted px-3 py-2 text-sm">
          Beta
        </span>
        <span className="rounded-md border bg-muted px-3 py-2 text-sm">
          Gamma
        </span>
      </Marquee>
    </div>
  );
}

function NumberTickerPreview() {
  return (
    <NumberTicker
      className="text-4xl font-semibold"
      duration={0}
      value={12_840}
    />
  );
}

function SpinnerPreview() {
  return (
    <div className="flex gap-4 items-center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  );
}

const PRIMARY_SOURCE_PREVIEW_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="320" height="200" fill="#efe7d3"/><g fill="#9c8e6a"><rect x="24" y="26" width="190" height="10" rx="3"/><rect x="24" y="52" width="272" height="6" rx="3"/><rect x="24" y="68" width="272" height="6" rx="3"/><rect x="24" y="84" width="236" height="6" rx="3"/><rect x="24" y="108" width="272" height="6" rx="3"/><rect x="24" y="124" width="252" height="6" rx="3"/></g><circle cx="252" cy="162" r="22" fill="#b23b3b"/></svg>',
)}`;

function AnimatedBeamPreview() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const fromRef = React.useRef<HTMLDivElement>(null);
  const toRef = React.useRef<HTMLDivElement>(null);
  return (
    <div
      className="relative flex h-28 w-72 items-center justify-between rounded-xl border bg-card p-6"
      ref={containerRef}
    >
      <div
        className="z-10 flex size-10 items-center justify-center rounded-full border bg-background text-sm"
        ref={fromRef}
      >
        A
      </div>
      <div
        className="z-10 flex size-10 items-center justify-center rounded-full border bg-background text-sm"
        ref={toRef}
      >
        B
      </div>
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={fromRef}
        toRef={toRef}
      />
    </div>
  );
}

function ChoroplethMapPreview() {
  return (
    <div className="w-full max-w-[280px]">
      <ChoroplethMap
        data={{ DE: 4082, ES: 1397, FR: 2937, IT: 2107 }}
        regions={[
          {
            coordinates: [
              [-5, 51],
              [10, 51],
              [10, 41],
              [-5, 41],
              [-5, 51],
            ],
            id: "FR",
            name: "France",
          },
          {
            coordinates: [
              [5, 55],
              [15, 55],
              [15, 47],
              [5, 47],
              [5, 55],
            ],
            id: "DE",
            name: "Germany",
          },
          {
            coordinates: [
              [6, 47],
              [18, 47],
              [18, 37],
              [6, 37],
              [6, 47],
            ],
            id: "IT",
            name: "Italy",
          },
          {
            coordinates: [
              [-9, 44],
              [3, 44],
              [3, 36],
              [-9, 36],
              [-9, 44],
            ],
            id: "ES",
            name: "Spain",
          },
        ]}
      >
        <ChoroplethTooltip />
        <ChoroplethLegend title="GDP (B USD)" />
      </ChoroplethMap>
    </div>
  );
}

function ChronologicalTimelinePreview() {
  return (
    <div className="w-full max-w-md">
      <ChronologicalTimeline title="The Space Race">
        <ChronoEvent
          date="1957"
          id="sputnik"
          subtitle="First artificial satellite"
          title="Sputnik 1"
        />
        <ChronoEvent
          date="1961"
          id="vostok"
          subtitle="First human in space"
          title="Vostok 1"
        />
        <ChronoEvent
          date="1969"
          featured
          id="apollo"
          subtitle="First crewed Moon landing"
          title="Apollo 11"
        />
      </ChronologicalTimeline>
    </div>
  );
}

function FloatingToolbarPreview() {
  return (
    <div className="relative h-[160px] w-full max-w-md rounded-2xl border bg-muted/30">
      <FloatingToolbar
        actions={[
          {
            id: "rename",
            label: "Rename",
            onActivate: noop,
            variant: "primary",
          },
          { id: "duplicate", label: "Duplicate", onActivate: noop },
          {
            id: "delete",
            label: "Delete",
            onActivate: noop,
            variant: "destructive",
          },
        ]}
        x={90}
        y={110}
      />
    </div>
  );
}

function FollowModePreview() {
  return (
    <div className="h-[160px] w-full max-w-md">
      <FollowMode color="emerald" name="Sam">
        <div className="flex h-full w-full items-center justify-center bg-muted/20 text-sm text-muted-foreground">
          Followed canvas content
        </div>
      </FollowMode>
    </div>
  );
}

function GeographyQuizMapPreview() {
  return (
    <div className="w-full max-w-[280px]">
      <GeographyQuizMap
        questions={[
          { answerRegionId: "FR", id: "q1", prompt: "Click on France" },
          { answerRegionId: "DE", id: "q2", prompt: "Click on Germany" },
        ]}
        regions={[
          {
            coordinates: [
              [-5, 51],
              [10, 51],
              [10, 41],
              [-5, 41],
              [-5, 51],
            ],
            id: "FR",
            name: "France",
          },
          {
            coordinates: [
              [5, 55],
              [15, 55],
              [15, 47],
              [5, 47],
              [5, 55],
            ],
            id: "DE",
            name: "Germany",
          },
          {
            coordinates: [
              [6, 47],
              [18, 47],
              [18, 37],
              [6, 37],
              [6, 47],
            ],
            id: "IT",
            name: "Italy",
          },
        ]}
      >
        <GeographyQuizMapPrompt />
        <GeographyQuizMapScore />
      </GeographyQuizMap>
    </div>
  );
}

function GlassProgressPreview() {
  return (
    <div className="w-full max-w-xs rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 p-8">
      <GlassProgress value={60} />
    </div>
  );
}

function Globe3dPreview() {
  return (
    <div className="w-full max-w-[220px]">
      <Globe3D autoRotate={false} initialPosition={{ lat: 30, lng: -30 }}>
        <GlobeMarker
          color="blue"
          id="paris"
          label="Paris"
          lat={48.85}
          lng={2.35}
        />
        <GlobeMarker
          color="red"
          id="ny"
          label="New York"
          lat={40.71}
          lng={-74}
        />
        <GlobeMarker
          color="emerald"
          id="rio"
          label="Rio"
          lat={-22.9}
          lng={-43.2}
        />
      </Globe3D>
    </div>
  );
}

function HandoffBeaconPreview() {
  return (
    <div className="relative h-[160px] w-full max-w-md rounded-2xl border bg-muted/30">
      <HandoffBeacon
        level="info"
        message="Heads up"
        source="Sam"
        x={70}
        y={60}
      />
      <HandoffBeacon
        level="urgent"
        message="Schema mismatch"
        source="Riley"
        x={250}
        y={90}
      />
    </div>
  );
}

function HeatMapOverlayPreview() {
  return (
    <div className="w-full max-w-[280px]">
      <HeatMapOverlay
        data={[
          { id: "ny", lat: 40.7, lng: -74, weight: 0.95 },
          { id: "ldn", lat: 51.5, lng: -0.13, weight: 0.7 },
          { id: "tok", lat: 35.7, lng: 139.7, weight: 0.85 },
          { id: "syd", lat: -33.9, lng: 151.2, weight: 0.5 },
          { id: "rio", lat: -22.9, lng: -43.2, weight: 0.45 },
        ]}
        radius={50}
      />
    </div>
  );
}

function HistoricTimelinePreview() {
  return (
    <div className="w-full max-w-xl">
      <HistoricTimeline
        categories={[
          { color: "blue", id: "science", label: "Science" },
          { color: "red", id: "conflict", label: "Conflict" },
        ]}
        endYear={2025}
        eras={[
          {
            color: "amber",
            endYear: 476,
            id: "ancient",
            name: "Ancient",
            startYear: -500,
          },
          {
            color: "blue",
            endYear: 2025,
            id: "modern",
            name: "Modern",
            startYear: 476,
          },
        ]}
        events={[
          {
            category: "conflict",
            id: "fall-rome",
            title: "Fall of Rome",
            year: 476,
          },
          {
            category: "science",
            id: "press",
            title: "Printing press",
            year: 1450,
          },
          {
            category: "science",
            id: "moon",
            title: "Moon landing",
            year: 1969,
          },
        ]}
        startYear={-500}
      />
    </div>
  );
}

function InteractiveTimelinePreview() {
  return (
    <div className="w-full max-w-md">
      <InteractiveTimeline
        endDate={new Date("2025-01-01T00:00:00.000Z")}
        events={[
          {
            id: "v1",
            startDate: new Date("2024-03-01T00:00:00.000Z"),
            title: "v1.0",
            track: "release",
          },
          {
            id: "v2",
            startDate: new Date("2024-09-15T00:00:00.000Z"),
            title: "v2.0",
            track: "release",
          },
          {
            endDate: new Date("2024-08-01T00:00:00.000Z"),
            id: "search",
            startDate: new Date("2024-06-01T00:00:00.000Z"),
            title: "Search",
            track: "feature",
          },
        ]}
        startDate={new Date("2024-01-01T00:00:00.000Z")}
        tracks={[
          { color: "blue", id: "release", label: "Releases" },
          { color: "emerald", id: "feature", label: "Features" },
        ]}
      />
    </div>
  );
}

function Map2dPreview() {
  return (
    <div className="w-full max-w-[300px]">
      <Map2D center={[2, 48]} zoom={2}>
        <MapLayer
          data={[
            {
              coordinates: [
                [-5, 51],
                [10, 51],
                [10, 41],
                [-5, 41],
                [-5, 51],
              ],
              id: "france-bbox",
              type: "polygon",
            },
          ]}
        />
        <MapMarker popup="Paris" position={[2.35, 48.85]} />
        <MapMarker popup="London" position={[-0.13, 51.5]} />
        <MapMarker popup="Berlin" position={[13.4, 52.52]} />
        <MapControls>
          <MapZoomIn />
          <MapZoomOut />
        </MapControls>
      </Map2D>
    </div>
  );
}

function MapTimelinePreview() {
  return (
    <div className="w-full max-w-[320px]">
      <MapTimeline endYear={2025} initialYear={400} startYear={-500}>
        <MapTimelineLayer
          color="red"
          endYear={476}
          geometry={{
            polygon: [
              [-9, 56],
              [10, 56],
              [40, 50],
              [40, 30],
              [10, 30],
              [-9, 36],
              [-9, 56],
            ],
            type: "polygon",
          }}
          id="rome"
          label="Roman Empire"
          startYear={-27}
        />
        <MapTimelineLayer
          color="purple"
          endYear={1453}
          geometry={{
            polygon: [
              [10, 45],
              [42, 45],
              [42, 30],
              [10, 30],
              [10, 45],
            ],
            type: "polygon",
          }}
          id="byzantium"
          label="Byzantine Empire"
          startYear={330}
        />
        <MapTimelineEvent
          color="amber"
          description="Pompeii destroyed"
          id="vesuvius"
          position={[14.48, 40.75]}
          title="Vesuvius"
          toleranceYears={400}
          year={79}
        />
        <MapTimelineControls>
          <MapTimelinePlayButton />
          <MapTimelineSlider />
        </MapTimelineControls>
      </MapTimeline>
    </div>
  );
}

function PrimarySourceViewerPreview() {
  return (
    <div className="w-full max-w-[320px]">
      <PrimarySourceViewer
        origin="England"
        period="Medieval"
        source={{
          alt: "Historical document scan",
          src: PRIMARY_SOURCE_PREVIEW_IMAGE,
          type: "image",
        }}
        title="Magna Carta (1215)"
      >
        <PrimarySourceToolbar>
          <PrimarySourceZoomIn />
          <PrimarySourceZoomOut />
        </PrimarySourceToolbar>
        <PrimarySourceAnnotations>
          <PrimarySourceAnnotation
            category="Artifact"
            color="amber"
            id="seal"
            note="Royal seal of King John"
            region={{ height: 16, width: 18, x: 70, y: 70 }}
          />
        </PrimarySourceAnnotations>
      </PrimarySourceViewer>
    </div>
  );
}

function RouteMapPreview() {
  return (
    <div className="w-full max-w-[320px]">
      <RouteMap
        color="red"
        lineStyle="dashed"
        waypoints={[
          { id: "chang", label: "Chang'an", position: [108.94, 34.34] },
          { id: "kashgar", label: "Kashgar", position: [75.99, 39.47] },
          { id: "samarkand", label: "Samarkand", position: [66.97, 39.65] },
          {
            id: "constantinople",
            label: "Constantinople",
            position: [28.98, 41.01],
          },
        ]}
      >
        <p className="font-medium">Silk Road</p>
        <p className="text-muted-foreground">4 waypoints</p>
      </RouteMap>
    </div>
  );
}

function SelectionHaloPreview() {
  return (
    <div className="relative h-[160px] w-full max-w-md rounded-2xl border bg-muted/30">
      <SelectionHalo
        bounds={{ height: 90, width: 180, x: 80, y: 40 }}
        label="3 objects"
      />
    </div>
  );
}

function SnapGuidesPreview() {
  return (
    <div className="relative h-[160px] w-full max-w-md rounded-2xl border bg-muted/30">
      <SnapGuides
        guides={[
          { id: "v-120", orientation: "vertical", x: 120 },
          { id: "v-300", orientation: "vertical", x: 300 },
          { id: "h-60", orientation: "horizontal", y: 60 },
          { id: "h-120", orientation: "horizontal", y: 120 },
        ]}
      />
    </div>
  );
}

function StoryMapPreview() {
  return (
    <div className="w-full max-w-md">
      <StoryMap>
        <StoryMapChapter
          center={[12.49, 41.89]}
          color="red"
          id="rome"
          subtitle="476 AD"
          title="The Fall of Rome"
          zoom={3}
        >
          <p>The last Western Roman Emperor was deposed in 476 AD.</p>
        </StoryMapChapter>
        <StoryMapChapter
          center={[28.98, 41.01]}
          color="purple"
          id="constantinople"
          subtitle="476 - 1453"
          title="Constantinople Endures"
          zoom={3}
        >
          <p>Constantinople thrived as the Byzantine capital for centuries.</p>
        </StoryMapChapter>
      </StoryMap>
    </div>
  );
}

function TreeViewPreview() {
  return (
    <div className="w-full max-w-xs">
      <TreeView
        defaultExpanded={["src", "components"]}
        defaultSelected={["button"]}
        nodes={[
          {
            id: "src",
            label: "src/",
            nodes: [
              {
                id: "components",
                label: "components/",
                nodes: [
                  { id: "button", label: "Button.tsx" },
                  { id: "card", label: "Card.tsx" },
                ],
              },
              { id: "utils", label: "utils/" },
            ],
          },
          { id: "package", label: "package.json" },
        ]}
      />
    </div>
  );
}

function AlertPulsePreview() {
  return (
    <div className="relative h-[120px] w-[160px] overflow-hidden rounded-lg border bg-card">
      <AlertPulse cx={80} cy={60} radius={28} severity="warn" />
    </div>
  );
}

function AnimatedGridPatternPreview() {
  return (
    <div className="relative h-[120px] w-[160px] overflow-hidden rounded-lg border bg-card">
      <AnimatedGridPattern height={28} squares={10} width={28} />
    </div>
  );
}

function CardFlipPreview() {
  return (
    <CardFlip
      back={
        <div className="flex h-full items-center justify-center rounded-xl border bg-primary text-sm text-primary-foreground">
          Back
        </div>
      }
      className="h-28 w-44"
      front={
        <div className="flex h-full items-center justify-center rounded-xl border bg-card text-sm text-card-foreground">
          Front
        </div>
      }
    />
  );
}

function CommentPinPreview() {
  return (
    <div className="relative h-[120px] w-[160px] overflow-hidden rounded-lg border bg-card">
      <CommentPin authorInitial="B" color="#5b8def" unread={3} x={72} y={56} />
    </div>
  );
}

function ContextLensPreview() {
  return (
    <div className="relative h-[120px] w-[160px] overflow-hidden rounded-lg border bg-card">
      <ContextLens
        focus={{ cx: 80, cy: 60, inner: 22, outer: 60 }}
        opacity={0.55}
      />
    </div>
  );
}

function CursorPreview() {
  return (
    <div className="relative flex h-[120px] w-[160px] items-center justify-center overflow-hidden rounded-lg border bg-card">
      <Cursor size={24} />
      <span className="text-xs text-muted-foreground">
        Custom cursor follows pointer
      </span>
    </div>
  );
}

function DotPatternPreview() {
  return (
    <div className="relative h-[120px] w-[160px] overflow-hidden rounded-lg border bg-card">
      <DotPattern spacing={14} />
    </div>
  );
}

function GlassCardPreview() {
  return (
    <div className="rounded-xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent p-5">
      <GlassCard className="px-4 py-3 text-sm">Frosted glass</GlassCard>
    </div>
  );
}

function GlassPanelPreview() {
  return (
    <div className="rounded-xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent p-5">
      <GlassPanel className="px-4 py-3 text-sm">Panel chrome</GlassPanel>
    </div>
  );
}

function InfinitePlanePreview() {
  return (
    <div className="h-[120px] w-[160px] overflow-hidden rounded-lg border">
      <InfinitePlane pattern="dot" spacing={24} zoom={1} />
    </div>
  );
}

function LiquidGlassPreview() {
  return (
    <div className="rounded-xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent p-5">
      <LiquidGlass className="px-4 py-3 text-sm">Liquid glass</LiquidGlass>
    </div>
  );
}

function LiveCursorPreview() {
  return (
    <div className="relative h-[120px] w-[160px] overflow-hidden rounded-lg border bg-card">
      <LiveCursor color="#5b8def" name="Bea" x={48} y={40} />
    </div>
  );
}

function MagneticPreview() {
  return (
    <Magnetic className="rounded-xl border border-border bg-card px-6 py-4 text-sm text-card-foreground">
      Pull me
    </Magnetic>
  );
}

function MagneticButtonPreview() {
  return (
    <MagneticButton className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
      Hover me
    </MagneticButton>
  );
}

function MeteorsPreview() {
  return (
    <div className="relative h-[120px] w-[160px] overflow-hidden rounded-lg border bg-card">
      <Meteors count={10} />
    </div>
  );
}

function MultiSelectLassoPreview() {
  return (
    <div className="relative h-[120px] w-[160px] overflow-hidden rounded-lg border bg-card">
      <MultiSelectLasso
        count={4}
        hint="Drag"
        rect={{ height: 64, width: 96, x: 32, y: 28 }}
      />
    </div>
  );
}

function ParticlesPreview() {
  return (
    <div className="relative h-[120px] w-[160px] overflow-hidden rounded-lg border bg-card">
      <Particles count={24} />
    </div>
  );
}

function PlaybackGhostPreview() {
  return (
    <div className="relative h-[120px] w-[160px] overflow-hidden rounded-lg border bg-card">
      <PlaybackGhost
        kind="run"
        label="research"
        opacity={0.4}
        size={36}
        x={80}
        y={60}
      />
    </div>
  );
}

function ProgressiveBlurPreview() {
  return (
    <div className="relative h-[120px] w-[160px] overflow-hidden rounded-lg border bg-card">
      <div className="p-3 text-xs leading-5 text-muted-foreground">
        Progressive blur ramps content toward one edge so overflow fades into a
        soft gradient.
      </div>
      <ProgressiveBlur blur={8} direction="bottom" />
    </div>
  );
}

function SelectionPresencePreview() {
  return (
    <div className="relative h-[120px] w-[160px] overflow-hidden rounded-lg border bg-card">
      <SelectionPresence
        color="#5b8def"
        height={56}
        name="Bea"
        width={96}
        x={32}
        y={32}
      />
    </div>
  );
}

function ShimmerButtonPreview() {
  return <ShimmerButton>Get started</ShimmerButton>;
}

function ShineBorderPreview() {
  return (
    <ShineBorder className="rounded-xl bg-card px-6 py-4 text-sm text-card-foreground">
      Featured
    </ShineBorder>
  );
}

function ShinyButtonPreview() {
  return <ShinyButton>Learn more</ShinyButton>;
}

function SparklesPreview() {
  return (
    <Sparkles className="rounded-lg px-5 py-4" count={20}>
      <span className="text-sm font-semibold">Sparkle field</span>
    </Sparkles>
  );
}

function SpotlightCardPreview() {
  return (
    <SpotlightCard className="rounded-xl border bg-card px-5 py-4 text-sm text-card-foreground">
      Spotlight card
    </SpotlightCard>
  );
}

function StateBadgeOverlayPreview() {
  return (
    <div className="relative h-[120px] w-[160px] overflow-hidden rounded-lg border bg-card">
      <StateBadgeOverlay anchor="top-right" state="running" x={108} y={40} />
    </div>
  );
}

function ThemePresetProviderPreview() {
  return (
    <ThemePresetProvider>
      <ThemeSwitcher />
    </ThemePresetProvider>
  );
}

function ThemeSwitcherPreview() {
  return <ThemeSwitcher />;
}

function ThreadBubblePreview() {
  return (
    <div className="w-full max-w-[280px]">
      <ThreadBubble
        messages={[
          {
            author: "Bea",
            authorColor: "#5b8def",
            body: "Why are we routing to fallback?",
            id: "1",
            ts: "12s",
          },
          {
            author: "Lior",
            authorColor: "#10b981",
            body: "p95 spike on primary.",
            id: "2",
            ts: "9s",
          },
        ]}
        title="research-2025"
      />
    </div>
  );
}

function TiltCardPreview() {
  return (
    <TiltCard
      className="flex h-28 w-44 items-center justify-center rounded-xl border bg-card text-sm text-card-foreground shadow-sm"
      maxTilt={12}
    >
      Hover to tilt
    </TiltCard>
  );
}

function TruncatedTextPreview() {
  return (
    <div className="w-[160px]">
      <TruncatedText maxWidth="160px">
        This is a very long label that truncates with an ellipsis
      </TruncatedText>
    </div>
  );
}

function AnimatedListPreview() {
  return (
    <AnimatedList className="w-full max-w-xs">
      <span className="rounded-md border bg-card px-3 py-2 text-sm">
        Deploy queued
      </span>
      <span className="rounded-md border bg-card px-3 py-2 text-sm">
        Build passed
      </span>
      <span className="rounded-md border bg-card px-3 py-2 text-sm">
        Shipped to production
      </span>
    </AnimatedList>
  );
}

function AnimatedTestimonialsPreview() {
  return (
    <div className="w-full max-w-sm">
      <AnimatedTestimonials
        testimonials={[
          {
            name: "Ada Lovelace",
            quote: "This shipped our launch in a day.",
            title: "Engineer",
          },
          {
            name: "Grace Hopper",
            quote: "The motion feels effortless.",
            title: "Admiral",
          },
        ]}
      />
    </div>
  );
}

function BentoGridPreview() {
  return (
    <BentoGrid className="w-full max-w-sm auto-rows-[3.5rem] gap-2">
      <BentoCard className="col-span-2 p-3 text-sm font-medium">
        Featured
      </BentoCard>
      <BentoCard className="p-3 text-sm">Detail</BentoCard>
      <BentoCard className="p-3 text-sm">Detail</BentoCard>
      <BentoCard className="col-span-2 p-3 text-sm">Wide</BentoCard>
    </BentoGrid>
  );
}

function BlurRevealPreview() {
  return (
    <BlurReveal className="text-2xl font-semibold">
      I sharpen into view
    </BlurReveal>
  );
}

function DocumentSiblingNavPreview() {
  return (
    <div className="w-full max-w-md">
      <DocumentSiblingNav
        next={{ href: "#", title: "What we shipped this quarter" }}
        previous={{ href: "#", title: "Why thin clients are back" }}
      />
    </div>
  );
}

function ExpandableCardsPreview() {
  return (
    <div className="w-full max-w-sm">
      <ExpandableCards
        cards={[
          {
            content: "Detailed body revealed on expand.",
            description: "Click to expand",
            id: "one",
            title: "Getting started",
          },
          {
            content: "Another panel of content.",
            id: "two",
            title: "Advanced usage",
          },
        ]}
      />
    </div>
  );
}

function ObjectInspectorPreview() {
  return (
    <div className="w-72">
      <ObjectInspector
        kind="run"
        status="running"
        subtitle="claude-3.7 · 128k ctx"
        title="research-2025-04-15"
      >
        <PropertySection
          entries={[
            { id: "tokens", label: "Tokens", value: "12.4k" },
            { id: "cost", label: "Cost", value: "$0.18" },
          ]}
          title="State"
        />
      </ObjectInspector>
    </div>
  );
}

function PlanBadgePreview() {
  return (
    <div className="flex flex-wrap gap-2">
      <PlanBadge tier="free" />
      <PlanBadge tier="starter" />
      <PlanBadge tier="growth" />
      <PlanBadge tier="enterprise" />
      <PlanBadge state="trial" tier="starter" />
    </div>
  );
}

function PolicyDeliveryPanelPreview() {
  return (
    <div className="w-72">
      <PolicyDeliveryPanel
        policies={[
          { id: "pii", name: "PII redaction", status: "enforced" },
          {
            description: "60 / s soft cap",
            id: "rate",
            name: "Rate limiting",
            status: "advisory",
          },
          { id: "exp", name: "Experiment B", status: "disabled" },
        ]}
      />
    </div>
  );
}

function PropertySectionPreview() {
  return (
    <div className="w-72">
      <PropertySection
        entries={[
          { id: "x", label: "X", value: "120" },
          { id: "y", label: "Y", value: "80" },
          { id: "w", label: "Width", value: "240" },
          { id: "h", label: "Height", value: "120" },
        ]}
        title="Layout"
      />
    </div>
  );
}

function RelationshipInspectorPreview() {
  return (
    <div className="w-72">
      <RelationshipInspector
        edges={[
          {
            direction: "inbound",
            id: "1",
            relation: "spawned-by",
            target: "run-2025-04-15",
            targetSublabel: "claude-3.7",
          },
          {
            direction: "outbound",
            id: "2",
            relation: "emits",
            target: "summary.md",
            targetSublabel: "1.2 KB",
          },
          {
            direction: "outbound",
            id: "3",
            relation: "calls",
            target: "ranker",
          },
        ]}
      />
    </div>
  );
}

function RevealTextPreview() {
  return (
    <RevealText className="text-2xl font-semibold">Reveal headline</RevealText>
  );
}

function RoleBadgePreview() {
  return (
    <div className="flex flex-wrap gap-2">
      <RoleBadge accountRole="owner" />
      <RoleBadge accountRole="admin" />
      <RoleBadge accountRole="member" />
      <RoleBadge accountRole="billing" />
    </div>
  );
}

function RoutingAssignmentPanelPreview() {
  return (
    <div className="w-72">
      <RoutingAssignmentPanel
        assignments={[
          { agent: "researcher", id: "1", load: 0.82, role: "primary" },
          { agent: "researcher-mini", id: "2", load: 0.04, role: "fallback" },
          { agent: "shadow-eval", id: "3", role: "shadow" },
        ]}
      />
    </div>
  );
}

function RuntimeOverviewPanelPreview() {
  return (
    <div className="w-72">
      <RuntimeOverviewPanel
        metrics={[
          {
            id: "runs",
            label: "Active runs",
            tone: "success",
            trend: "up",
            value: 3,
          },
          {
            detail: "0 last hour",
            id: "errs",
            label: "Errors",
            tone: "neutral",
            trend: "flat",
            value: 0,
          },
          {
            id: "tps",
            label: "Throughput",
            tone: "success",
            trend: "up",
            value: "120 / s",
          },
          {
            detail: "p95 240ms",
            id: "lat",
            label: "Latency",
            tone: "warn",
            trend: "down",
            value: "180ms",
          },
        ]}
      />
    </div>
  );
}

function ScrambleTextPreview() {
  return <ScrambleText className="text-2xl font-semibold" text="DECRYPTED" />;
}

function ShimmerTextPreview() {
  return (
    <ShimmerText className="text-xl font-medium">
      Loading your workspace
    </ShimmerText>
  );
}

function SpinningTextPreview() {
  return (
    <div className="flex items-center justify-center text-sm text-foreground">
      <SpinningText radius={64}>vllnt design system • </SpinningText>
    </div>
  );
}

function SubscriptionCardPreview() {
  return (
    <div className="w-full max-w-md">
      <SubscriptionCard
        note="Your annual discount is locked in until the next renewal date."
        plan="growth"
        priceLabel="$49/mo"
        primaryActionLabel="Manage plan"
        renewalLabel="Renews on May 1, 2026"
        seatsLabel="12 seats"
        secondaryActionLabel="View invoices"
        status="active"
        usageLabel="4.2M tokens used"
      />
    </div>
  );
}

function TextAnimatePreview() {
  return (
    <TextAnimate
      animation="slide-up"
      className="text-2xl font-semibold"
      startOnView={false}
    >
      Welcome aboard the platform
    </TextAnimate>
  );
}

function TextRevealPreview() {
  return (
    <TextReveal className="text-xl font-semibold">
      Scroll to read this line word by word.
    </TextReveal>
  );
}

function TextShimmerPreview() {
  return (
    <TextShimmer className="text-2xl font-semibold">
      Shimmering headline
    </TextShimmer>
  );
}

function TimelinePreview() {
  return (
    <div className="w-full max-w-xs">
      <Timeline>
        <TimelineItem
          date="Jan 2026"
          status="completed"
          title="Project started"
        />
        <TimelineItem date="Mar 2026" status="completed" title="MVP launch" />
        <TimelineItem date="Jul 2026" status="active" title="V2 release" />
        <TimelineItem
          date="Q4 2026"
          isLast
          status="upcoming"
          title="Public release"
        />
      </Timeline>
    </div>
  );
}

function TypewriterPreview() {
  return (
    <Typewriter className="text-xl font-medium" text="Building the future." />
  );
}

function BottomActivityStripPreview() {
  return (
    <div className="w-full max-w-md">
      <BottomActivityStrip
        events={[
          { id: "1", label: "deploy ok", tone: "success", ts: "12s" },
          { id: "2", label: "queue spike", tone: "warn", ts: "1m" },
          { id: "3", label: "alert resolved", tone: "info", ts: "3m" },
          { id: "4", label: "p95 trip", tone: "danger", ts: "5m" },
        ]}
      />
    </div>
  );
}

function CandlestickChartPreview() {
  return (
    <div className="w-full max-w-[320px]">
      <CandlestickChart
        data={[
          { close: 189.8, high: 191.2, label: "Mon", low: 182.4, open: 184.6 },
          { close: 186.1, high: 193.5, label: "Tue", low: 184.8, open: 190.3 },
          { close: 194.6, high: 196.8, label: "Wed", low: 185.9, open: 186.5 },
          { close: 197.2, high: 199.4, label: "Thu", low: 192.7, open: 194.8 },
          { close: 198.5, high: 201.1, label: "Fri", low: 192.4, open: 193.6 },
        ]}
        height={150}
        showGrid={false}
        width={300}
      />
    </div>
  );
}

function ContributionGraphPreview() {
  const data = Array.from({ length: 49 }, (_unused, index) => ({
    count: Math.max(0, Math.round(3 + 3 * Math.sin(index / 3))),
    date: new Date(Date.UTC(2026, 0, 4) + index * 86_400_000)
      .toISOString()
      .slice(0, 10),
  }));
  return (
    <div className="w-full max-w-[260px]">
      <ContributionGraph className="text-primary" data={data} weeks={7} />
    </div>
  );
}

function FlowDiagramPreview() {
  return (
    <div className="w-full max-w-sm">
      <FlowDiagram
        allowFullscreen={false}
        edges={[
          { id: "e1-2", source: "1", target: "2" },
          { id: "e2-3", source: "2", target: "3" },
        ]}
        fitView
        height={160}
        nodes={[
          {
            data: { description: "Entry point", label: "Start" },
            id: "1",
            position: { x: 0, y: 0 },
          },
          {
            data: { description: "Processing step", label: "Process" },
            id: "2",
            position: { x: 180, y: 0 },
          },
          {
            data: { description: "Final step", label: "End" },
            id: "3",
            position: { x: 360, y: 0 },
          },
        ]}
        showControls={false}
      />
    </div>
  );
}

function GanttChartPreview() {
  return (
    <div className="w-full max-w-md">
      <GanttChart
        endDate="2026-04-30"
        groups={[
          {
            id: "phase-1",
            name: "Phase 1",
            tasks: [
              {
                color: "blue",
                end: "2026-02-28",
                id: "design",
                progress: 100,
                start: "2026-01-15",
                title: "Design",
              },
              {
                color: "emerald",
                end: "2026-04-15",
                id: "core",
                progress: 60,
                start: "2026-02-01",
                title: "Build",
              },
            ],
          },
        ]}
        milestones={[{ date: "2026-04-15", id: "v1", title: "v1.0" }]}
        now="2026-03-01"
        scale="month"
        startDate="2026-01-01"
      />
    </div>
  );
}

function GaugeChartPreview() {
  return (
    <div className="w-full max-w-[200px]">
      <GaugeChart
        className="text-primary"
        label="CPU load"
        max={100}
        min={0}
        size={150}
        value={72}
      />
    </div>
  );
}

function HeatOverlayPreview() {
  return (
    <SimplePreview description="Density heat overlay that plots weighted points as soft radial blooms over a workspace canvas." />
  );
}

function MetricClusterPreview() {
  return (
    <div className="relative h-[150px] w-full max-w-[280px] overflow-hidden rounded-lg border bg-muted/30">
      <MetricCluster
        anchor="top-left"
        metrics={[
          { id: "qps", label: "qps", tone: "success", value: "240" },
          { id: "errs", label: "errs", tone: "danger", value: "14" },
          { id: "p95", label: "p95", value: "180ms" },
        ]}
        title="research-2025"
        x={170}
        y={130}
      />
    </div>
  );
}

function OverviewBoardPreview() {
  return (
    <div className="w-full max-w-md">
      <OverviewBoard
        eyebrow="Operator overview"
        heading="Morning priorities"
        items={[
          {
            description: "Retries that still need intervention.",
            heading: "Errors",
            id: "errors",
            metric: "3",
            tone: "danger",
          },
          {
            description: "Approvals to clear before lunch.",
            heading: "Actions",
            id: "actions",
            metric: "7",
            tone: "warning",
          },
        ]}
      />
    </div>
  );
}

function PieChartPreview() {
  return (
    <div className="w-full max-w-[200px]">
      <PieChart
        className="text-primary"
        data={[
          { label: "Direct", value: 40 },
          { label: "Referral", value: 25 },
          { label: "Organic", value: 35 },
          { label: "Social", value: 18 },
        ]}
        innerRadius={0.6}
        size={150}
      />
    </div>
  );
}

function PresenceStackPreview() {
  return (
    <PresenceStack
      max={4}
      users={[
        { color: "#5b8def", id: "1", initial: "B", name: "Bea" },
        {
          color: "#10b981",
          id: "2",
          initial: "L",
          name: "Lior",
          status: "away",
        },
        {
          color: "#f59e0b",
          id: "3",
          initial: "S",
          name: "Sam",
          status: "idle",
        },
        { color: "#a855f7", id: "4", initial: "M", name: "Mira" },
        {
          color: "#ef4444",
          id: "5",
          initial: "R",
          name: "Rae",
          status: "offline",
        },
        { color: "#0ea5e9", id: "6", initial: "K", name: "Kim" },
      ]}
    />
  );
}

function PresenceSyncIndicatorPreview() {
  return (
    <div className="flex flex-col items-start gap-2">
      <PresenceSyncIndicator state="live" status="3 peers" />
      <PresenceSyncIndicator state="syncing" status="2 changes" />
      <PresenceSyncIndicator state="reconnecting" status="retry 2 / 5" />
    </div>
  );
}

function RadarChartPreview() {
  return (
    <div className="w-full max-w-[200px]">
      <RadarChart
        className="text-primary"
        data={[
          { label: "Speed", value: 80 },
          { label: "Power", value: 60 },
          { label: "Range", value: 90 },
          { label: "Agility", value: 70 },
          { label: "Defense", value: 50 },
          { label: "Stamina", value: 65 },
        ]}
        max={100}
        size={170}
      />
    </div>
  );
}

function RunTimelinePreview() {
  return (
    <div className="w-full max-w-md">
      <RunTimeline
        cursor={1800}
        end={3600}
        formatValue={(value) => `${Math.round(value / 60)}m`}
        lanes={[
          { id: "ingest", label: "Ingest" },
          { id: "rank", label: "Rank" },
          { id: "emit", label: "Emit" },
        ]}
        phases={[
          {
            end: 600,
            id: "i1",
            label: "load",
            laneId: "ingest",
            start: 0,
            state: "complete",
          },
          {
            end: 2200,
            id: "r1",
            label: "score",
            laneId: "rank",
            start: 800,
            state: "running",
          },
          {
            end: 1500,
            id: "r2",
            label: "filter",
            laneId: "rank",
            start: 1200,
            state: "failed",
          },
          {
            end: 3600,
            id: "e1",
            label: "publish",
            laneId: "emit",
            start: 2300,
            state: "queued",
          },
        ]}
        start={0}
      />
    </div>
  );
}

function SankeyChartPreview() {
  return (
    <div className="w-full max-w-[320px]">
      <SankeyChart
        className="text-primary"
        height={150}
        links={[
          { source: "visits", target: "signup", value: 60 },
          { source: "visits", target: "bounce", value: 40 },
          { source: "signup", target: "trial", value: 35 },
          { source: "signup", target: "churn", value: 25 },
          { source: "trial", target: "paid", value: 20 },
        ]}
        nodes={[
          { id: "visits", label: "Visits" },
          { id: "signup", label: "Signup" },
          { id: "bounce", label: "Bounce" },
          { id: "trial", label: "Trial" },
          { id: "churn", label: "Churn" },
          { id: "paid", label: "Paid" },
        ]}
        width={300}
      />
    </div>
  );
}

function SparklineGridPreview() {
  return (
    <div className="w-full max-w-md">
      <SparklineGrid
        columns={2}
        items={[
          {
            change: 2.14,
            data: [14, 16, 17, 15, 19, 22],
            label: "Tech momentum",
            value: "$12.8M",
          },
          {
            change: -1.08,
            data: [9, 8, 7, 8, 6, 5],
            label: "Energy breadth",
            value: "$8.4M",
          },
        ]}
      />
    </div>
  );
}

function StickyMetricPreview() {
  return (
    <div className="relative h-[120px] w-full max-w-[240px] overflow-hidden rounded-lg border bg-muted/30">
      <StickyMetric
        anchor="top-left"
        detail="↑ 12%"
        label="qps"
        tone="success"
        value="240"
        x={170}
        y={90}
      />
    </div>
  );
}

function ThresholdRingPreview() {
  return (
    <div className="flex items-center justify-center gap-4">
      <ThresholdRing
        centerLabel="32%"
        size={88}
        threshold={0.7}
        tone="success"
        value={0.32}
      />
      <ThresholdRing
        centerLabel="68%"
        size={88}
        threshold={0.7}
        tone="warn"
        value={0.68}
      />
      <ThresholdRing
        centerLabel="92%"
        size={88}
        threshold={0.7}
        tone="danger"
        value={0.92}
      />
    </div>
  );
}

function TickerTapePreview() {
  return (
    <div className="w-full max-w-md">
      <TickerTape
        items={[
          { change: 1.42, price: 182.33, symbol: "AAPL", volume: "Vol 32M" },
          { change: -0.64, price: 431.8, symbol: "MSFT", volume: "Vol 18M" },
          { change: 3.08, price: 512.9, symbol: "NVDA", volume: "Vol 44M" },
          { change: -1.18, price: 287.12, symbol: "TSLA", volume: "Vol 51M" },
        ]}
      />
    </div>
  );
}

function ButtonGroupPreview() {
  return (
    <ButtonGroup>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
    </ButtonGroup>
  );
}

function CheckboxGroupPreview() {
  return (
    <CheckboxGroup defaultValue={["email"]}>
      <CheckboxGroupItem value="email">Email</CheckboxGroupItem>
      <CheckboxGroupItem value="sms">SMS</CheckboxGroupItem>
      <CheckboxGroupItem value="push">Push</CheckboxGroupItem>
    </CheckboxGroup>
  );
}

function ColorPickerPreview() {
  return (
    <div className="w-44">
      <ColorPicker defaultValue="#3b82f6" />
    </div>
  );
}

function DateFieldPreview() {
  return (
    <div className="w-48">
      <DateField aria-label="Date" defaultValue="2026-04-19" />
    </div>
  );
}

function DateRangePickerPreview() {
  return (
    <div className="w-60">
      <DateRangePicker
        defaultValue={{
          from: new Date("2026-04-19T00:00:00.000Z"),
          to: new Date("2026-04-26T00:00:00.000Z"),
        }}
      />
    </div>
  );
}

function FieldPreview() {
  return (
    <Field className="w-56">
      <FieldLabel>Email</FieldLabel>
      <FieldControl>
        <Input placeholder="you@example.com" type="email" />
      </FieldControl>
      <FieldDescription>We never share it.</FieldDescription>
    </Field>
  );
}

function FieldsetPreview() {
  return (
    <Fieldset className="w-60">
      <FieldsetLegend>Shipping address</FieldsetLegend>
      <FieldsetContent>
        <Input placeholder="Street" />
        <Input placeholder="City" />
      </FieldsetContent>
    </Fieldset>
  );
}

function InputGroupPreview() {
  return (
    <InputGroup className="w-56">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search..." />
    </InputGroup>
  );
}

function ItemPreview() {
  return (
    <Item className="w-56" variant="outline">
      <ItemContent>
        <ItemTitle>Pro plan</ItemTitle>
        <ItemDescription>Billed annually.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm">Upgrade</Button>
      </ItemActions>
    </Item>
  );
}

function ListBoxPreview() {
  return (
    <ListBox className="w-48" defaultValue={["pst"]} label="Timezone">
      <ListBoxItem value="utc">UTC</ListBoxItem>
      <ListBoxItem value="est">Eastern</ListBoxItem>
      <ListBoxItem value="pst">Pacific</ListBoxItem>
    </ListBox>
  );
}

function NativeSelectPreview() {
  return (
    <NativeSelect aria-label="Timezone" className="w-48" defaultValue="utc">
      <option value="utc">UTC</option>
      <option value="est">Eastern</option>
      <option value="pst">Pacific</option>
    </NativeSelect>
  );
}

function NewsletterSignupPreview() {
  return (
    <div className="w-64">
      <NewsletterSignup onSubmit={noop} variant="stacked" />
    </div>
  );
}

function PhoneInputPreview() {
  return (
    <div className="w-64">
      <PhoneInput defaultCountry="US" placeholder="555 000 1234" />
    </div>
  );
}

function RangeCalendarPreview() {
  return (
    <RangeCalendar
      defaultValue={{
        from: new Date("2026-04-19T00:00:00.000Z"),
        to: new Date("2026-04-26T00:00:00.000Z"),
      }}
      numberOfMonths={1}
    />
  );
}

function SearchFieldPreview() {
  return (
    <div className="w-56">
      <SearchField defaultValue="components" placeholder="Search..." />
    </div>
  );
}

function TagGroupPreview() {
  return (
    <TagGroup defaultValue={["design"]} label="Topics" selectionMode="multiple">
      <TagGroupItem value="design">Design</TagGroupItem>
      <TagGroupItem value="engineering">Engineering</TagGroupItem>
      <TagGroupItem value="product">Product</TagGroupItem>
    </TagGroup>
  );
}

function TextFieldPreview() {
  return (
    <div className="w-56">
      <TextField
        defaultValue="ada@vllnt.com"
        label="Email"
        placeholder="you@example.com"
      />
    </div>
  );
}

function TimeFieldPreview() {
  return (
    <div className="w-44">
      <TimeField aria-label="Time" defaultValue="08:15" />
    </div>
  );
}

function TimePickerPreview() {
  return (
    <div className="w-44">
      <TimePicker defaultValue="09:30" placeholder="Select time" />
    </div>
  );
}

function TimelineScrubberPreview() {
  return (
    <div className="w-64">
      <TimelineScrubber
        end={3600}
        formatValue={(value) => `${Math.round(value / 60)}m`}
        onValueChange={noop}
        start={0}
        ticks={[
          { id: "deploy", tone: "primary", value: 600 },
          { id: "alert", tone: "danger", value: 2400 },
        ]}
        value={1800}
      />
    </div>
  );
}

function AgentActivityPreview() {
  return (
    <div className="w-full max-w-md">
      <AgentActivity elapsed="8.4s" status="completed">
        <AgentStep status="completed">
          <AgentStepTitle>Searching codebase</AgentStepTitle>
          <AgentStepDuration>1.2s</AgentStepDuration>
          <AgentStepDetail>
            Found 12 files matching &quot;auth&quot;.
          </AgentStepDetail>
        </AgentStep>
        <AgentStep status="completed">
          <AgentStepTitle>Reading auth.ts</AgentStepTitle>
          <AgentStepDuration>0.4s</AgentStepDuration>
        </AgentStep>
      </AgentActivity>
    </div>
  );
}

function AiArtifactPreview() {
  const source = `export function UserProfile({ name }: { name: string }) {
  return <div className="profile">Hello, {name}</div>;
}`;
  return (
    <div className="w-full max-w-md">
      <AIArtifact
        filename="UserProfile.tsx"
        language="tsx"
        subtitle="Generated component"
        title="UserProfile.tsx"
        type="code"
        value={source}
      >
        <AIArtifactToolbar>
          <AIArtifactCopyButton />
          <AIArtifactDownloadButton />
        </AIArtifactToolbar>
        <AIArtifactContent>
          <pre className="font-mono text-xs leading-relaxed">{source}</pre>
        </AIArtifactContent>
        <AIArtifactVersions>
          <AIArtifactVersion label="v1" />
          <AIArtifactVersion active label="v2" />
        </AIArtifactVersions>
      </AIArtifact>
    </div>
  );
}

function AiSidebarPreview() {
  return (
    <AISidebarProvider defaultOpen defaultPosition="right" defaultWidth={280}>
      <div className="relative h-[280px] w-full max-w-sm overflow-hidden rounded-xl border bg-muted/30">
        <AISidebar className="!absolute">
          <AISidebarHeader>
            <AISidebarTitle>AI Assistant</AISidebarTitle>
            <AISidebarClose />
          </AISidebarHeader>
          <AISidebarContent>
            <p className="text-sm text-muted-foreground">
              Ask anything about this document.
            </p>
          </AISidebarContent>
          <AISidebarFooter>
            <p className="text-xs text-muted-foreground">Composer goes here…</p>
          </AISidebarFooter>
        </AISidebar>
      </div>
    </AISidebarProvider>
  );
}

function ChainOfThoughtPreview() {
  return (
    <div className="w-full max-w-sm">
      <ChainOfThought
        steps={[
          {
            description: "Loaded src/index.ts",
            status: "complete",
            title: "Read the file",
          },
          { status: "complete", title: "Apply the edit" },
          { status: "complete", title: "Run the test suite" },
        ]}
      />
    </div>
  );
}

function ChatDockSectionPreview() {
  return (
    <div className="w-full max-w-md">
      <ChatDockSection
        contextLabel="Today · overview"
        messages={[
          {
            body: "Three failed runs came in overnight. Start with the invoice retry and the security digest.",
            id: "assistant",
            speaker: "Assistant",
          },
          {
            body: "Queue the approvals first, then review the stale automations after lunch.",
            id: "operator",
            speaker: "Operator",
          },
        ]}
        title="Assistant"
      />
    </div>
  );
}

function ModelComparisonPreview() {
  return (
    <div className="w-full max-w-2xl">
      <ModelComparison prompt="Explain closures in JavaScript">
        <ModelComparisonColumn label="Sonnet" model="claude-sonnet-4-6">
          <p className="text-sm">
            A closure is a function bundled together with references to its
            surrounding state.
          </p>
          <ModelComparisonMeta cost="$0.003" latency="0.8s" tokens={320} />
        </ModelComparisonColumn>
        <ModelComparisonColumn label="GPT-4o" model="gpt-4o">
          <p className="text-sm">
            Closures let an inner function remember the variables of the outer
            function it was created in.
          </p>
          <ModelComparisonMeta cost="$0.005" latency="1.1s" tokens={410} />
        </ModelComparisonColumn>
      </ModelComparison>
    </div>
  );
}

function PromptInputPreview() {
  return (
    <div className="w-full max-w-md">
      <PromptInput
        defaultValue="Summarize this thread and list the open action items."
        isLoading={false}
        placeholder="Ask anything…"
      />
    </div>
  );
}

function PromptTemplatesPreview() {
  return (
    <div className="w-full max-w-2xl">
      <PromptTemplates
        categories={[{ name: "Code" }, { name: "Analysis" }]}
        templates={[
          {
            category: "Code",
            description: "Review code for bugs, performance, and improvements",
            id: "code-review",
            template: "Review this {{language}} code for bugs:\n\n{{code}}",
            title: "Code Review",
          },
          {
            category: "Analysis",
            description: "Explain code line by line",
            id: "code-explain",
            template: "Explain what this code does line by line.",
            title: "Explain code",
          },
        ]}
      />
    </div>
  );
}

function ReasoningPreview() {
  return (
    <div className="w-full max-w-md">
      <Reasoning
        duration={4}
        isStreaming={false}
        steps={[
          "Parse the user request and identify the goal.",
          "Check the cache for a recent matching answer.",
          "Compose the final response from the retrieved context.",
        ]}
      />
    </div>
  );
}

function AiChatInputPreview() {
  return (
    <div className="w-full max-w-2xl">
      <AIChatInput
        helperText="Shift + Enter adds a new line"
        isSubmitting={false}
        status="2 files attached"
        value="Draft a release note for the latest accessibility fixes."
      />
    </div>
  );
}

function AiMessageBubblePreview() {
  return (
    <div className="w-full max-w-md space-y-3">
      <AIMessageBubble author="You" messageRole="user" timestamp="3m ago">
        Can you check the failing background job?
      </AIMessageBubble>
      <AIMessageBubble author="Assistant" timestamp="2m ago">
        I reviewed the integration logs and found a single failing background
        job.
      </AIMessageBubble>
    </div>
  );
}

function AiSourceCitationPreview() {
  return (
    <div className="w-full max-w-md">
      <AISourceCitation
        href="https://example.com/research/agent-patterns"
        snippet="Agent interfaces work best when message state, tool traces, and citations share the same visual language."
        source="Agent UI research"
        title="Designing readable AI conversations"
      />
    </div>
  );
}

function AiStreamingTextPreview() {
  return (
    <div className="w-full max-w-md text-sm">
      <AIStreamingText
        isStreaming={false}
        text="I checked the deployment logs and found the slow step in the image optimization pipeline."
      />
    </div>
  );
}

function AiToolCallDisplayPreview() {
  return (
    <div className="w-full max-w-md">
      <AIToolCallDisplay
        description="Gathered logs from the latest deployment run."
        duration="1.2s"
        input='{"service":"registry","window":"15m"}'
        output='{"errors":0,"warnings":2}'
        status="complete"
        toolName="logs.fetch"
      />
    </div>
  );
}

function AnnotationPreview() {
  return (
    <p className="max-w-md text-sm leading-7 text-foreground">
      In guided reading,{" "}
      <Annotation annotation="Scaffolding provides temporary support while a learner builds confidence.">
        scaffolding
      </Annotation>{" "}
      helps learners focus on the next{" "}
      <Highlight tone="sky">meaningful step</Highlight>.
    </p>
  );
}

function ConversationThreadPreview() {
  return (
    <div className="h-[280px] w-full max-w-md overflow-hidden rounded-xl border">
      <ConversationThread
        isStreaming={false}
        messages={[
          {
            content: "Summarize the UI PR stack and call out blockers.",
            id: "user-1",
            role: "user",
          },
          {
            content:
              "I reconciled the stacked branches against main and queued the next merge in order.",
            id: "assistant-1",
            role: "assistant",
            thinking:
              "Check the PR states, confirm quality gates, then merge only the clean branches.",
            toolCalls: [
              { id: "tool-1", input: { pr: 149 }, name: "gh_pr_checks" },
            ],
          },
        ]}
      >
        <ConversationHeader>
          <ConversationTitle>Workspace assistant</ConversationTitle>
        </ConversationHeader>
        <ConversationMessages />
      </ConversationThread>
    </div>
  );
}

function CurriculumPreview() {
  return (
    <div className="w-full max-w-lg">
      <Curriculum
        defaultExpandedModules={["mod-1"]}
        title="Full-Stack Development"
        totalHours={40}
      >
        <CurriculumModule
          description="Core web technologies"
          estimatedHours={8}
          id="mod-1"
          title="Module 1: Foundations"
        >
          <CurriculumLesson
            difficulty="beginner"
            duration="45 min"
            href="/lessons/html"
            status="completed"
            title="HTML & Semantic Markup"
          />
          <CurriculumLesson
            difficulty="beginner"
            duration="60 min"
            href="/lessons/css"
            status="in-progress"
            title="CSS Layout"
          />
          <CurriculumLesson
            difficulty="intermediate"
            duration="90 min"
            status="locked"
            title="JavaScript Fundamentals"
          />
        </CurriculumModule>
      </Curriculum>
    </div>
  );
}

function ProgressTrackerPreview() {
  return (
    <div className="w-full max-w-2xl">
      <ProgressTracker
        overallProgress={0.65}
        streak={7}
        title="Frontend mastery path"
      >
        <ProgressTrackerOverview description="A curriculum-level dashboard for lessons, exercises, and learning streaks." />
        <ProgressTrackerStats>
          <ProgressTrackerStat label="Streak" value="7 days" />
          <ProgressTrackerStat label="Time spent" value="24h" />
          <ProgressTrackerStat label="Exercises" value="45/80" />
          <ProgressTrackerStat label="Skills" value="12" />
        </ProgressTrackerStats>
        <ProgressTrackerModules>
          <ProgressTrackerModule
            badge="Foundation"
            completedExercises={18}
            completedLessons={12}
            description="Build confidence with variables, functions, and arrays."
            exercises={18}
            lessons={12}
            progress={1}
            skills={["Syntax", "Functions", "Arrays"]}
            status="completed"
            timeSpent="8h 10m"
            title="JavaScript Basics"
          />
          <ProgressTrackerModule
            badge="Now learning"
            completedExercises={5}
            completedLessons={3}
            currentLesson="Hooks in action"
            description="Move from JSX to reusable interactive interfaces."
            exercises={12}
            lessons={8}
            progress={0.4}
            skills={["Components", "Hooks", "State"]}
            status="in-progress"
            timeSpent="6h 20m"
            title="React Fundamentals"
          />
        </ProgressTrackerModules>
      </ProgressTracker>
    </div>
  );
}

function RatingPreview() {
  return <Rating defaultValue={4} label="Lesson quality" readOnly showValue />;
}

function StepperPreview() {
  return (
    <div className="w-full max-w-lg">
      <Stepper
        currentStep={2}
        steps={[
          {
            description: "Set context and vocabulary.",
            id: "intro",
            title: "Introduction",
          },
          {
            description: "Work through a solved example.",
            id: "practice",
            meta: "8 min",
            title: "Guided practice",
          },
          {
            description: "Answer a quick prompt to confirm understanding.",
            id: "check",
            title: "Knowledge check",
          },
          {
            description: "Capture the main takeaway.",
            id: "reflect",
            title: "Reflection",
          },
        ]}
      />
    </div>
  );
}

function TourPreview() {
  return (
    <div className="w-full max-w-md">
      <Tour
        defaultStep={0}
        steps={[
          {
            badge: "Start here",
            description:
              "The overview introduces goals, key vocabulary, and the pacing for the lesson.",
            id: "overview",
            title: "Overview",
          },
          {
            description:
              "Worked examples walk through a complete solution with annotations and checkpoints.",
            id: "examples",
            title: "Examples",
          },
          {
            badge: "Wrap up",
            description:
              "End with a quick self-check and a reflection prompt so learners can consolidate the takeaway.",
            id: "wrap-up",
            title: "Wrap up",
          },
        ]}
      />
    </div>
  );
}

function BannerPreview() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-lg border">
      <Banner dismissible icon={<AlertTriangle />} variant="warning">
        Scheduled maintenance tonight at 11pm UTC.
        <BannerAction>View status</BannerAction>
      </Banner>
    </div>
  );
}

function CookieConsentPreview() {
  return (
    <div
      className="relative h-40 w-full max-w-sm overflow-hidden rounded-lg border bg-muted/20"
      style={{ transform: "translateZ(0)" }}
    >
      <CookieConsent
        acceptText="Accept"
        declineText="Decline"
        message="This site uses cookies to improve your experience."
        position="bottom-left"
        settingsHref="/privacy"
        settingsText="Learn more"
      />
    </div>
  );
}

function CopyButtonPreview() {
  return (
    <div className="flex items-center gap-3">
      <CopyButton value="EXAMPLE_API_KEY" />
      <CopyButton
        label="Copy link"
        value="https://ui.vllnt.com"
        variant="button"
      />
    </div>
  );
}

function EmptyStatePreview() {
  return (
    <div className="w-full max-w-sm">
      <EmptyState
        description="Try adjusting your search or filters."
        icon={<Inbox />}
        size="sm"
        title="No results found"
      >
        <Button size="sm" variant="outline">
          Clear filters
        </Button>
      </EmptyState>
    </div>
  );
}

function GridPreview() {
  return (
    <div className="w-full max-w-xs">
      <Grid cols={3} gap={2}>
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="rounded-md border border-border bg-muted p-3 text-center text-xs"
            key={`grid-cell-${index + 1}`}
          >
            {index + 1}
          </div>
        ))}
      </Grid>
    </div>
  );
}

function KbdPreview() {
  return (
    <div className="flex flex-col items-center gap-2 text-sm">
      <span className="inline-flex items-center gap-1">
        <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>
      </span>
      <Kbd shortcut="mod+shift+p" />
    </div>
  );
}

function LabelPreview() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="newsletter" />
      <Label htmlFor="newsletter">Subscribe to newsletter</Label>
    </div>
  );
}

function LinkPreview() {
  return (
    <div className="flex flex-col items-start gap-2 text-sm">
      <Link href="#">Read the docs</Link>
      <Link href="#" variant="muted">
        Muted link
      </Link>
      <Link external href="https://example.com">
        Visit example.com
      </Link>
    </div>
  );
}

function MeterPreview() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Meter label="Disk usage" value={72} valueText="72% used" />
      <Meter
        label="Storage almost full"
        value={94}
        valueText="94% used"
        variant="destructive"
      />
      <Meter
        label="Signal strength"
        max={5}
        segments={5}
        value={3}
        valueText="3 of 5 bars"
      />
    </div>
  );
}

function PanelPreview() {
  return (
    <Panel className="w-full max-w-sm">
      <PanelHeader>
        <PanelTitle>Workspace settings</PanelTitle>
        <PanelDescription>Update how your team collaborates.</PanelDescription>
      </PanelHeader>
      <PanelBody>
        <p className="text-sm text-muted-foreground">Body content goes here.</p>
      </PanelBody>
      <PanelFooter className="justify-end gap-2">
        <Button size="sm" variant="ghost">
          Cancel
        </Button>
        <Button size="sm">Save</Button>
      </PanelFooter>
    </Panel>
  );
}

function QrCodePreview() {
  return <QrCode size={140} value="https://vllnt.com" />;
}

function SwitchPreview() {
  return (
    <div className="flex items-center gap-2">
      <Switch defaultChecked id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane mode</Label>
    </div>
  );
}

function ToolbarPreview() {
  return (
    <Toolbar aria-label="Text formatting">
      <Button size="sm" variant="ghost">
        Bold
      </Button>
      <Button size="sm" variant="ghost">
        Italic
      </Button>
      <ToolbarSeparator />
      <Button size="sm" variant="ghost">
        Link
      </Button>
    </Toolbar>
  );
}

function TypographyPreview() {
  return (
    <div className="w-full max-w-sm text-left">
      <H3>The quick brown fox</H3>
      <P>
        A standard body paragraph with inline code like{" "}
        <InlineCode>npm install</InlineCode>.
      </P>
      <Muted>Muted secondary text for captions.</Muted>
    </div>
  );
}

function AnimatedTooltipPreview() {
  return (
    <div className="flex min-h-24 items-center justify-center p-6">
      <AnimatedTooltip content="Tooltip content">
        <Button variant="outline">Hover me</Button>
      </AnimatedTooltip>
    </div>
  );
}

function ShareDialogPreview() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
        }}
        variant="outline"
      >
        Share
      </Button>
      <ShareDialog
        description="Share this article with your network."
        onOpenChange={setOpen}
        open={open}
        platforms={[
          {
            buildUrl: (url) => `https://x.com/intent/tweet?url=${url}`,
            key: "x",
            label: "X",
          },
          {
            buildUrl: (url) =>
              `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            key: "linkedin",
            label: "LinkedIn",
          },
        ]}
        title="Share"
      />
    </>
  );
}

function AnimatedTabsPreview() {
  return (
    <AnimatedTabs
      defaultValue="overview"
      tabs={[
        { label: "Overview", value: "overview" },
        { label: "Activity", value: "activity" },
        { label: "Settings", value: "settings" },
      ]}
    />
  );
}

function BottomBarPreview() {
  return (
    <div className="w-full max-w-md rounded-xl border border-dashed border-border/70 p-2">
      <BottomBar
        center={
          <span className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
            7 awaiting action
          </span>
        }
        leading={
          <span className="text-xs text-muted-foreground">System healthy</span>
        }
        trailing={
          <Button size="sm" variant="ghost">
            Open inbox
          </Button>
        }
      />
    </div>
  );
}

function DockPreview() {
  return (
    <Dock>
      <DockIcon>A</DockIcon>
      <DockIcon>B</DockIcon>
      <DockIcon>C</DockIcon>
      <DockIcon>D</DockIcon>
    </Dock>
  );
}

function FloatingNavbarPreview() {
  return (
    <div
      className="relative flex h-20 w-full max-w-md items-center justify-center overflow-hidden rounded-lg border bg-muted/20"
      style={{ transform: "translateZ(0)" }}
    >
      <FloatingNavbar className="text-sm">
        <Link href="#">Home</Link>
        <Link href="#">About</Link>
        <Link href="#">Contact</Link>
      </FloatingNavbar>
    </div>
  );
}

function JarvisDockPreview() {
  return (
    <JarvisDock
      actions={[
        {
          glyph: "+",
          id: "summon",
          label: "Summon",
          onActivate: noop,
          tone: "primary",
        },
        {
          badge: "3",
          glyph: "✓",
          id: "review",
          label: "Review",
          onActivate: noop,
          tone: "success",
        },
        {
          glyph: "↻",
          id: "retry",
          label: "Retry",
          onActivate: noop,
        },
      ]}
      onOpenPalette={noop}
    />
  );
}

function ViewportBookmarksPreview() {
  return (
    <div className="w-full max-w-[240px]">
      <ViewportBookmarks
        activeId="incidents"
        bookmarks={[
          { color: "#5b8def", id: "home", label: "Home base" },
          {
            color: "#10b981",
            detail: "1.4× zoom",
            id: "drilldown",
            label: "Drill-down",
          },
          {
            color: "#ef4444",
            detail: "5 open",
            id: "incidents",
            label: "Incidents",
          },
        ]}
        onSelect={noop}
      />
    </div>
  );
}

function WorldBreadcrumbsPreview() {
  return (
    <WorldBreadcrumbs
      crumbs={[
        { id: "world", kind: "world", label: "Production" },
        { id: "group", kind: "group", label: "Ingest cluster" },
        { id: "run", kind: "run", label: "research-2025" },
      ]}
      onSelect={noop}
    />
  );
}

function AutoReloadPreview() {
  return (
    <div className="w-full max-w-[280px]">
      <AutoReload defaultEnabled />
    </div>
  );
}

function PricingTablePreview() {
  return (
    <div className="w-full max-w-[260px] pt-3">
      <PricingTable>
        <PricingPlan
          badge="Most Popular"
          cta={{ label: "Start trial" }}
          description="For teams"
          features={[
            { included: true, label: "Unlimited projects" },
            { included: "100 GB", label: "Storage" },
            { included: true, label: "API access" },
          ]}
          highlighted
          name="Pro"
          period="/month"
          price="$29"
        />
      </PricingTable>
    </div>
  );
}

function TransactionListPreview() {
  return (
    <div className="w-full max-w-[300px]">
      <TransactionList
        currency="USD"
        locale="en-US"
        transactions={[
          {
            amountCents: 2000,
            createdAt: Date.UTC(2025, 2, 10),
            description: "Credit reload",
            id: "1",
            type: "credit",
          },
          {
            amountCents: 150,
            createdAt: Date.UTC(2025, 2, 8),
            description: "API usage — March",
            id: "2",
            type: "debit",
          },
        ]}
      >
        <TransactionListPinned>
          <TransactionListSubscriptionRow
            amountCents={1200}
            interval="month"
            plan="AI OS Pro"
            renewsAt={Date.UTC(2025, 3, 15)}
            status="active"
          />
        </TransactionListPinned>
      </TransactionList>
    </div>
  );
}

function CivilizationCardPreview() {
  return (
    <div className="w-full max-w-[280px]">
      <CivilizationCard
        achievements={["Aqueducts", "Roads", "Law"]}
        capital="Rome"
        color="red"
        era={{ end: 476, start: -27 }}
        leaders={["Augustus", "Trajan"]}
        name="Roman Empire"
        peakPopulation="70 million"
        region="Mediterranean"
      />
    </div>
  );
}

function EraComparisonPreview() {
  return (
    <div className="w-full max-w-[280px]">
      <EraComparison>
        <EraColumn
          color="amber"
          name="Renaissance"
          period="1400–1600"
          region="Europe"
        >
          <EraDomain name="Art">
            <EraHighlight>Perspective painting, humanism</EraHighlight>
            <div className="flex flex-wrap gap-1.5">
              <EraFigure name="Leonardo da Vinci" />
              <EraFigure name="Michelangelo" />
            </div>
          </EraDomain>
          <EraDomain name="Science">
            <EraHighlight>Heliocentrism, anatomy</EraHighlight>
          </EraDomain>
        </EraColumn>
      </EraComparison>
    </div>
  );
}

function HistoricalFigureCardPreview() {
  return (
    <div className="w-full max-w-[280px]">
      <HistoricalFigureCard
        birth={{ place: "Vinci, Italy", year: 1452 }}
        death={{ place: "Amboise, France", year: 1519 }}
        era="Renaissance"
        fields={["Art", "Science", "Anatomy"]}
        name="Leonardo da Vinci"
        quote={{
          source: "Notebooks",
          text: "Learning never exhausts the mind.",
        }}
        title="Polymath"
        works={["Mona Lisa", "Vitruvian Man"]}
      />
    </div>
  );
}

function KnowledgeCheckPreview() {
  return (
    <div className="w-full max-w-[300px]">
      <KnowledgeCheck
        questions={[
          {
            id: "react-purpose",
            options: [
              { correct: true, label: "A UI library", value: "ui" },
              { label: "A database", value: "db" },
              { label: "A backend framework", value: "backend" },
            ],
            question: "What is React?",
            type: "multiple-choice",
          },
          {
            answer: false,
            id: "react-framework",
            question: "React is a framework.",
            type: "true-false",
          },
        ]}
        title="Check your understanding"
      />
    </div>
  );
}

function ParallelTimelinePreview() {
  return (
    <div className="w-full max-w-[340px]">
      <ParallelTimeline
        endYear={500}
        startYear={-500}
        tracks={[
          {
            color: "red",
            events: [
              { id: "augustus", title: "Augustus", year: -27 },
              { id: "fall", title: "Fall of Rome", year: 476 },
            ],
            id: "rome",
            name: "Rome",
            region: "Mediterranean",
          },
          {
            color: "amber",
            events: [
              { id: "qin", title: "Qin unifies China", year: -221 },
              { id: "han-end", title: "End of Han", year: 220 },
            ],
            id: "china",
            name: "China",
            region: "East Asia",
          },
        ]}
      />
    </div>
  );
}

// eslint-disable-next-line max-lines-per-function -- Switch statement mapping all components
export function ComponentPreview({ componentName }: ComponentPreviewProps) {
  switch (componentName) {
    case "accordion":
      return <AccordionPreview />;
    case "activity-heatmap":
      return <ActivityHeatmapPreview />;
    case "activity-log":
      return <ActivityLogPreview />;
    case "alert":
      return <AlertPreview />;
    case "alert-dialog":
      return <AlertDialogPreview />;
    case "animated-text":
      return <AnimatedTextPreview />;
    case "area-chart":
      return <AreaChartPreview />;
    case "aspect-ratio":
      return <AspectRatioPreview />;
    case "avatar":
      return <AvatarPreview />;
    case "avatar-group":
      return <AvatarGroupPreview />;
    case "border-beam":
      return <BorderBeamPreview />;
    case "badge":
      return <BadgePreview />;
    case "bar-chart":
      return <BarChartPreview />;
    case "blog-card":
      return <BlogCardPreview />;
    case "breadcrumb":
      return <BreadcrumbPreview />;
    case "button":
      return <ButtonPreview />;
    case "anchor-port":
      return (
        <SimplePreview description="Connection port primitive for object graph cards and edges." />
      );
    case "callout":
      return <CalloutPreview />;
    case "calendar":
      return <CalendarPreview />;
    case "combobox":
      return <ComboboxPreview />;
    case "card":
      return <CardPreview />;
    case "data-list":
      return <DataListPreview />;
    case "data-table":
      return <DataTablePreview />;
    case "carousel":
      return <CarouselPreview />;
    case "canvas-shell":
      return (
        <SimplePreview description="Overlay shell for infinite-canvas workspaces with floating chrome regions." />
      );
    case "canvas-view":
      return <CanvasViewPreview />;
    case "connector-edge":
      return (
        <SimplePreview description="Curved connector edge for linking spatial objects on the canvas." />
      );
    case "category-filter":
      return <CategoryFilterPreview />;
    case "checkbox":
      return <CheckboxPreview />;
    case "collapsible":
      return <CollapsiblePreview />;
    case "checklist":
      return <ChecklistPreview />;
    case "code-block":
      return <CodeBlockPreview />;
    case "code-playground":
      return <CodePlaygroundPreview />;
    case "command":
      return <CommandPreview />;
    case "comparison":
      return <ComparisonPreview />;
    case "completion-dialog":
      return (
        <SimplePreview description="A dialog for displaying completion status with confetti animation." />
      );
    case "content-intro":
      return (
        <SimplePreview description="An introduction section with progress tracking and action buttons." />
      );
    case "context-menu":
      return <ContextMenuPreview />;
    case "countdown-timer":
      return <CountdownTimerPreview />;
    case "credit-badge":
      return <CreditBadgePreview />;
    case "dialog":
      return <DialogPreview />;
    case "drawer":
      return <DrawerPreview />;
    case "dropdown-menu":
      return <DropdownMenuPreview />;
    case "exercise":
      return <ExercisePreview />;
    case "faq":
      return <FAQPreview />;
    case "flashcard":
      return <FlashcardPreview />;
    case "edge-label":
      return (
        <SimplePreview description="Compact edge annotation badge used inside connector paths." />
      );
    case "file-upload":
      return <FileUploadPreview />;
    case "filter-bar":
      return (
        <SimplePreview description="A filter bar with search, sort, and filter controls." />
      );
    case "floating-action-button":
      return <FloatingActionButtonPreview />;
    case "form":
      return <FormPreview />;
    case "group-hull":
      return (
        <SimplePreview description="Dashed grouping surface for related spatial objects." />
      );
    case "horizontal-scroll-row":
      return <HorizontalScrollRowPreview />;
    case "hover-card":
      return <HoverCardPreview />;
    case "inline-input":
      return <InlineInputPreview />;
    case "input":
      return <InputPreview />;
    case "input-otp":
      return <InputOTPPreview />;
    case "date-picker":
      return <DatePickerPreview />;
    case "key-concept":
      return <KeyConceptPreview />;
    case "keyboard-shortcuts-help":
      return <KeyboardShortcutsHelpPreview />;
    case "left-rail":
      return (
        <SimplePreview description="Primary left-side rail for workspace navigation and context controls." />
      );
    case "lang-provider":
      return <LangProviderPreview />;
    case "learning-objectives":
      return <LearningObjectivesPreview />;
    case "line-chart":
      return <LineChartPreview />;
    case "marquee":
      return <MarqueePreview />;
    case "live-feed":
      return <LiveFeedPreview />;
    case "market-treemap":
      return <MarketTreemapPreview />;
    case "mdx-content":
      return <MDXContentPreview />;
    case "menubar":
      return <MenubarPreview />;
    case "mini-map-panel":
      return (
        <SimplePreview description="Viewport overview panel showing camera position within the world surface." />
      );
    case "metric-gauge":
      return <MetricGaugePreview />;
    case "model-selector":
      return (
        <SimplePreview description="A dialog for selecting AI models with search and filtering." />
      );
    case "multi-select":
      return <MultiSelectPreview />;
    case "tags-input":
      return <TagsInputPreview />;
    case "segmented-control":
      return <SegmentedControlPreview />;
    case "navbar-saas":
      return (
        <SimplePreview description="A responsive navigation bar for SaaS applications." />
      );
    case "navigation-menu":
      return <NavigationMenuPreview />;
    case "number-input":
      return <NumberInputPreview />;
    case "number-ticker":
      return <NumberTickerPreview />;
    case "object-card":
      return (
        <SimplePreview description="Object card primitive for spatial entities with metrics, actions, and ports." />
      );
    case "object-handle":
      return (
        <SimplePreview description="Drag/move handle affordance for manipulating canvas objects." />
      );
    case "order-book":
      return <OrderBookPreview />;
    case "pagination":
      return <PaginationPreview />;
    case "password-input":
      return <PasswordInputPreview />;
    case "popover":
      return <PopoverPreview />;
    case "pro-tip":
      return <ProTipPreview />;
    case "profile-section":
      return <ProfileSectionPreview />;
    case "progress-bar":
      return <ProgressBarPreview />;
    case "progress-card":
      return (
        <SimplePreview description="A card component with progress tracking." />
      );
    case "quiz":
      return <QuizPreview />;
    case "radio-group":
      return <RadioGroupPreview />;
    case "resizable":
      return <ResizablePreview />;
    case "right-dock":
      return (
        <SimplePreview description="Right-side dock for inspector, agent, or activity panels in the workspace shell." />
      );
    case "scroll-area":
      return <ScrollAreaPreview />;
    case "search-bar":
      return <SearchBarPreview />;
    case "search-dialog":
      return (
        <SimplePreview description="A command palette style search dialog." />
      );
    case "scope-selector":
      return <ScopeSelectorPreview />;
    case "select":
      return <SelectPreview />;
    case "separator":
      return <SeparatorPreview />;
    case "severity-badge":
      return <SeverityBadgePreview />;
    case "share-section":
      return <ShareSectionPreview />;
    case "sheet":
      return <SheetPreview />;
    case "sidebar":
      return <SidebarPreview />;
    case "skeleton":
      return <SkeletonPreview />;
    case "slider":
      return <SliderPreview />;
    case "spinner":
      return <SpinnerPreview />;
    case "stat-card":
      return <StatCardPreview />;
    case "status-board":
      return <StatusBoardPreview />;
    case "sidebar-provider":
      return <SidebarProviderPreview />;
    case "sidebar-toggle":
      return <SidebarTogglePreview />;
    case "slideshow":
      return (
        <SimplePreview description="A slideshow with keyboard navigation and progress." />
      );
    case "step-by-step":
      return <StepByStepPreview />;
    case "step-navigation":
      return <StepNavigationPreview />;
    case "status-indicator":
      return <StatusIndicatorPreview />;
    case "table-of-contents":
      return <TableOfContentsPreview />;
    case "table-of-contents-panel":
      return (
        <SimplePreview description="A table of contents panel with progress tracking." />
      );
    case "top-bar":
      return (
        <SimplePreview description="Top workspace bar combining title, subtitle, and command surfaces." />
      );
    case "table":
      return <TablePreview />;
    case "tabs":
      return <TabsPreview />;
    case "terminal":
      return <TerminalPreview />;
    case "textarea":
      return <TextareaPreview />;
    case "theme-provider":
      return <ThemeProviderPreview />;
    case "theme-toggle":
      return <ThemeTogglePreview />;
    case "thinking-block":
      return <ThinkingBlockPreview />;
    case "tldr-section":
      return <TLDRSectionPreview />;
    case "toast":
      return <ToastPreview />;
    case "toggle":
      return <TogglePreview />;
    case "toggle-group":
      return <ToggleGroupPreview />;
    case "tooltip":
      return <TooltipPreview />;
    case "tutorial-card":
      return <TutorialCardPreview />;
    case "tutorial-complete":
      return (
        <SimplePreview description="A completion screen with achievements and related content." />
      );
    case "tutorial-filters":
      return (
        <SimplePreview description="Filter controls for tutorial listings." />
      );
    case "tutorial-intro-content":
      return (
        <SimplePreview description="An introduction component for tutorials with objectives." />
      );
    case "tutorial-mdx":
      return (
        <SimplePreview description="MDX components optimized for tutorial content." />
      );
    case "usage-breakdown":
      return <UsageBreakdownPreview />;
    case "video-embed":
      return <VideoEmbedPreview />;
    case "view-switcher":
      return <ViewSwitcherPreview />;
    case "workspace-switcher":
      return (
        <SimplePreview description="Workspace selector for moving between orchestration views and object neighborhoods." />
      );
    case "wallet-card":
      return <WalletCardPreview />;
    case "watchlist":
      return <WatchlistPreview />;
    case "zoom-hud":
      return (
        <SimplePreview description="Heads-up zoom control for resetting and stepping canvas magnification." />
      );
    case "world-clock-bar":
      return <WorldClockBarPreview />;
    case "animated-beam":
      return <AnimatedBeamPreview />;
    case "choropleth-map":
      return <ChoroplethMapPreview />;
    case "chronological-timeline":
      return <ChronologicalTimelinePreview />;
    case "floating-toolbar":
      return <FloatingToolbarPreview />;
    case "follow-mode":
      return <FollowModePreview />;
    case "geography-quiz-map":
      return <GeographyQuizMapPreview />;
    case "glass-progress":
      return <GlassProgressPreview />;
    case "globe-3d":
      return <Globe3dPreview />;
    case "handoff-beacon":
      return <HandoffBeaconPreview />;
    case "heat-map-overlay":
      return <HeatMapOverlayPreview />;
    case "historic-timeline":
      return <HistoricTimelinePreview />;
    case "interactive-timeline":
      return <InteractiveTimelinePreview />;
    case "map-2d":
      return <Map2dPreview />;
    case "map-timeline":
      return <MapTimelinePreview />;
    case "primary-source-viewer":
      return <PrimarySourceViewerPreview />;
    case "route-map":
      return <RouteMapPreview />;
    case "scroll-progress":
      return (
        <SimplePreview description="A fixed progress bar pinned to the top of the page that fills as the reader scrolls." />
      );
    case "selection-halo":
      return <SelectionHaloPreview />;
    case "snap-guides":
      return <SnapGuidesPreview />;
    case "story-map":
      return <StoryMapPreview />;
    case "tree-view":
      return <TreeViewPreview />;
    case "alert-pulse":
      return <AlertPulsePreview />;
    case "animated-grid-pattern":
      return <AnimatedGridPatternPreview />;
    case "card-flip":
      return <CardFlipPreview />;
    case "comment-pin":
      return <CommentPinPreview />;
    case "context-lens":
      return <ContextLensPreview />;
    case "cursor":
      return <CursorPreview />;
    case "dot-pattern":
      return <DotPatternPreview />;
    case "glass-card":
      return <GlassCardPreview />;
    case "glass-panel":
      return <GlassPanelPreview />;
    case "infinite-plane":
      return <InfinitePlanePreview />;
    case "liquid-glass":
      return <LiquidGlassPreview />;
    case "live-cursor":
      return <LiveCursorPreview />;
    case "magnetic":
      return <MagneticPreview />;
    case "magnetic-button":
      return <MagneticButtonPreview />;
    case "meteors":
      return <MeteorsPreview />;
    case "multi-select-lasso":
      return <MultiSelectLassoPreview />;
    case "particles":
      return <ParticlesPreview />;
    case "playback-ghost":
      return <PlaybackGhostPreview />;
    case "progressive-blur":
      return <ProgressiveBlurPreview />;
    case "selection-presence":
      return <SelectionPresencePreview />;
    case "shimmer-button":
      return <ShimmerButtonPreview />;
    case "shine-border":
      return <ShineBorderPreview />;
    case "shiny-button":
      return <ShinyButtonPreview />;
    case "sparkles":
      return <SparklesPreview />;
    case "spotlight-card":
      return <SpotlightCardPreview />;
    case "state-badge-overlay":
      return <StateBadgeOverlayPreview />;
    case "theme-preset-provider":
      return <ThemePresetProviderPreview />;
    case "theme-switcher":
      return <ThemeSwitcherPreview />;
    case "thread-bubble":
      return <ThreadBubblePreview />;
    case "tilt-card":
      return <TiltCardPreview />;
    case "truncated-text":
      return <TruncatedTextPreview />;
    case "animated-list":
      return <AnimatedListPreview />;
    case "animated-testimonials":
      return <AnimatedTestimonialsPreview />;
    case "bento-grid":
      return <BentoGridPreview />;
    case "blur-reveal":
      return <BlurRevealPreview />;
    case "document-sibling-nav":
      return <DocumentSiblingNavPreview />;
    case "expandable-cards":
      return <ExpandableCardsPreview />;
    case "object-inspector":
      return <ObjectInspectorPreview />;
    case "plan-badge":
      return <PlanBadgePreview />;
    case "policy-delivery-panel":
      return <PolicyDeliveryPanelPreview />;
    case "property-section":
      return <PropertySectionPreview />;
    case "relationship-inspector":
      return <RelationshipInspectorPreview />;
    case "reveal-text":
      return <RevealTextPreview />;
    case "role-badge":
      return <RoleBadgePreview />;
    case "routing-assignment-panel":
      return <RoutingAssignmentPanelPreview />;
    case "runtime-overview-panel":
      return <RuntimeOverviewPanelPreview />;
    case "scramble-text":
      return <ScrambleTextPreview />;
    case "shimmer-text":
      return <ShimmerTextPreview />;
    case "spinning-text":
      return <SpinningTextPreview />;
    case "subscription-card":
      return <SubscriptionCardPreview />;
    case "text-animate":
      return <TextAnimatePreview />;
    case "text-reveal":
      return <TextRevealPreview />;
    case "text-shimmer":
      return <TextShimmerPreview />;
    case "timeline":
      return <TimelinePreview />;
    case "typewriter":
      return <TypewriterPreview />;
    case "bottom-activity-strip":
      return <BottomActivityStripPreview />;
    case "candlestick-chart":
      return <CandlestickChartPreview />;
    case "contribution-graph":
      return <ContributionGraphPreview />;
    case "flow-diagram":
      return <FlowDiagramPreview />;
    case "gantt-chart":
      return <GanttChartPreview />;
    case "gauge-chart":
      return <GaugeChartPreview />;
    case "heat-overlay":
      return <HeatOverlayPreview />;
    case "metric-cluster":
      return <MetricClusterPreview />;
    case "overview-board":
      return <OverviewBoardPreview />;
    case "pie-chart":
      return <PieChartPreview />;
    case "presence-stack":
      return <PresenceStackPreview />;
    case "presence-sync-indicator":
      return <PresenceSyncIndicatorPreview />;
    case "radar-chart":
      return <RadarChartPreview />;
    case "run-timeline":
      return <RunTimelinePreview />;
    case "sankey-chart":
      return <SankeyChartPreview />;
    case "sparkline-grid":
      return <SparklineGridPreview />;
    case "sticky-metric":
      return <StickyMetricPreview />;
    case "threshold-ring":
      return <ThresholdRingPreview />;
    case "ticker-tape":
      return <TickerTapePreview />;
    case "button-group":
      return <ButtonGroupPreview />;
    case "checkbox-group":
      return <CheckboxGroupPreview />;
    case "color-picker":
      return <ColorPickerPreview />;
    case "date-field":
      return <DateFieldPreview />;
    case "date-range-picker":
      return <DateRangePickerPreview />;
    case "field":
      return <FieldPreview />;
    case "fieldset":
      return <FieldsetPreview />;
    case "input-group":
      return <InputGroupPreview />;
    case "item":
      return <ItemPreview />;
    case "list-box":
      return <ListBoxPreview />;
    case "native-select":
      return <NativeSelectPreview />;
    case "newsletter-signup":
      return <NewsletterSignupPreview />;
    case "phone-input":
      return <PhoneInputPreview />;
    case "range-calendar":
      return <RangeCalendarPreview />;
    case "search-field":
      return <SearchFieldPreview />;
    case "tag-group":
      return <TagGroupPreview />;
    case "text-field":
      return <TextFieldPreview />;
    case "time-field":
      return <TimeFieldPreview />;
    case "time-picker":
      return <TimePickerPreview />;
    case "timeline-scrubber":
      return <TimelineScrubberPreview />;
    case "agent-activity":
      return <AgentActivityPreview />;
    case "ai-artifact":
      return <AiArtifactPreview />;
    case "ai-sidebar":
      return <AiSidebarPreview />;
    case "chain-of-thought":
      return <ChainOfThoughtPreview />;
    case "chat-dock-section":
      return <ChatDockSectionPreview />;
    case "model-comparison":
      return <ModelComparisonPreview />;
    case "prompt-input":
      return <PromptInputPreview />;
    case "prompt-templates":
      return <PromptTemplatesPreview />;
    case "reasoning":
      return <ReasoningPreview />;
    case "ai-chat-input":
      return <AiChatInputPreview />;
    case "ai-message-bubble":
      return <AiMessageBubblePreview />;
    case "ai-source-citation":
      return <AiSourceCitationPreview />;
    case "ai-streaming-text":
      return <AiStreamingTextPreview />;
    case "ai-tool-call-display":
      return <AiToolCallDisplayPreview />;
    case "annotation":
      return <AnnotationPreview />;
    case "conversation-thread":
      return <ConversationThreadPreview />;
    case "curriculum":
      return <CurriculumPreview />;
    case "progress-tracker":
      return <ProgressTrackerPreview />;
    case "rating":
      return <RatingPreview />;
    case "stepper":
      return <StepperPreview />;
    case "tour":
      return <TourPreview />;
    case "banner":
      return <BannerPreview />;
    case "cookie-consent":
      return <CookieConsentPreview />;
    case "copy-button":
      return <CopyButtonPreview />;
    case "empty-state":
      return <EmptyStatePreview />;
    case "grid":
      return <GridPreview />;
    case "kbd":
      return <KbdPreview />;
    case "label":
      return <LabelPreview />;
    case "link":
      return <LinkPreview />;
    case "meter":
      return <MeterPreview />;
    case "panel":
      return <PanelPreview />;
    case "qr-code":
      return <QrCodePreview />;
    case "switch":
      return <SwitchPreview />;
    case "toolbar":
      return <ToolbarPreview />;
    case "typography":
      return <TypographyPreview />;
    case "animated-tooltip":
      return <AnimatedTooltipPreview />;
    case "share-dialog":
      return <ShareDialogPreview />;
    case "animated-tabs":
      return <AnimatedTabsPreview />;
    case "bottom-bar":
      return <BottomBarPreview />;
    case "dock":
      return <DockPreview />;
    case "floating-navbar":
      return <FloatingNavbarPreview />;
    case "jarvis-dock":
      return <JarvisDockPreview />;
    case "viewport-bookmarks":
      return <ViewportBookmarksPreview />;
    case "world-breadcrumbs":
      return <WorldBreadcrumbsPreview />;
    case "auto-reload":
      return <AutoReloadPreview />;
    case "pricing-table":
      return <PricingTablePreview />;
    case "transaction-list":
      return <TransactionListPreview />;
    case "civilization-card":
      return <CivilizationCardPreview />;
    case "era-comparison":
      return <EraComparisonPreview />;
    case "historical-figure-card":
      return <HistoricalFigureCardPreview />;
    case "knowledge-check":
      return <KnowledgeCheckPreview />;
    case "parallel-timeline":
      return <ParallelTimelinePreview />;
    default:
      return <PlaceholderPreview componentName={componentName} />;
  }
}
