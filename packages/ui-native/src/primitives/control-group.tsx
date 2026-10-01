import { createContext, use, useMemo } from "react";

/**
 * Name and disabled state that a group container (ButtonGroup, FilterBar,
 * Toolbar, Fieldset) hands to the package controls inside it. VoiceOver
 * ignores labels and state on non-focusable containers, so the controls
 * speak the group name as their hint and apply the disabled state.
 */
type ControlGroup = {
  readonly disabled?: boolean;
  readonly label?: string;
};

const ControlGroupContext = createContext<ControlGroup>({});

/** Reads the nearest control group. */
function useControlGroup(): ControlGroup {
  return use(ControlGroupContext);
}

/** Merges a group's own name and state with any enclosing group. */
function useNestedControlGroup(own: ControlGroup): ControlGroup {
  const outer = use(ControlGroupContext);
  const disabled = own.disabled === true || outer.disabled === true;
  const label = own.label ?? outer.label;
  return useMemo(() => ({ disabled, label }), [disabled, label]);
}

export type { ControlGroup };
export { ControlGroupContext, useControlGroup, useNestedControlGroup };
