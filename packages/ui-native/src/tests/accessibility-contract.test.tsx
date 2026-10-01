import { fireEvent, screen } from "@testing-library/react-native";

import manifest from "../../registry.json";

import {
  accessibilityFixtureActions,
  accessibilityFixtures,
} from "./accessibility-fixtures";
import { renderThemed } from "./test-utils";

/**
 * Native accessibility contract.
 *
 * Every component in `registry.json` renders a representative fixture, and
 * its host tree meets these rules on BOTH iOS and Android:
 *
 * - R1 interactive-name-role: pressable hosts have a role and a name.
 * - R2 nested-accessible: no pressable, text input, switch or element with a
 *   control/value role (progressbar, checkbox, …) inside an `accessible`
 *   ancestor (iOS merges it into the ancestor and it becomes unreachable for
 *   VoiceOver, Switch Control and Voice Control).
 * - R3 ios-ignored-semantics: label, hint, value, state, actions and leaf
 *   roles belong on `accessible` elements (iOS reads them nowhere else).
 *   Grouping roles (list, radiogroup, tablist, …) may stay on plain
 *   containers.
 * - R4 state: toggles expose `checked` (radios never also `selected`), tabs
 *   expose `selected`, adjustable controls expose value text plus
 *   increment/decrement actions, progress exposes a value or `busy`.
 * - R5 names: text inputs carry their own label (`accessibilityLabelledBy`
 *   works on Android alone), images and other accessible elements with a leaf
 *   role (progressbar, adjustable, …) have a name, `accessible` groups have a
 *   name or role, and visible modals set `accessibilityViewIsModal`.
 * - R6 hidden-both-platforms: decorative content hides from VoiceOver and
 *   TalkBack together; `importantForAccessibility="no"` never wraps text;
 *   standalone punctuation or symbol glyphs stay out of the reading order.
 * - R7 touch-target: pressable hosts reach 44×44 pt and editable text inputs
 *   reach 44 pt tall (style, stretch/absolute layout + hitSlop).
 * - R8 roles/props: `accessibilityRole` names a React Native role, `role`
 *   names an ARIA role React Native maps, and no unsupported (no-op)
 *   `aria-*` prop appears.
 * - R9 label-hides-content: an explicit label on an accessible element
 *   replaces its visible text, so the label, value text or hint repeats every
 *   visible text run (longer than three characters, not a glyph, not a
 *   numeric restatement of a progress value).
 */

type Props = Readonly<Record<string, unknown>>;
type HostNode = {
  readonly children: readonly (HostNode | string)[];
  readonly props: Props;
  readonly type: string;
};
type Visit = {
  readonly ancestors: readonly HostNode[];
  readonly hidden: boolean;
  readonly node: HostNode;
};

const MIN_TARGET = 44;
const CONTAINER_ROLES = new Set([
  "grid",
  "list",
  "menu",
  "menubar",
  "none",
  "radiogroup",
  "tablist",
  "tabbar",
  "toolbar",
]);
const NATIVE_ROLES = new Set(
  "none button togglebutton link search image keyboardkey text adjustable imagebutton header summary alert checkbox combobox menu menubar menuitem progressbar radio radiogroup scrollbar spinbutton switch tab tabbar tablist timer list toolbar grid dropdownlist pager drawerlayout slidingdrawer iconmenu".split(
    " ",
  ),
);
const ARIA_ROLES = new Set(
  "alert alertdialog application article banner button cell checkbox columnheader combobox complementary contentinfo definition dialog directory document feed figure form grid group heading img link list listitem log main marquee math menu menubar menuitem meter navigation none note option presentation progressbar radio radiogroup region row rowgroup rowheader scrollbar searchbox separator slider spinbutton status summary switch tab table tablist tabpanel term timer toolbar tooltip tree treegrid treeitem".split(
    " ",
  ),
);
const SUPPORTED_ARIA = new Set([
  "aria-busy",
  "aria-checked",
  "aria-disabled",
  "aria-expanded",
  "aria-hidden",
  "aria-label",
  "aria-labelledby",
  "aria-live",
  "aria-modal",
  "aria-selected",
  "aria-valuemax",
  "aria-valuemin",
  "aria-valuenow",
  "aria-valuetext",
]);
const STATE_ARIA = [
  "aria-busy",
  "aria-checked",
  "aria-disabled",
  "aria-expanded",
  "aria-selected",
  "aria-valuenow",
  "aria-valuetext",
];
const TOGGLE_ROLES = new Set(["checkbox", "radio", "switch", "togglebutton"]);
const ADJUSTABLE_ROLES = new Set(["adjustable", "slider", "spinbutton"]);
const PROGRESS_ROLES = new Set(["meter", "progressbar"]);
const IMAGE_ROLES = new Set(["image", "img"]);
const INPUT_TYPES = new Set(["RCTSwitch", "TextInput"]);
const NESTED_SEMANTIC_ROLES = new Set([
  "adjustable",
  "button",
  "checkbox",
  "combobox",
  "link",
  "menuitem",
  "meter",
  "progressbar",
  "radio",
  "slider",
  "spinbutton",
  "switch",
  "tab",
  "timer",
  "togglebutton",
]);
const DECORATIVE_GLYPH = /^[\p{P}\p{S}\s]+$/u;

function isRecord(value: unknown): value is Props {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Converts `toJSON()` output into typed host nodes. */
function toHostNodes(value: unknown): HostNode[] {
  if (Array.isArray(value)) return value.flatMap(toHostNodes);
  if (!isRecord(value) || typeof value.type !== "string") return [];
  const children: (HostNode | string)[] = Array.isArray(value.children)
    ? value.children.flatMap((child: unknown): (HostNode | string)[] =>
        typeof child === "string" ? [child] : toHostNodes(child),
      )
    : [];
  return [
    {
      children,
      props: isRecord(value.props) ? value.props : {},
      type: value.type,
    },
  ];
}

function flattenStyle(style: unknown): Props {
  if (Array.isArray(style))
    return style.reduce<Props>(
      (merged, entry: unknown) => ({ ...merged, ...flattenStyle(entry) }),
      {},
    );
  return isRecord(style) ? style : {};
}

function numberOf(style: Props, key: string): number | undefined {
  const value = style[key];
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function stringOf(props: Props, key: string): string | undefined {
  const value = props[key];
  return typeof value === "string" ? value : undefined;
}

function hides(props: Props): boolean {
  return (
    props.accessibilityElementsHidden === true ||
    props.importantForAccessibility === "no-hide-descendants" ||
    props["aria-hidden"] === true
  );
}

function roleOf(props: Props): string | undefined {
  return stringOf(props, "accessibilityRole") ?? stringOf(props, "role");
}

function labelOf(props: Props): string {
  return (
    stringOf(props, "accessibilityLabel") ??
    stringOf(props, "aria-label") ??
    ""
  ).trim();
}

function stateOf(props: Props): Props {
  const state = isRecord(props.accessibilityState)
    ? props.accessibilityState
    : {};
  const aria = (key: string) => props[`aria-${key}`];
  return {
    ...state,
    ...(aria("busy") === undefined ? {} : { busy: aria("busy") }),
    ...(aria("checked") === undefined ? {} : { checked: aria("checked") }),
    ...(aria("disabled") === undefined ? {} : { disabled: aria("disabled") }),
    ...(aria("expanded") === undefined ? {} : { expanded: aria("expanded") }),
    ...(aria("selected") === undefined ? {} : { selected: aria("selected") }),
  };
}

function valueOf(props: Props): Props {
  const value = isRecord(props.accessibilityValue)
    ? props.accessibilityValue
    : {};
  return {
    ...value,
    ...(props["aria-valuenow"] === undefined
      ? {}
      : { now: props["aria-valuenow"] }),
    ...(props["aria-valuetext"] === undefined
      ? {}
      : { text: props["aria-valuetext"] }),
  };
}

function actionNames(props: Props): string[] {
  return Array.isArray(props.accessibilityActions)
    ? props.accessibilityActions.flatMap((action: unknown) =>
        isRecord(action) && typeof action.name === "string"
          ? [action.name]
          : [],
      )
    : [];
}

/** Text a screen reader reads from a subtree, skipping hidden branches. */
function visibleText(node: HostNode): string {
  if (hides(node.props)) return "";
  return node.children
    .map((child) => (typeof child === "string" ? child : visibleText(child)))
    .join("");
}

function nameOf(node: HostNode): string {
  const label = labelOf(node.props);
  return label || visibleText(node).trim();
}

function isInteractive(node: HostNode): boolean {
  const { props } = node;
  if (INPUT_TYPES.has(node.type) || props.accessible === false) return false;
  return ["onClick", "onPress", "onResponderRelease"].some(
    (key) => typeof props[key] === "function",
  );
}

/** Text hosts are accessible on iOS unless explicitly opted out. */
function isAccessibleElement(node: HostNode): boolean {
  if (node.type === "Text" || INPUT_TYPES.has(node.type))
    return node.props.accessible !== false;
  return node.props.accessible === true;
}

function summarize(node: HostNode): string {
  return `${node.type}[${roleOf(node.props) ?? "-"}] "${nameOf(node).slice(0, 40)}"`;
}

function hasTextContent(node: HostNode): boolean {
  if (node.type === "Text" || node.type === "TextInput") return true;
  return node.children.some(
    (child) => typeof child !== "string" && hasTextContent(child),
  );
}

/** Estimated outer height of a node including its vertical margins. */
function blockHeight(node: HostNode): number {
  const style = flattenStyle(node.props.style);
  if (style.position === "absolute") return 0;
  const margin =
    (numberOf(style, "marginTop") ??
      numberOf(style, "marginVertical") ??
      numberOf(style, "margin") ??
      0) +
    (numberOf(style, "marginBottom") ??
      numberOf(style, "marginVertical") ??
      numberOf(style, "margin") ??
      0);
  return (ownHeight(node) ?? 0) + margin;
}

function verticalChrome(style: Props): number {
  const padding =
    (numberOf(style, "paddingTop") ??
      numberOf(style, "paddingVertical") ??
      numberOf(style, "padding") ??
      0) +
    (numberOf(style, "paddingBottom") ??
      numberOf(style, "paddingVertical") ??
      numberOf(style, "padding") ??
      0);
  const border =
    (numberOf(style, "borderTopWidth") ?? numberOf(style, "borderWidth") ?? 0) +
    (numberOf(style, "borderBottomWidth") ??
      numberOf(style, "borderWidth") ??
      0);
  return padding + border;
}

function horizontalChrome(style: Props): number {
  const padding =
    (numberOf(style, "paddingLeft") ??
      numberOf(style, "paddingStart") ??
      numberOf(style, "paddingHorizontal") ??
      numberOf(style, "padding") ??
      0) +
    (numberOf(style, "paddingRight") ??
      numberOf(style, "paddingEnd") ??
      numberOf(style, "paddingHorizontal") ??
      numberOf(style, "padding") ??
      0);
  const border =
    (numberOf(style, "borderLeftWidth") ??
      numberOf(style, "borderWidth") ??
      0) +
    (numberOf(style, "borderRightWidth") ??
      numberOf(style, "borderWidth") ??
      0);
  return padding + border;
}

function isRow(style: Props): boolean {
  return style.flexDirection === "row" || style.flexDirection === "row-reverse";
}

/** Estimated inner-content height, stacking children by flex direction. */
function contentHeight(node: HostNode): number {
  const style = flattenStyle(node.props.style);
  const heights = node.children.flatMap((child) =>
    typeof child === "string" ? [] : [blockHeight(child)],
  );
  if (heights.length === 0) return 0;
  if (isRow(style)) return Math.max(...heights);
  const gap = numberOf(style, "rowGap") ?? numberOf(style, "gap") ?? 0;
  return (
    heights.reduce((sum, height) => sum + height, 0) +
    gap * (heights.length - 1)
  );
}

/** Own height: explicit, else the larger of minHeight and the estimate. */
function ownHeight(node: HostNode): number | undefined {
  const style = flattenStyle(node.props.style);
  const explicit = style.height;
  if (typeof explicit === "string") return undefined;
  const fixed = numberOf(style, "height");
  if (fixed !== undefined) return fixed;
  const minimum = numberOf(style, "minHeight") ?? 0;
  const lineHeight =
    numberOf(style, "lineHeight") ?? (numberOf(style, "fontSize") ?? 14) * 1.2;
  if (node.type === "Text") return Math.max(minimum, lineHeight);
  if (node.type === "TextInput")
    return Math.max(minimum, verticalChrome(style) + lineHeight);
  return Math.max(minimum, verticalChrome(style) + contentHeight(node));
}

/**
 * Laid-out height of a target: its own estimate, grown to the parent's inner
 * height when a row stretches it or absolute `top`/`bottom` pin it.
 */
function targetHeight(
  node: HostNode,
  parent: HostNode | undefined,
): number | undefined {
  const own = ownHeight(node);
  if (own === undefined || !parent) return own;
  const style = flattenStyle(node.props.style);
  if (numberOf(style, "height") !== undefined) return own;
  const parentStyle = flattenStyle(parent.props.style);
  const parentInner = (ownHeight(parent) ?? 0) - verticalChrome(parentStyle);
  const top = numberOf(style, "top");
  const bottom = numberOf(style, "bottom");
  if (style.position === "absolute")
    return top !== undefined && bottom !== undefined
      ? Math.max(own, parentInner - top - bottom)
      : own;
  const alignSelf = style.alignSelf ?? "auto";
  const stretched =
    alignSelf === "stretch" ||
    (alignSelf === "auto" &&
      (parentStyle.alignItems ?? "stretch") === "stretch");
  return isRow(parentStyle) && stretched ? Math.max(own, parentInner) : own;
}

function estimatedContentWidth(node: HostNode): number {
  const style = flattenStyle(node.props.style);
  const widths = node.children.flatMap((child) => {
    if (typeof child === "string") return [];
    const childStyle = flattenStyle(child.props.style);
    if (childStyle.position === "absolute") return [];
    const width =
      numberOf(childStyle, "width") ??
      Math.max(
        numberOf(childStyle, "minWidth") ?? 0,
        horizontalChrome(childStyle) + estimatedContentWidth(child),
      );
    return [width];
  });
  if (widths.length === 0) return 0;
  if (!isRow(style)) return Math.max(...widths);
  const gap = numberOf(style, "columnGap") ?? numberOf(style, "gap") ?? 0;
  return (
    widths.reduce((sum, width) => sum + width, 0) + gap * (widths.length - 1)
  );
}

/** Own width when layout allows an estimate; `undefined` when it stretches. */
function ownWidth(
  node: HostNode,
  parent: HostNode | undefined,
): number | undefined {
  const style = flattenStyle(node.props.style);
  if (typeof style.width === "string") return undefined;
  const fixed = numberOf(style, "width");
  if (fixed !== undefined) return fixed;
  if (style.flex !== undefined || style.flexGrow !== undefined)
    return undefined;
  if (hasTextContent(node)) return undefined;
  const parentStyle = parent ? flattenStyle(parent.props.style) : {};
  const shrinks =
    isRow(parentStyle) ||
    ["baseline", "center", "flex-end", "flex-start"].includes(
      String(parentStyle.alignItems),
    ) ||
    (style.alignSelf !== undefined &&
      !["auto", "stretch"].includes(String(style.alignSelf)));
  if (!shrinks) return undefined;
  return Math.max(
    numberOf(style, "minWidth") ?? 0,
    horizontalChrome(style) + estimatedContentWidth(node),
  );
}

function hitSlopOf(props: Props) {
  const slop = props.hitSlop;
  if (typeof slop === "number")
    return { horizontal: slop * 2, vertical: slop * 2 };
  if (!isRecord(slop)) return { horizontal: 0, vertical: 0 };
  const side = (key: string) => {
    const value = slop[key];
    return typeof value === "number" ? value : 0;
  };
  return {
    horizontal: side("left") + side("right"),
    vertical: side("top") + side("bottom"),
  };
}

function interactiveRule({ node }: Visit): string[] {
  if (!isInteractive(node)) return [];
  const violations: string[] = [];
  const role = roleOf(node.props);
  if (!role || role === "none")
    violations.push(`interactive-name-role: ${summarize(node)} has no role`);
  if (!nameOf(node))
    violations.push(`interactive-name-role: ${summarize(node)} has no name`);
  return violations;
}

/** Pressables (height and width) and text inputs (height) reach 44 pt. */
function touchTargetRule({ ancestors, node }: Visit): string[] {
  const input = node.type === "TextInput" && node.props.editable !== false;
  if (!isInteractive(node) && !input) return [];
  const violations: string[] = [];
  const slop = hitSlopOf(node.props);
  const parent = ancestors.at(-1);
  const height = targetHeight(node, parent);
  if (height !== undefined && height + slop.vertical < MIN_TARGET)
    violations.push(
      `touch-target: ${summarize(node)} height ${Math.round(height + slop.vertical)} < ${MIN_TARGET}`,
    );
  const width = input ? undefined : ownWidth(node, parent);
  if (width !== undefined && width + slop.horizontal < MIN_TARGET)
    violations.push(
      `touch-target: ${summarize(node)} width ${Math.round(width + slop.horizontal)} < ${MIN_TARGET}`,
    );
  return violations;
}

function nestedRule({ ancestors, node }: Visit): string[] {
  const role = roleOf(node.props);
  const semantic =
    isAccessibleElement(node) &&
    role !== undefined &&
    NESTED_SEMANTIC_ROLES.has(role);
  if (!isInteractive(node) && !INPUT_TYPES.has(node.type) && !semantic)
    return [];
  const container = [...ancestors]
    .reverse()
    .find((ancestor) => ancestor.props.accessible === true);
  return container
    ? [
        `nested-accessible: ${summarize(node)} inside accessible ${summarize(container)}`,
      ]
    : [];
}

/** Semantics a non-accessible host carries that iOS never reads. */
function ignoredSemantics(node: HostNode): string[] {
  const { props } = node;
  const carried: string[] = [];
  if (labelOf(props)) carried.push("label");
  if (stringOf(props, "accessibilityHint")) carried.push("hint");
  const value = valueOf(props);
  if (value.now !== undefined || value.text !== undefined)
    carried.push("value");
  const state = isRecord(props.accessibilityState)
    ? props.accessibilityState
    : {};
  const stateKeys = Object.keys(state).filter(
    (key) => state[key] !== undefined,
  );
  if (stateKeys.length > 0) carried.push(`state{${stateKeys.join(",")}}`);
  const ariaState = STATE_ARIA.filter((key) => props[key] !== undefined);
  if (ariaState.length > 0) carried.push(ariaState.join(","));
  if (actionNames(props).length > 0) carried.push("actions");
  const role = roleOf(props);
  if (role && !CONTAINER_ROLES.has(role)) carried.push(`role=${role}`);
  return carried;
}

function iosIgnoredRule({ node }: Visit): string[] {
  if (INPUT_TYPES.has(node.type) || isAccessibleElement(node)) return [];
  const carried = ignoredSemantics(node);
  return carried.length > 0
    ? [
        `ios-ignored-semantics: ${summarize(node)} not accessible but sets ${carried.join(" ")}`,
      ]
    : [];
}

function stateRules({ node }: Visit): string[] {
  const role = roleOf(node.props);
  if (!role) return [];
  const state = stateOf(node.props);
  const value = valueOf(node.props);
  const violations: string[] = [];
  if (TOGGLE_ROLES.has(role) && state.checked === undefined)
    violations.push(`state: ${summarize(node)} has no checked state`);
  if (role === "radio" && state.selected !== undefined)
    violations.push(`state: ${summarize(node)} sets both checked and selected`);
  if (role === "tab" && state.selected === undefined)
    violations.push(`state: ${summarize(node)} has no selected state`);
  if (ADJUSTABLE_ROLES.has(role)) {
    if (typeof value.text !== "string" || !value.text.trim())
      violations.push(`state: ${summarize(node)} has no value text`);
    const actions = actionNames(node.props);
    if (
      !actions.includes("increment") ||
      !actions.includes("decrement") ||
      typeof node.props.onAccessibilityAction !== "function"
    )
      violations.push(
        `state: ${summarize(node)} lacks increment/decrement actions`,
      );
  }
  if (
    PROGRESS_ROLES.has(role) &&
    value.now === undefined &&
    value.text === undefined &&
    state.busy !== true
  )
    violations.push(`state: ${summarize(node)} has no value or busy state`);
  return violations;
}

function hasModalMarker(node: HostNode): boolean {
  if (
    node.props.accessibilityViewIsModal === true ||
    node.props["aria-modal"] === true
  )
    return true;
  return node.children.some(
    (child) => typeof child !== "string" && hasModalMarker(child),
  );
}

function nameRules({ node }: Visit): string[] {
  const { props } = node;
  const role = roleOf(props);
  if (node.type === "TextInput")
    return labelOf(props)
      ? []
      : [`names: ${summarize(node)} text input has no accessibilityLabel`];
  if (
    (node.type === "Image" || (role && IMAGE_ROLES.has(role))) &&
    props.accessible !== false &&
    !nameOf(node) &&
    !stringOf(props, "alt")
  )
    return [`names: ${summarize(node)} image has no name`];
  if (node.type === "Modal" && props.visible !== false && !hasModalMarker(node))
    return [`names: ${summarize(node)} modal has no accessibilityViewIsModal`];
  if (
    !isAccessibleElement(node) ||
    INPUT_TYPES.has(node.type) ||
    isInteractive(node) ||
    nameOf(node)
  )
    return [];
  if (role && !CONTAINER_ROLES.has(role))
    return [`names: ${summarize(node)} role ${role} has no name`];
  if (node.type !== "Text" && !role)
    return [`names: ${summarize(node)} accessible group has no name or role`];
  return [];
}

function hiddenPairRule({ node }: Visit): string[] {
  const { props } = node;
  if (props["aria-hidden"] === true) return [];
  const iosHidden = props.accessibilityElementsHidden === true;
  const androidHidden =
    props.importantForAccessibility === "no-hide-descendants";
  if (iosHidden && !androidHidden)
    return [`hidden-both-platforms: ${summarize(node)} hidden on iOS only`];
  if (androidHidden && !iosHidden)
    return [`hidden-both-platforms: ${summarize(node)} hidden on Android only`];
  return [];
}

function decorativeRules({ ancestors, hidden, node }: Visit): string[] {
  if (hidden) return [];
  const { props } = node;
  if (props.importantForAccessibility === "no" && visibleText(node).trim())
    return [
      `hidden-both-platforms: ${summarize(node)} importantForAccessibility="no" still exposes its text`,
    ];
  if (node.type !== "Text" || props.accessible === false || labelOf(props))
    return [];
  const text = visibleText(node).trim();
  if (text.length === 0 || text.length > 3 || !DECORATIVE_GLYPH.test(text))
    return [];
  if (ancestors.some((ancestor) => ancestor.props.accessible === true))
    return [];
  return [`hidden-both-platforms: decorative glyph "${text}" is exposed`];
}

/** Visible text runs under an element, stopping at nested accessible ones. */
function textRuns(node: HostNode): string[] {
  return node.children.flatMap((child) => {
    if (typeof child === "string" || hides(child.props)) return [];
    if (child.type === "Text") return [visibleText(child).trim()];
    if (isAccessibleElement(child)) return [];
    return textRuns(child);
  });
}

/** Lower-cases and drops punctuation/symbols so glyph decoration never counts. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replaceAll(/[\p{P}\p{S}\s]+/gu, " ")
    .trim();
}

function labelHidesContentRule({ node }: Visit): string[] {
  const label = labelOf(node.props);
  if (!label || INPUT_TYPES.has(node.type) || !isAccessibleElement(node))
    return [];
  const value = valueOf(node.props);
  const spoken = normalize(
    [
      label,
      typeof value.text === "string" ? value.text : "",
      value.now === undefined ? "" : String(value.now),
      stringOf(node.props, "accessibilityHint") ?? "",
    ].join(" "),
  );
  const role = roleOf(node.props);
  const restatesValue = (run: string) =>
    role !== undefined && PROGRESS_ROLES.has(role) && /\d/.test(run);
  const runs =
    node.type === "Text" ? [visibleText(node).trim()] : textRuns(node);
  const omitted = runs.filter(
    (run) =>
      run.length > 3 &&
      !DECORATIVE_GLYPH.test(run) &&
      !restatesValue(run) &&
      !spoken.includes(normalize(run)),
  );
  return omitted.length > 0
    ? [
        `label-hides-content: ${summarize(node)} label omits visible "${omitted.join('", "')}"`,
      ]
    : [];
}

function propertyRules({ node }: Visit): string[] {
  const { props } = node;
  const violations: string[] = [];
  const nativeRole = stringOf(props, "accessibilityRole");
  if (nativeRole && !NATIVE_ROLES.has(nativeRole))
    violations.push(
      `roles-props: ${summarize(node)} invalid accessibilityRole "${nativeRole}"`,
    );
  const ariaRole = stringOf(props, "role");
  if (ariaRole && !ARIA_ROLES.has(ariaRole))
    violations.push(
      `roles-props: ${summarize(node)} invalid role "${ariaRole}"`,
    );
  const noOps = Object.keys(props).filter(
    (key) => key.startsWith("aria-") && !SUPPORTED_ARIA.has(key),
  );
  if (noOps.length > 0)
    violations.push(
      `roles-props: ${summarize(node)} no-op aria prop ${noOps.join(",")}`,
    );
  return violations;
}

function visitRules(visit: Visit): string[] {
  const always = [...hiddenPairRule(visit), ...decorativeRules(visit)];
  if (visit.hidden) return always;
  return [
    ...always,
    ...interactiveRule(visit),
    ...touchTargetRule(visit),
    ...nestedRule(visit),
    ...iosIgnoredRule(visit),
    ...stateRules(visit),
    ...nameRules(visit),
    ...propertyRules(visit),
    ...labelHidesContentRule(visit),
  ];
}

function walk(
  node: HostNode,
  ancestors: readonly HostNode[],
  hiddenAncestor: boolean,
): string[] {
  const hidden = hiddenAncestor || hides(node.props);
  const own = visitRules({ ancestors, hidden, node });
  const nested = node.children.flatMap((child) =>
    typeof child === "string" ? [] : walk(child, [...ancestors, node], hidden),
  );
  return [...own, ...nested];
}

/** Returns every contract violation in the current rendered host tree. */
function contractViolations(): string[] {
  return toHostNodes(screen.toJSON()).flatMap((root) => walk(root, [], false));
}

const PRESSABLE_ROLES =
  /^(button|combobox|link|menuitem|tab|togglebutton|dropdownlist)$/;

function registryNames(): string[] {
  return manifest.components.map((component) => component.name);
}

it("has an accessibility fixture for every registry component", () => {
  expect(Object.keys(accessibilityFixtures).sort()).toEqual(
    [...registryNames()].sort(),
  );
});

it.each(
  Object.entries(accessibilityFixtures).sort(([left], [right]) =>
    left.localeCompare(right),
  ),
)("%s meets the native accessibility contract", (name, fixture) => {
  renderThemed(fixture());
  const violations = contractViolations();
  for (const control of accessibilityFixtureActions[name] ?? []) {
    const [target] = screen.getAllByRole(PRESSABLE_ROLES, { name: control });
    if (!target) throw new Error(`No control named "${control}"`);
    fireEvent.press(target);
    violations.push(
      ...contractViolations().map(
        (violation) => `after "${control}": ${violation}`,
      ),
    );
  }
  expect([...new Set(violations)]).toEqual([]);
});
