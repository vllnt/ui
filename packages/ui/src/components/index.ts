// Core UI primitives
export { Badge, type BadgeProps, badgeVariants } from "./badge";
export { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";
export { Button, type ButtonProps, buttonVariants } from "./button";
export {
  CookieConsent,
  type CookieConsentProps,
  cookieConsentVariants,
} from "./cookie-consent";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command";
export { Combobox, type ComboboxOption, type ComboboxProps } from "./combobox";
export { DatePicker, type DatePickerProps } from "./date-picker";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";
export { Input } from "./input";
export { Checkbox } from "./checkbox";
export { FileUpload, type FileUploadProps } from "./file-upload";
export { Label } from "./label";
export { NumberInput, type NumberInputProps } from "./number-input";
export { PasswordInput, type PasswordInputProps } from "./password-input";
export { Switch } from "./switch";
export {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  type FormProps,
} from "./form";
export {
  MultiSelect,
  type MultiSelectOption,
  type MultiSelectProps,
} from "./multi-select";
export { TagsInput, type TagsInputProps } from "./tags-input";
export {
  SegmentedControl,
  SegmentedControlItem,
  type SegmentedControlItemProps,
  segmentedControlItemVariants,
  type SegmentedControlProps,
  segmentedControlVariants,
} from "./segmented-control";
export {
  toast,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  Toaster,
  type ToastProps,
  ToastTitle,
} from "./toast";

// AI components
export { AIChatInput, type AIChatInputProps } from "./ai-chat-input";
export {
  AIMessageBubble,
  type AIMessageBubbleProps,
} from "./ai-message-bubble";
export {
  AISourceCitation,
  type AISourceCitationProps,
} from "./ai-source-citation";
export {
  AIStreamingText,
  type AIStreamingTextProps,
} from "./ai-streaming-text";
export {
  AIToolCallDisplay,
  type AIToolCallDisplayProps,
  type AIToolCallStatus,
} from "./ai-tool-call-display";

// New shadcn primitives - Form
export { Textarea, type TextareaProps } from "./textarea";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";
export { RadioGroup, RadioGroupItem } from "./radio-group";
export { Slider } from "./slider";
export { Toggle, toggleVariants } from "./toggle";
export { ToggleGroup, ToggleGroupItem } from "./toggle-group";
export {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./input-otp";

// New shadcn primitives - Overlay
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
export { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./context-menu";
export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./menubar";
export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from "./navigation-menu";

// New shadcn primitives - Data Display
export {
  DataTable,
  type DataTableFilter,
  type DataTableFilterOption,
  type DataTableProps,
} from "./data-table";
export {
  DataList,
  DataListItem,
  type DataListItemProps,
  dataListItemVariants,
  DataListLabel,
  type DataListProps,
  DataListValue,
  dataListVariants,
} from "./data-list";
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
export { Avatar, AvatarFallback, AvatarImage } from "./avatar";
export {
  AvatarGroup,
  type AvatarGroupItem,
  type AvatarGroupProps,
  avatarGroupVariants,
  avatarItemVariants,
} from "./avatar-group";
export { Skeleton } from "./skeleton";
export { Separator } from "./separator";
export { Alert, AlertDescription, AlertTitle, alertVariants } from "./alert";
export { StatCard, type StatCardProps, statCardVariants } from "./stat-card";
export {
  dotVariants,
  StatusIndicator,
  type StatusIndicatorProps,
  statusIndicatorVariants,
} from "./status-indicator";

// New shadcn primitives - Layout
export { AspectRatio } from "./aspect-ratio";
export { ScrollArea, ScrollBar } from "./scroll-area";
export {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./resizable";
export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
export {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";

// New shadcn primitives - Utilities
export { BorderBeam, type BorderBeamProps } from "./border-beam";
export {
  ActivityHeatmap,
  type ActivityHeatmapItem,
  type ActivityHeatmapProps,
} from "./activity-heatmap";
export { Calendar, type CalendarProps } from "./calendar";
export { CountdownTimer, type CountdownTimerProps } from "./countdown-timer";
export { Marquee, type MarqueeProps } from "./marquee";
export { NumberTicker, type NumberTickerProps } from "./number-ticker";
export {
  Spinner,
  type SpinnerProps,
  UnicodeSpinner,
  type UnicodeSpinnerAnimation,
  type UnicodeSpinnerProps,
} from "./spinner";
export {
  WorldClockBar,
  type WorldClockBarProps,
  type WorldClockBarZone,
} from "./world-clock-bar";

// Content components
export { CodeBlock } from "./code-block";
export { MDXContent } from "./mdx-content";

// Layout components
export { CanvasShell, type CanvasShellProps } from "./canvas-shell";
export {
  CanvasView,
  type CanvasViewHandle,
  type CanvasViewport,
  type CanvasViewProps,
} from "./canvas-view";
export { LeftRail, type LeftRailProps } from "./left-rail";
export {
  type MiniMapMarker,
  MiniMapPanel,
  type MiniMapPanelProps,
} from "./mini-map-panel";
export {
  NavbarSaas,
  type NavbarSaasProps,
  type NavItem,
  useMobile,
} from "./navbar-saas";
export { RightDock, type RightDockProps } from "./right-dock";
export { Sidebar } from "./sidebar";
export type { SidebarItem, SidebarSection } from "./sidebar";
export { SidebarProvider, useSidebar } from "./sidebar-provider";
export { TableOfContents } from "./table-of-contents";
export { TopBar, type TopBarProps } from "./top-bar";
export { ZoomHUD, type ZoomHUDProps } from "./zoom-hud";

// Blog components
export {
  ActivityLog,
  type ActivityLogItem,
  type ActivityLogProps,
  type ActivityLogTone,
} from "./activity-log";
export { BlogCard, ContentCard } from "./blog-card";
export { CategoryFilter } from "./category-filter";
export { Pagination, type PaginationProps } from "./pagination";
export { SearchBar } from "./search-bar";
export {
  ScopeSelector,
  type ScopeSelectorNode,
  type ScopeSelectorProps,
  type ScopeSelectorSelection,
} from "./scope-selector";
export {
  UsageBreakdown,
  type UsageBreakdownItem,
  type UsageBreakdownProps,
  type UsageBreakdownTone,
} from "./usage-breakdown";
export {
  type PlatformConfig,
  type SharePlatform,
  ShareSection,
} from "./share-section";

// Registry/Documentation components
export { SearchDialog } from "./search-dialog";

// Theme & Language providers
export { LangProvider } from "./lang-provider";
export { ThemeProvider } from "./theme-provider";
export { ThemeToggle } from "./theme-toggle";

// Feature components
export {
  CandlestickChart,
  type CandlestickChartProps,
  type CandlestickDatum,
} from "./candlestick-chart";
export {
  CreditBadge,
  type CreditBadgeProps,
  type CreditBadgeStatus,
} from "./credit-badge";
export {
  MarketTreemap,
  type MarketTreemapItem,
  type MarketTreemapProps,
} from "./market-treemap";
export {
  OrderBook,
  type OrderBookLevel,
  type OrderBookProps,
} from "./order-book";
export { ProfileSection } from "./profile-section";
export {
  PlanBadge,
  type PlanBadgeProps,
  type PlanBadgeState,
  type PlanBadgeTier,
} from "./plan-badge";
export {
  RoleBadge,
  type RoleBadgeProps,
  type RoleBadgeRole,
} from "./role-badge";
export {
  SparklineGrid,
  type SparklineGridItem,
  type SparklineGridProps,
} from "./sparkline-grid";
export {
  SubscriptionCard,
  type SubscriptionCardProps,
  type SubscriptionCardStatus,
} from "./subscription-card";
export { TLDRSection } from "./tldr-section";
export {
  TickerTape,
  type TickerTapeItem,
  type TickerTapeProps,
} from "./ticker-tape";
export { WalletCard, type WalletCardProps } from "./wallet-card";
export {
  Watchlist,
  type WatchlistItem,
  type WatchlistProps,
} from "./watchlist";
export { BarChart, LineChart } from "./chart";
export { AreaChart } from "./chart";
export { LiveFeed, type LiveFeedEvent, type LiveFeedProps } from "./live-feed";
export {
  MetricGauge,
  type MetricGaugeProps,
  type MetricGaugeThreshold,
} from "./metric-gauge";
export {
  SeverityBadge,
  type SeverityBadgeLevel,
  type SeverityBadgeProps,
  severityBadgeVariants,
} from "./severity-badge";
export {
  StatusBoard,
  type StatusBoardItem,
  type StatusBoardProps,
  type StatusBoardStatus,
} from "./status-board";

// Text components
export { AnimatedText, type AnimatedTextProps } from "./animated-text";
export { TruncatedText, type TruncatedTextProps } from "./truncated-text";

// Tutorial/Educational MDX components
export {
  Accordion,
  AccordionContent,
  type AccordionContentProps,
  AccordionItem,
  type AccordionItemProps,
  type AccordionProps,
  AccordionTrigger,
  type AccordionTriggerProps,
} from "./accordion";
export { Callout, type CalloutProps, type CalloutVariant } from "./callout";
export {
  Annotation,
  type AnnotationProps,
  Highlight,
  type HighlightProps,
} from "./annotation";
export {
  Checklist,
  type ChecklistItem,
  type ChecklistProps,
} from "./checklist";
export {
  CodePlayground,
  type CodePlaygroundProps,
  FileTree,
  type FileTreeProps,
} from "./code-playground";
export {
  BeforeAfter,
  type BeforeAfterProps,
  Comparison,
  type ComparisonProps,
} from "./comparison";
export { Exercise, type ExerciseProps } from "./exercise";
export { FAQ, FAQItem, type FAQItemProps, type FAQProps } from "./faq";
export { Flashcard, type FlashcardProps } from "./flashcard";
export {
  Glossary,
  type GlossaryProps,
  KeyConcept,
  type KeyConceptProps,
} from "./key-concept";
export {
  LearningObjectives,
  type LearningObjectivesProps,
  Prerequisites,
  type PrerequisitesProps,
  Summary,
  type SummaryProps,
} from "./learning-objectives";
export { ProgressBar, type ProgressBarProps } from "./progress-bar";
export {
  ProgressCard,
  type ProgressCardProgress,
  type ProgressCardProps,
} from "./progress-card";
export {
  ProgressTracker,
  ProgressTrackerBadge,
  type ProgressTrackerBadgeProps,
  ProgressTrackerModule,
  type ProgressTrackerModuleItem,
  type ProgressTrackerModuleProps,
  ProgressTrackerModules,
  type ProgressTrackerModulesProps,
  type ProgressTrackerModuleStatus,
  ProgressTrackerOverview,
  type ProgressTrackerOverviewProps,
  type ProgressTrackerProps,
  ProgressTrackerStat,
  type ProgressTrackerStatProps,
  ProgressTrackerStats,
  type ProgressTrackerStatsProps,
  useProgressTrackerContext,
} from "./progress-tracker";
export {
  CommonMistake,
  type CommonMistakeProps,
  ProTip,
  type ProTipProps,
  type ProTipVariant,
} from "./pro-tip";
export { Quiz, type QuizOption, type QuizProps } from "./quiz";
export { Rating, type RatingProps } from "./rating";
export {
  Step,
  StepByStep,
  type StepByStepProps,
  type StepProps,
} from "./step-by-step";
export { Stepper, type StepperProps, type StepperStep } from "./stepper";
export {
  Tabs,
  TabsContent,
  type TabsContentProps,
  TabsList,
  type TabsListProps,
  type TabsProps,
  TabsTrigger,
  type TabsTriggerProps,
} from "./tabs";
export {
  SimpleTerminal,
  type SimpleTerminalProps,
  Terminal,
  type TerminalLine,
  type TerminalProps,
} from "./terminal";
export { VideoEmbed, type VideoEmbedProps } from "./video-embed";
export {
  type FilterUpdates,
  TutorialFilters,
  type TutorialFiltersLabels,
  type TutorialFiltersProps,
} from "./tutorial-filters";
export {
  TutorialCard,
  type TutorialCardLabels,
  type TutorialCardMeta,
  type TutorialCardProgress,
  type TutorialCardProps,
} from "./tutorial-card";
export {
  TutorialComplete,
  type TutorialCompleteLabels,
  type TutorialCompleteProps,
  type TutorialCompleteRelatedContent,
  type TutorialCompleteSection,
} from "./tutorial-complete";
export {
  TutorialIntroContent,
  type TutorialIntroContentProps,
} from "./tutorial-intro-content";
export {
  mdxComponents,
  TutorialMDX,
  type TutorialMDXProps,
} from "./tutorial-mdx";
export { Tour, type TourProps, type TourStep } from "./tour";

// Tutorial/Interactive components
export {
  CompletionDialog,
  type CompletionDialogProps,
} from "./completion-dialog";
export {
  ContentIntro,
  type ContentIntroLabels,
  type ContentIntroProps,
  type ContentIntroSection,
} from "./content-intro";
export {
  FilterBar,
  type FilterBarLabels,
  type FilterBarProps,
  type FilterOption,
} from "./filter-bar";
export {
  FloatingActionButton,
  type FloatingActionButtonProps,
} from "./floating-action-button";
export {
  type KeyboardShortcut,
  KeyboardShortcutsHelp,
  type KeyboardShortcutsHelpProps,
} from "./keyboard-shortcuts-help";
export {
  Slideshow,
  type SlideshowLabels,
  type SlideshowProps,
  type SlideshowSection,
} from "./slideshow";
export { StepNavigation, type StepNavigationProps } from "./step-navigation";
export {
  TableOfContentsPanel,
  type TableOfContentsPanelProps,
  type TOCSection,
} from "./table-of-contents-panel";

// Social/Sharing components
export {
  ShareDialog,
  type ShareDialogLabels,
  type SharePlatform as ShareDialogPlatform,
  type ShareDialogProps,
} from "./share-dialog";
export {
  type SharePlatformConfig,
  SocialFAB,
  type SocialFabActionConfig,
  type SocialFabLabels,
  type SocialFabProps,
  useSocialFab,
} from "./social-fab";

// Scroll/View components
export {
  HorizontalScrollRow,
  type HorizontalScrollRowProps,
} from "./horizontal-scroll-row";
export {
  type ViewOption,
  ViewSwitcher,
  type ViewSwitcherProps,
} from "./view-switcher";
export {
  type WorkspaceOption,
  WorkspaceSwitcher,
  type WorkspaceSwitcherProps,
} from "./workspace-switcher";

// Flow/Diagram components
export {
  type CopyStatus,
  FlowControls,
  type FlowControlsProps,
  FlowDiagram,
  type FlowDiagramEdge,
  type FlowDiagramNode,
  type FlowDiagramProps,
  FlowErrorBoundary,
  FlowFullscreen,
  type FlowFullscreenProps,
  useFlowDiagram,
  type UseFlowDiagramOptions,
  type UseFlowDiagramReturn,
} from "./flow-diagram";

// Canvas/Object components
export { AnchorPort, type AnchorPortProps } from "./anchor-port";
export {
  ConnectorEdge,
  type ConnectorEdgePoint,
  type ConnectorEdgeProps,
} from "./connector-edge";
export { EdgeLabel, type EdgeLabelProps } from "./edge-label";
export { GroupHull, type GroupHullProps } from "./group-hull";
export {
  ObjectCard,
  type ObjectCardAction,
  type ObjectCardMetric,
  type ObjectCardProps,
} from "./object-card";
export { ObjectHandle, type ObjectHandleProps } from "./object-handle";

// AI/Chat components
export { InlineInput, type InlineInputProps } from "./inline-input";
export {
  type ModelInfo,
  ModelSelector,
  type ModelSelectorProps,
} from "./model-selector";
export { SidebarToggle, type SidebarToggleProps } from "./sidebar-toggle";
export { ThinkingBlock, type ThinkingBlockProps } from "./thinking-block";
