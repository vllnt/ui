"use client";

import * as React from "react";

import { X } from "lucide-react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge";

function normalizeTag(tag: string) {
  return tag.trim();
}

function getNormalizedTags(tags: string[]) {
  return tags
    .map(normalizeTag)
    .filter(
      (tag, index, values) => tag.length > 0 && values.indexOf(tag) === index,
    );
}

function shouldAddTagFromKey(key: string) {
  return key === "Enter" || key === ",";
}

type TagsInputStateOptions = {
  defaultValue: string[];
  onValueChange?: (value: string[]) => void;
  value?: string[];
};

type TagsInputHandlersOptions = {
  disabled: boolean;
  inputValue: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  tags: string[];
  updateTags: (nextTags: string[]) => void;
};

type TagListProps = {
  disabled: boolean;
  onRemove: (tag: string) => void;
  tags: string[];
};

function useTagsInputState({
  defaultValue,
  onValueChange,
  value,
}: TagsInputStateOptions) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(() =>
    getNormalizedTags(defaultValue),
  );
  const isControlled = value !== undefined;
  const tags = React.useMemo(
    () => getNormalizedTags(value ?? uncontrolledValue),
    [uncontrolledValue, value],
  );

  const updateTags = React.useCallback(
    (nextTags: string[]) => {
      const normalizedTags = getNormalizedTags(nextTags);

      if (!isControlled) {
        setUncontrolledValue(normalizedTags);
      }

      onValueChange?.(normalizedTags);
    },
    [isControlled, onValueChange],
  );

  return { tags, updateTags };
}

function useTagsInputHandlers({
  disabled,
  inputValue,
  onKeyDown,
  setInputValue,
  tags,
  updateTags,
}: TagsInputHandlersOptions) {
  const removeTag = React.useCallback(
    (tagToRemove: string) => {
      updateTags(tags.filter((tag) => tag !== tagToRemove));
    },
    [tags, updateTags],
  );

  const commitTag = React.useCallback(() => {
    const nextTag = normalizeTag(inputValue);

    if (nextTag.length === 0 || tags.includes(nextTag)) {
      setInputValue("");
      return;
    }

    updateTags([...tags, nextTag]);
    setInputValue("");
  }, [inputValue, setInputValue, tags, updateTags]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);

      if (event.defaultPrevented || disabled) {
        return;
      }

      if (shouldAddTagFromKey(event.key)) {
        event.preventDefault();
        commitTag();
        return;
      }

      if (
        (event.key === "Backspace" || event.key === "Delete") &&
        inputValue.length === 0
      ) {
        const lastTag = tags.at(-1);

        if (lastTag) {
          event.preventDefault();
          removeTag(lastTag);
        }
      }
    },
    [commitTag, disabled, inputValue.length, onKeyDown, removeTag, tags],
  );

  return { handleKeyDown, removeTag };
}

function TagList({ disabled, onRemove, tags }: TagListProps) {
  return (
    <ul className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <Badge
            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm"
            variant="secondary"
          >
            <span>{tag}</span>
            <button
              aria-label={`Remove ${tag}`}
              className="rounded-sm outline-none ring-offset-background transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation();
                onRemove(tag);
              }}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        </li>
      ))}
    </ul>
  );
}

export type TagsInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "defaultValue" | "onChange" | "value"
> & {
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  value?: string[];
};

const TagsInput = React.forwardRef<HTMLInputElement, TagsInputProps>(
  (
    {
      className,
      defaultValue = [],
      disabled = false,
      onBlur,
      onKeyDown,
      onValueChange,
      placeholder = "Add a tag",
      value,
      ...props
    },
    ref,
  ) => {
    const [inputValue, setInputValue] = React.useState("");
    const { tags, updateTags } = useTagsInputState({
      defaultValue,
      onValueChange,
      value,
    });
    const { handleKeyDown, removeTag } = useTagsInputHandlers({
      disabled,
      inputValue,
      onKeyDown,
      setInputValue,
      tags,
      updateTags,
    });

    return (
      <div
        aria-disabled={disabled || undefined}
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        data-disabled={disabled ? "true" : undefined}
        role="group"
      >
        <TagList disabled={disabled} onRemove={removeTag} tags={tags} />
        <input
          {...props}
          className="min-w-[8rem] flex-1 border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed"
          disabled={disabled}
          onBlur={onBlur}
          onChange={(event) => {
            setInputValue(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={ref}
          type="text"
          value={inputValue}
        />
      </div>
    );
  },
);
TagsInput.displayName = "TagsInput";

export { TagsInput };
