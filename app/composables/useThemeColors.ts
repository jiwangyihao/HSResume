import colors from "tailwindcss/colors";
import { formatHex, parse } from "culori";
import type { ResumeEntry } from "~/types/resume";

type ThemeColor = {
  text: string;
  bg: string;
  border: string;
  icon: string;
};

const themeColors: Record<string, ThemeColor> = {
  primary: {
    text: "text-primary-600 dark:text-primary-400",
    bg: "bg-primary-600",
    border: "border-primary-600",
    icon: "text-primary-600 dark:text-primary-400",
  },
  blue: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-600",
    border: "border-blue-600",
    icon: "text-blue-600 dark:text-blue-400",
  },
  sky: {
    text: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-600",
    border: "border-sky-600",
    icon: "text-sky-600 dark:text-sky-400",
  },
  green: {
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-600",
    border: "border-green-600",
    icon: "text-green-600 dark:text-green-400",
  },
  emerald: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-600",
    border: "border-emerald-600",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  yellow: {
    text: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-600",
    border: "border-yellow-600",
    icon: "text-yellow-600 dark:text-yellow-400",
  },
  amber: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-600",
    border: "border-amber-600",
    icon: "text-amber-600 dark:text-amber-400",
  },
  purple: {
    text: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-600",
    border: "border-purple-600",
    icon: "text-purple-600 dark:text-purple-400",
  },
  pink: {
    text: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-600",
    border: "border-pink-600",
    icon: "text-pink-600 dark:text-pink-400",
  },
  red: {
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-600",
    border: "border-red-600",
    icon: "text-red-600 dark:text-red-400",
  },
  orange: {
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-600",
    border: "border-orange-600",
    icon: "text-orange-600 dark:text-orange-400",
  },
  gray: {
    text: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-600",
    border: "border-gray-600",
    icon: "text-gray-600 dark:text-gray-400",
  },
};

const primaryThemeColor: ThemeColor = themeColors.primary!;

const getThemeColor = (colorName?: string): ThemeColor => {
  return themeColors[colorName || ""] ?? primaryThemeColor;
};

export const resolveHexColor = (colorName: string) => {
  // Default to sky-600 if not found or invalid
  const defaultColor = colors.sky[600];

  const palette = colors[colorName as keyof typeof colors];
  let colorValue: string = defaultColor;

  if (palette && typeof palette === "object" && "600" in palette) {
    colorValue = (palette as any)[600];
  } else if (typeof palette === "string") {
    // e.g. black, white
    colorValue = palette;
  }

  const parsed = parse(colorValue);
  return parsed ? formatHex(parsed) : "#0284c7";
};

export const useThemeColors = (resumeView: ComputedRef<ResumeEntry>) => {
  const sectionSettings = computed(() => {
    const c = resumeView.value.colors || {};
    return {
      profile: getThemeColor(c.profile || "primary"),
      education: getThemeColor(c.education || "primary"),
      projects: getThemeColor(c.projects || "primary"),
      games: getThemeColor(c.games || "purple"),
      awards: getThemeColor(c.awards || "yellow"),
      languages: getThemeColor(c.languages || "emerald"),
      github: getThemeColor(c.github || "sky"),
    };
  });

  return { sectionSettings, getThemeColor, resolveHexColor };
};
