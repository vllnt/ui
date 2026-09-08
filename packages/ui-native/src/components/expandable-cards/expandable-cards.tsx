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

/** Caller-identified expandable native card. */
export type ExpandableCardItem = {
  readonly content: ReactNode;
  readonly description?: string;
  readonly id: string;
  readonly title: string;
};

/** Localized labels for expandable cards. */
export type ExpandableCardsLabels = {
  readonly collapseCard: (item: ExpandableCardItem) => string;
  readonly expandCard: (item: ExpandableCardItem) => string;
  readonly region: string;
};

/** Props for a controlled or uncontrolled stack of native cards. */
export type ExpandableCardsProps = Omit<ViewProps, "children" | "ref"> & {
  readonly cards: readonly ExpandableCardItem[];
  readonly defaultExpandedId?: null | string;
  readonly expandedId?: null | string;
  readonly labels: ExpandableCardsLabels;
  readonly onExpandedIdChange?: (id: null | string) => void;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, overflow: "hidden" },
  root: { width: "100%" },
  trigger: { alignItems: "flex-start", width: "100%" },
});

function ExpandableCard({
  card,
  expanded,
  labels,
  onExpandedChange,
  reducedMotionService,
}: {
  readonly card: ExpandableCardItem;
  readonly expanded: boolean;
  readonly labels: ExpandableCardsLabels;
  readonly onExpandedChange: (expanded: boolean) => void;
  readonly reducedMotionService?: ReducedMotionService;
}) {
  const theme = useTheme();
  return (
    <Collapsible
      id={card.id}
      onOpenChange={onExpandedChange}
      open={expanded}
      reducedMotionService={reducedMotionService}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
        },
      ]}
    >
      <CollapsibleTrigger
        label={expanded ? labels.collapseCard(card) : labels.expandCard(card)}
        style={{ padding: theme.spacing[4] }}
      >
        <View style={[styles.trigger, { gap: theme.spacing[1] }]}>
          <Text
            style={[
              theme.typography.scale.body,
              {
                color: theme.colors.cardForeground,
                fontWeight: theme.typography.fontWeight.caption,
              },
            ]}
          >
            {card.title}
          </Text>
          {card.description === undefined ? null : (
            <Text
              style={[
                theme.typography.scale.bodySmall,
                { color: theme.colors.mutedForeground },
              ]}
            >
              {card.description}
            </Text>
          )}
        </View>
      </CollapsibleTrigger>
      <CollapsibleContent style={{ padding: theme.spacing[4], paddingTop: 0 }}>
        {card.content}
      </CollapsibleContent>
    </Collapsible>
  );
}
ExpandableCard.displayName = "ExpandableCard";

/** Native single-expansion card stack with caller-owned card identities. */
function ExpandableCards({
  cards,
  defaultExpandedId = null,
  expandedId,
  labels,
  onExpandedIdChange,
  reducedMotionService,
  ref,
  style,
  ...props
}: ExpandableCardsProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useControllableState(
    expandedId === undefined
      ? {
          defaultValue: defaultExpandedId,
          mode: "uncontrolled",
          onChange: onExpandedIdChange,
        }
      : { mode: "controlled", onChange: onExpandedIdChange, value: expandedId },
  );
  return (
    <View
      {...props}
      accessibilityLabel={labels.region}
      accessibilityRole="list"
      ref={ref}
      style={[styles.root, { gap: theme.spacing[3] }, style]}
    >
      {cards.map((card) => (
        <ExpandableCard
          card={card}
          expanded={expanded === card.id}
          key={card.id}
          labels={labels}
          onExpandedChange={(next) => {
            setExpanded(next ? card.id : null);
          }}
          reducedMotionService={reducedMotionService}
        />
      ))}
    </View>
  );
}
ExpandableCards.displayName = "ExpandableCards";

export { ExpandableCards };
