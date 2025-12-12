import { queryCollection } from "#imports";
import type { ResumeEntry, ResumeLocale } from "../types/resume";

export const useResumeContent = async (locale: Ref<ResumeLocale>) => {
  const {
    data: resume,
    pending,
    error,
    refresh,
  } = await useAsyncData<ResumeEntry | null>(
    () => `resume-${locale.value}`,
    async () => {
      const primaryPath = locale.value === "zh" ? "/resume/zh" : "/resume/en";
      const samplePath =
        locale.value === "zh" ? "/resume/zh.sample" : "/resume/en.sample";

      const entry =
        (await queryCollection("content").path(primaryPath).first()) ??
        (await queryCollection("content").path(samplePath).first());

      const meta = (entry as { meta?: Partial<ResumeEntry> } | null)?.meta;
      return meta ? (meta as ResumeEntry) : null;
    },
    { watch: [locale] }
  );

  const resumeView = computed<ResumeEntry>(() => {
    const base: ResumeEntry = {
      locale: locale.value,
      name: "",
      subtitle: "",
      highlights: [],
      nationality: "",
      email: "",
      homepages: [],
      summary: "",
      education: [],
      internships: [],
      work: [],
      projects: [],
      games: [],
      awards: [],
      languages: [],
    };

    const entry = (resume.value ?? {}) as Partial<ResumeEntry>;

    return {
      ...base,
      ...entry,
      homepages: entry.homepages ?? base.homepages,
      education: entry.education ?? base.education,
      internships: entry.internships ?? base.internships,
      work: entry.work ?? base.work,
      projects: entry.projects ?? base.projects,
      games: entry.games ?? base.games,
      awards: entry.awards ?? base.awards,
      languages: entry.languages ?? base.languages,
      github: entry.github,
    };
  });

  return { resume, pending, error, refresh, resumeView };
};
