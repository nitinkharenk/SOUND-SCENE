"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSearchStore } from "@/store/useSearchStore";

function isTypingTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;

  if (!element) {
    return false;
  }

  return (
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.tagName === "SELECT" ||
    element.isContentEditable
  );
}

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const goPrefixRef = useRef(false);
  const goTimeoutRef = useRef<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useSearchStore();

  useEffect(() => {
    return () => {
      if (goTimeoutRef.current) {
        window.clearTimeout(goTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const toggleShortcuts = () => setIsOpen((current) => !current);

    window.addEventListener("soundscene:toggle-shortcuts", toggleShortcuts as EventListener);

    return () => {
      window.removeEventListener(
        "soundscene:toggle-shortcuts",
        toggleShortcuts as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    function focusSearch() {
      open();

      window.setTimeout(() => {
        const searchInput =
          document.querySelector<HTMLInputElement>("#search") ??
          document.querySelector<HTMLInputElement>("[data-global-search-input='true']") ??
          document.querySelector<HTMLInputElement>("[data-page-search-input='true']");

        searchInput?.focus();
      }, pathname === "/search" ? 0 : 80);
    }

    function toggleTheme() {
      const nextTheme =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";

      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem("theme", nextTheme);
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        goPrefixRef.current = false;
        if (goTimeoutRef.current) {
          window.clearTimeout(goTimeoutRef.current);
          goTimeoutRef.current = null;
        }
        return;
      }

      if (isTypingTarget(event.target) && event.key !== "?") {
        return;
      }

      if (event.key === "/") {
        event.preventDefault();
        focusSearch();
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        setIsOpen((current) => !current);
        return;
      }

      if (event.key.toLowerCase() === "d") {
        event.preventDefault();
        toggleTheme();
        return;
      }

      if (event.key.toLowerCase() === "g") {
        goPrefixRef.current = true;
        if (goTimeoutRef.current) {
          window.clearTimeout(goTimeoutRef.current);
        }
        goTimeoutRef.current = window.setTimeout(() => {
          goPrefixRef.current = false;
          goTimeoutRef.current = null;
        }, 1500);
        return;
      }

      if (!goPrefixRef.current) {
        return;
      }

      const nextKey = event.key.toLowerCase();
      goPrefixRef.current = false;
      if (goTimeoutRef.current) {
        window.clearTimeout(goTimeoutRef.current);
        goTimeoutRef.current = null;
      }

      if (nextKey === "m") {
        event.preventDefault();
        router.push("/movies");
      } else if (nextKey === "s") {
        event.preventDefault();
        router.push("/songs");
      } else if (nextKey === "c") {
        event.preventDefault();
        router.push("/charts");
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [open, pathname, router]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[1rem] border border-[color:var(--line)] bg-[color:var(--background)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.16)]">
        <p className="route-kicker">Keyboard shortcuts</p>
        <h2 className="font-heading mt-3 text-3xl font-extrabold uppercase tracking-[0.01em] text-[color:var(--foreground)]">
          Move Fast
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            ["/", "Focus search"],
            ["G M", "Go to Movies"],
            ["G S", "Go to Songs"],
            ["G C", "Go to Charts"],
            ["D", "Toggle dark mode"],
            ["?", "Open this panel"],
          ].map(([keys, label]) => (
            <div
              key={keys}
              className="rounded-[0.9rem] border border-[color:var(--line)] bg-accent-subtle px-4 py-3"
            >
              <p className="font-card text-base font-medium text-[color:var(--foreground)]">
                {keys}
              </p>
              <p className="mt-1 font-body text-sm text-[color:var(--muted)]">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="route-action route-action-primary focus-ring"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
