"use client";

import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
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
  AlertTitle,
  AspectRatio,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Breadcrumb,
  Button,
  Calendar,
  Callout,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CategoryFilter,
  Checkbox,
  Checklist,
  CodeBlock,
  CodePlayground,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommonMistake,
  Comparison,
  ContentCard,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Exercise,
  FAQ,
  FAQItem,
  FloatingActionButton,
  Glossary,
  HorizontalScrollRow,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  InlineInput,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  KeyboardShortcutsHelp,
  KeyConcept,
  LangProvider,
  LearningObjectives,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Prerequisites,
  ProfileSection,
  ProgressBar,
  ProTip,
  Quiz,
  RadioGroup,
  RadioGroupItem,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ScrollArea,
  SearchBar,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  ShareSection,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Sidebar,
  SidebarProvider,
  SidebarToggle,
  Skeleton,
  Slider,
  Spinner,
  Step,
  StepByStep,
  StepNavigation,
  Summary,
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
  Terminal,
  Textarea,
  ThemeProvider,
  ThemeToggle,
  ThinkingBlock,
  TLDRSection,
  Toast,
  ToastDescription,
  ToastTitle,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TutorialCard,
  VideoEmbed,
  ViewSwitcher,
} from "@vllnt/ui";
import {
  Bold,
  ChevronsUpDown,
  Italic,
  Plus,
  Terminal as TerminalIcon,
  Underline,
} from "lucide-react";

type ComponentPreviewProps = {
  componentName: string;
};

// Simple text-based preview for components that need complex context
function SimplePreview({ description }: { description: string }) {
  return (
    <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/30">
      <p>{description}</p>
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
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <label className="text-sm" htmlFor="terms">
          Accept terms
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox defaultChecked id="marketing" />
        <label className="text-sm" htmlFor="marketing">
          Receive emails
        </label>
      </div>
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
        <Plus className="h-5 w-5" />
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
        setStep(step + 1);
      }}
      onPrev={() => {
        setStep(step - 1);
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
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="option-one" value="option-one" />
        <label className="text-sm" htmlFor="option-one">
          Option One
        </label>
      </div>
      <div className="flex items-center space-x-2">
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
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="Toggle underline">
        <Underline className="h-4 w-4" />
      </Toggle>
    </div>
  );
}

function ToggleGroupPreview() {
  return (
    <ToggleGroup type="multiple">
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <Underline className="h-4 w-4" />
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
      {Array.from({ length: 6 }, (_, index) => (
        <div
          className="min-w-[180px] snap-start rounded-lg border bg-card p-4 text-sm"
          key={index}
        >
          Card {index + 1}
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

function SkeletonPreview() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
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
      <div className="flex h-5 items-center space-x-4 text-sm">
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
        <TerminalIcon className="h-4 w-4" />
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
      <div className="flex items-center justify-between space-x-4">
        <h4 className="text-sm font-semibold">Collapsible Section</h4>
        <CollapsibleTrigger asChild>
          <Button size="sm" variant="ghost">
            <ChevronsUpDown className="h-4 w-4" />
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

function CalendarPreview() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  return <Calendar mode="single" onSelect={setDate} selected={date} />;
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

// eslint-disable-next-line max-lines-per-function -- Switch statement mapping all components
export function ComponentPreview({ componentName }: ComponentPreviewProps) {
  switch (componentName) {
    case "accordion":
      return <AccordionPreview />;
    case "alert":
      return <AlertPreview />;
    case "alert-dialog":
      return <AlertDialogPreview />;
    case "area-chart":
      return <AreaChartPreview />;
    case "aspect-ratio":
      return <AspectRatioPreview />;
    case "avatar":
      return <AvatarPreview />;
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
    case "callout":
      return <CalloutPreview />;
    case "calendar":
      return <CalendarPreview />;
    case "card":
      return <CardPreview />;
    case "carousel":
      return <CarouselPreview />;
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
    case "filter-bar":
      return (
        <SimplePreview description="A filter bar with search, sort, and filter controls." />
      );
    case "floating-action-button":
      return <FloatingActionButtonPreview />;
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
    case "key-concept":
      return <KeyConceptPreview />;
    case "keyboard-shortcuts-help":
      return <KeyboardShortcutsHelpPreview />;
    case "lang-provider":
      return <LangProviderPreview />;
    case "learning-objectives":
      return <LearningObjectivesPreview />;
    case "line-chart":
      return <LineChartPreview />;
    case "mdx-content":
      return <MDXContentPreview />;
    case "menubar":
      return <MenubarPreview />;
    case "model-selector":
      return (
        <SimplePreview description="A dialog for selecting AI models with search and filtering." />
      );
    case "navbar-saas":
      return (
        <SimplePreview description="A responsive navigation bar for SaaS applications." />
      );
    case "navigation-menu":
      return <NavigationMenuPreview />;
    case "pagination":
      return <PaginationPreview />;
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
    case "scroll-area":
      return <ScrollAreaPreview />;
    case "search-bar":
      return <SearchBarPreview />;
    case "search-dialog":
      return (
        <SimplePreview description="A command palette style search dialog." />
      );
    case "select":
      return <SelectPreview />;
    case "separator":
      return <SeparatorPreview />;
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
    case "table-of-contents":
      return <TableOfContentsPreview />;
    case "table-of-contents-panel":
      return (
        <SimplePreview description="A table of contents panel with progress tracking." />
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
    case "video-embed":
      return <VideoEmbedPreview />;
    case "view-switcher":
      return <ViewSwitcherPreview />;
    default:
      return <div className="text-muted-foreground">Preview not available</div>;
  }
}
