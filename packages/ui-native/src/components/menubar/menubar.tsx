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
  menuItem: { justifyContent: "center", minHeight: 44, minWidth: 44 },
  root: { borderWidth: 1, flexDirection: "row" },
  sheet: { flex: 1, justifyContent: "flex-end" },
  surface: { borderWidth: 1 },
});

/** Native menubar whose commands use callbacks or an injected link service. */
function Menubar({
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

  return (
    <View
      {...props}
      accessibilityLabel={props.accessibilityLabel ?? label}
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
        {activeMenu ? (
          <View
            accessibilityLabel={activeMenu.label}
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
          </View>
        ) : null}
      </ModalLayer>
    </View>
  );
}
Menubar.displayName = "Menubar";

export { Menubar };
