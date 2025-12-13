<script setup lang="ts">
import type { ResumeEntry } from "~/types/resume";
import type { ComputedRef } from "vue";

type GithubStats = {
  stars: number;
  forks: number;
  repoCount: number;
  prs: number;
  issues: number;
  totalContributions: number;
};

const DEFAULT_STATS: GithubStats = {
  stars: 0,
  forks: 0,
  repoCount: 0,
  prs: 0,
  issues: 0,
  totalContributions: 0,
};

const isStrictEnabled = (v: unknown) => v === "1" || v === true;

type Props = {
  resume: ResumeEntry;
  title: string;
  iconClass: string;
  dotBgClass: string;
  textClass: string;
  themeColor: string;
  starsLabel: string;
  contributionsLabel: string;
  prsLabel: string;
  issuesLabel: string;
  repositoriesLabel: string;
};

const props = defineProps<Props>();

const resumeView = computed(() => props.resume) as ComputedRef<ResumeEntry>;

const { public: publicRuntime } = useRuntimeConfig();
const strictGithubStats = isStrictEnabled(
  (publicRuntime as any).strictGithubStats
);

// Client-side cache to avoid re-fetching when switching locale (or any other UI-only state)
// that causes components to re-render. We scope by (user + orgs) so different resumes/users
// don't collide.
const statsCache = useState<Record<string, GithubStats>>(
  "github-stats-cache",
  () => ({})
);

const cacheKey = computed(() => {
  const gh = resumeView.value.github;
  if (!gh) return "";
  const orgs = Array.isArray(gh.orgs) ? gh.orgs : [];
  return `${gh.user}|${orgs.join(",")}`;
});

const asyncKey = computed(() =>
  cacheKey.value ? `github-stats:${cacheKey.value}` : "github-stats:none"
);

const { data: githubStats } = await useAsyncData<GithubStats | null>(
  () => asyncKey.value,
  async () => {
    if (!resumeView.value.github) return null;
    const { user, orgs } = resumeView.value.github;

    // If we already have cached stats on the client, do not hit the network again.
    // (SSR/prerender can still fetch fresh values as before.)
    if (import.meta.client && cacheKey.value) {
      const cached = statsCache.value[cacheKey.value];
      if (cached) return cached;
    }

    try {
      const requests = [
        $fetch<any[]>(
          `https://api.github.com/users/${user}/repos?per_page=100&type=owner`
        ),
        ...orgs.map((org: string) =>
          $fetch<any[]>(
            `https://api.github.com/orgs/${org}/repos?per_page=100&type=public`
          )
        ),
        $fetch<any>(
          `https://api.github.com/search/issues?q=author:${user}+type:pr`
        ),
        $fetch<any>(
          `https://api.github.com/search/issues?q=author:${user}+type:issue`
        ),
        $fetch<any>(`https://github-contributions-api.jogruber.de/v4/${user}`),
      ];

      const results = await Promise.all(requests);
      const repoResults = results.slice(0, 1 + orgs.length) as any[][];
      const prResult = results[results.length - 3] as any;
      const issueResult = results[results.length - 2] as any;
      const contribResult = results[results.length - 1] as any;

      // If any upstream returned an unexpected shape (often rate limit / error payload),
      // fail the build in strict mode so we don't publish wrong numbers.
      if (strictGithubStats) {
        const contribOk = Array.isArray(contribResult?.contributions);
        const prOk = typeof prResult?.total_count === "number";
        const issueOk = typeof issueResult?.total_count === "number";
        const reposOk = repoResults.every(Array.isArray);
        if (!reposOk || !prOk || !issueOk || !contribOk) {
          throw createError({
            statusCode: 502,
            statusMessage:
              "GitHub stats payload invalid (possibly rate-limited)",
          });
        }
      }

      const allRepos = repoResults.flat();

      // Deduplicate by id just in case
      const uniqueRepos = Array.from(
        new Map(allRepos.map((item) => [item.id, item])).values()
      );

      const stars = uniqueRepos.reduce(
        (acc, repo) => acc + (repo.stargazers_count || 0),
        0
      );
      const forks = uniqueRepos.reduce(
        (acc, repo) => acc + (repo.forks_count || 0),
        0
      );

      // Calculate total contributions for the last year (365 days)
      const today = new Date();
      const oneYearAgo = new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getDate()
      );
      let totalContributions = 0;

      if (contribResult?.contributions) {
        totalContributions = contribResult.contributions.reduce(
          (acc: number, day: any) => {
            const date = new Date(day.date);
            if (date >= oneYearAgo && date <= today) {
              return acc + day.count;
            }
            return acc;
          },
          0
        );
      }

      const result = {
        stars,
        forks,
        repoCount: uniqueRepos.length,
        prs: prResult.total_count || 0,
        issues: issueResult.total_count || 0,
        totalContributions,
      } satisfies GithubStats;

      if (import.meta.client && cacheKey.value) {
        statsCache.value[cacheKey.value] = result;
      }

      return result;
    } catch (e) {
      // In CI strict mode, abort the prerender to avoid publishing incorrect stats.
      if (import.meta.server && strictGithubStats) {
        const msg =
          e instanceof Error
            ? e.message
            : typeof e === "string"
            ? e
            : undefined;
        throw createError({
          statusCode: 502,
          statusMessage: "Failed to fetch GitHub stats (strict mode)",
          message: msg,
        });
      }

      console.error("Failed to fetch GitHub stats", e);
      return { ...DEFAULT_STATS };
    }
  },
  {
    watch: [cacheKey],
    default: () => {
      const key = cacheKey.value;
      if (key && statsCache.value[key]) return statsCache.value[key];
      return { ...DEFAULT_STATS };
    },
  }
);

const githubUser = computed(() => props.resume.github?.user ?? "");
const githubColorHex = computed(() => props.themeColor.replace("#", ""));
const heatmapSrc = computed(() => {
  if (!githubUser.value) return "";
  return `https://ghchart.rshah.org/${githubColorHex.value}/${githubUser.value}`;
});
</script>

<template>
  <template v-if="resume.github">
    <section
      class="break-inside-avoid waterfall-item col-span-1 md:col-start-1 print:col-span-6 print:col-start-auto"
    >
      <SectionHeader
        :title="title"
        icon="i-iconoir-github"
        :icon-class="iconClass"
        :theme-color="themeColor"
      />
      <div class="space-y-6 print:space-y-4">
        <div
          class="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700"
        >
          <div
            class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white dark:ring-gray-900"
            :class="dotBgClass"
          ></div>
          <h3 class="font-bold text-gray-900 dark:text-white">GitHub Stats</h3>
          <div class="text-sm text-gray-500 mb-2">
            @{{ resume.github.user }}
          </div>
          <ul
            class="space-y-1 text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            <li class="flex items-start gap-2">
              <UIcon
                name="i-heroicons-star"
                class="w-4 h-4 mt-0.5 shrink-0"
                :class="textClass"
              />
              {{ starsLabel }}: {{ githubStats?.stars || 0 }}
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-octicon-git-commit-16"
                class="w-4 h-4 mt-0.5 shrink-0"
                :class="textClass"
              />
              {{ contributionsLabel }}:
              {{ githubStats?.totalContributions || 0 }}
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-octicon-git-pull-request-16"
                class="w-4 h-4 mt-0.5 shrink-0"
                :class="textClass"
              />
              {{ prsLabel }}: {{ githubStats?.prs || 0 }}
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-octicon-issue-opened-16"
                class="w-4 h-4 mt-0.5 shrink-0"
                :class="textClass"
              />
              {{ issuesLabel }}: {{ githubStats?.issues || 0 }}
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-octicon-repo-16"
                class="w-4 h-4 mt-0.5 shrink-0"
                :class="textClass"
              />
              {{ repositoriesLabel }}: {{ githubStats?.repoCount || 0 }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section
      class="break-inside-avoid waterfall-item col-span-1 md:col-start-1 print:col-span-12 print:col-start-1 print:-mt-4"
      style="--print-col-span: 12"
    >
      <SectionCard class="p-2">
        <img
          v-if="heatmapSrc"
          :src="heatmapSrc"
          alt="GitHub Contribution Graph"
          class="w-full dark:invert dark:hue-rotate-180"
        />
      </SectionCard>
    </section>
  </template>
</template>
