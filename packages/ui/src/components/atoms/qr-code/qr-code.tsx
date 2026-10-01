import { create } from "qrcode";

import { cn } from "../../../lib/utils";

/**
 * Error-correction level. Higher levels tolerate more damage/occlusion at the
 * cost of denser codes: `L` ~7%, `M` ~15%, `Q` ~25%, `H` ~30%.
 */
export type QrCodeLevel = "H" | "L" | "M" | "Q";

/** Props for the {@link QrCode} component. */
export type QrCodeProps = {
  /** Error-correction level. Defaults to `M`. */
  level?: QrCodeLevel;
  /** Quiet-zone margin in modules. Defaults to `4`, the smallest the spec allows. */
  margin?: number;
  /** Rendered width/height in pixels. Defaults to `160`. */
  size?: number;
  /** Accessible label for the code. Defaults to `"QR code"`. */
  title?: string;
  /** The string to encode (URL, text, etc.). */
  value: string;
} & Omit<React.SVGAttributes<SVGSVGElement>, "title">;

function buildPath(data: Uint8Array, count: number, margin: number): string {
  return Array.from({ length: count * count }).reduce<string>(
    (path, _cell, index) => {
      if (data[index] !== 1) return path;
      const x = (index % count) + margin;
      const y = Math.floor(index / count) + margin;
      return `${path}M${x} ${y}h1v1h-1z`;
    },
    "",
  );
}

type QrEncoding = { count: number; path: string };

const ENCODING_CACHE_LIMIT = 32;
const encodingCache = new Map<string, QrEncoding>();

/**
 * Encodes `value` into its module count and SVG path. A small module-level
 * cache keyed on (level, margin, value) lets re-renders with the same inputs
 * skip the encoder. It keeps the latest {@link ENCODING_CACHE_LIMIT} encodings
 * and needs no client hooks.
 */
function encodeQrCode(
  value: string,
  level: QrCodeLevel,
  margin: number,
): QrEncoding {
  const key = `${level}|${margin}|${value}`;
  const cached = encodingCache.get(key);
  if (cached) {
    return cached;
  }

  const { modules } = create(value, { errorCorrectionLevel: level });
  const encoding = {
    count: modules.size,
    path: buildPath(modules.data, modules.size, margin),
  };
  encodingCache.set(key, encoding);
  if (encodingCache.size > ENCODING_CACHE_LIMIT) {
    const oldest = encodingCache.keys().next().value;
    if (oldest !== undefined) {
      encodingCache.delete(oldest);
    }
  }
  return encoding;
}

/**
 * Renders a QR code as a single, theme-aware SVG path. Modules use
 * `currentColor` (inherits `text-foreground`) so the code adapts to the
 * surrounding surface — place it on a high-contrast background to keep it
 * scannable. Encoding is pure and runs during render (no client hooks).
 * @example
 * <QrCode value="https://vllnt.com" />
 * <QrCode value="WIFI:S:home;T:WPA;P:secret;;" level="H" size={200} />
 */
const QrCode = ({
  className,
  level = "M",
  margin = 4,
  ref,
  size = 160,
  title = "QR code",
  value,
  ...props
}: QrCodeProps & { ref?: React.Ref<SVGSVGElement> }) => {
  const { count, path } = value
    ? encodeQrCode(value, level, margin)
    : { count: 0, path: "" };
  const dimension = count + margin * 2;

  return (
    <svg
      aria-label={title}
      className={cn("text-foreground", className)}
      height={size}
      ref={ref}
      role="img"
      shapeRendering="crispEdges"
      viewBox={`0 0 ${dimension} ${dimension}`}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d={path} fill="currentColor" />
    </svg>
  );
};
QrCode.displayName = "QrCode";

export { QrCode };
