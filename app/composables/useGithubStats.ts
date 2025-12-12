import type { ResumeEntry } from "../types/resume";

export type GithubStats = {
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

export const useGithubStats = async (resumeView: ComputedRef<ResumeEntry>) => {
  const { public: publicRuntime } = useRuntimeConfig();
  const strictGithubStats = isStrictEnabled((publicRuntime as any).strictGithubStats);

  const { data: githubStats } = await useAsyncData<GithubStats | null>(
    "github-stats",
    async () => {
      if (!resumeView.value.github) return null;
      const { user, orgs } = resumeView.value.github;

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

        return {
          stars,
          forks,
          repoCount: uniqueRepos.length,
          prs: prResult.total_count || 0,
          issues: issueResult.total_count || 0,
          totalContributions,
        } satisfies GithubStats;
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
      watch: [() => resumeView.value.github?.user],
      default: () => ({ ...DEFAULT_STATS }),
    }
  );

  return { githubStats, strictGithubStats };
};
