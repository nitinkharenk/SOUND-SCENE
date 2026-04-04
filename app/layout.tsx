export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import "./globals.css";
import { GlobalSearchMount } from "@/components/global-search-mount";
import { getThemeBootScript } from "@/lib/theme";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { NavBar } from "@/components/nav-bar";
import { SiteFooter } from "@/components/site-footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://soundscene.vercel.app";

export const metadata: Metadata = {
  title: "SoundScene | Movie & Series Soundtrack Finder",
  metadataBase: new URL(siteUrl),
  description:
    "Discover soundtrack moments in movies and series with scene-level context, curated metadata, and editorial browsing.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: getThemeBootScript(),
          }}
        />
      </head>
      <body>
        <div className="grid-lines min-h-screen">
          <NavBar />
          <Suspense fallback={null}>
            <GlobalSearchMount />
          </Suspense>
          <KeyboardShortcuts />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
