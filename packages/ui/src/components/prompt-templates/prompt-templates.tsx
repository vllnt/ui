"use client";

import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";

import { Search, Sparkles } from "lucide-react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { Input } from "../input/input";

const VARIABLE_PATTERN = /{{\s*([\w-]+)\s*}}/g;
const ALL_CATEGORY_VALUE = "__all__";

/**
 * One prompt template entry.
 *
 * @public
 */
export type PromptTemplate = {
  /** Optional category (matched against {@link PromptTemplateCategory.name}). */
  category?: string;
  /** Sub-headline shown under the title. */
  description?: ReactNode;
  /** Stable identifier. */
  id: string;
  /**
   * Raw template body with `{{variable}}` placeholders. Placeholders are
   * detected automatically; the explicit `variables` array overrides
   * detection (useful when the same placeholder appears more than once).
   */
  template: string;
  /** Display title. */
  title: ReactNode;
  /** Override for detected variable names. */
  variables?: string[];
};

/**
 * Category chip for filtering.
 *
 * @public
 */
export type PromptTemplateCategory = {
  /** Optional icon rendered next to the name. */
  icon?: ReactNode;
  /** Category display name (matched against {@link PromptTemplate.category}). */
  name: string;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type PromptTemplatesLabels = {
  /** Caption for the all-categories chip. Defaults to `"All"`. */
  allCategory?: string;
  /** Caption for the cancel button on the variable form. Defaults to `"Cancel"`. */
  cancel?: string;
  /** Empty-state heading when no templates match. Defaults to `"No prompts found."`. */
  empty?: string;
  /** Caption for the use button when filling in variables. Defaults to `"Insert"`. */
  insert?: string;
  /** Search input placeholder. Defaults to `"Search prompts…"`. */
  searchPlaceholder?: string;
  /** Caption for the use button on a card. Defaults to `"Use template"`. */
  use?: string;
  /** Caption above the variable form. Defaults to `"Fill in the placeholders"`. */
  variablesHeading?: string;
};

const DEFAULT_LABELS = {
  allCategory: "All",
  cancel: "Cancel",
  empty: "No prompts found.",
  insert: "Insert",
  searchPlaceholder: "Search prompts…",
  use: "Use template",
  variablesHeading: "Fill in the placeholders",
} as const satisfies Required<PromptTemplatesLabels>;

/**
 * Props for {@link PromptTemplates}.
 *
 * @public
 */
export type PromptTemplatesProps = {
  /** Optional list of categories to render as filter chips. */
  categories?: PromptTemplateCategory[];
  /** Localizable strings. */
  labels?: PromptTemplatesLabels;
  /**
   * Fires with the resolved template body. When the template has variables,
   * the user fills them in first; otherwise this fires on click.
   */
  onSelect?: (resolved: string, template: PromptTemplate) => void;
  /** The template list. */
  templates: PromptTemplate[];
} & ComponentPropsWithoutRef<"section">;

function detectVariables(template: PromptTemplate): string[] {
  if (template.variables) return template.variables;
  const matches = [...template.template.matchAll(VARIABLE_PATTERN)];
  const seen = new Set<string>();
  return matches.reduce<string[]>((accumulator, match) => {
    const name = match[1];
    if (name && !seen.has(name)) {
      seen.add(name);
      accumulator.push(name);
    }
    return accumulator;
  }, []);
}

function fillTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replaceAll(
    VARIABLE_PATTERN,
    (_match: string, name: string) => values[name] ?? `{{${name}}}`,
  );
}

function matchesCategory(template: PromptTemplate, selected: string): boolean {
  if (selected === ALL_CATEGORY_VALUE) return true;
  return template.category === selected;
}

function matchesQuery(template: PromptTemplate, query: string): boolean {
  if (!query) return true;
  const lowered = query.toLowerCase();
  const title =
    typeof template.title === "string" ? template.title.toLowerCase() : "";
  const description =
    typeof template.description === "string"
      ? template.description.toLowerCase()
      : "";
  return title.includes(lowered) || description.includes(lowered);
}

type FilterBarProps = {
  categories: PromptTemplateCategory[];
  labels: Required<PromptTemplatesLabels>;
  onCategoryChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  query: string;
  searchId: string;
  selectedCategory: string;
};

function FilterBar({
  categories,
  labels,
  onCategoryChange,
  onQueryChange,
  query,
  searchId,
  selectedCategory,
}: FilterBarProps): ReactNode {
  const handleSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    onQueryChange(event.target.value);
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label={labels.searchPlaceholder}
          className="pl-9"
          id={searchId}
          onChange={handleSearch}
          placeholder={labels.searchPlaceholder}
          type="search"
          value={query}
        />
      </div>
      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-1.5" role="tablist">
          <CategoryChip
            active={selectedCategory === ALL_CATEGORY_VALUE}
            label={labels.allCategory}
            onClick={() => {
              onCategoryChange(ALL_CATEGORY_VALUE);
            }}
            value={ALL_CATEGORY_VALUE}
          />
          {categories.map((category) => (
            <CategoryChip
              active={selectedCategory === category.name}
              icon={category.icon}
              key={category.name}
              label={category.name}
              onClick={() => {
                onCategoryChange(category.name);
              }}
              value={category.name}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

type CategoryChipProps = {
  active: boolean;
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  value: string;
};

function CategoryChip({
  active,
  icon,
  label,
  onClick,
  value,
}: CategoryChipProps): ReactNode {
  return (
    <button
      aria-selected={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-accent",
      )}
      data-value={value}
      onClick={onClick}
      role="tab"
      type="button"
    >
      {icon ? (
        <span aria-hidden="true" className="[&>svg]:h-3.5 [&>svg]:w-3.5">
          {icon}
        </span>
      ) : null}
      {label}
    </button>
  );
}

type CardProps = {
  active: boolean;
  labels: Required<PromptTemplatesLabels>;
  onActivate: (template: PromptTemplate) => void;
  onCancel: () => void;
  onResolve: (resolved: string, template: PromptTemplate) => void;
  onValueChange: (name: string, value: string) => void;
  template: PromptTemplate;
  values: Record<string, string>;
};

type CardHeaderProps = {
  category?: string;
  description?: ReactNode;
  title: ReactNode;
};

function CardHeader({
  category,
  description,
  title,
}: CardHeaderProps): ReactNode {
  return (
    <header className="flex flex-col gap-1">
      <h4 className="text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h4>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {category ? (
        <Badge className="self-start" variant="outline">
          {category}
        </Badge>
      ) : null}
    </header>
  );
}

type CardActionsProps = {
  onUse: () => void;
  useLabel: string;
  variableCount: number;
};

function CardActions({
  onUse,
  useLabel,
  variableCount,
}: CardActionsProps): ReactNode {
  return (
    <div className="flex items-center justify-between gap-2">
      {variableCount > 0 ? (
        <span className="text-xs text-muted-foreground">
          {variableCount.toString()} variable{variableCount === 1 ? "" : "s"}
        </span>
      ) : (
        <span aria-hidden="true" />
      )}
      <Button
        onClick={onUse}
        size="sm"
        type="button"
        variant={variableCount > 0 ? "outline" : "default"}
      >
        <Sparkles aria-hidden="true" className="mr-2 h-3.5 w-3.5" />
        {useLabel}
      </Button>
    </div>
  );
}

function PromptTemplateCard({
  active,
  labels,
  onActivate,
  onCancel,
  onResolve,
  onValueChange,
  template,
  values,
}: CardProps): ReactNode {
  const variables = detectVariables(template);
  const handleUse = useCallback(() => {
    if (variables.length === 0) {
      onResolve(template.template, template);
      return;
    }
    if (active) {
      onResolve(fillTemplate(template.template, values), template);
      return;
    }
    onActivate(template);
  }, [active, onActivate, onResolve, template, values, variables.length]);

  return (
    <article
      className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 shadow-sm"
      data-template-id={template.id}
    >
      <CardHeader
        category={template.category}
        description={template.description}
        title={template.title}
      />
      {active && variables.length > 0 ? (
        <VariableForm
          fieldIdPrefix={template.id}
          labels={labels}
          onCancel={onCancel}
          onSubmit={handleUse}
          onValueChange={onValueChange}
          values={values}
          variables={variables}
        />
      ) : (
        <CardActions
          onUse={handleUse}
          useLabel={labels.use}
          variableCount={variables.length}
        />
      )}
    </article>
  );
}

type VariableFormProps = {
  fieldIdPrefix: string;
  labels: Required<PromptTemplatesLabels>;
  onCancel: () => void;
  onSubmit: () => void;
  onValueChange: (name: string, value: string) => void;
  values: Record<string, string>;
  variables: string[];
};

type VariableFieldProps = {
  fieldId: string;
  name: string;
  onValueChange: (name: string, value: string) => void;
  value: string;
};

function VariableField({
  fieldId,
  name,
  onValueChange,
  value,
}: VariableFieldProps): ReactNode {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onValueChange(name, event.target.value);
    },
    [name, onValueChange],
  );
  return (
    <div className="flex flex-col gap-1 text-xs">
      <label className="font-medium text-foreground" htmlFor={fieldId}>
        {name}
      </label>
      <Input
        id={fieldId}
        onChange={handleChange}
        placeholder={`Value for ${name}`}
        value={value}
      />
    </div>
  );
}

function VariableForm({
  fieldIdPrefix,
  labels,
  onCancel,
  onSubmit,
  onValueChange,
  values,
  variables,
}: VariableFormProps): ReactNode {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {labels.variablesHeading}
      </p>
      <div className="flex flex-col gap-2">
        {variables.map((name) => (
          <VariableField
            fieldId={`${fieldIdPrefix}-${name}`}
            key={name}
            name={name}
            onValueChange={onValueChange}
            value={values[name] ?? ""}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-end gap-2">
        <Button onClick={onCancel} size="sm" type="button" variant="ghost">
          {labels.cancel}
        </Button>
        <Button onClick={onSubmit} size="sm" type="button">
          {labels.insert}
        </Button>
      </div>
    </div>
  );
}

/**
 * Library / gallery of saved prompt templates with search, category filter,
 * and a built-in fill-in form for `{{variable}}` placeholders. Composes
 * existing {@link Input}, {@link Button}, and {@link Badge} primitives.
 *
 * @example
 * ```tsx
 * <PromptTemplates
 *   templates={[
 *     {
 *       id: "code-review",
 *       title: "Code Review",
 *       description: "Review code for bugs and improvements",
 *       template: "Review this {{language}} code:\n\n{{code}}",
 *       category: "Code",
 *     },
 *   ]}
 *   categories={[{ name: "Code" }, { name: "Writing" }]}
 *   onSelect={(resolved) => insertIntoComposer(resolved)}
 * />
 * ```
 *
 * @public
 */
type ControllerState = {
  activeId: null | string;
  filtered: PromptTemplate[];
  handleActivate: (template: PromptTemplate) => void;
  handleCancel: () => void;
  handleCategoryChange: (value: string) => void;
  handleQueryChange: (value: string) => void;
  handleResolve: (resolved: string, template: PromptTemplate) => void;
  handleValueChange: (name: string, value: string) => void;
  query: string;
  searchId: string;
  selectedCategory: string;
  values: Record<string, string>;
};

function usePromptTemplatesController(
  templates: PromptTemplate[],
  onSelect: PromptTemplatesProps["onSelect"],
): ControllerState {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY_VALUE);
  const [activeId, setActiveId] = useState<null | string>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const filtered = useMemo(
    () =>
      templates.filter(
        (template) =>
          matchesCategory(template, selectedCategory) &&
          matchesQuery(template, query),
      ),
    [query, selectedCategory, templates],
  );

  const handleActivate = useCallback((template: PromptTemplate) => {
    setActiveId(template.id);
    setValues({});
  }, []);

  const handleCancel = useCallback(() => {
    setActiveId(null);
    setValues({});
  }, []);

  const handleResolve = useCallback(
    (resolved: string, template: PromptTemplate) => {
      onSelect?.(resolved, template);
      setActiveId(null);
      setValues({});
    },
    [onSelect],
  );

  const handleValueChange = useCallback((name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  }, []);

  return {
    activeId,
    filtered,
    handleActivate,
    handleCancel,
    handleCategoryChange: setSelectedCategory,
    handleQueryChange: setQuery,
    handleResolve,
    handleValueChange,
    query,
    searchId,
    selectedCategory,
    values,
  };
}

type GridProps = {
  controller: ControllerState;
  labels: Required<PromptTemplatesLabels>;
};

function TemplateGrid({ controller, labels }: GridProps): ReactNode {
  if (controller.filtered.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {labels.empty}
      </p>
    );
  }
  return (
    <div
      className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
      role="tabpanel"
    >
      {controller.filtered.map((template) => (
        <PromptTemplateCard
          active={controller.activeId === template.id}
          key={template.id}
          labels={labels}
          onActivate={controller.handleActivate}
          onCancel={controller.handleCancel}
          onResolve={controller.handleResolve}
          onValueChange={controller.handleValueChange}
          template={template}
          values={controller.values}
        />
      ))}
    </div>
  );
}

export const PromptTemplates = forwardRef<HTMLElement, PromptTemplatesProps>(
  (props, ref) => {
    const { categories, className, labels, onSelect, templates, ...rest } =
      props;
    const resolvedLabels = useMemo(
      () => ({ ...DEFAULT_LABELS, ...labels }),
      [labels],
    );
    const controller = usePromptTemplatesController(templates, onSelect);

    return (
      <section
        className={cn(
          "flex flex-col gap-4 rounded-2xl border bg-background p-4",
          className,
        )}
        ref={ref}
        {...rest}
      >
        <FilterBar
          categories={categories ?? []}
          labels={resolvedLabels}
          onCategoryChange={controller.handleCategoryChange}
          onQueryChange={controller.handleQueryChange}
          query={controller.query}
          searchId={controller.searchId}
          selectedCategory={controller.selectedCategory}
        />
        <TemplateGrid controller={controller} labels={resolvedLabels} />
      </section>
    );
  },
);
PromptTemplates.displayName = "PromptTemplates";
