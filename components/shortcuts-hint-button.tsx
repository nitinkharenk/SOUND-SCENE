"use client";

export function ShortcutsHintButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("soundscene:toggle-shortcuts"))}
      className="font-body text-sm font-medium text-[color:var(--muted)] transition-colors duration-200 hover:text-accent-hover"
    >
      Keyboard Shortcuts
    </button>
  );
}
