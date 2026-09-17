<script setup lang="ts">
import type { ResumeEntry } from "~/types/resume";
import type { ComputedRef } from "vue";

type GithubStats = {
  stars: number | null;
  forks: number | null;
  repoCount: number | null;
  prs: number | null;
  issues: number | null;
  totalContributions: number | null;
};

type GithubRepo = {
  id: number;
  stargazers_count?: number;
  forks_count?: number;
};

type GitHubSearchResult = {
  total_count?: number;
};

type ContributionsAPI = {
  total?: Record<string, number>;
};

type GitHubContributionsResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: { totalContributions?: number };
      };
    };
  };
};

const DEFAULT_STATS: GithubStats = {
  stars: null,
  forks: null,
  repoCount: null,
  prs: null,
  issues: null,
  totalContributions: null,
};

const isStrictEnabled = (v: unknown) => v === "1" || v === 1 || v === true;

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
  (publicRuntime as { strictGithubStats?: unknown }).strictGithubStats
);


// GitHub API is rate-limited for unauthenticated requests. During SSR/prerender (CI),
// we can use a server-only token to avoid 403 rate limit exceeded.
const githubToken = import.meta.server
  ? (useRuntimeConfig() as { githubToken?: string }).githubToken ?? ""
  : "";

const githubApiHeaders = computed(() => {
  if (!import.meta.server) return undefined;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (githubToken) headers.Authorization = `Bearer ${githubToken}`;
  return headers;
});

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

const { data: githubStats } = useAsyncData<GithubStats | null>(
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
      const useGitHubGraphQL = import.meta.server && Boolean(githubToken);
      const contributionRequest: Promise<number> = useGitHubGraphQL
        ? $fetch<GitHubContributionsResponse>("https://api.github.com/graphql", {
            method: "POST",
            headers: githubApiHeaders.value,
            body: {
              query:
                "query Contributions($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar { totalContributions } } } }",
              variables: { login: user },
            },
          }).then((response) => {
            const total =
              response.data?.user?.contributionsCollection?.contributionCalendar
                ?.totalContributions;
            if (typeof total !== "number") {
              throw new Error("GitHub GraphQL contributions payload invalid");
            }
            return total;
          })
        : $fetch<ContributionsAPI>(
            `https://github-contributions-api.jogruber.de/v4/${user}`
          ).then((response) => {
            const totals = Object.values(response.total ?? {});
            if (totals.length === 0) {
              throw new Error("GitHub contributions payload invalid");
            }
            return totals.reduce((sum, value) => sum + value, 0);
          });

      const requests = [
        $fetch<GithubRepo[]>(
          `https://api.github.com/users/${user}/repos?per_page=100&type=owner`,
          { headers: githubApiHeaders.value }
        ),
        ...orgs.map((org: string) =>
          $fetch<GithubRepo[]>(
            `https://api.github.com/orgs/${org}/repos?per_page=100&type=public`,
            { headers: githubApiHeaders.value }
          )
        ),
        $fetch<GitHubSearchResult>(
          `https://api.github.com/search/issues?q=author:${user}+type:pr`,
          { headers: githubApiHeaders.value }
        ),
        $fetch<GitHubSearchResult>(
          `https://api.github.com/search/issues?q=author:${user}+type:issue`,
          { headers: githubApiHeaders.value }
        ),
        contributionRequest,
      ];

      const settled = await Promise.allSettled(requests);
      const repoResults = settled
        .slice(0, 1 + orgs.length)
        .map((result) =>
          result.status === "fulfilled" && Array.isArray(result.value)
            ? (result.value as GithubRepo[])
            : null
        );
      const prResult =
        settled[settled.length - 3]?.status === "fulfilled"
          ? (settled[settled.length - 3].value as GitHubSearchResult)
          : null;
      const issueResult =
        settled[settled.length - 2]?.status === "fulfilled"
          ? (settled[settled.length - 2].value as GitHubSearchResult)
          : null;
      const contributionResult =
        settled[settled.length - 1]?.status === "fulfilled"
          ? (settled[settled.length - 1].value as number)
          : null;

      const reposOk = repoResults.every((result) => result !== null);
      const prOk = typeof prResult?.total_count === "number";
      const issueOk = typeof issueResult?.total_count === "number";
      const contribOk = typeof contributionResult === "number";

      // In strict mode, do not publish incomplete statistics.
      if (strictGithubStats && (!reposOk || !prOk || !issueOk || !contribOk)) {
        throw createError({
          statusCode: 502,
          statusMessage:
            "GitHub stats payload invalid (possibly rate-limited)",
        });
      }

      const allRepos = reposOk
        ? (repoResults as GithubRepo[][]).flat()
        : [];
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
      const totalContributions = contributionResult;

      const result = {
        stars: reposOk ? stars : null,
        forks: reposOk ? forks : null,
        repoCount: reposOk ? uniqueRepos.length : null,
        prs: prOk ? prResult.total_count : null,
        issues: issueOk ? issueResult.total_count : null,
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
            : "Unknown error";
        console.error(
          `[FATAL] Failed to fetch GitHub stats in strict mode: ${msg}`
        );
        // createError alone doesn't stop prerender; force exit to fail the build.
        process.exit(1);
      }

      // In dev, Nuxt forwards server logs to the client/devtools and stringifies them.
      // Some fetch/network errors (e.g. undici) are not plain objects and can cause
      // DevalueError: Cannot stringify arbitrary non-POJOs.
      // So we only log a safe string here.
      const errMsg =
        e instanceof Error
          ? `${e.name}: ${e.message}`
          : typeof e === "string"
          ? e
          : "Unknown error";
      console.error(`Failed to fetch GitHub stats: ${errMsg}`);
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
const heatmapSrc = computed(() => {
  if (!githubUser.value) return "";
  // Build-time cached asset generated by scripts/cache-github-heatmap.mjs
  // (Avoids client-side third-party SVG fetch that may fail in some regions.)
  return "/github-heatmap.svg";
});
</script>

<template>
  <template v-if="resume.github">
    <section
      class="break-inside-avoid waterfall-item col-span-1 md:col-start-1 print:col-span-6 print:col-start-auto"
    >
      <SectionHeader
        :title="title"
        icon="i-lucide-github"
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
          />
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
              {{ starsLabel }}: {{ githubStats?.stars ?? "—" }}
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-octicon-git-commit-16"
                class="w-4 h-4 mt-0.5 shrink-0"
                :class="textClass"
              />
              {{ contributionsLabel }}:
              {{ githubStats?.totalContributions ?? "—" }}
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-octicon-git-pull-request-16"
                class="w-4 h-4 mt-0.5 shrink-0"
                :class="textClass"
              />
              {{ prsLabel }}: {{ githubStats?.prs ?? "—" }}
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-octicon-issue-opened-16"
                class="w-4 h-4 mt-0.5 shrink-0"
                :class="textClass"
              />
              {{ issuesLabel }}: {{ githubStats?.issues ?? "—" }}
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-octicon-repo-16"
                class="w-4 h-4 mt-0.5 shrink-0"
                :class="textClass"
              />
              {{ repositoriesLabel }}: {{ githubStats?.repoCount ?? "—" }}
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
        >
      </SectionCard>
    </section>
  </template>
</template>
