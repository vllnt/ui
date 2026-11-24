"use client";

import * as React from "react";

import {
  Command as CommandRoot,
  CommandEmpty as CommandEmptyPart,
  CommandGroup as CommandGroupPart,
  CommandGroupLabel,
  CommandInput as CommandInputPart,
  CommandItem as CommandItemPart,
  CommandList as CommandListPart,
} from "@ui-sdk/react/command";
import { renderElement, type RenderProp } from "@ui-sdk/react/primitive";
import { Search } from "lucide-react";

import { createCommandRanker } from "../../../lib/command-rank";
import { commandScore } from "../../../lib/command-score";
import {
  type AsChildProps,
  asChildProps,
  type DataAttributes,
  type NarrowPartProps,
  useElementRef,
  withDataAttributes,
} from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";
import { Dialog, DialogContent, DialogTitle } from "../../atoms/dialog/dialog";

type SearchHandler = (search: string) => void;

type ItemScore = (value: string, search: string, keywords?: string[]) => number;

type SearchBinding = {
  label?: string;
  query: string;
  score?: ItemScore;
  setQuery: (query: string) => void;
  setSearchHandler: (handler?: SearchHandler) => void;
};

const SearchContext = React.createContext<null | SearchBinding>(null);

type CommandProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange" | "onSelect"
> & {
  asChild?: boolean;
  /** Highlighted item when uncontrolled. */
  defaultValue?: string;
  /**
   * Replaces the built-in cmdk match. Return a score: `0` hides the item and
   * a higher score ranks first.
   */
  filter?: ItemScore;
  /** Accessible name of the search field and the list. */
  label?: string;
  /** Wraps the highlight from the last item to the first. */
  loop?: boolean;
  /** Runs when the highlight moves, with the highlighted item's value. */
  onValueChange?: (value: string) => void;
  /** Set `false` to keep every item, for results that are already filtered. */
  shouldFilter?: boolean;
  /** Highlighted item's value. Pass it to control the highlight. */
  value?: string;
};

/**
 * Search field over a list of commands. The cmdk-style API (`shouldFilter`,
 * `onValueChange`, `value` on items) sits on top of the ui-sdk command, and
 * parts keep the `cmdk-*` attributes that styles and tests select on.
 */
const Command = ({
  asChild,
  children,
  className,
  defaultValue,
  filter,
  label,
  loop = false,
  onValueChange,
  ref,
  shouldFilter = true,
  value,
  ...props
}: CommandProps) => {
  const [query, setQuery] = React.useState("");
  const onSearchChangeRef = React.useRef<
    ((search: string) => void) | undefined
  >(undefined);
  const slot = asChildProps({ asChild, children });
  const setSearchHandler = React.useCallback((handler?: SearchHandler) => {
    onSearchChangeRef.current = handler;
  }, []);
  const score = shouldFilter ? (filter ?? commandScore) : undefined;
  const binding = React.useMemo(
    () => ({ label, query, score, setQuery, setSearchHandler }),
    [label, query, score, setSearchHandler],
  );
  const handleQueryChange = (next: string) => {
    setQuery(next);
    onSearchChangeRef.current?.(next);
  };
  const rank: React.ComponentProps<typeof CommandRoot>["filter"] = score
    ? (item, search) => score(item.label, search, item.keywords)
    : false;

  return (
    <SearchContext value={binding}>
      <CommandRoot
        autoHighlight
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
          className,
        )}
        cmdk-root=""
        defaultValue={defaultValue}
        filter={rank}
        loop={loop}
        onQueryChange={handleQueryChange}
        onValueChange={(next) => {
          onValueChange?.(next ?? "");
        }}
        query={query}
        ref={ref}
        render={slot.render}
        value={value}
        {...props}
      >
        {slot.children}
      </CommandRoot>
    </SearchContext>
  );
};
Command.displayName = "Command";

export type CommandDialogProps = React.ComponentProps<typeof Dialog>;

const CommandDialog = ({ children, ...props }: CommandDialogProps) => (
  <Dialog {...props}>
    <DialogContent className="overflow-hidden p-0 shadow-lg">
      <DialogTitle className="sr-only">Command Menu</DialogTitle>
      <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
        {children}
      </Command>
    </DialogContent>
  </Dialog>
);
CommandDialog.displayName = "CommandDialog";

type CommandInputProps = Omit<
  React.ComponentProps<"input">,
  "className" | "defaultValue" | "onChange" | "value"
> & {
  className?: string;
  /** Runs with the search text as the user types. */
  onValueChange?: (search: string) => void;
  /** Search text. Pass it, with `onValueChange`, to control the field. */
  value?: string;
};

const CommandInput = ({
  className,
  onValueChange,
  ref,
  value,
  ...props
}: CommandInputProps) => {
  const search = React.use(SearchContext);
  const setQuery = search?.setQuery;
  const setSearchHandler = search?.setSearchHandler;

  React.useEffect(() => {
    setSearchHandler?.(onValueChange);
  });
  React.useEffect(() => {
    if (value !== undefined) {
      setQuery?.(value);
    }
  }, [setQuery, value]);

  return (
    <div
      className="flex items-center border-b px-3 focus-within:border-ring"
      cmdk-input-wrapper=""
    >
      <Search className="mr-2 size-4 shrink-0 opacity-50" />
      <CommandInputPart
        aria-label={search?.label}
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        cmdk-input=""
        ref={ref}
        {...props}
      />
    </div>
  );
};
CommandInput.displayName = "CommandInput";

type CommandListProps = Omit<
  React.ComponentProps<typeof CommandListPart>,
  "className" | "render"
> & {
  className?: string;
  /** Accessible name of the list. Defaults to `"Suggestions"`. */
  label?: string;
};

const keywordSeparator = "\n";

const itemScore = (
  item: HTMLElement,
  query: string,
  score?: ItemScore,
): number => {
  if (!score || query.trim() === "") {
    return 0;
  }
  const value =
    item.dataset.value ?? (item.textContent ?? "").replaceAll(/\s+/g, " ");
  return score(
    value.trim(),
    query,
    item.dataset.keywords?.split(keywordSeparator),
  );
};

/** True inside `CommandList`: its listbox holds options and groups, nothing else. */
const InListContext = React.createContext(false);

const CommandList = ({ className, label, ref, ...props }: CommandListProps) => {
  const search = React.use(SearchContext);
  const [list, listReference] = useElementRef(ref);
  const [ranker] = React.useState(createCommandRanker);
  const query = search?.query ?? "";
  const score = search?.score;

  React.useLayoutEffect(() => {
    if (!list) {
      return;
    }
    const arrange = () => {
      ranker.arrange(list, (item) => itemScore(item, query, score));
    };
    arrange();
    const observer = new MutationObserver(arrange);
    observer.observe(list, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
    };
  }, [list, query, ranker, score]);

  return (
    <InListContext value>
      <CommandListPart
        aria-label={label ?? search?.label ?? "Suggestions"}
        className={cn(
          "max-h-[300px] overflow-y-auto overflow-x-hidden",
          className,
        )}
        cmdk-list=""
        ref={listReference}
        {...props}
      />
    </InListContext>
  );
};
CommandList.displayName = "CommandList";

type CommandEmptyProps = Omit<
  React.ComponentProps<typeof CommandEmptyPart>,
  "className" | "render"
>;

/**
 * cmdk's empty state inside the list. A listbox may not hold a live region,
 * so cmdk rendered it as presentational, and so does this.
 */
const presentational: RenderProp<unknown> = (props, state) =>
  renderElement(
    "div",
    {
      ...props,
      "aria-atomic": undefined,
      "aria-live": undefined,
      role: "presentation",
    },
    undefined,
    state,
  );

/**
 * Shown when no command matches. Outside `CommandList`, a live region
 * announces the message; inside the list, as with cmdk, the element is
 * presentational.
 */
const CommandEmpty = ({ ref, ...props }: CommandEmptyProps) => {
  const inList = React.use(InListContext);

  return (
    <CommandEmptyPart
      className="py-6 text-center text-sm empty:py-0"
      cmdk-empty=""
      ref={ref}
      render={inList ? presentational : undefined}
      {...props}
    />
  );
};
CommandEmpty.displayName = "CommandEmpty";

type CommandGroupProps = Omit<
  React.ComponentProps<typeof CommandGroupPart>,
  "children" | "className" | "render"
> & {
  children?: React.ReactNode;
  className?: string;
  /** Title shown above the group. */
  heading?: React.ReactNode;
};

const CommandGroup = ({
  children,
  className,
  heading,
  ref,
  ...props
}: CommandGroupProps) => (
  <CommandGroupPart
    className={cn(
      "overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className,
    )}
    cmdk-group=""
    ref={ref}
    {...props}
  >
    {heading ? (
      <CommandGroupLabel cmdk-group-heading="">{heading}</CommandGroupLabel>
    ) : null}
    {children}
  </CommandGroupPart>
);
CommandGroup.displayName = "CommandGroup";

/**
 * Visual divider between groups. It renders as a hidden decoration rather
 * than `role="separator"`, which a listbox may not contain (WAI-ARIA 1.2).
 * Like cmdk's separator it hides while a search query is active unless you
 * pass `alwaysRender`.
 */
const CommandSeparator = ({
  alwaysRender = false,
  className,
  ref,
  ...props
}: React.ComponentProps<"div"> & { alwaysRender?: boolean }) => {
  const searching = React.use(SearchContext)?.query !== "";
  if (searching && !alwaysRender) return null;
  return (
    <div
      aria-hidden="true"
      className={cn("-mx-1 h-px bg-border", className)}
      ref={ref}
      {...props}
    />
  );
};
CommandSeparator.displayName = "CommandSeparator";

const itemAttributes = (state: {
  disabled: boolean;
  highlighted: boolean;
}): DataAttributes => ({
  "data-disabled": state.disabled ? "true" : "false",
  "data-selected": state.highlighted ? "true" : "false",
});

type CommandItemProps = Omit<
  AsChildProps & NarrowPartProps<React.ComponentProps<typeof CommandItemPart>>,
  "label" | "onSelect" | "value"
> & {
  /** Extra words the search matches. */
  keywords?: string[];
  /** Runs on choice, with the item's value. */
  onSelect?: (value: string) => void;
  /**
   * Identifies the item and is the text the search matches. Without it, the
   * item's text content takes its place.
   */
  value?: string;
};

const CommandItem = ({
  asChild,
  children,
  className,
  disabled,
  keywords,
  onSelect,
  ref,
  value,
  ...props
}: CommandItemProps) => {
  const [item, itemReference] = useElementRef(ref);
  const slot = asChildProps({ asChild, children });
  const trimmed = value?.trim();

  return (
    <CommandItemPart
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:opacity-50",
        disabled && "pointer-events-none",
        className,
      )}
      cmdk-item=""
      data-keywords={keywords?.join(keywordSeparator)}
      data-value={trimmed}
      disabled={disabled}
      keywords={keywords}
      label={trimmed}
      onSelect={() => {
        onSelect?.(trimmed ?? item?.textContent?.trim() ?? "");
      }}
      ref={itemReference}
      render={withDataAttributes("div", itemAttributes, slot.render)}
      value={trimmed}
      {...props}
    >
      {slot.children}
    </CommandItemPart>
  );
};
CommandItem.displayName = "CommandItem";

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
