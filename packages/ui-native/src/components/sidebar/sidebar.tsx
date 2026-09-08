import type { Ref } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import {
  defaultLinkingService,
  type LinkingService,
} from "../../primitives/platform-services";
import { isSingleSelected } from "../../primitives/selection";
import { useTheme } from "../../theme/theme-provider";
import { useSidebar } from "../sidebar-provider/sidebar-provider";
import { Text } from "../text/text";

/** One native sidebar destination. */
export type SidebarItem = {
  readonly disabled?: boolean;
  readonly href?: string;
  readonly id: string;
  readonly label: string;
};

/** One labeled native sidebar section. */
export type SidebarSection = {
  readonly id: string;
  readonly items: readonly SidebarItem[];
  readonly label?: string;
};

/** Props for native sidebar presentation. */
export type SidebarProps = Omit<ViewProps, "children" | "ref"> & {
  readonly currentId?: string;
  readonly label?: string;
  readonly linking?: LinkingService;
  readonly onNavigate?: (item: SidebarItem) => void;
  readonly onOpenError?: (error: unknown, item: SidebarItem) => void;
  readonly ref?: Ref<View>;
  readonly sections: readonly SidebarSection[];
};

const styles = StyleSheet.create({
  item: { justifyContent: "center", minHeight: 44, minWidth: 44 },
  root: { borderRightWidth: 1, flex: 1 },
});

/** Native sidebar driven by provider state and caller-owned navigation. */
function Sidebar({
  currentId,
  label = "Sidebar navigation",
  linking = defaultLinkingService,
  onNavigate,
  onOpenError,
  ref,
  sections,
  style,
  ...props
}: SidebarProps) {
  const theme = useTheme();
  const { open, presentation } = useSidebar();
  if (!open) return null;
  const compact = presentation === "compact";

  return (
    <View
      {...props}
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityRole="none"
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          borderRightColor: theme.colors.border,
          padding: compact ? theme.spacing[2] : theme.spacing[4],
          width: compact ? 72 : 256,
        },
        style,
      ]}
    >
      <ScrollView contentContainerStyle={{ gap: theme.spacing[4] }}>
        {sections.map((section) => (
          <View key={section.id} style={{ gap: theme.spacing[1] }}>
            {!compact && section.label ? (
              <Text size="caption" tone="muted" weight="semibold">
                {section.label}
              </Text>
            ) : null}
            {section.items.map((item) => {
              const current = isSingleSelected(
                currentId,
                item,
                (candidate) => candidate.id,
              );
              return (
                <Pressable
                  accessibilityLabel={item.label}
                  accessibilityRole={item.href ? "link" : "button"}
                  accessibilityState={{
                    disabled: item.disabled,
                    selected: current,
                  }}
                  disabled={item.disabled}
                  key={item.id}
                  onPress={() => {
                    onNavigate?.(item);
                    if (item.href) {
                      void linking
                        .openUrl(item.href)
                        .then(undefined, (error: unknown) => {
                          onOpenError?.(error, item);
                        });
                    }
                  }}
                  style={({ pressed }) => [
                    styles.item,
                    {
                      alignItems: compact ? "center" : "flex-start",
                      backgroundColor: current
                        ? theme.colors.accent
                        : pressed
                          ? theme.colors.muted
                          : "transparent",
                      borderRadius: theme.radius.md,
                      opacity: item.disabled ? 0.5 : pressed ? 0.8 : 1,
                      paddingHorizontal: compact
                        ? theme.spacing[2]
                        : theme.spacing[3],
                    },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    size="small"
                    tone={current ? "default" : "muted"}
                    weight={current ? "medium" : "normal"}
                  >
                    {compact ? item.label.slice(0, 1) : item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
Sidebar.displayName = "Sidebar";

export { Sidebar };
