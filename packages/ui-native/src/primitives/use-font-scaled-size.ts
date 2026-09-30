import { useWindowDimensions } from "react-native";

/**
 * Grows a fixed box dimension (avatar, step circle, icon button) with the
 * user's text size so large Dynamic Type or Android font scales do not clip
 * the text inside the box. Never returns less than `size`.
 */
function useFontScaledSize(size: number): number {
  const { fontScale } = useWindowDimensions();
  return Math.round(size * Math.max(1, fontScale));
}

export { useFontScaledSize };
