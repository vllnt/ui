"use client";

import {
  createContext,
  type ReactNode,
  type Ref,
  use,
  useCallback,
  useMemo,
} from "react";

import { StyleSheet, Text, View, type ViewProps } from "react-native";

import { useControllableState } from "../../primitives/use-controllable-state";
import type { ReducedMotionService } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";
import {
  Collapsible,
  CollapsibleContent,
  type CollapsibleContentProps,
  CollapsibleTrigger,
  type CollapsibleTriggerProps,
} from "../collapsible/collapsible";

/** Props for controlled or uncontrolled native accordion state. */
export type AccordionProps = Omit<ViewProps, "children" | "ref"> & {
  readonly children: ReactNode;
  readonly defaultOpenIds?: readonly string[];
  readonly onOpenIdsChange?: (ids: readonly string[]) => void;
  readonly openIds?: readonly string[];
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<View>;
  readonly type?: "multiple" | "single";
};

/** Props for one caller-identified accordion item. */
export type AccordionItemProps = Omit<ViewProps, "children" | "ref"> & {
  readonly children: ReactNode;
  readonly id: string;
  readonly ref?: Ref<View>;
};

/** Props for an accordion item's localized disclosure control. */
export type AccordionTriggerProps = Omit<
  CollapsibleTriggerProps,
  "children" | "label"
> & {
  readonly icon?: ReactNode;
  readonly label: string;
};

/** Props for an accordion item's revealed content. */
export type AccordionContentProps = CollapsibleContentProps;

type AccordionContextValue = {
  readonly isOpen: (id: string) => boolean;
  readonly reducedMotionService?: ReducedMotionService;
  readonly toggle: (id: string) => void;
};

type AccordionItemContextValue = { readonly id: string };

const AccordionContext = createContext<AccordionContextValue | undefined>(
  undefined,
);
const AccordionItemContext = createContext<
  AccordionItemContextValue | undefined
>(undefined);

function useAccordion(): AccordionContextValue {
  const context = use(AccordionContext);
  if (!context) throw new Error("AccordionItem must be used within Accordion");
  return context;
}

function useAccordionItem(): AccordionItemContextValue {
  const context = use(AccordionItemContext);
  if (!context)
    throw new Error("Accordion parts must be used within AccordionItem");
  return context;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 16, paddingHorizontal: 16 },
  item: { borderBottomWidth: 1 },
  root: { borderWidth: 1, overflow: "hidden" },
  triggerContent: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

/** Native accordion supporting single or concurrent controlled disclosures. */
function Accordion({
  children,
  defaultOpenIds = [],
  onOpenIdsChange,
  openIds,
  reducedMotionService,
  ref,
  style,
  type = "single",
  ...props
}: AccordionProps) {
  const theme = useTheme();
  const [expandedIds, setExpandedIds] = useControllableState(
    openIds === undefined
      ? {
          defaultValue: defaultOpenIds,
          mode: "uncontrolled",
          onChange: onOpenIdsChange,
        }
      : { mode: "controlled", onChange: onOpenIdsChange, value: openIds },
  );
  const toggle = useCallback(
    (id: string) => {
      const open = expandedIds.includes(id);
      const next = open
        ? expandedIds.filter((candidate) => candidate !== id)
        : type === "single"
          ? [id]
          : [...expandedIds, id];
      setExpandedIds(next);
    },
    [expandedIds, setExpandedIds, type],
  );
  const value = useMemo(
    () => ({
      isOpen: (id: string) => expandedIds.includes(id),
      reducedMotionService,
      toggle,
    }),
    [expandedIds, reducedMotionService, toggle],
  );

  return (
    <AccordionContext value={value}>
      <View
        {...props}
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
        {children}
      </View>
    </AccordionContext>
  );
}
Accordion.displayName = "Accordion";

/** Caller-identified item boundary for native accordion parts. */
function AccordionItem({
  children,
  id,
  ref,
  style,
  ...props
}: AccordionItemProps) {
  const accordion = useAccordion();
  const item = useMemo(() => ({ id }), [id]);
  return (
    <AccordionItemContext value={item}>
      <Collapsible
        id={id}
        onOpenChange={() => {
          accordion.toggle(id);
        }}
        open={accordion.isOpen(id)}
        reducedMotionService={accordion.reducedMotionService}
      >
        <View
          {...props}
          ref={ref}
          style={[
            styles.item,
            { borderBottomColor: useTheme().colors.border },
            style,
          ]}
        >
          {children}
        </View>
      </Collapsible>
    </AccordionItemContext>
  );
}
AccordionItem.displayName = "AccordionItem";

/** Localized 44-point accordion disclosure trigger. */
function AccordionTrigger({
  icon,
  label,
  style,
  ...props
}: AccordionTriggerProps) {
  useAccordionItem();
  const theme = useTheme();
  return (
    <CollapsibleTrigger
      {...props}
      label={label}
      style={(state) => [
        { paddingHorizontal: theme.spacing[4] },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <View style={styles.triggerContent}>
        <Text
          style={[
            theme.typography.scale.bodySmall,
            {
              color: theme.colors.cardForeground,
              fontWeight: theme.typography.fontWeight.caption,
            },
          ]}
        >
          {label}
        </Text>
        {icon}
      </View>
    </CollapsibleTrigger>
  );
}
AccordionTrigger.displayName = "AccordionTrigger";

/** Accordion panel removed from native layout while collapsed. */
function AccordionContent({ style, ...props }: AccordionContentProps) {
  useAccordionItem();
  const theme = useTheme();
  return (
    <CollapsibleContent
      {...props}
      style={[styles.content, { backgroundColor: theme.colors.card }, style]}
    />
  );
}
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
