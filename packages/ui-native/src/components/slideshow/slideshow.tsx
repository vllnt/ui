"use client";

import { useState } from "react";

import type { ReactNode, Ref } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import {
  ModalLayer,
  type ModalLayerCloseReason,
  type ModalLayerPresentationProps,
} from "../../primitives/modal-layer";
import { useControllableState } from "../../primitives/use-controllable-state";
import type { ReducedMotionService } from "../../primitives/use-reduced-motion";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Caller-identified native slideshow section. */
export type SlideshowSection = {
  readonly content: ReactNode;
  readonly id: string;
  readonly title: string;
};

/** Localized labels for all native slideshow actions. */
export type SlideshowLabels = {
  readonly closeSections: string;
  readonly exit: string;
  readonly finish: string;
  readonly markComplete: string;
  readonly markIncomplete: string;
  readonly next: string;
  readonly openSections: string;
  readonly position: (index: number, total: number) => string;
  readonly previous: string;
  readonly sections: string;
};

/** Props for a native modal slideshow with caller-owned completion state. */
export type SlideshowProps = ModalLayerPresentationProps & {
  readonly completedIds: ReadonlySet<string>;
  readonly currentSectionId?: string;
  readonly defaultCurrentSectionId?: string;
  readonly defaultOpen?: boolean;
  readonly labels: SlideshowLabels;
  readonly onComplete: () => void;
  readonly onCurrentSectionIdChange?: (id: string) => void;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly onToggleComplete: (id: string) => void;
  readonly open?: boolean;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
  readonly sections: readonly SlideshowSection[];
  readonly surfaceProps?: Omit<ViewProps, "children" | "ref">;
  readonly title: string;
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  content: { flex: 1 },
  footer: {
    alignItems: "center",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progress: { height: 4, overflow: "hidden", width: "100%" },
  progressFill: { height: 4 },
  sectionAction: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 44,
    width: "100%",
  },
  surface: { flex: 1 },
  titleBlock: { flex: 1 },
  toc: { borderBottomWidth: 1 },
});

function SlideshowHeader({
  labels,
  onExit,
  onToggleSections,
  position,
  sectionsOpen,
  sectionTitle,
  title,
}: {
  readonly labels: SlideshowLabels;
  readonly onExit: () => void;
  readonly onToggleSections: () => void;
  readonly position: string;
  readonly sectionsOpen: boolean;
  readonly sectionTitle: string;
  readonly title: string;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.header,
        {
          borderBottomColor: theme.colors.border,
          gap: theme.spacing[2],
          padding: theme.spacing[3],
        },
      ]}
    >
      <Pressable
        accessibilityLabel={
          sectionsOpen ? labels.closeSections : labels.openSections
        }
        accessibilityRole="button"
        accessibilityState={{ expanded: sectionsOpen }}
        onPress={onToggleSections}
        style={styles.action}
      >
        <Text style={{ color: theme.colors.foreground }}>
          {sectionsOpen ? "−" : "+"}
        </Text>
      </Pressable>
      <View style={[styles.titleBlock, { gap: theme.spacing[1] }]}>
        <Text
          numberOfLines={1}
          style={[
            theme.typography.scale.caption,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {title}
        </Text>
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          style={[
            theme.typography.scale.bodySmall,
            {
              color: theme.colors.foreground,
              fontWeight: theme.typography.fontWeight.caption,
            },
          ]}
        >
          {sectionTitle}
        </Text>
      </View>
      <Text
        style={[
          theme.typography.scale.caption,
          { color: theme.colors.mutedForeground },
        ]}
      >
        {position}
      </Text>
      <Pressable
        accessibilityLabel={labels.exit}
        accessibilityRole="button"
        onPress={onExit}
        style={styles.action}
      >
        <Text style={{ color: theme.colors.foreground }}>{labels.exit}</Text>
      </Pressable>
    </View>
  );
}
SlideshowHeader.displayName = "SlideshowHeader";

function SlideshowSections({
  completedIds,
  currentIndex,
  labels,
  onNavigate,
  sections,
}: {
  readonly completedIds: ReadonlySet<string>;
  readonly currentIndex: number;
  readonly labels: SlideshowLabels;
  readonly onNavigate: (id: string) => void;
  readonly sections: readonly SlideshowSection[];
}) {
  const theme = useTheme();
  return (
    <View
      accessibilityLabel={labels.sections}
      accessibilityRole="list"
      style={[
        styles.toc,
        { borderBottomColor: theme.colors.border, padding: theme.spacing[2] },
      ]}
    >
      {sections.map((section, index) => {
        const completed = completedIds.has(section.id);
        const selected = index === currentIndex;
        return (
          <Pressable
            accessibilityLabel={section.title}
            accessibilityRole="button"
            accessibilityState={{ checked: completed, selected }}
            key={section.id}
            onPress={() => {
              onNavigate(section.id);
            }}
            style={[
              styles.sectionAction,
              {
                backgroundColor: selected
                  ? theme.colors.accent
                  : theme.colors.background,
                borderRadius: theme.radius.md,
                paddingHorizontal: theme.spacing[3],
              },
            ]}
          >
            <Text
              style={[
                theme.typography.scale.bodySmall,
                { color: theme.colors.foreground },
              ]}
            >
              {section.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
SlideshowSections.displayName = "SlideshowSections";

function SlideshowFooter({
  completed,
  isFirst,
  isLast,
  labels,
  onNext,
  onPrevious,
  onToggleComplete,
}: {
  readonly completed: boolean;
  readonly isFirst: boolean;
  readonly isLast: boolean;
  readonly labels: SlideshowLabels;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
  readonly onToggleComplete: () => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.footer,
        {
          borderTopColor: theme.colors.border,
          gap: theme.spacing[2],
          padding: theme.spacing[3],
        },
      ]}
    >
      <Pressable
        accessibilityLabel={labels.previous}
        accessibilityRole="button"
        accessibilityState={{ disabled: isFirst }}
        disabled={isFirst}
        onPress={onPrevious}
        style={[styles.action, { opacity: isFirst ? 0.5 : 1 }]}
      >
        <Text style={{ color: theme.colors.foreground }}>
          {labels.previous}
        </Text>
      </Pressable>
      <Pressable
        accessibilityLabel={
          completed ? labels.markIncomplete : labels.markComplete
        }
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        onPress={onToggleComplete}
        style={styles.action}
      >
        <Text style={{ color: theme.colors.foreground }}>
          {completed ? labels.markIncomplete : labels.markComplete}
        </Text>
      </Pressable>
      <Pressable
        accessibilityLabel={isLast ? labels.finish : labels.next}
        accessibilityRole="button"
        onPress={onNext}
        style={[
          styles.action,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing[4],
          },
        ]}
      >
        <Text style={{ color: theme.colors.primaryForeground }}>
          {isLast ? labels.finish : labels.next}
        </Text>
      </Pressable>
    </View>
  );
}
SlideshowFooter.displayName = "SlideshowFooter";

/**
 * Full-screen native modal slideshow using the shared back, accessibility
 * escape, safe-area, and reduced-motion boundaries. Completion stays caller-owned.
 */
function Slideshow({
  completedIds,
  currentSectionId,
  defaultCurrentSectionId,
  defaultOpen = false,
  labels,
  onComplete,
  onCurrentSectionIdChange,
  onOpenChange,
  onRequestClose,
  onToggleComplete,
  open,
  reducedMotionService,
  ref,
  safeArea,
  sections,
  surfaceProps,
  title,
  ...presentationProps
}: SlideshowProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const [visible, setVisible] = useControllableState(
    open === undefined
      ? {
          defaultValue: defaultOpen,
          mode: "uncontrolled",
          onChange: onOpenChange,
        }
      : { mode: "controlled", onChange: onOpenChange, value: open },
  );
  const [selection, setSelection] = useControllableState(
    currentSectionId === undefined
      ? {
          defaultValue: defaultCurrentSectionId ?? sections[0]?.id ?? "",
          mode: "uncontrolled",
          onChange: onCurrentSectionIdChange,
        }
      : {
          mode: "controlled",
          onChange: onCurrentSectionIdChange,
          value: currentSectionId,
        },
  );
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const foundIndex = sections.findIndex((section) => section.id === selection);
  const currentIndex = foundIndex < 0 ? 0 : foundIndex;
  const current = sections[currentIndex];
  const close = (reason: ModalLayerCloseReason) => {
    setVisible(false);
    onRequestClose?.(reason);
  };
  if (!current) return null;
  const completed = completedIds.has(current.id);
  const progress = (currentIndex + 1) / sections.length;

  return (
    <ModalLayer
      {...presentationProps}
      animationType={
        reduceMotion ? "none" : (presentationProps.animationType ?? "fade")
      }
      contentProps={{ style: styles.content }}
      keyboardAvoidingViewProps={{ style: styles.content }}
      onClose={close}
      ref={ref}
      safeArea={safeArea}
      visible={visible}
    >
      <View
        {...surfaceProps}
        accessibilityLabel={title}
        style={[
          styles.surface,
          { backgroundColor: theme.colors.background },
          surfaceProps?.style,
        ]}
      >
        <View
          style={[styles.progress, { backgroundColor: theme.colors.muted }]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.colors.primary,
                width: `${progress * 100}%`,
              },
            ]}
          />
        </View>
        <SlideshowHeader
          labels={labels}
          onExit={() => {
            close("requestClose");
          }}
          onToggleSections={() => {
            setSectionsOpen(!sectionsOpen);
          }}
          position={labels.position(currentIndex + 1, sections.length)}
          sectionsOpen={sectionsOpen}
          sectionTitle={current.title}
          title={title}
        />
        {sectionsOpen ? (
          <SlideshowSections
            completedIds={completedIds}
            currentIndex={currentIndex}
            labels={labels}
            onNavigate={(id) => {
              setSelection(id);
              setSectionsOpen(false);
            }}
            sections={sections}
          />
        ) : null}
        <ScrollView
          contentContainerStyle={{ padding: theme.spacing[6] }}
          style={styles.content}
        >
          {current.content}
        </ScrollView>
        <SlideshowFooter
          completed={completed}
          isFirst={currentIndex === 0}
          isLast={currentIndex === sections.length - 1}
          labels={labels}
          onNext={() => {
            const next = sections[currentIndex + 1];
            if (next) setSelection(next.id);
            else onComplete();
          }}
          onPrevious={() => {
            const previous = sections[currentIndex - 1];
            if (previous) setSelection(previous.id);
          }}
          onToggleComplete={() => {
            onToggleComplete(current.id);
          }}
        />
      </View>
    </ModalLayer>
  );
}
Slideshow.displayName = "Slideshow";

export { Slideshow };
