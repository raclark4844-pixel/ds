import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteDock } from "@/components/site-dock";
import { SiteAssistant } from "@/components/site-assistant";
import { JsonLd } from "@/components/json-ld";
import { organizationJsonLd } from "@/lib/seo";
import { SITE_NAME, THEME_COLOR } from "@/lib/site";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_NAME },
      { name: "theme-color", content: THEME_COLOR },
    ],
    links: [
      {
        rel: "preload",
        href: "/fonts/syne-latin.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  component: RootDocument,
});

function SitewideEntityJsonLd() {
  const showSharedGraph = useRouterState({
    select: (state) => !state.matches.some((match) => match.routeId === "/industries/contractors"),
  });
  if (!showSharedGraph) return null;
  return <JsonLd data={organizationJsonLd()} />;
}

function RootDocument() {
  return (
    <html lang="en" className="dark antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="site-dock-offset min-h-dvh bg-bg font-sans text-fg">
        <PreviewHostBridge />
        <AuthProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <SiteHeader />
          <Outlet />
          <SiteFooter />
          <SiteDock />
          <SiteAssistant />
          <SitewideEntityJsonLd />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
