import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import "./globals.css";
import { GlobalSearchMount } from "@/components/global-search-mount";
import { NavBar } from "@/components/nav-bar";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "SoundScene | Movie & Series Soundtrack Finder",
  description:
    "Discover soundtrack moments in movies and web series with scene-level context, curated metadata, and editorial browsing.",
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
            __html: `
              (() => {
                try {
                  const storedTheme = localStorage.getItem("theme");
                  document.documentElement.dataset.theme = storedTheme === "dark" ? "dark" : "light";
                } catch (error) {
                  document.documentElement.dataset.theme = "light";
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <div className="grid-lines min-h-screen">
          <NavBar />
          <Suspense fallback={null}>
            <GlobalSearchMount />
          </Suspense>
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
