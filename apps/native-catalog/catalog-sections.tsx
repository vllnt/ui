import {
  Badge,
  Button,
  type ButtonSize,
  type ButtonVariant,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Heading,
  Text,
  type ThemeSelection,
  useTheme,
} from "@vllnt/ui-native";
import type { ReactNode } from "react";
import { View } from "react-native";

const buttonVariants: readonly ButtonVariant[] = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "link",
  "destructive",
];
const buttonSizes: readonly ButtonSize[] = ["sm", "default", "lg", "icon"];
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

export function ButtonSection({
  onPress,
  presses,
}: {
  readonly onPress: () => void;
  readonly presses: number;
}) {
  return (
    <Section title="Buttons">
      <Row>
        {buttonVariants.map((variant) => (
          <Button key={variant} onPress={onPress} variant={variant}>
            {variant[0]?.toUpperCase() + variant.slice(1)}
          </Button>
        ))}
      </Row>
      <Row>
        {buttonSizes.map((size) => (
          <Button
            accessibilityLabel={size === "icon" ? "Add item" : undefined}
            key={size}
            onPress={onPress}
            size={size}
          >
            {size === "icon" ? "+" : size}
          </Button>
        ))}
      </Row>
      <Text size="small" tone="muted">
        Button presses: {presses}
      </Text>
    </Section>
  );
}

export function TypeSection() {
  return (
    <Section title="Type">
      <Heading level={3} size={1}>
        Semantic h3 at h1 size
      </Heading>
      <Text size="lead">Lead body text</Text>
      <Text>Default body text</Text>
      <Text size="small" tone="muted">
        Muted small text
      </Text>
      <Text size="caption" weight="semibold">
        Semibold caption
      </Text>
    </Section>
  );
}

export function BadgeSection() {
  return (
    <Section title="Badges">
      <Row>
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </Row>
    </Section>
  );
}

export function CardSection({ onPress }: { readonly onPress: () => void }) {
  const theme = useTheme();
  return (
    <Card>
      <CardHeader>
        <Badge variant="secondary">Experimental</Badge>
        <CardTitle>Separate native renderer</CardTitle>
        <CardDescription>
          The web API remains intact while native uses platform-correct
          primitives.
        </CardDescription>
      </CardHeader>
      <CardContent style={{ gap: theme.spacing[2] }}>
        <Text>Five pilot components share canonical design tokens.</Text>
        <Text size="small" tone="muted">
          No DOM, Radix, Tailwind, or NativeWind runtime is required.
        </Text>
      </CardContent>
      <CardFooter>
        <Button onPress={onPress}>Try interaction</Button>
      </CardFooter>
    </Card>
  );
}
