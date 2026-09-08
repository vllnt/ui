import { useState } from "react";

import type { ReactNode, Ref } from "react";
import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

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
    minHeight: 44,
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
        <NativeText
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.mutedForeground },
          ]}
        >
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
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        onPress={() => {
          setIsExpanded((current) => !current);
        }}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: pressed ? theme.colors.accent : theme.colors.muted,
            paddingHorizontal: theme.spacing[4],
            paddingVertical: theme.spacing[3],
          },
        ]}
      >
        <NativeText
          style={[
            theme.typography.scale.bodySmall,
            {
              color: theme.colors.foreground,
              fontWeight: theme.typography.fontWeight.caption,
            },
          ]}
        >
          {label}
        </NativeText>
        <NativeText
          accessibilityElementsHidden
          style={{ color: theme.colors.mutedForeground }}
        >
          {isExpanded ? "−" : "+"}
        </NativeText>
      </Pressable>
      {isExpanded ? <TLDRContent>{children}</TLDRContent> : null}
    </View>
  );
}
TLDRSection.displayName = "TLDRSection";

export { TLDRSection };
