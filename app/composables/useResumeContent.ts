import { queryCollection } from "#imports";
import type { ResumeEntry, ResumeLocale } from "~/types/resume";

type ContentResumeDocument = {
  meta?: ResumeEntry;
} | null | undefined;

export const useResumeContent = async (locale: Ref<ResumeLocale>) => {
  // Fetch all resume data at once (server-side / build-time)
  // This avoids running queryCollection on the client, which would trigger SQLite WASM loading.
  const {
    data: allResumes,
    pending,
    error,
    refresh,
  } = await useAsyncData("resume-data-all", async () => {
    const [zh, zhSample, en, enSample] = await Promise.all([
      queryCollection("content").path("/resume/zh").first(),
      queryCollection("content").path("/resume/zh.sample").first(),
      queryCollection("content").path("/resume/en").first(),
      queryCollection("content").path("/resume/en.sample").first(),
    ]);

    const resolveEntry = (entry: ContentResumeDocument, sample: ContentResumeDocument) => {
      const final = entry ?? sample;
      return (final?.meta as ResumeEntry) || null;
    };

    return {
      zh: resolveEntry(zh, zhSample),
      en: resolveEntry(en, enSample),
    };
  });

  const resume = computed(() => allResumes.value?.[locale.value] ?? null);

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
      sectionOrder: [
        "profile",
        "education",
        "github",
        "awards",
        "projects",
        "games",
        "languages",
      ],
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
      sectionOrder: entry.sectionOrder ?? base.sectionOrder,
    };
  });

  return { resume, pending, error, refresh, resumeView };
};
