"use client";

import {
  type Ref,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import {
  AccessibilityInfo,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Explicit service availability for one selectable model. */
export type ModelServiceState =
  | { readonly message: string; readonly status: "unavailable" }
  | { readonly status: "available" };

/** Model data rendered by the native selector. */
export type ModelInfo = {
  readonly description?: string;
  readonly id: string;
  readonly name: string;
  readonly pricing?: { readonly input?: number; readonly output?: number };
  readonly serviceState?: ModelServiceState;
};

/** Caller-localized copy for the native model selector. */
export type ModelSelectorLabels = {
  readonly close: string;
  readonly description: string;
  readonly noModels: string;
  readonly search: string;
  readonly selected: string;
  readonly title: string;
  readonly unavailable: string;
};

/** Props for a native modal model selector. */
export type ModelSelectorProps = Omit<ViewProps, "children"> & {
  readonly defaultOpen?: boolean;
  readonly defaultSelectedModelId?: string;
  readonly formatPricing?: (pricing: ModelInfo["pricing"]) => string;
  readonly labels: ModelSelectorLabels;
  readonly models: readonly ModelInfo[];
  readonly onOpenChange?: (open: boolean) => void;
  readonly onSelectModel?: (modelId: string) => void;
  readonly open?: boolean;
  readonly ref?: Ref<View>;
  readonly searchInputProps?: Omit<TextInputProps, "onChangeText" | "value">;
  readonly selectedModelId?: string;
};

const styles = StyleSheet.create({
  close: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  header: { alignItems: "flex-start", flexDirection: "row" },
  headerText: { flex: 1 },
  item: { borderBottomWidth: 1, justifyContent: "center", minHeight: 60 },
  modal: { flex: 1, justifyContent: "center" },
  panel: { borderWidth: 1, maxHeight: "80%", overflow: "hidden" },
  pressed: { opacity: 0.8 },
  search: { borderWidth: 1, minHeight: 44 },
});

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => {
      subscription.remove();
    };
  }, []);
  return reduced;
}

function modelMatches(model: ModelInfo, query: string): boolean {
  const normalized = query.trim().toLocaleLowerCase();
  if (normalized.length === 0) return true;
  return (
    model.name.toLocaleLowerCase().includes(normalized) ||
    model.id.toLocaleLowerCase().includes(normalized) ||
    model.description?.toLocaleLowerCase().includes(normalized) === true
  );
}

function ModelMeta({
  labels,
  model,
  price,
  selected,
}: {
  readonly labels: ModelSelectorLabels;
  readonly model: ModelInfo;
  readonly price?: string;
  readonly selected: boolean;
}) {
  const theme = useTheme();
  const unavailable = model.serviceState?.status === "unavailable";
  return (
    <>
      <Text
        style={[
          theme.typography.scale.caption,
          { color: theme.colors.mutedForeground },
        ]}
      >
        {model.id}
      </Text>
      {model.description ? (
        <Text
          style={[
            theme.typography.scale.caption,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {model.description}
        </Text>
      ) : null}
      {price ? (
        <Text
          style={[
            theme.typography.scale.caption,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {price}
        </Text>
      ) : null}
      {selected ? (
        <Text
          style={[
            theme.typography.scale.caption,
            { color: theme.colors.primary },
          ]}
        >
          {labels.selected}
        </Text>
      ) : null}
      {unavailable ? (
        <Text
          style={[
            theme.typography.scale.caption,
            { color: theme.colors.destructive },
          ]}
        >
          {labels.unavailable}: {model.serviceState.message}
        </Text>
      ) : null}
    </>
  );
}
ModelMeta.displayName = "ModelMeta";

function ModelRow({
  formatPricing,
  labels,
  model,
  onSelect,
  selected,
}: {
  readonly formatPricing?: ModelSelectorProps["formatPricing"];
  readonly labels: ModelSelectorLabels;
  readonly model: ModelInfo;
  readonly onSelect: (id: string) => void;
  readonly selected: boolean;
}) {
  const theme = useTheme();
  const unavailable = model.serviceState?.status === "unavailable";
  return (
    <Pressable
      accessibilityLabel={model.name}
      accessibilityRole="radio"
      accessibilityState={{ disabled: unavailable, selected }}
      disabled={unavailable}
      onPress={() => {
        onSelect(model.id);
      }}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: selected
            ? theme.colors.accent
            : theme.colors.popover,
          borderColor: theme.colors.border,
          gap: theme.spacing[1],
          paddingHorizontal: theme.spacing[3],
          paddingVertical: theme.spacing[2],
        },
        pressed ? styles.pressed : undefined,
        unavailable ? { opacity: 0.6 } : undefined,
      ]}
    >
      <Text
        style={[
          theme.typography.scale.bodySmall,
          {
            color: theme.colors.popoverForeground,
            fontWeight: theme.typography.fontWeight.caption,
          },
        ]}
      >
        {model.name}
      </Text>
      <ModelMeta
        labels={labels}
        model={model}
        price={formatPricing?.(model.pricing)}
        selected={selected}
      />
    </Pressable>
  );
}
ModelRow.displayName = "ModelRow";

type SelectorState = {
  readonly changeOpen: (open: boolean) => void;
  readonly filteredModels: readonly ModelInfo[];
  readonly handleSelect: (id: string) => void;
  readonly isOpen: boolean;
  readonly query: string;
  readonly selection: string;
  readonly setQuery: (query: string) => void;
};

function useSelectorState(props: ModelSelectorProps): SelectorState {
  const [internalOpen, setInternalOpen] = useState(props.defaultOpen ?? false);
  const [internalSelection, setInternalSelection] = useState(
    props.defaultSelectedModelId ?? "",
  );
  const [query, setQuery] = useState("");
  const openControlled = props.open !== undefined;
  const selectionControlled = props.selectedModelId !== undefined;
  const isOpen = openControlled ? props.open : internalOpen;
  const selection = selectionControlled
    ? props.selectedModelId
    : internalSelection;
  const changeOpen = useCallback(
    (next: boolean) => {
      if (!openControlled) setInternalOpen(next);
      if (!next) setQuery("");
      props.onOpenChange?.(next);
    },
    [openControlled, props],
  );
  const handleSelect = useCallback(
    (modelId: string) => {
      if (!selectionControlled) setInternalSelection(modelId);
      props.onSelectModel?.(modelId);
      changeOpen(false);
    },
    [changeOpen, props, selectionControlled],
  );
  const filteredModels = useMemo(
    () => props.models.filter((model) => modelMatches(model, query)),
    [props.models, query],
  );
  return {
    changeOpen,
    filteredModels,
    handleSelect,
    isOpen,
    query,
    selection,
    setQuery,
  };
}

function SelectorHeader({
  labels,
  onClose,
}: {
  readonly labels: ModelSelectorLabels;
  readonly onClose: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.header, { gap: theme.spacing[3] }]}>
      <View style={[styles.headerText, { gap: theme.spacing[1] }]}>
        <Text
          accessibilityRole="header"
          style={[
            theme.typography.scale.h5,
            {
              color: theme.colors.popoverForeground,
              fontWeight: theme.typography.fontWeight.heading,
            },
          ]}
        >
          {labels.title}
        </Text>
        <Text
          style={[
            theme.typography.scale.caption,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {labels.description}
        </Text>
      </View>
      <Pressable
        accessibilityLabel={labels.close}
        accessibilityRole="button"
        onPress={onClose}
        style={({ pressed }) => [
          styles.close,
          {
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing[2],
          },
          pressed ? styles.pressed : undefined,
        ]}
      >
        <Text
          style={[
            theme.typography.scale.caption,
            { color: theme.colors.popoverForeground },
          ]}
        >
          {labels.close}
        </Text>
      </Pressable>
    </View>
  );
}
SelectorHeader.displayName = "SelectorHeader";

function SelectorList({
  formatPricing,
  labels,
  models,
  onSelect,
  selection,
}: {
  readonly formatPricing?: ModelSelectorProps["formatPricing"];
  readonly labels: ModelSelectorLabels;
  readonly models: readonly ModelInfo[];
  readonly onSelect: (id: string) => void;
  readonly selection: string;
}) {
  const theme = useTheme();
  return (
    <ScrollView
      accessibilityRole="radiogroup"
      keyboardShouldPersistTaps="handled"
    >
      {models.length === 0 ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.mutedForeground, padding: theme.spacing[4] },
          ]}
        >
          {labels.noModels}
        </Text>
      ) : (
        models.map((model) => (
          <ModelRow
            formatPricing={formatPricing}
            key={model.id}
            labels={labels}
            model={model}
            onSelect={onSelect}
            selected={selection === model.id}
          />
        ))
      )}
    </ScrollView>
  );
}
SelectorList.displayName = "SelectorList";

function SelectorSearch({
  inputProps,
  label,
  onChange,
  value,
}: {
  readonly inputProps?: ModelSelectorProps["searchInputProps"];
  readonly label: string;
  readonly onChange: (value: string) => void;
  readonly value: string;
}) {
  const theme = useTheme();
  const searchId = useId();
  return (
    <TextInput
      {...inputProps}
      accessibilityLabel={label}
      nativeID={inputProps?.nativeID ?? searchId}
      onChangeText={onChange}
      placeholderTextColor={theme.colors.mutedForeground}
      returnKeyType="search"
      style={[
        styles.search,
        theme.typography.scale.bodySmall,
        {
          borderColor: theme.colors.input,
          borderRadius: theme.radius.md,
          color: theme.colors.popoverForeground,
          paddingHorizontal: theme.spacing[3],
        },
        inputProps?.style,
      ]}
      value={value}
    />
  );
}
SelectorSearch.displayName = "SelectorSearch";

function SelectorPanel({
  formatPricing,
  labels,
  reference,
  searchInputProps,
  state,
  style,
  viewProps,
}: {
  readonly formatPricing?: ModelSelectorProps["formatPricing"];
  readonly labels: ModelSelectorLabels;
  readonly reference?: Ref<View>;
  readonly searchInputProps?: ModelSelectorProps["searchInputProps"];
  readonly state: SelectorState;
  readonly style?: ModelSelectorProps["style"];
  readonly viewProps: ViewProps;
}) {
  const theme = useTheme();
  const handleSearchChange = state.setQuery;
  return (
    <View
      {...viewProps}
      accessibilityLabel={labels.description}
      accessibilityViewIsModal
      ref={reference}
      style={[
        styles.panel,
        {
          backgroundColor: theme.colors.popover,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          gap: theme.spacing[3],
          padding: theme.spacing[4],
        },
        style,
      ]}
    >
      <SelectorHeader
        labels={labels}
        onClose={() => {
          state.changeOpen(false);
        }}
      />
      <SelectorSearch
        inputProps={searchInputProps}
        label={labels.search}
        onChange={handleSearchChange}
        value={state.query}
      />
      <SelectorList
        formatPricing={formatPricing}
        labels={labels}
        models={state.filteredModels}
        onSelect={state.handleSelect}
        selection={state.selection}
      />
    </View>
  );
}
SelectorPanel.displayName = "SelectorPanel";

/** Searchable native modal with controlled or uncontrolled model selection. */
function ModelSelector({
  defaultOpen,
  defaultSelectedModelId,
  formatPricing,
  labels,
  models,
  onOpenChange,
  onSelectModel,
  open,
  ref,
  searchInputProps,
  selectedModelId,
  style,
  ...viewProps
}: ModelSelectorProps) {
  const theme = useTheme();
  const state = useSelectorState({
    defaultOpen,
    defaultSelectedModelId,
    formatPricing,
    labels,
    models,
    onOpenChange,
    onSelectModel,
    open,
    ref,
    searchInputProps,
    selectedModelId,
    style,
  });
  const reducedMotion = useReducedMotion();
  return (
    <Modal
      animationType={reducedMotion ? "none" : "fade"}
      onRequestClose={() => {
        state.changeOpen(false);
      }}
      transparent
      visible={state.isOpen}
    >
      <View
        style={[
          styles.modal,
          { backgroundColor: theme.colors.muted, padding: theme.spacing[4] },
        ]}
      >
        <SelectorPanel
          formatPricing={formatPricing}
          labels={labels}
          reference={ref}
          searchInputProps={searchInputProps}
          state={state}
          style={style}
          viewProps={viewProps}
        />
      </View>
    </Modal>
  );
}
ModelSelector.displayName = "ModelSelector";

export { ModelSelector };
