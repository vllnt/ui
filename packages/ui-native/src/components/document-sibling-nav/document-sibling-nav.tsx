"use client";

import type { Ref } from "react";
import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import {
  defaultLinkingService,
  type LinkingService,
  type OpenUrlResult,
} from "../../primitives/platform-services";
import { typeStyle } from "../../primitives/type-style";
import { useTheme } from "../../theme/theme-provider";

/** Native sibling-navigation presentation. */
export type DocumentSiblingNavVariant = "compact" | "with-meta" | "with-title";

/** A native document destination. */
export type DocumentSiblingNavLink = {
  readonly href: string;
  readonly meta?: string;
  readonly title: string;
};

/** Caller-localized native navigation labels. */
export type DocumentSiblingNavLabels = {
  readonly navigation: string;
  readonly next: string;
  readonly previous: string;
};

/** Props for native previous and next document links. */
export type DocumentSiblingNavProps = Omit<ViewProps, "children"> & {
  readonly labels: DocumentSiblingNavLabels;
  readonly linking?: LinkingService;
  readonly next?: DocumentSiblingNavLink;
  readonly onOpenError?: (error: unknown, link: DocumentSiblingNavLink) => void;
  readonly onOpenResult?: (
    result: OpenUrlResult,
    link: DocumentSiblingNavLink,
  ) => void;
  readonly previous?: DocumentSiblingNavLink;
  readonly ref?: Ref<View>;
  readonly variant?: DocumentSiblingNavVariant;
};

const styles = StyleSheet.create({
  item: { flex: 1, justifyContent: "center", minHeight: 44 },
  next: { alignItems: "flex-end" },
  previous: { alignItems: "flex-start" },
  root: { flexDirection: "row", width: "100%" },
});

function buildLabel(
  caption: string,
  link: DocumentSiblingNavLink,
  variant: DocumentSiblingNavVariant,
) {
  if (variant === "compact") return caption;
  const titled = `${caption}: ${link.title}`;
  return variant === "with-meta" && link.meta
    ? `${titled}, ${link.meta}`
    : titled;
}

function SiblingText({
  caption,
  link,
  variant,
}: {
  readonly caption: string;
  readonly link: DocumentSiblingNavLink;
  readonly variant: DocumentSiblingNavVariant;
}) {
  const theme = useTheme();
  return (
    <>
      <NativeText
        style={typeStyle(theme, "caption", {
          color: "mutedForeground",
          fontWeight: theme.typography.fontWeight.caption,
        })}
      >
        {caption}
      </NativeText>
      {variant === "compact" ? null : (
        <NativeText
          numberOfLines={2}
          style={typeStyle(theme, "bodySmall", {
            color: "foreground",
            fontWeight: theme.typography.fontWeight.heading,
          })}
        >
          {link.title}
        </NativeText>
      )}
      {variant === "with-meta" && link.meta ? (
        <NativeText style={{ color: theme.colors.mutedForeground }}>
          {link.meta}
        </NativeText>
      ) : null}
    </>
  );
}
SiblingText.displayName = "SiblingText";

type SiblingLinkProps = {
  readonly caption: string;
  readonly hint: string;
  readonly link: DocumentSiblingNavLink;
  readonly linking: LinkingService;
  readonly onOpenError?: (error: unknown, link: DocumentSiblingNavLink) => void;
  readonly onOpenResult?: (
    result: OpenUrlResult,
    link: DocumentSiblingNavLink,
  ) => void;
  readonly side: "next" | "previous";
  readonly variant: DocumentSiblingNavVariant;
};

function SiblingLink({
  caption,
  hint,
  link,
  linking,
  onOpenError,
  onOpenResult,
  side,
  variant,
}: SiblingLinkProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={buildLabel(caption, link, variant)}
      accessibilityRole="link"
      onPress={() => {
        void linking.openUrl(link.href).then(
          (result) => onOpenResult?.(result, link),
          (error: unknown) => onOpenError?.(error, link),
        );
      }}
      style={({ pressed }) => [
        styles.item,
        side === "next" ? styles.next : styles.previous,
        {
          backgroundColor: pressed
            ? theme.colors.accent
            : theme.colors.background,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          gap: theme.spacing[1],
          padding: theme.spacing[4],
        },
      ]}
    >
      <SiblingText caption={caption} link={link} variant={variant} />
    </Pressable>
  );
}
SiblingLink.displayName = "SiblingLink";

/**
 * Opens sibling document URLs through an injectable native linking service.
 * Each link speaks its caption, title, and (with-meta) meta, with
 * `labels.navigation` as its hint.
 */
function DocumentSiblingNav({
  labels,
  linking = defaultLinkingService,
  next,
  onOpenError,
  onOpenResult,
  previous,
  ref,
  style,
  variant = "with-title",
  ...props
}: DocumentSiblingNavProps) {
  const theme = useTheme();
  if (!previous && !next) return null;
  return (
    <View
      {...props}
      ref={ref}
      style={[styles.root, { gap: theme.spacing[3] }, style]}
    >
      {previous ? (
        <SiblingLink
          caption={labels.previous}
          hint={labels.navigation}
          link={previous}
          linking={linking}
          onOpenError={onOpenError}
          onOpenResult={onOpenResult}
          side="previous"
          variant={variant}
        />
      ) : (
        <View style={styles.item} />
      )}
      {next ? (
        <SiblingLink
          caption={labels.next}
          hint={labels.navigation}
          link={next}
          linking={linking}
          onOpenError={onOpenError}
          onOpenResult={onOpenResult}
          side="next"
          variant={variant}
        />
      ) : null}
    </View>
  );
}
DocumentSiblingNav.displayName = "DocumentSiblingNav";

export { DocumentSiblingNav };
