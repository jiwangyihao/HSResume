import { queryCollection } from "#imports";
import type { ResumeEntry, ResumeLocale } from "~/types/resume";

export const useResumeContent = async (locale: Ref<ResumeLocale>) => {
  // Cache resume payloads per locale to:
  // 1) make switching back instant
  // 2) avoid tricky pending/race states that can happen when combining a dynamic key
  //    with an explicit watch trigger.
  const resumeCache = useState<
    Record<ResumeLocale, ResumeEntry | null | undefined>
  >(
    "resume-entry-cache",
    () =>
      ({ zh: undefined, en: undefined } as Record<
        ResumeLocale,
        ResumeEntry | null | undefined
      >)
  );

  const {
    data: resume,
    pending,
    error,
    refresh,
  } = await useAsyncData<ResumeEntry | null>(
    // Use a stable key and refresh on locale changes.
    // This avoids double refreshes (key change + watch) which can make `pending`
    // appear false while a request is still in-flight, causing loading UI to end too early.
    "resume-entry",
    async () => {
      const cached = resumeCache.value[locale.value];
      if (cached !== undefined) return cached;

      const primaryPath = locale.value === "zh" ? "/resume/zh" : "/resume/en";
      const samplePath =
        locale.value === "zh" ? "/resume/zh.sample" : "/resume/en.sample";

      const entry =
        (await queryCollection("content").path(primaryPath).first()) ??
        (await queryCollection("content").path(samplePath).first());

      const meta = (entry as { meta?: Partial<ResumeEntry> } | null)?.meta;
      const resolved = meta ? (meta as ResumeEntry) : null;
      resumeCache.value[locale.value] = resolved;
      return resolved;
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
