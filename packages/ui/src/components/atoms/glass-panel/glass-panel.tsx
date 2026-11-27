import type { MaterialProps } from "../../../lib/material";
import { named } from "../../../lib/named";
import { cn } from "../../../lib/utils";

/** Props for {@link GlassPanel}. `material="solid"` opts out of glass. */
export type GlassPanelProps = MaterialProps &
  React.ComponentPropsWithoutRef<"div">;

const GlassPanel = /* @__PURE__ */ named(
  "GlassPanel",
  ({
    children,
    className,
    material = "glass",
    ref,
    ...props
  }: GlassPanelProps & { ref?: React.Ref<HTMLDivElement> }) => (
    <div
      className={cn(
        "vllnt-glass vllnt-glass-dense rounded-2xl border",
        className,
      )}
      data-glass={material === "glass" ? "on" : undefined}
      data-material={material}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  ),
);

export { GlassPanel };
