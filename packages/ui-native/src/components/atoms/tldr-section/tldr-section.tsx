import { useState } from "react";

import type { ReactNode, Ref } from "react";
import {
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import { decorativeProps } from "../../../primitives/accessibility";
import { InteractivePressable } from "../../../primitives/interactive-pressable";
import { typeStyle } from "../../../primitives/type-style";
import { useTheme } from "../../../theme/theme-provider";

/** Props for the native TLDR disclosure. */
export type TLDRSectionProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly defaultExpanded?: boolean;
  readonly label: string;
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  content: { borderTopWidth: 1 },
  root: { borderWidth: 1, overflow: "hidden", width: "100%" },
  trigger: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function TLDRContent({ children }: { readonly children: ReactNode }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.content,
        {
          borderTopColor: theme.colors.border,
          padding: theme.spacing[4],
        },
      ]}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <NativeText style={typeStyle(theme, "bodySmall", "mutedForeground")}>
          {children}
        </NativeText>
      ) : (
        children
      )}
    </View>
  );
}
TLDRContent.displayName = "TLDRContent";

/** Expandable native summary without decorative loading animation. */
function TLDRSection({
  children,
  defaultExpanded = false,
  label,
  ref,
  style,
  ...props
}: TLDRSectionProps) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.muted,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
        },
        style,
      ]}
    >
      <InteractivePressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        filled
        onPress={() => {
          setIsExpanded((current) => !current);
        }}
        style={[
          styles.trigger,
          {
            backgroundColor: theme.colors.muted,
            paddingHorizontal: theme.spacing[4],
            paddingVertical: theme.spacing[3],
          },
        ]}
      >
        <NativeText
          style={typeStyle(theme, "bodySmall", {
            color: "foreground",
            fontWeight: theme.typography.fontWeight.label,
          })}
        >
          {label}
        </NativeText>
        <NativeText
          {...decorativeProps}
          style={{ color: theme.colors.mutedForeground }}
        >
          {isExpanded ? "−" : "+"}
        </NativeText>
      </InteractivePressable>
      {isExpanded ? <TLDRContent>{children}</TLDRContent> : null}
    </View>
  );
}
TLDRSection.displayName = "TLDRSection";

export { TLDRSection };
