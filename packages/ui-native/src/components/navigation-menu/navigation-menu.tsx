"use client";

import type { ReactNode, Ref } from "react";
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
import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** One item in a native navigation menu. */
export type NavigationMenuItem = {
  readonly disabled?: boolean;
  readonly href?: string;
  readonly id: string;
  readonly label: string;
  readonly panel?: ReactNode;
};

/** Props for presentation-only native navigation. */
export type NavigationMenuProps = Omit<ViewProps, "children" | "ref"> & {
  readonly currentId?: string;
  readonly defaultOpenId?: string;
  readonly items: readonly NavigationMenuItem[];
  readonly label?: string;
  readonly linking?: LinkingService;
  readonly onNavigate?: (item: NavigationMenuItem) => void;
  readonly onOpenChange?: (id: string) => void;
  readonly onOpenError?: (error: unknown, item: NavigationMenuItem) => void;
  readonly openId?: string;
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  list: { flexDirection: "row" },
  trigger: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
});

function navigationRole(item: NavigationMenuItem): "button" | "link" {
  if (item.panel !== undefined) return "button";
  return item.href ? "link" : "button";
}

/** Native navigation menu using callbacks or an injected link service. */
function NavigationMenu({
  currentId,
  defaultOpenId = "",
  items,
  label = "Primary navigation",
  linking = defaultLinkingService,
  onNavigate,
  onOpenChange,
  onOpenError,
  openId,
  ref,
  style,
  ...props
}: NavigationMenuProps) {
  const theme = useTheme();
  const stateOptions: ControllableStateOptions<string> =
    openId === undefined
      ? {
          defaultValue: defaultOpenId,
          mode: "uncontrolled",
          onChange: onOpenChange,
        }
      : { mode: "controlled", onChange: onOpenChange, value: openId };
  const [expandedId, setExpandedId] = useControllableState(stateOptions);
  const expandedItem = items.find((item) =>
    isSingleSelected(expandedId, item, (candidate) => candidate.id),
  );

  const activate = (item: NavigationMenuItem) => {
    if (item.panel !== undefined) {
      const expanded = isSingleSelected(
        expandedId,
        item,
        (candidate) => candidate.id,
      );
      setExpandedId(expanded ? "" : item.id);
      return;
    }
    onNavigate?.(item);
    if (item.href) {
      void linking.openUrl(item.href).then(undefined, (error: unknown) => {
        onOpenError?.(error, item);
      });
    }
  };

  return (
    <View
      {...props}
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityRole="none"
      ref={ref}
      style={style}
    >
      <ScrollView
        contentContainerStyle={[styles.list, { gap: theme.spacing[1] }]}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {items.map((item) => {
          const current = isSingleSelected(
            currentId,
            item,
            (candidate) => candidate.id,
          );
          const expanded =
            item.panel !== undefined &&
            isSingleSelected(expandedId, item, (candidate) => candidate.id);
          return (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole={navigationRole(item)}
              accessibilityState={{
                disabled: item.disabled,
                expanded: item.panel === undefined ? undefined : expanded,
                selected: current,
              }}
              disabled={item.disabled}
              key={item.id}
              onPress={() => {
                activate(item);
              }}
              style={({ pressed }) => [
                styles.trigger,
                {
                  backgroundColor:
                    current || expanded
                      ? theme.colors.accent
                      : pressed
                        ? theme.colors.muted
                        : "transparent",
                  borderRadius: theme.radius.md,
                  opacity: item.disabled ? 0.5 : pressed ? 0.8 : 1,
                  paddingHorizontal: theme.spacing[4],
                },
              ]}
            >
              <Text
                size="small"
                tone={current || expanded ? "default" : "muted"}
                weight="medium"
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {expandedItem?.panel === undefined ? null : (
        <View
          style={{
            backgroundColor: theme.colors.popover,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            marginTop: theme.spacing[2],
            padding: theme.spacing[4],
          }}
        >
          {expandedItem.panel}
        </View>
      )}
    </View>
  );
}
NavigationMenu.displayName = "NavigationMenu";

export { NavigationMenu };
