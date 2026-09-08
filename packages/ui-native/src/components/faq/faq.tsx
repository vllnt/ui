"use client";

import type { ReactNode, Ref } from "react";
import { StyleSheet, Text, View, type ViewProps } from "react-native";

import { useControllableState } from "../../primitives/use-controllable-state";
import type { ReducedMotionService } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../collapsible/collapsible";

/** Caller-identified native FAQ entry. */
export type FAQItem = {
  readonly answer: ReactNode;
  readonly id: string;
  readonly question: string;
};

/** Localized labels for the FAQ and its disclosure actions. */
export type FAQLabels = {
  readonly collapseAnswer: (item: FAQItem) => string;
  readonly expandAnswer: (item: FAQItem) => string;
  readonly region: string;
};

/** Props for a native FAQ with controlled or uncontrolled open answers. */
export type FAQProps = Omit<ViewProps, "children" | "ref"> & {
  readonly defaultOpenIds?: readonly string[];
  readonly items: readonly FAQItem[];
  readonly labels: FAQLabels;
  readonly onOpenIdsChange?: (ids: readonly string[]) => void;
  readonly openIds?: readonly string[];
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<View>;
  readonly title: string;
};

const styles = StyleSheet.create({
  header: { borderBottomWidth: 1 },
  item: { borderBottomWidth: 1 },
  root: { borderWidth: 1, overflow: "hidden" },
});

function FAQRow({
  item,
  labels,
  onOpenChange,
  open,
  reducedMotionService,
}: {
  readonly item: FAQItem;
  readonly labels: FAQLabels;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly reducedMotionService?: ReducedMotionService;
}) {
  const theme = useTheme();
  return (
    <Collapsible
      id={item.id}
      onOpenChange={onOpenChange}
      open={open}
      reducedMotionService={reducedMotionService}
      style={[styles.item, { borderBottomColor: theme.colors.border }]}
    >
      <CollapsibleTrigger
        label={open ? labels.collapseAnswer(item) : labels.expandAnswer(item)}
        style={{ paddingHorizontal: theme.spacing[4] }}
      >
        <Text
          style={[
            theme.typography.scale.bodySmall,
            {
              color: theme.colors.cardForeground,
              fontWeight: theme.typography.fontWeight.caption,
            },
          ]}
        >
          {item.question}
        </Text>
      </CollapsibleTrigger>
      <CollapsibleContent
        style={{
          paddingBottom: theme.spacing[4],
          paddingHorizontal: theme.spacing[4],
        }}
      >
        {item.answer}
      </CollapsibleContent>
    </Collapsible>
  );
}
FAQRow.displayName = "FAQRow";

/** Native FAQ disclosure list with no hard-coded product copy. */
function FAQ({
  defaultOpenIds = [],
  items,
  labels,
  onOpenIdsChange,
  openIds,
  reducedMotionService,
  ref,
  style,
  title,
  ...props
}: FAQProps) {
  const theme = useTheme();
  const [open, setOpen] = useControllableState(
    openIds === undefined
      ? {
          defaultValue: defaultOpenIds,
          mode: "uncontrolled",
          onChange: onOpenIdsChange,
        }
      : { mode: "controlled", onChange: onOpenIdsChange, value: openIds },
  );
  return (
    <View
      {...props}
      accessibilityLabel={labels.region}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.colors.border, padding: theme.spacing[4] },
        ]}
      >
        <Text
          accessibilityRole="header"
          style={[
            theme.typography.scale.bodyLarge,
            {
              color: theme.colors.cardForeground,
              fontWeight: theme.typography.fontWeight.heading,
            },
          ]}
        >
          {title}
        </Text>
      </View>
      <View accessibilityRole="list">
        {items.map((item) => (
          <FAQRow
            item={item}
            key={item.id}
            labels={labels}
            onOpenChange={(next) => {
              const ids = next
                ? [...open, item.id]
                : open.filter((id) => id !== item.id);
              setOpen(ids);
            }}
            open={open.includes(item.id)}
            reducedMotionService={reducedMotionService}
          />
        ))}
      </View>
    </View>
  );
}
FAQ.displayName = "FAQ";

export { FAQ };
