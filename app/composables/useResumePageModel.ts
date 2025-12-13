import { usePrint } from "./usePrint";
import { useResumeContent } from "./useResumeContent";
import { useResumeLocale } from "./useResumeLocale";
import { useThemeColors } from "./useThemeColors";
import type { ResumeEntry } from "../types/resume";

type SectionColorKey = keyof NonNullable<ResumeEntry["colors"]>;

export const useResumePageModel = async () => {
  const runtimeConfig = useRuntimeConfig();
  const buildTime = computed(() => runtimeConfig.public.buildTime || "");
  const buildSha = computed(() => runtimeConfig.public.gitSha || "");

  const { locale, localeItems, labels } = useResumeLocale();
  const { resume, pending, error, refresh, resumeView } =
    await useResumeContent(locale);

  const { sectionSettings, resolveHexColor } = useThemeColors(resumeView);
  const { printPage } = usePrint();

  const themeColorFor = (key: SectionColorKey, fallbackColorName: string) => {
    return resolveHexColor(resumeView.value.colors?.[key] || fallbackColorName);
  };

  return {
    // build meta
    buildTime,
    buildSha,

    // locale + content
    locale,
    localeItems,
    labels,
    resume,
    pending,
    error,
    refresh,
    resumeView,

    // theme
    sectionSettings,
    themeColorFor,

    // actions
    printPage,
  };
};
