"use client";

import {
  type ReactNode,
  type Ref,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewProps,
} from "react-native";

import {
  ModalLayer,
  type ModalLayerCloseReason,
  type ModalLayerPresentationProps,
} from "../../primitives/modal-layer";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** One stable result in native search. */
export type SearchItem = {
  readonly description?: string;
  readonly id: string;
  readonly keywords?: string;
  readonly snippet?: string;
  readonly title: string;
};

export type SearchScope = "components" | "docs" | "everything";

/** Caller-localized text used by the native search dialog. */
export type SearchDialogLabels = {
  readonly clear: string;
  readonly close: string;
  readonly componentsGroup: string;
  readonly docsEmpty: string;
  readonly docsGroup: string;
  readonly empty: string;
  readonly minimumDocsQuery: (minimum: number) => string;
  readonly open: string;
  readonly result: (item: SearchItem) => string;
  readonly scope: string;
  readonly scopeOption: Readonly<Record<SearchScope, string>>;
  readonly searchingDocs: string;
  readonly searchPlaceholder: string;
  readonly title: string;
};

/** Props for controlled or uncontrolled native search. */
export type SearchDialogProps = ModalLayerPresentationProps & {
  readonly defaultOpen?: boolean;
  readonly defaultQuery?: string;
  readonly defaultScope?: SearchScope;
  readonly docsSearch?: (query: string) => Promise<readonly SearchItem[]>;
  readonly hardwareKeyboardHint?: string;
  readonly items: readonly SearchItem[];
  readonly labels: SearchDialogLabels;
  readonly minDocsSearchLength?: number;
  readonly onDocsSelect?: (item: SearchItem) => void;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onQueryChange?: (query: string) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly onScopeChange?: (scope: SearchScope) => void;
  readonly onSelect: (item: SearchItem) => void;
  readonly open?: boolean;
  readonly query?: string;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
  readonly scope?: SearchScope;
  readonly surfaceProps?: Omit<ViewProps, "children" | "ref">;
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  backdrop: { flex: 1, justifyContent: "center" },
  input: { borderWidth: 1, flex: 1, minHeight: 44 },
  result: { borderBottomWidth: 1, justifyContent: "center", minHeight: 44 },
  row: { alignItems: "center", flexDirection: "row" },
  scopes: { flexDirection: "row" },
  surface: {
    alignSelf: "center",
    borderWidth: 1,
    maxHeight: "88%",
    maxWidth: 640,
    width: "94%",
  },
});

function searchableText(item: SearchItem): string {
  return [item.title, item.description, item.snippet, item.keywords]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
}

function SearchScopeControl({
  labels,
  onChange,
  scope,
}: {
  readonly labels: SearchDialogLabels;
  readonly onChange: (scope: SearchScope) => void;
  readonly scope: SearchScope;
}) {
  const theme = useTheme();
  const scopes: readonly SearchScope[] = ["components", "docs", "everything"];
  return (
    <View
      accessibilityLabel={labels.scope}
      accessibilityRole="radiogroup"
      style={[
        styles.scopes,
        {
          backgroundColor: theme.colors.muted,
          borderRadius: theme.radius.md,
          padding: theme.spacing[1],
        },
      ]}
    >
      {scopes.map((option) => {
        const selected = option === scope;
        return (
          <Pressable
            accessibilityLabel={labels.scopeOption[option]}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            key={option}
            onPress={() => {
              onChange(option);
            }}
            style={[
              styles.action,
              {
                backgroundColor: selected
                  ? theme.colors.background
                  : theme.colors.muted,
                borderRadius: theme.radius.sm,
                flex: 1,
                paddingHorizontal: theme.spacing[2],
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                theme.typography.scale.caption,
                {
                  color: selected
                    ? theme.colors.foreground
                    : theme.colors.mutedForeground,
                },
              ]}
            >
              {labels.scopeOption[option]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
SearchScopeControl.displayName = "SearchScopeControl";

function SearchResults({
  heading,
  items,
  labels,
  onSelect,
}: {
  readonly heading: string;
  readonly items: readonly SearchItem[];
  readonly labels: SearchDialogLabels;
  readonly onSelect: (item: SearchItem) => void;
}) {
  const theme = useTheme();
  if (items.length === 0) return null;
  return (
    <View accessibilityLabel={heading} style={{ gap: theme.spacing[1] }}>
      <Text
        accessibilityRole="header"
        style={[
          theme.typography.scale.caption,
          {
            color: theme.colors.mutedForeground,
            fontWeight: theme.typography.fontWeight.caption,
          },
        ]}
      >
        {heading}
      </Text>
      {items.map((item) => (
        <Pressable
          accessibilityLabel={labels.result(item)}
          accessibilityRole="button"
          key={item.id}
          nativeID={`search-result-${item.id}`}
          onPress={() => {
            onSelect(item);
          }}
          style={({ pressed }) => [
            styles.result,
            {
              backgroundColor: pressed
                ? theme.colors.muted
                : theme.colors.background,
              borderBottomColor: theme.colors.border,
              paddingVertical: theme.spacing[2],
            },
          ]}
        >
          <Text
            style={[
              theme.typography.scale.bodySmall,
              {
                color: theme.colors.foreground,
                fontWeight: theme.typography.fontWeight.caption,
              },
            ]}
          >
            {item.title}
          </Text>
          {item.snippet || item.description ? (
            <Text
              numberOfLines={2}
              style={[
                theme.typography.scale.caption,
                { color: theme.colors.mutedForeground },
              ]}
            >
              {item.snippet ?? item.description}
            </Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}
SearchResults.displayName = "SearchResults";

type DocumentationResultsOptions = {
  readonly documentationSearch: SearchDialogProps["docsSearch"];
  readonly minimum: number;
  readonly open: boolean;
  readonly query: string;
  readonly scope: SearchScope;
};

function useDocumentationResults({
  documentationSearch,
  minimum,
  open,
  query,
  scope,
}: DocumentationResultsOptions) {
  const trimmedQuery = query.trim();
  const eligible =
    open &&
    Boolean(documentationSearch) &&
    scope !== "components" &&
    trimmedQuery.length >= minimum;
  const [result, setResult] = useState<{
    readonly items: readonly SearchItem[];
    readonly query: string;
    readonly service: SearchDialogProps["docsSearch"];
  }>();
  const request = useRef(0);

  useLayoutEffect(() => {
    const currentRequest = request.current + 1;
    request.current = currentRequest;
    if (!eligible || !documentationSearch) return;

    void documentationSearch(trimmedQuery).then(
      (items) => {
        if (request.current === currentRequest) {
          setResult({
            items,
            query: trimmedQuery,
            service: documentationSearch,
          });
        }
      },
      () => {
        if (request.current === currentRequest) {
          setResult({
            items: [],
            query: trimmedQuery,
            service: documentationSearch,
          });
        }
      },
    );
    return () => {
      request.current += 1;
    };
  }, [documentationSearch, eligible, trimmedQuery]);

  const hasCurrentResult =
    eligible &&
    result?.query === trimmedQuery &&
    result.service === documentationSearch;
  return {
    items: hasCurrentResult ? result.items : [],
    loading: eligible && !hasCurrentResult,
  };
}

/** Native modal search without browser-global shortcut claims. */
function SearchDialog({
  defaultOpen = false,
  defaultQuery = "",
  defaultScope = "components",
  docsSearch,
  hardwareKeyboardHint,
  items,
  labels,
  minDocsSearchLength: minimumDocumentationSearchLength = 2,
  onDocsSelect,
  onOpenChange,
  onQueryChange,
  onRequestClose,
  onScopeChange,
  onSelect,
  open,
  query,
  ref,
  safeArea,
  scope,
  surfaceProps,
  ...presentationProps
}: SearchDialogProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const generatedId = useId();
  const [visible, setVisible] = useControllableState(
    open === undefined
      ? {
          defaultValue: defaultOpen,
          mode: "uncontrolled",
          onChange: onOpenChange,
        }
      : { mode: "controlled", onChange: onOpenChange, value: open },
  );
  const [searchQuery, setSearchQuery] = useControllableState(
    query === undefined
      ? {
          defaultValue: defaultQuery,
          mode: "uncontrolled",
          onChange: onQueryChange,
        }
      : { mode: "controlled", onChange: onQueryChange, value: query },
  );
  const [searchScope, setSearchScope] = useControllableState(
    scope === undefined
      ? {
          defaultValue: defaultScope,
          mode: "uncontrolled",
          onChange: onScopeChange,
        }
      : { mode: "controlled", onChange: onScopeChange, value: scope },
  );
  const minimum = Math.max(1, Math.round(minimumDocumentationSearchLength));
  const documentation = useDocumentationResults({
    documentationSearch: docsSearch,
    minimum,
    open: visible,
    query: searchQuery,
    scope: searchScope,
  });
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const componentItems = [...items]
    .filter(
      (item) =>
        !normalizedQuery || searchableText(item).includes(normalizedQuery),
    )
    .sort((left, right) => left.title.localeCompare(right.title));
  const showComponents = searchScope !== "docs";
  const showDocumentation = Boolean(docsSearch) && searchScope !== "components";
  const waitingForQuery =
    showDocumentation && searchQuery.trim().length < minimum;
  const noResults =
    (!showComponents || componentItems.length === 0) &&
    (!showDocumentation || documentation.items.length === 0) &&
    !documentation.loading;
  const close = (reason: ModalLayerCloseReason) => {
    onRequestClose?.(reason);
    setVisible(false);
  };
  const selectComponent = (item: SearchItem) => {
    setVisible(false);
    onSelect(item);
  };
  const selectDocument = (item: SearchItem) => {
    setVisible(false);
    (onDocsSelect ?? onSelect)(item);
  };

  return (
    <>
      <Pressable
        accessibilityLabel={labels.open}
        accessibilityRole="button"
        onPress={() => {
          setVisible(true);
        }}
        style={({ pressed }) => [
          styles.action,
          {
            backgroundColor: theme.colors.secondary,
            borderRadius: theme.radius.md,
            opacity: pressed ? 0.8 : 1,
            paddingHorizontal: theme.spacing[4],
          },
        ]}
      >
        <Text
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.secondaryForeground },
          ]}
        >
          {labels.open}
        </Text>
      </Pressable>
      <ModalLayer
        {...presentationProps}
        animationType={
          reduceMotion ? "none" : (presentationProps.animationType ?? "fade")
        }
        contentProps={{
          style: [styles.backdrop, { backgroundColor: theme.colors.muted }],
        }}
        keyboardAvoidingViewProps={{ style: styles.backdrop }}
        onClose={close}
        ref={ref}
        safeArea={safeArea}
        visible={visible}
      >
        <View
          {...surfaceProps}
          accessibilityLabel={labels.title}
          style={[
            styles.surface,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              gap: theme.spacing[3],
              padding: theme.spacing[4],
            },
            surfaceProps?.style,
          ]}
        >
          <View style={[styles.row, { gap: theme.spacing[2] }]}>
            <TextInput
              accessibilityLabel={labels.searchPlaceholder}
              inputMode="search"
              nativeID={`${generatedId}-input`}
              onChangeText={setSearchQuery}
              placeholder={labels.searchPlaceholder}
              placeholderTextColor={theme.colors.mutedForeground}
              style={[
                styles.input,
                theme.typography.scale.body,
                {
                  borderColor: theme.colors.input,
                  borderRadius: theme.radius.md,
                  color: theme.colors.foreground,
                  paddingHorizontal: theme.spacing[3],
                },
              ]}
              value={searchQuery}
            />
            {searchQuery ? (
              <Pressable
                accessibilityLabel={labels.clear}
                accessibilityRole="button"
                onPress={() => {
                  setSearchQuery("");
                }}
                style={styles.action}
              >
                <Text
                  style={{ color: theme.colors.mutedForeground, fontSize: 20 }}
                >
                  ×
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityLabel={labels.close}
              accessibilityRole="button"
              onPress={() => {
                close("requestClose");
              }}
              style={styles.action}
            >
              <Text
                style={{ color: theme.colors.mutedForeground, fontSize: 20 }}
              >
                ×
              </Text>
            </Pressable>
          </View>
          {hardwareKeyboardHint ? (
            <Text
              style={[
                theme.typography.scale.caption,
                { color: theme.colors.mutedForeground },
              ]}
            >
              {hardwareKeyboardHint}
            </Text>
          ) : null}
          {docsSearch ? (
            <SearchScopeControl
              labels={labels}
              onChange={setSearchScope}
              scope={searchScope}
            />
          ) : null}
          <ScrollView
            contentContainerStyle={{ gap: theme.spacing[4] }}
            keyboardShouldPersistTaps="handled"
          >
            {showComponents ? (
              <SearchResults
                heading={labels.componentsGroup}
                items={componentItems}
                labels={labels}
                onSelect={selectComponent}
              />
            ) : null}
            {showDocumentation ? (
              <SearchResults
                heading={labels.docsGroup}
                items={documentation.items}
                labels={labels}
                onSelect={selectDocument}
              />
            ) : null}
            {waitingForQuery ? (
              <Text
                style={[
                  theme.typography.scale.bodySmall,
                  { color: theme.colors.mutedForeground },
                ]}
              >
                {labels.minimumDocsQuery(minimum)}
              </Text>
            ) : null}
            {documentation.loading ? (
              <Text
                accessibilityLiveRegion="polite"
                style={[
                  theme.typography.scale.bodySmall,
                  { color: theme.colors.mutedForeground },
                ]}
              >
                {labels.searchingDocs}
              </Text>
            ) : null}
            {noResults && !waitingForQuery ? (
              <Text
                accessibilityLiveRegion="polite"
                style={[
                  theme.typography.scale.bodySmall,
                  { color: theme.colors.mutedForeground },
                ]}
              >
                {searchScope === "docs" ? labels.docsEmpty : labels.empty}
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </ModalLayer>
    </>
  );
}
SearchDialog.displayName = "SearchDialog";

export { SearchDialog };
