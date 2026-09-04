import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AIChatInput,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Banner,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Checklist,
  DataList,
  Dialog,
  EmptyState,
  Heading,
  Input,
  NumberTicker,
  ProgressBar,
  SearchBar,
  Separator,
  Spinner,
  StatusIndicator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Textarea,
  type ThemeSelection,
  useTheme,
} from "@vllnt/ui-native";
import type { ReactNode } from "react";
import { View } from "react-native";

const themeSelections: readonly ThemeSelection[] = ["system", "light", "dark"];

function Row({ children }: { readonly children: ReactNode }) {
  const theme = useTheme();
  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.spacing[2],
      }}
    >
      {children}
    </View>
  );
}
Row.displayName = "Row";

function Section({
  children,
  title,
}: {
  readonly children: ReactNode;
  readonly title: string;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing[3] }}>
      <Heading level={2} size={4}>
        {title}
      </Heading>
      {children}
    </View>
  );
}
Section.displayName = "Section";

export function ThemeSection({
  onChange,
  selection,
}: {
  readonly onChange: (selection: ThemeSelection) => void;
  readonly selection: ThemeSelection;
}) {
  return (
    <Section title="Theme">
      <Row>
        {themeSelections.map((value) => (
          <Button
            key={value}
            onPress={() => {
              onChange(value);
            }}
            size="sm"
            variant={value === selection ? "default" : "outline"}
          >
            {value[0]?.toUpperCase() + value.slice(1)}
          </Button>
        ))}
      </Row>
    </Section>
  );
}

export function FoundationSection({
  onPress,
  presses,
}: {
  readonly onPress: () => void;
  readonly presses: number;
}) {
  return (
    <Section title="Foundation">
      <Row>
        <Button onPress={onPress}>Primary action</Button>
        <Badge variant="secondary">Experimental</Badge>
        <Avatar accessibilityLabel="Ada Lovelace">
          <AvatarFallback>
            <Text>AL</Text>
          </AvatarFallback>
        </Avatar>
        <StatusIndicator label="Operational" tone="success" />
        <Spinner accessibilityLabel="Loading" />
      </Row>
      <Text size="lead">Native semantic tokens</Text>
      <Text size="small" tone="muted">
        Interaction count: {presses}
      </Text>
      <Separator />
    </Section>
  );
}

export function FormSection({
  enabled,
  onEnabledChange,
}: {
  readonly enabled: boolean;
  readonly onEnabledChange: (value: boolean) => void;
}) {
  return (
    <Section title="Forms and selection">
      <Input accessibilityLabel="Project name" placeholder="Project name" />
      <Textarea accessibilityLabel="Project notes" placeholder="Notes" />
      <SearchBar
        buttonLabel="Search components"
        onSearch={(query) => {
          void query;
        }}
      />
      <Row>
        <Switch
          accessibilityLabel="Enable alerts"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <Checkbox accessibilityLabel="Include archived" defaultChecked />
      </Row>
    </Section>
  );
}

export function DataSection() {
  return (
    <Section title="Data and feedback">
      <Alert>
        <AlertTitle>Build ready</AlertTitle>
        <AlertDescription>Android and iOS bundles are queued.</AlertDescription>
      </Alert>
      <Banner>Source preview · npm canary publication is still gated.</Banner>
      <ProgressBar
        accessibilityLabel="Catalog coverage"
        max={171}
        value={171}
      />
      <DataList
        items={[
          { id: "renderer", label: "Renderer", value: "React Native" },
          {
            id: "availability",
            label: "Availability",
            value: "Repository source",
          },
        ]}
      />
    </Section>
  );
}

export function NavigationSection() {
  return (
    <Section title="Navigation">
      <Tabs accessibilityLabel="Catalog views" defaultValue="components">
        <TabsList accessibilityLabel="Catalog views">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <Text>171 native modules</Text>
        </TabsContent>
        <TabsContent value="contracts">
          <Text>Portable and native-adapted</Text>
        </TabsContent>
      </Tabs>
    </Section>
  );
}

export function OverlaySection() {
  return (
    <Section title="Overlay">
      <Dialog
        closeLabel="Close details"
        open={false}
        title="Native modal contract"
      >
        <Text>
          Back handling, accessibility escape, and safe-area injection.
        </Text>
      </Dialog>
      <Text size="small" tone="muted">
        Overlay behavior is exercised by the native Jest suite.
      </Text>
    </Section>
  );
}

export function CompositeSection() {
  return (
    <Section title="Interactive composites">
      <Accordion defaultOpenIds={["coverage"]}>
        <AccordionItem id="coverage">
          <AccordionTrigger label="What does native support cover?" />
          <AccordionContent>
            <Text>
              Forms, navigation, overlays, AI workflows, learning, and motion.
            </Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem id="boundary">
          <AccordionTrigger label="Is this the web renderer?" />
          <AccordionContent>
            <Text>No. Every module uses React Native primitives.</Text>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Checklist
        defaultCheckedIds={["tokens"]}
        items={[
          {
            description: "Shared semantic values, generated per renderer.",
            id: "tokens",
            label: "Design tokens",
          },
          {
            description: "Roles, state, labels, and 44-point controls.",
            id: "accessibility",
            label: "Native accessibility",
          },
        ]}
        labels={{
          allCompleted: "Catalog review complete",
          item: (item, checked) =>
            `${checked ? "Reopen" : "Complete"} ${item.label}`,
          progress: (checked, total) =>
            `${checked} of ${total} modules reviewed`,
        }}
        title="Release review"
      />
      <AIChatInput
        defaultValue="Summarize native support"
        helperText="Submission stays in the host application."
        inputLabel="Message"
        onSubmit={(message) => {
          void message;
        }}
        submitLabel="Send message"
      />
      <Row>
        <Text tone="muted">Animated module count</Text>
        <NumberTicker accessibilityLabel="171 native modules" value={171} />
      </Row>
    </Section>
  );
}

export function CardSection({ onPress }: { readonly onPress: () => void }) {
  const theme = useTheme();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Renderer boundary</CardTitle>
        <CardDescription>
          Native components share tokens without importing the web renderer.
        </CardDescription>
      </CardHeader>
      <CardContent style={{ gap: theme.spacing[2] }}>
        <Text>React Native core primitives and accessibility APIs.</Text>
        <EmptyState
          description="No DOM, Radix, Tailwind, or browser globals."
          title="Platform correct"
        />
      </CardContent>
      <CardFooter>
        <Button onPress={onPress}>Try interaction</Button>
      </CardFooter>
    </Card>
  );
}
