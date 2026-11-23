import type * as React from "react";

type AspectRatioProps = React.ComponentProps<"div"> & {
  /** Width divided by height, for example `16 / 9`. Defaults to `1`. */
  ratio?: number;
};

/**
 * Keeps its content at a fixed width-to-height ratio. The outer box takes the
 * full width and reserves the height; the content fills it.
 *
 * @param props - `ratio` plus any `div` props, which go to the content box.
 * @returns The sized wrapper with the content box inside.
 * @example
 * <AspectRatio ratio={16 / 9}><img alt="" className="size-full object-cover" src="/a.jpg" /></AspectRatio>
 */
function AspectRatio({
  ratio = 1,
  style,
  ...props
}: AspectRatioProps): React.ReactElement {
  return (
    <div
      data-aspect-ratio-wrapper=""
      style={{
        paddingBottom: `${100 / ratio}%`,
        position: "relative",
        width: "100%",
      }}
    >
      <div {...props} style={{ ...style, inset: 0, position: "absolute" }} />
    </div>
  );
}

export type { AspectRatioProps };
export { AspectRatio };
