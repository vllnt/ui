"use client";

import type { ReactNode, Ref } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  type Text as NativeTextInstance,
  View,
  type ViewProps,
} from "react-native";

import {
  decorativeProps,
  useFocusWhenShown,
} from "../../primitives/accessibility";
import {
  ModalLayer,
  type ModalLayerPresentationProps,
} from "../../primitives/modal-layer";
import {
  defaultLinkingService,
  type LinkingService,
} from "../../primitives/platform-services";
import { isSingleSelected } from "../../primitives/selection";
import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** One command in a native menubar menu. */
export type MenubarItem = {
  readonly disabled?: boolean;
  readonly href?: string;
  readonly id: string;
  readonly label: string;
};

/** One top-level native menu. */
export type MenubarMenu = {
  readonly disabled?: boolean;
  readonly id: string;
  readonly items: readonly MenubarItem[];
  readonly label: string;
};

/** Props for the native modal menubar contract. */
export type MenubarProps = Omit<ViewProps, "children" | "ref"> & {
  /** Name of the button that closes an open menu sheet. Defaults to "Close". */
  readonly closeLabel?: string;
  readonly defaultOpenMenuId?: string;
  readonly label?: string;
  readonly linking?: LinkingService;
  readonly menus: readonly MenubarMenu[];
  readonly modalProps?: ModalLayerPresentationProps;
  readonly onItemSelect?: (item: MenubarItem, menu: MenubarMenu) => void;
  readonly onOpenError?: (
    error: unknown,
    item: MenubarItem,
    menu: MenubarMenu,
  ) => void;
  readonly onOpenMenuChange?: (id: string) => void;
  readonly openMenuId?: string;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
};

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  close: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  heading: { paddingHorizontal: 12, paddingTop: 4 },
  menuItem: { justifyContent: "center", minHeight: 44, minWidth: 44 },
  root: { borderWidth: 1, flexDirection: "row" },
  sheet: { flex: 1, justifyContent: "flex-end" },
  surface: { borderWidth: 1 },
});

/**
 * Native menubar whose commands use callbacks or an injected link service.
 * VoiceOver ignores labels on non-focusable containers, so the menubar name
 * becomes each menu button's hint. An open menu shows its name as a header
 * (also announced) and closes from its close button, the backdrop, or the
 * platform escape gesture.
 */
function Menubar({
  accessibilityLabel,
  closeLabel = "Close",
  defaultOpenMenuId = "",
  label = "Menu bar",
  linking = defaultLinkingService,
  menus,
  modalProps,
  onItemSelect,
  onOpenError,
  onOpenMenuChange,
  openMenuId,
  ref,
  safeArea,
  style,
  ...props
}: MenubarProps) {
  const theme = useTheme();
  const stateOptions: ControllableStateOptions<string> =
    openMenuId === undefined
      ? {
          defaultValue: defaultOpenMenuId,
          mode: "uncontrolled",
          onChange: onOpenMenuChange,
        }
      : {
          mode: "controlled",
          onChange: onOpenMenuChange,
          value: openMenuId,
        };
  const [activeId, setActiveId] = useControllableState(stateOptions);
  const activeMenu = menus.find((menu) =>
    isSingleSelected(activeId, menu, (candidate) => candidate.id),
  );
  const headingRef = useFocusWhenShown<NativeTextInstance>(
    activeMenu !== undefined,
  );

  return (
    <View
      {...props}
      accessibilityRole="toolbar"
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          gap: theme.spacing[1],
          padding: theme.spacing[1],
        },
        style,
      ]}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {menus.map((menu) => {
          const expanded = isSingleSelected(
            activeId,
            menu,
            (candidate) => candidate.id,
          );
          return (
            <Pressable
              accessibilityHint={accessibilityLabel ?? label}
              accessibilityRole="button"
              accessibilityState={{ disabled: menu.disabled, expanded }}
              disabled={menu.disabled}
              key={menu.id}
              onPress={() => {
                setActiveId(expanded ? "" : menu.id);
              }}
              style={({ pressed }) => [
                styles.menuItem,
                {
                  backgroundColor: expanded
                    ? theme.colors.accent
                    : pressed
                      ? theme.colors.muted
                      : "transparent",
                  borderRadius: theme.radius.sm,
                  opacity: menu.disabled ? 0.5 : pressed ? 0.8 : 1,
                  paddingHorizontal: theme.spacing[3],
                },
              ]}
            >
              <Text size="small" weight="medium">
                {menu.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <ModalLayer
        {...modalProps}
        contentProps={{ style: styles.sheet }}
        onClose={() => {
          setActiveId("");
        }}
        safeArea={safeArea}
        visible={activeMenu !== undefined}
      >
        <Pressable
          {...decorativeProps}
          accessible={false}
          onPress={() => {
            setActiveId("");
          }}
          style={styles.backdrop}
        />
        {activeMenu ? (
          <View
            accessibilityRole="menu"
            style={[
              styles.surface,
              {
                backgroundColor: theme.colors.popover,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
                gap: theme.spacing[1],
                padding: theme.spacing[2],
              },
            ]}
          >
            <Text
              accessibilityRole="header"
              ref={headingRef}
              size="small"
              style={styles.heading}
              weight="semibold"
            >
              {activeMenu.label}
            </Text>
            {activeMenu.items.map((item) => (
              <Pressable
                accessibilityRole={item.href ? "link" : "menuitem"}
                accessibilityState={{ disabled: item.disabled }}
                disabled={item.disabled}
                key={item.id}
                onPress={() => {
                  onItemSelect?.(item, activeMenu);
                  if (item.href) {
                    void linking
                      .openUrl(item.href)
                      .then(undefined, (error: unknown) => {
                        onOpenError?.(error, item, activeMenu);
                      });
                  }
                  setActiveId("");
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  {
                    backgroundColor: pressed
                      ? theme.colors.accent
                      : "transparent",
                    borderRadius: theme.radius.sm,
                    opacity: item.disabled ? 0.5 : pressed ? 0.8 : 1,
                    paddingHorizontal: theme.spacing[3],
                  },
                ]}
              >
                <Text size="small">{item.label}</Text>
              </Pressable>
            ))}
            <Pressable
              accessibilityLabel={closeLabel}
              accessibilityRole="button"
              onPress={() => {
                setActiveId("");
              }}
              style={({ pressed }) => [
                styles.close,
                {
                  backgroundColor: theme.colors.secondary,
                  borderRadius: theme.radius.md,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                size="small"
                style={{ color: theme.colors.secondaryForeground }}
              >
                {closeLabel}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ModalLayer>
    </View>
  );
}
Menubar.displayName = "Menubar";

export { Menubar };
