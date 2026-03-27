declare module 'virtual:pwa-assets/icons' {
  import type { AppleSplashScreenLink, FaviconLink, HtmlLink, IconAsset } from '@vite-pwa/assets-generator/api'

  interface PwaAssetsIcons {
    transparent: Record<string, IconAsset<HtmlLink>>
    maskable: Record<string, IconAsset<HtmlLink>>
    favicon: Record<string, IconAsset<FaviconLink>>
    apple: Record<string, IconAsset<HtmlLink>>
    appleSplashScreen: Record<string, IconAsset<AppleSplashScreenLink>>
  }

  export const pwaAssetsIcons: PwaAssetsIcons
}
