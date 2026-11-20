import {
  createContext,
  type Ref,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { NativeTheme } from "@vllnt/ui-core";
import {
  Image,
  type ImageProps,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import { decorativeProps } from "../../../primitives/accessibility";
import { useFontScaledSize } from "../../../primitives/use-font-scaled-size";
import { useTheme } from "../../../theme/theme-provider";

/** Avatar outline, as on web: `circle` is the default, `square` uses the `md` radius. */
export type AvatarShape = "circle" | "square";

/**
 * Presence status, as on web. Each value draws a different marker shape:
 * `online` is a filled dot, `away` is a ring, `busy` is a dot with a bar.
 */
export type AvatarPresence = "away" | "busy" | "online";

/** Load state of an avatar image, as on web. */
export type AvatarImageLoadingStatus = "error" | "idle" | "loaded" | "loading";

type AvatarContextValue = {
  readonly imageLoaded: boolean;
  readonly setImageLoaded: (loaded: boolean) => void;
  readonly shape: AvatarShape;
};
const AvatarContext = createContext<AvatarContextValue | null>(null);

function useAvatar(): AvatarContextValue {
  const context = use(AvatarContext);
  if (!context) throw new Error("Avatar parts must be used within Avatar");
  return context;
}

/** Props for the native avatar frame. */
export type AvatarProps = ViewProps & {
  /** Status marker drawn at the bottom-right. Leave it out for no marker. */
  readonly presence?: AvatarPresence;
  /** Words screen readers speak for each status. Defaults to `Online`, `Away` and `Busy`. */
  readonly presenceLabels?: Partial<Record<AvatarPresence, string>>;
  readonly ref?: Ref<View>;
  /** Outline shared by the frame, the image and the fallback. Defaults to `circle`. */
  readonly shape?: AvatarShape;
  readonly size?: number;
};
/**
 * Props for the native avatar image. Pass `accessibilityLabel`, `alt`, or
 * `aria-label` (the person's name) to expose it as an image; without a name
 * screen readers skip it.
 */
export type AvatarImageProps = ImageProps & {
  /**
   * Called as the image moves through `loading`, `loaded` and `error`. An
   * image without a `source` reports `error` at once, as on web.
   */
  readonly onLoadingStatusChange?: (status: AvatarImageLoadingStatus) => void;
  readonly ref?: Ref<Image>;
};
/** Props for avatar fallback content. */
export type AvatarFallbackProps = ViewProps & {
  /**
   * Milliseconds to wait before the fallback shows, which spares fast
   * connections a flash of fallback. It shows at once when left out.
   */
  readonly delayMs?: number;
  readonly ref?: Ref<View>;
};

const DEFAULT_PRESENCE_LABELS = {
  away: "Away",
  busy: "Busy",
  online: "Online",
} as const satisfies Record<AvatarPresence, string>;

/** Marker diameter as a share of the avatar, 12 of 40 on web. */
const PRESENCE_RATIO = 0.3;

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    width: "100%",
  },
  image: {
    bottom: 0,
    height: "100%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
  },
  marker: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  markerDot: { alignItems: "center", justifyContent: "center" },
  root: { alignItems: "center", justifyContent: "center" },
});

function shapeRadius(theme: NativeTheme, shape: AvatarShape): number {
  return shape === "square" ? theme.radius.md : theme.radius.full;
}

function PresenceMarker({
  diameter,
  label,
  presence,
}: {
  readonly diameter: number;
  readonly label: string;
  readonly presence: AvatarPresence;
}) {
  const { colors, radius, spacing } = useTheme();
  const ring = spacing[1] / 2;
  const size = Math.max(spacing[2], Math.round(diameter * PRESENCE_RATIO));
  const statusColors: Record<AvatarPresence, string> = {
    away: colors.warning,
    busy: colors.destructive,
    online: colors.success,
  };
  const away = presence === "away";
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="text"
      accessible
      style={[
        styles.marker,
        {
          backgroundColor: colors.background,
          borderRadius: radius.full,
          bottom: -ring,
          padding: ring,
          right: -ring,
        },
      ]}
    >
      <View
        style={[
          styles.markerDot,
          {
            backgroundColor: away ? colors.background : statusColors[presence],
            borderColor: statusColors[presence],
            borderRadius: radius.full,
            borderWidth: away ? ring : 0,
            height: size,
            width: size,
          },
        ]}
      >
        {presence === "busy" ? (
          <View
            {...decorativeProps}
            style={{
              backgroundColor: colors.background,
              borderRadius: radius.full,
              height: ring,
              width: "50%",
            }}
          />
        ) : null}
      </View>
    </View>
  );
}
PresenceMarker.displayName = "PresenceMarker";

/**
 * Circular or square frame for an image and fallback content, with an optional
 * presence marker. The frame clips its content, except with a marker, which
 * sits past the edge.
 */
function Avatar({
  children,
  presence,
  presenceLabels,
  ref,
  shape = "circle",
  size = 40,
  style,
  ...props
}: AvatarProps) {
  const theme = useTheme();
  const diameter = useFontScaledSize(size);
  const [imageLoaded, setImageLoaded] = useState(false);
  const context = useMemo(
    () => ({ imageLoaded, setImageLoaded, shape }),
    [imageLoaded, shape],
  );
  return (
    <AvatarContext value={context}>
      <View
        {...props}
        ref={ref}
        style={[
          styles.root,
          {
            backgroundColor: theme.colors.muted,
            borderRadius: shapeRadius(theme, shape),
            height: diameter,
            overflow: presence === undefined ? "hidden" : "visible",
            width: diameter,
          },
          style,
        ]}
      >
        {children}
        {presence === undefined ? null : (
          <PresenceMarker
            diameter={diameter}
            label={
              presenceLabels?.[presence] ?? DEFAULT_PRESENCE_LABELS[presence]
            }
            presence={presence}
          />
        )}
      </View>
    </AvatarContext>
  );
}
Avatar.displayName = "Avatar";

/** Native avatar image that removes itself after a load failure, revealing fallback content. */
function AvatarImage({
  accessibilityLabel,
  onError,
  onLoad,
  onLoadingStatusChange,
  ref,
  source,
  style,
  ...props
}: AvatarImageProps) {
  const theme = useTheme();
  const { setImageLoaded, shape } = useAvatar();
  const latestStatusListener = useRef(onLoadingStatusChange);
  useLayoutEffect(() => {
    latestStatusListener.current = onLoadingStatusChange;
  });
  const notify = useCallback((status: AvatarImageLoadingStatus) => {
    latestStatusListener.current?.(status);
  }, []);
  // Compare by value so an inline `source` object does not restart a load.
  const sourceKey = JSON.stringify(source ?? null);
  const hasSource = source !== undefined;
  const [failedSourceKey, setFailedSourceKey] = useState<null | string>(null);
  const [currentSourceKey, setCurrentSourceKey] = useState(sourceKey);
  if (currentSourceKey !== sourceKey) {
    setCurrentSourceKey(sourceKey);
    setFailedSourceKey(null);
  }
  useEffect(() => {
    setImageLoaded(false);
    notify(hasSource ? "loading" : "error");
    return () => {
      setImageLoaded(false);
    };
  }, [hasSource, notify, setImageLoaded, sourceKey]);
  if (failedSourceKey === sourceKey) return null;
  const name = accessibilityLabel ?? props.alt ?? props["aria-label"];
  const named = name !== undefined && name !== "";
  return (
    <Image
      {...(named ? undefined : decorativeProps)}
      {...props}
      accessibilityLabel={name}
      accessibilityRole={named ? "image" : undefined}
      accessible={named}
      onError={(event) => {
        setImageLoaded(false);
        setFailedSourceKey(sourceKey);
        notify("error");
        onError?.(event);
      }}
      onLoad={(event) => {
        setImageLoaded(true);
        notify("loaded");
        onLoad?.(event);
      }}
      ref={ref}
      source={source}
      style={[styles.image, { borderRadius: shapeRadius(theme, shape) }, style]}
    />
  );
}
AvatarImage.displayName = "AvatarImage";

/**
 * Content shown behind an avatar image and exposed when that image fails. With
 * `delayMs` it waits that long first, and it never shows once the image loads.
 */
function AvatarFallback({
  delayMs,
  ref,
  style,
  ...props
}: AvatarFallbackProps) {
  const theme = useTheme();
  const { imageLoaded, shape } = useAvatar();
  const [delayElapsed, setDelayElapsed] = useState(false);
  useEffect(() => {
    if (delayMs === undefined) return;
    const timer = setTimeout(() => {
      setDelayElapsed(true);
    }, delayMs);
    return () => {
      clearTimeout(timer);
    };
  }, [delayMs]);
  if (imageLoaded || (delayMs !== undefined && !delayElapsed)) return null;
  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.fallback,
        { borderRadius: shapeRadius(theme, shape) },
        style,
      ]}
    />
  );
}
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarFallback, AvatarImage };
