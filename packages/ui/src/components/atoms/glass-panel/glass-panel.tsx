import type { MaterialProps } from "../../../lib/material";
import { cn } from "../../../lib/utils";

/** Props for {@link GlassPanel}. `material="solid"` opts out of glass. */
export type GlassPanelProps = MaterialProps &
  React.ComponentPropsWithoutRef<"div">;

const GlassPanel = ({
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
    data-material={material}
    ref={ref}
    {...props}
  >
    {children}
  </div>
);

GlassPanel.displayName = "GlassPanel";

export { GlassPanel };
