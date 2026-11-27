import { cx } from "../../../lib/cx";

/** Props for the {@link UnstyledButton} component. */
export type UnstyledButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    ref?: React.Ref<HTMLButtonElement>;
  };

/**
 * A `button` with no classes of its own: it renders the caller's `className`
 * (joined by `cx`, without `tailwind-merge`) and every native attribute. The
 * caller styles hover, focus and disabled states. `type` defaults to
 * `"button"`; pass `type="submit"` to submit a form. For `asChild`, use
 * `Button variant="unstyled"`.
 * @example
 * <UnstyledButton className="rounded-sm px-3 focus-visible:ring-2" type="button">
 *   A
 * </UnstyledButton>
 */
const UnstyledButton = ({
  className,
  ref,
  type = "button",
  ...props
}: UnstyledButtonProps) => (
  <button
    className={cx(className) || undefined}
    ref={ref}
    type={type === "submit" ? "submit" : type === "reset" ? "reset" : "button"}
    {...props}
  />
);
UnstyledButton.displayName = "UnstyledButton";

export { UnstyledButton };
