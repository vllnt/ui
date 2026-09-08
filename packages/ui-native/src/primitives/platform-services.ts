import {
  Linking,
  Share,
  type ShareContent,
  type ShareOptions,
} from "react-native";

/** Result returned after opening a native URL. */
export type OpenUrlResult = { readonly status: "opened" };

/** Typed native URL-opening boundary. */
export type LinkingService = {
  readonly openUrl: (url: string) => Promise<OpenUrlResult>;
};

/** Result returned by the native share sheet. */
export type ShareResult =
  | { readonly activityType?: string; readonly status: "shared" }
  | { readonly status: "dismissed" };

/** Typed native sharing boundary. */
export type ShareService = {
  readonly share: (
    content: ShareContent,
    options?: ShareOptions,
  ) => Promise<ShareResult>;
};

/** Optional clipboard boundary supplied by the host application. */
export type ClipboardService = {
  readonly getText: () => Promise<string>;
  readonly setText: (text: string) => Promise<void>;
};

/** File selected by an optional host file-picker adapter. */
export type PickedFile = {
  readonly mimeType?: string;
  readonly name: string;
  readonly size?: number;
  readonly uri: string;
};

/** Optional file-picker request. */
export type FilePickOptions = {
  readonly allowMultiple?: boolean;
  readonly mimeTypes?: readonly string[];
};

/** Optional file-picker boundary supplied by the host application. */
export type FilePickerService = {
  readonly pickFiles: (
    options?: FilePickOptions,
  ) => Promise<readonly PickedFile[]>;
};

/** Injectable platform services used by interaction primitives. */
export type PlatformServices = {
  readonly clipboard?: ClipboardService;
  readonly filePicker?: FilePickerService;
  readonly linking: LinkingService;
  readonly share: ShareService;
};

/** Host overrides accepted when constructing platform services. */
export type PlatformServiceOverrides = Partial<PlatformServices>;

const defaultLinkingService: LinkingService = {
  async openUrl(url) {
    await Linking.openURL(url);
    return { status: "opened" };
  },
};

const defaultShareService: ShareService = {
  async share(content, options) {
    const result = await Share.share(content, options);
    return result.action === Share.dismissedAction
      ? { status: "dismissed" }
      : {
          activityType: result.activityType ?? undefined,
          status: "shared",
        };
  },
};

/**
 * Creates a service set with React Native Linking and Share defaults. Clipboard
 * and file picking remain absent unless the host explicitly provides adapters.
 */
function createPlatformServices(
  services: PlatformServiceOverrides = {},
): PlatformServices {
  return {
    clipboard: services.clipboard,
    filePicker: services.filePicker,
    linking: services.linking ?? defaultLinkingService,
    share: services.share ?? defaultShareService,
  };
}

const defaultPlatformServices = createPlatformServices();

export {
  createPlatformServices,
  defaultLinkingService,
  defaultPlatformServices,
  defaultShareService,
};
