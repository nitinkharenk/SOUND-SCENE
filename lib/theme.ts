export type ThemeMode = "light" | "dark";

export type ThemeFamilyId =
  | "current"
  | "bone-crimson"
  | "noir-gold"
  | "arctic-electric"
  | "slate-sage"
  | "dusk-violet";

export type ThemePresetId =
  | "current-light"
  | "current-dark"
  | "bone-crimson-light"
  | "bone-crimson-dark"
  | "noir-gold-light"
  | "noir-gold-dark"
  | "arctic-electric-light"
  | "arctic-electric-dark"
  | "slate-sage-light"
  | "slate-sage-dark"
  | "dusk-violet-light"
  | "dusk-violet-dark";

export type ThemePreset = {
  id: ThemePresetId;
  familyId: ThemeFamilyId;
  name: string;
  mode: ThemeMode;
  tokens: Record<string, string>;
  preview: [string, string, string];
};

export type ThemeFamily = {
  id: ThemeFamilyId;
  name: string;
  preview: [string, string, string];
  variants: Record<ThemeMode, ThemePresetId>;
};

const currentLightTokens = {
  "--background": "#F5F3EE",
  "--foreground": "#1f1915",
  "--card": "#ffffff",
  "--muted": "#6B6965",
  "--line": "#E8E6E1",
  "--color-accent": "#E84528",
  "--color-accent-hover": "#c93d22",
  "--color-accent-subtle": "#E845281a",
  "--color-bg-primary": "#F5F3EE",
  "--color-bg-surface": "#FFFFFF",
  "--color-border": "#E8E6E1",
  "--color-text-muted": "#6B6965",
  "--section-outline": "#E84528",
  "--outlined-stroke": "#E84528",
  "--accent": "#E84528",
  "--accent-soft": "#ffd6cd",
  "--nav-background": "#F5F3EE",
  "--nav-foreground": "#1f1915",
  "--nav-muted": "#6B6965",
  "--nav-border": "#E8E6E1",
  "--nav-surface": "#FFFFFF",
} as const;

const currentDarkTokens = {
  "--background": "#111010",
  "--foreground": "#f5f5f5",
  "--card": "#1A1918",
  "--muted": "#9A9895",
  "--line": "#2E2D2B",
  "--color-accent": "#E84528",
  "--color-accent-hover": "#ef6b4d",
  "--color-accent-subtle": "#E845281a",
  "--color-bg-primary": "#111010",
  "--color-bg-surface": "#1A1918",
  "--color-border": "#2E2D2B",
  "--color-text-muted": "#9A9895",
  "--section-outline": "#E84528",
  "--outlined-stroke": "#E84528",
  "--accent": "#E84528",
  "--accent-soft": "#ffd6cd",
  "--nav-background": "#111010",
  "--nav-foreground": "#f5f5f5",
  "--nav-muted": "#9A9895",
  "--nav-border": "#2E2D2B",
  "--nav-surface": "#1A1918",
} as const;

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "current-light",
    familyId: "current",
    name: "Current",
    mode: "light",
    tokens: currentLightTokens,
    preview: ["#E84528", "#F5F3EE", "#111010"],
  },
  {
    id: "current-dark",
    familyId: "current",
    name: "Current",
    mode: "dark",
    tokens: currentDarkTokens,
    preview: ["#E84528", "#F5F3EE", "#111010"],
  },
  {
    id: "bone-crimson-light",
    familyId: "bone-crimson",
    name: "Bone & Crimson",
    mode: "light",
    tokens: {
      "--background": "#FAFAF7",
      "--foreground": "#141414",
      "--card": "#F0EBE1",
      "--muted": "#7A6F6A",
      "--line": "#DDD6CC",
      "--color-accent": "#C8102E",
      "--color-accent-hover": "#A60D26",
      "--color-accent-subtle": "#C8102E1A",
      "--color-bg-primary": "#FAFAF7",
      "--color-bg-surface": "#F0EBE1",
      "--color-border": "#DDD6CC",
      "--color-text-muted": "#7A6F6A",
      "--section-outline": "#C8102E",
      "--outlined-stroke": "#C8102E",
      "--accent": "#C8102E",
      "--accent-soft": "#F4D8DD",
      "--nav-background": "#141414",
      "--nav-foreground": "#F0EBE1",
      "--nav-muted": "#7A6F6A",
      "--nav-border": "#2B2B2B",
      "--nav-surface": "#1E1E1E",
    },
    preview: ["#C8102E", "#F0EBE1", "#141414"],
  },
  {
    id: "bone-crimson-dark",
    familyId: "bone-crimson",
    name: "Bone & Crimson",
    mode: "dark",
    tokens: {
      "--background": "#141414",
      "--foreground": "#F0EBE1",
      "--card": "#1E1E1E",
      "--muted": "#7A6F6A",
      "--line": "#2B2B2B",
      "--color-accent": "#C8102E",
      "--color-accent-hover": "#D92B47",
      "--color-accent-subtle": "#C8102E1A",
      "--color-bg-primary": "#141414",
      "--color-bg-surface": "#1E1E1E",
      "--color-border": "#2B2B2B",
      "--color-text-muted": "#7A6F6A",
      "--section-outline": "#C8102E",
      "--outlined-stroke": "#C8102E",
      "--accent": "#C8102E",
      "--accent-soft": "#F4D8DD",
      "--nav-background": "#141414",
      "--nav-foreground": "#F0EBE1",
      "--nav-muted": "#7A6F6A",
      "--nav-border": "#2B2B2B",
      "--nav-surface": "#1E1E1E",
    },
    preview: ["#C8102E", "#F0EBE1", "#141414"],
  },
  {
    id: "noir-gold-light",
    familyId: "noir-gold",
    name: "Noir & Gold",
    mode: "light",
    tokens: {
      "--background": "#F7F3EC",
      "--foreground": "#0F0E0C",
      "--card": "#F7F3EC",
      "--muted": "#6B6355",
      "--line": "#E0DCD2",
      "--color-accent": "#C9933A",
      "--color-accent-hover": "#A87928",
      "--color-accent-subtle": "#C9933A1A",
      "--color-bg-primary": "#F7F3EC",
      "--color-bg-surface": "#F7F3EC",
      "--color-border": "#E0DCD2",
      "--color-text-muted": "#6B6355",
      "--section-outline": "#C9933A",
      "--outlined-stroke": "#C9933A",
      "--accent": "#C9933A",
      "--accent-soft": "#F0DEC0",
      "--nav-background": "#0F0E0C",
      "--nav-foreground": "#F7F3EC",
      "--nav-muted": "#6B6355",
      "--nav-border": "#2E2B22",
      "--nav-surface": "#1C1A15",
    },
    preview: ["#C9933A", "#F7F3EC", "#0F0E0C"],
  },
  {
    id: "noir-gold-dark",
    familyId: "noir-gold",
    name: "Noir & Gold",
    mode: "dark",
    tokens: {
      "--background": "#0F0E0C",
      "--foreground": "#F7F3EC",
      "--card": "#1C1A15",
      "--muted": "#6B6355",
      "--line": "#2E2B22",
      "--color-accent": "#C9933A",
      "--color-accent-hover": "#E0B45C",
      "--color-accent-subtle": "#C9933A1A",
      "--color-bg-primary": "#0F0E0C",
      "--color-bg-surface": "#1C1A15",
      "--color-border": "#2E2B22",
      "--color-text-muted": "#6B6355",
      "--section-outline": "#C9933A",
      "--outlined-stroke": "#C9933A",
      "--accent": "#C9933A",
      "--accent-soft": "#F0DEC0",
      "--nav-background": "#0F0E0C",
      "--nav-foreground": "#F7F3EC",
      "--nav-muted": "#6B6355",
      "--nav-border": "#2E2B22",
      "--nav-surface": "#1C1A15",
    },
    preview: ["#C9933A", "#F7F3EC", "#0F0E0C"],
  },
  {
    id: "arctic-electric-light",
    familyId: "arctic-electric",
    name: "Arctic & Electric",
    mode: "light",
    tokens: {
      "--background": "#F0F4F8",
      "--foreground": "#0A0F14",
      "--card": "#F0F4F8",
      "--muted": "#4A6070",
      "--line": "#E0E8EF",
      "--color-accent": "#00D4FF",
      "--color-accent-hover": "#00A9CC",
      "--color-accent-subtle": "#00D4FF1A",
      "--color-bg-primary": "#F0F4F8",
      "--color-bg-surface": "#F0F4F8",
      "--color-border": "#E0E8EF",
      "--color-text-muted": "#4A6070",
      "--section-outline": "#00D4FF",
      "--outlined-stroke": "#00D4FF",
      "--accent": "#00D4FF",
      "--accent-soft": "#C8F5FF",
      "--nav-background": "#0A0F14",
      "--nav-foreground": "#F0F4F8",
      "--nav-muted": "#4A6070",
      "--nav-border": "#1C2D3A",
      "--nav-surface": "#111820",
    },
    preview: ["#00D4FF", "#F0F4F8", "#0A0F14"],
  },
  {
    id: "arctic-electric-dark",
    familyId: "arctic-electric",
    name: "Arctic & Electric",
    mode: "dark",
    tokens: {
      "--background": "#0A0F14",
      "--foreground": "#F0F4F8",
      "--card": "#111820",
      "--muted": "#4A6070",
      "--line": "#1C2D3A",
      "--color-accent": "#00D4FF",
      "--color-accent-hover": "#4EE4FF",
      "--color-accent-subtle": "#00D4FF1A",
      "--color-bg-primary": "#0A0F14",
      "--color-bg-surface": "#111820",
      "--color-border": "#1C2D3A",
      "--color-text-muted": "#4A6070",
      "--section-outline": "#00D4FF",
      "--outlined-stroke": "#00D4FF",
      "--accent": "#00D4FF",
      "--accent-soft": "#C8F5FF",
      "--nav-background": "#0A0F14",
      "--nav-foreground": "#F0F4F8",
      "--nav-muted": "#4A6070",
      "--nav-border": "#1C2D3A",
      "--nav-surface": "#111820",
    },
    preview: ["#00D4FF", "#F0F4F8", "#0A0F14"],
  },
  {
    id: "slate-sage-light",
    familyId: "slate-sage",
    name: "Slate & Sage",
    mode: "light",
    tokens: {
      "--background": "#F2F0EA",
      "--foreground": "#141618",
      "--card": "#F2F0EA",
      "--muted": "#5E6870",
      "--line": "#E0DDD5",
      "--color-accent": "#4A7C59",
      "--color-accent-hover": "#386446",
      "--color-accent-subtle": "#4A7C591A",
      "--color-bg-primary": "#F2F0EA",
      "--color-bg-surface": "#F2F0EA",
      "--color-border": "#E0DDD5",
      "--color-text-muted": "#5E6870",
      "--section-outline": "#4A7C59",
      "--outlined-stroke": "#4A7C59",
      "--accent": "#4A7C59",
      "--accent-soft": "#D6E5DA",
      "--nav-background": "#141618",
      "--nav-foreground": "#F2F0EA",
      "--nav-muted": "#5E6870",
      "--nav-border": "#2C3035",
      "--nav-surface": "#1D2022",
    },
    preview: ["#4A7C59", "#F2F0EA", "#141618"],
  },
  {
    id: "slate-sage-dark",
    familyId: "slate-sage",
    name: "Slate & Sage",
    mode: "dark",
    tokens: {
      "--background": "#141618",
      "--foreground": "#F2F0EA",
      "--card": "#1D2022",
      "--muted": "#5E6870",
      "--line": "#2C3035",
      "--color-accent": "#4A7C59",
      "--color-accent-hover": "#6BA37A",
      "--color-accent-subtle": "#4A7C591A",
      "--color-bg-primary": "#141618",
      "--color-bg-surface": "#1D2022",
      "--color-border": "#2C3035",
      "--color-text-muted": "#5E6870",
      "--section-outline": "#4A7C59",
      "--outlined-stroke": "#4A7C59",
      "--accent": "#4A7C59",
      "--accent-soft": "#D6E5DA",
      "--nav-background": "#141618",
      "--nav-foreground": "#F2F0EA",
      "--nav-muted": "#5E6870",
      "--nav-border": "#2C3035",
      "--nav-surface": "#1D2022",
    },
    preview: ["#4A7C59", "#F2F0EA", "#141618"],
  },
  {
    id: "dusk-violet-light",
    familyId: "dusk-violet",
    name: "Dusk & Violet",
    mode: "light",
    tokens: {
      "--background": "#F3F0FA",
      "--foreground": "#0E0C14",
      "--card": "#F3F0FA",
      "--muted": "#6B5E8A",
      "--line": "#E0D8F5",
      "--color-accent": "#8B5CF6",
      "--color-accent-hover": "#6E45D4",
      "--color-accent-subtle": "#8B5CF61A",
      "--color-bg-primary": "#F3F0FA",
      "--color-bg-surface": "#F3F0FA",
      "--color-border": "#E0D8F5",
      "--color-text-muted": "#6B5E8A",
      "--section-outline": "#8B5CF6",
      "--outlined-stroke": "#8B5CF6",
      "--accent": "#8B5CF6",
      "--accent-soft": "#E2D8FF",
      "--nav-background": "#0E0C14",
      "--nav-foreground": "#F3F0FA",
      "--nav-muted": "#6B5E8A",
      "--nav-border": "#231E33",
      "--nav-surface": "#16131F",
    },
    preview: ["#8B5CF6", "#F3F0FA", "#0E0C14"],
  },
  {
    id: "dusk-violet-dark",
    familyId: "dusk-violet",
    name: "Dusk & Violet",
    mode: "dark",
    tokens: {
      "--background": "#0E0C14",
      "--foreground": "#F3F0FA",
      "--card": "#16131F",
      "--muted": "#6B5E8A",
      "--line": "#231E33",
      "--color-accent": "#8B5CF6",
      "--color-accent-hover": "#A37BFF",
      "--color-accent-subtle": "#8B5CF61A",
      "--color-bg-primary": "#0E0C14",
      "--color-bg-surface": "#16131F",
      "--color-border": "#231E33",
      "--color-text-muted": "#6B5E8A",
      "--section-outline": "#8B5CF6",
      "--outlined-stroke": "#8B5CF6",
      "--accent": "#8B5CF6",
      "--accent-soft": "#E2D8FF",
      "--nav-background": "#0E0C14",
      "--nav-foreground": "#F3F0FA",
      "--nav-muted": "#6B5E8A",
      "--nav-border": "#231E33",
      "--nav-surface": "#16131F",
    },
    preview: ["#8B5CF6", "#F3F0FA", "#0E0C14"],
  },
];

export const THEME_FAMILIES: ThemeFamily[] = [
  {
    id: "current",
    name: "Current",
    preview: ["#E84528", "#F5F3EE", "#111010"],
    variants: { light: "current-light", dark: "current-dark" },
  },
  {
    id: "bone-crimson",
    name: "Bone & Crimson",
    preview: ["#C8102E", "#F0EBE1", "#141414"],
    variants: { light: "bone-crimson-light", dark: "bone-crimson-dark" },
  },
  {
    id: "noir-gold",
    name: "Noir & Gold",
    preview: ["#C9933A", "#F7F3EC", "#0F0E0C"],
    variants: { light: "noir-gold-light", dark: "noir-gold-dark" },
  },
  {
    id: "arctic-electric",
    name: "Arctic & Electric",
    preview: ["#00D4FF", "#F0F4F8", "#0A0F14"],
    variants: { light: "arctic-electric-light", dark: "arctic-electric-dark" },
  },
  {
    id: "slate-sage",
    name: "Slate & Sage",
    preview: ["#4A7C59", "#F2F0EA", "#141618"],
    variants: { light: "slate-sage-light", dark: "slate-sage-dark" },
  },
  {
    id: "dusk-violet",
    name: "Dusk & Violet",
    preview: ["#8B5CF6", "#F3F0FA", "#0E0C14"],
    variants: { light: "dusk-violet-light", dark: "dusk-violet-dark" },
  },
];

export const DEFAULT_THEME_PRESET_ID: ThemePresetId = "current-light";

const THEME_PRESET_MAP = Object.fromEntries(
  THEME_PRESETS.map((preset) => [preset.id, preset]),
) as Record<ThemePresetId, ThemePreset>;

export function isThemePresetId(value: string): value is ThemePresetId {
  return value in THEME_PRESET_MAP;
}

export function normalizeStoredTheme(value: string | null | undefined): ThemePresetId {
  if (value === "light") {
    return "current-light";
  }

  if (value === "dark") {
    return "current-dark";
  }

  if (value === "bone-crimson") {
    return "bone-crimson-light";
  }

  if (value === "noir-gold") {
    return "noir-gold-light";
  }

  if (value === "arctic-electric") {
    return "arctic-electric-light";
  }

  if (value === "slate-sage") {
    return "slate-sage-light";
  }

  if (value === "dusk-violet") {
    return "dusk-violet-light";
  }

  if (value && isThemePresetId(value)) {
    return value;
  }

  return DEFAULT_THEME_PRESET_ID;
}

export function getStoredTheme(): ThemePresetId {
  if (typeof window === "undefined") {
    return DEFAULT_THEME_PRESET_ID;
  }

  return normalizeStoredTheme(window.localStorage.getItem("theme"));
}

export function getThemePreset(id: ThemePresetId): ThemePreset {
  return THEME_PRESET_MAP[id];
}

export function getThemePresetIdForFamilyMode(
  familyId: ThemeFamilyId,
  mode: ThemeMode,
): ThemePresetId {
  const family = THEME_FAMILIES.find((item) => item.id === familyId);

  return family?.variants[mode] ?? DEFAULT_THEME_PRESET_ID;
}

export function applyTheme(id: ThemePresetId): ThemePreset {
  const preset = getThemePreset(id);

  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = preset.id;
    document.documentElement.dataset.mode = preset.mode;

    Object.entries(preset.tokens).forEach(([token, value]) => {
      document.documentElement.style.setProperty(token, value);
    });

    window.localStorage.setItem("theme", preset.id);
  }

  return preset;
}

export function getThemeBootScript(): string {
  return `(() => {
    const presets = ${JSON.stringify(THEME_PRESETS)};
    const presetMap = Object.fromEntries(presets.map((preset) => [preset.id, preset]));
    const normalizeStoredTheme = (value) => {
      if (value === "light") return "current-light";
      if (value === "dark") return "current-dark";
      if (value === "bone-crimson") return "bone-crimson-light";
      if (value === "noir-gold") return "noir-gold-light";
      if (value === "arctic-electric") return "arctic-electric-light";
      if (value === "slate-sage") return "slate-sage-light";
      if (value === "dusk-violet") return "dusk-violet-light";
      return presetMap[value] ? value : "current-light";
    };

    try {
      const themeId = normalizeStoredTheme(localStorage.getItem("theme"));
      const preset = presetMap[themeId] ?? presetMap["current-light"];
      document.documentElement.dataset.theme = preset.id;
      document.documentElement.dataset.mode = preset.mode;
      Object.entries(preset.tokens).forEach(([token, value]) => {
        document.documentElement.style.setProperty(token, value);
      });
      localStorage.setItem("theme", preset.id);
    } catch (error) {
      const preset = presetMap["current-light"];
      document.documentElement.dataset.theme = preset.id;
      document.documentElement.dataset.mode = preset.mode;
      Object.entries(preset.tokens).forEach(([token, value]) => {
        document.documentElement.style.setProperty(token, value);
      });
    }
  })();`;
}
