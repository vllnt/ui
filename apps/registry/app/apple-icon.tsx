import { ImageResponse } from "next/og";

export const size = { height: 180, width: 180 };
export const contentType = "image/png";

/** Apple touch icon — the VLLNT chevron mark on the brand background. */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#0A0A0A",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <svg fill="none" height="104" viewBox="0 0 32 32" width="104">
        <path
          d="M7.5 9L16 23L24.5 9"
          stroke="#FAFAFA"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.2"
        />
      </svg>
    </div>,
    size,
  );
}
