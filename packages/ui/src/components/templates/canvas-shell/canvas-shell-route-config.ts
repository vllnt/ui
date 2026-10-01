import type { ReactNode } from "react";

export type CanvasShellInsets = {
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  top?: number | string;
};

export type CanvasShellRouteConfig = {
  bottomBar?: ReactNode;
  center: ReactNode;
  contentPadding?: CanvasShellInsets;
  leftBar?: ReactNode;
  rightBar?: ReactNode;
  topBar?: ReactNode;
};
