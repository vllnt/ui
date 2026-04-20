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
export { Label } from "./label";
export { Switch } from "./switch";
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
export { Skeleton } from "./skeleton";
export { Separator } from "./separator";
export { Alert, AlertDescription, AlertTitle, alertVariants } from "./alert";

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
export { Calendar, type CalendarProps } from "./calendar";
export { Spinner, type SpinnerProps } from "./spinner";

// Content components
export { CodeBlock } from "./code-block";
export { MDXContent } from "./mdx-content";

// Layout components
export {
  NavbarSaas,
  type NavbarSaasProps,
  type NavItem,
  useMobile,
} from "./navbar-saas";
export { Sidebar } from "./sidebar";
export type { SidebarItem, SidebarSection } from "./sidebar";
export { SidebarProvider, useSidebar } from "./sidebar-provider";
export { TableOfContents } from "./table-of-contents";

// Blog components
export { BlogCard, ContentCard } from "./blog-card";
export { CategoryFilter } from "./category-filter";
export { Pagination, type PaginationProps } from "./pagination";
export { SearchBar } from "./search-bar";
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
  SparklineGrid,
  type SparklineGridItem,
  type SparklineGridProps,
} from "./sparkline-grid";
export { TLDRSection } from "./tldr-section";
export {
  TickerTape,
  type TickerTapeItem,
  type TickerTapeProps,
} from "./ticker-tape";
export {
  Watchlist,
  type WatchlistItem,
  type WatchlistProps,
} from "./watchlist";
export { BarChart, LineChart } from "./chart";
export { AreaChart } from "./chart";

// Text components
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
  CommonMistake,
  type CommonMistakeProps,
  ProTip,
  type ProTipProps,
  type ProTipVariant,
} from "./pro-tip";
export { Quiz, type QuizOption, type QuizProps } from "./quiz";
export {
  Step,
  StepByStep,
  type StepByStepProps,
  type StepProps,
} from "./step-by-step";
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

// AI/Chat components
export { InlineInput, type InlineInputProps } from "./inline-input";
export {
  type ModelInfo,
  ModelSelector,
  type ModelSelectorProps,
} from "./model-selector";
export { SidebarToggle, type SidebarToggleProps } from "./sidebar-toggle";
export { ThinkingBlock, type ThinkingBlockProps } from "./thinking-block";
