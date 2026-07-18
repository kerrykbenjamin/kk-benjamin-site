import type { CaseStudyTheme } from "@/data/caseStudies";

export type ThemePreset = {
  id: string;
  name: string;
  colors: CaseStudyTheme;
};

/**
 * Five curated, pre-validated combinations — see COLOR_PRESETS.md for the full
 * contrast table. Every preset here already passes AA; nothing further needs
 * checking when one is selected (that's the whole point of a preset).
 */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "classic",
    name: "Classic",
    colors: {
      tint: "#FBF7F1",
      card: "#FFFAF4",
      accent: "#6F8B5F",
      text: "#1F2A19",
      dark: "#182312",
      onDark: "#FBF7F1",
    },
  },
  {
    id: "sage-forest",
    name: "Sage Forest",
    colors: {
      tint: "#F0EDE4",
      card: "#EBDECC",
      accent: "#9CA387",
      text: "#47463E",
      dark: "#47463E",
      onDark: "#F4EFE4",
    },
  },
  {
    id: "blush-rose",
    name: "Blush Rose",
    colors: {
      tint: "#FAEFEC",
      card: "#F6DEE0",
      accent: "#EFB8C7",
      text: "#1F2A19",
      dark: "#182312",
      onDark: "#FBF7F1",
    },
  },
  {
    id: "warm-retro",
    name: "Warm Retro",
    colors: {
      tint: "#F4E8D0",
      card: "#F6E2BA",
      accent: "#2A9D8F",
      text: "#0D3B66",
      dark: "#0D3B66",
      onDark: "#F4E8D0",
    },
  },
  {
    id: "peach-bloom",
    name: "Peach Bloom",
    colors: {
      tint: "#F9DFC2",
      card: "#F7CFB1",
      accent: "#DE7A1D",
      text: "#70592F",
      dark: "#70592F",
      onDark: "#F9DFC2",
    },
  },
];

export const DEFAULT_PRESET_ID = "classic";

export function getPreset(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find((p) => p.id === id);
}
