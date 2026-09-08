import {
  createContext,
  type Ref,
  use,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Image,
  type ImageProps,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

type AvatarContextValue = {
  readonly imageLoaded: boolean;
  readonly setImageLoaded: (loaded: boolean) => void;
};
const AvatarContext = createContext<AvatarContextValue | null>(null);

function useAvatar(): AvatarContextValue {
  const context = use(AvatarContext);
  if (!context) throw new Error("Avatar parts must be used within Avatar");
  return context;
}

/** Props for the native avatar frame. */
export type AvatarProps = ViewProps & {
  readonly ref?: Ref<View>;
  readonly size?: number;
};
/** Props for the native avatar image. */
export type AvatarImageProps = ImageProps & { readonly ref?: Ref<Image> };
/** Props for avatar fallback content. */
export type AvatarFallbackProps = ViewProps & { readonly ref?: Ref<View> };

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    width: "100%",
  },
  image: { ...StyleSheet.absoluteFill, height: "100%", width: "100%" },
  root: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
});

/** Circular frame for an image and fallback content. */
function Avatar({ children, ref, size = 40, style, ...props }: AvatarProps) {
  const theme = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const context = useMemo(
    () => ({ imageLoaded, setImageLoaded }),
    [imageLoaded],
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
            borderRadius: theme.radius.full,
            height: size,
            width: size,
          },
          style,
        ]}
      >
        {children}
      </View>
    </AvatarContext>
  );
}
Avatar.displayName = "Avatar";

/** Native avatar image that removes itself after a load failure, revealing fallback content. */
function AvatarImage({
  onError,
  onLoad,
  ref,
  source,
  style,
  ...props
}: AvatarImageProps) {
  const { setImageLoaded } = useAvatar();
  useEffect(() => {
    setImageLoaded(false);
    return () => {
      setImageLoaded(false);
    };
  }, [setImageLoaded, source]);
  return (
    <Image
      {...props}
      accessibilityRole="image"
      accessible
      onError={(event) => {
        setImageLoaded(false);
        onError?.(event);
      }}
      onLoad={(event) => {
        setImageLoaded(true);
        onLoad?.(event);
      }}
      ref={ref}
      source={source}
      style={[styles.image, style]}
    />
  );
}
AvatarImage.displayName = "AvatarImage";

/** Content shown behind an avatar image and exposed when that image fails. */
function AvatarFallback({ ref, style, ...props }: AvatarFallbackProps) {
  const { imageLoaded } = useAvatar();
  if (imageLoaded) return null;
  return <View {...props} ref={ref} style={[styles.fallback, style]} />;
}
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarFallback, AvatarImage };
