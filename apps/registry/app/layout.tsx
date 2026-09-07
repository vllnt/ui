import type { Viewport } from "next";
import type React from "react";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return children;
}
