<script setup lang="ts">
import { queryCollection } from "#imports";
import colors from "tailwindcss/colors";
import { formatHex, parse } from "culori";
import ResumeMarkdown from "../components/ResumeMarkdown.vue";

type BadgeCategory =
  | "award"
  | "metric"
  | "traffic"
  | "event"
  | "tech"
  | "business"
  | "platform"
  | "default";

type Badge =
  | {
      kind: "svg";
      url: string;
      alt?: string;
      category?: BadgeCategory;
      icon?: string;
    }
  | {
      kind: "split";
      domain: string;
      value: string;
      category?: BadgeCategory;
      icon?: string;
    }
  | { kind: "text"; label: string; category?: BadgeCategory; icon?: string };

type ResumeLink = { label: string; url: string; icon?: string };
type ResumeEducation = {
  period: string;
  school: string;
  city: string;
  degree: string;
  major: string;
  form: string;
  roles: string[];
  honors: string[];
  scholarships: string[];
};
type ResumeProject = {
  period: string;
  name: string;
  role: string;
  description: string[];
  responsibilities: string[];
  highlights?: Badge[];
  links?: ResumeLink[];
  printWidth?: number; // 0-100 percentage for print view width
  printColSpan?: number; // Calculated span for print view
};
type ResumeGame = { name: string; detail: string; notes?: string };
type ResumeAward = { date: string; title: string };
type ResumeLanguage = { name: string; certificate?: string };
type ResumeFooter = {
  onlineUrl: string;
  icp?: { text: string; link: string };
  psb?: { text: string; link: string; icon: string };
  copyright: string;
};
type ResumeEntry = {
  locale: "zh" | "en";
  name: string;
  subtitle?: string;
  highlights: Badge[];
  nationality: string;
  email: string;
  homepages: ResumeLink[];
  summary: string;
  education: ResumeEducation[];
  internships: unknown[];
  work: unknown[];
  projects: ResumeProject[];
  games: ResumeGame[];
  awards: ResumeAward[];
  awardsPrintWidth?: number;
  languages: ResumeLanguage[];
  footer?: ResumeFooter;
  colors?: {
    profile?: string;
    education?: string;
    projects?: string;
    games?: string;
    awards?: string;
    languages?: string;
    github?: string;
  };
  github?: {
    user: string;
    orgs: string[];
  };
};

const locale = useState<"zh" | "en">("locale", () => "zh");

const localeItems = [
  { label: "中文", value: "zh" },
  { label: "EN", value: "en" },
];

const switchLocale = (l: "zh" | "en") => {
  locale.value = l;
};

const themeColors = {
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

const resolveHexColor = (colorName: string) => {
  // Default to sky-600 if not found or invalid
  const defaultColor = colors.sky[600];

  // Try to find the color in Tailwind colors
  // The user provides "sky", "blue", etc.
  // We assume they want the 600 shade for the chart.
  const palette = colors[colorName as keyof typeof colors];

  let colorValue = defaultColor;

  if (palette && typeof palette === "object" && "600" in palette) {
    colorValue = (palette as any)[600];
  } else if (typeof palette === "string") {
    // e.g. black, white
    colorValue = palette;
  }

  // Convert to hex
  const parsed = parse(colorValue);
  return parsed ? formatHex(parsed) : "#0284c7"; // Fallback to sky-600 hex
};

const getThemeColor = (colorName?: string) => {
  return (
    themeColors[colorName as keyof typeof themeColors] || themeColors.primary
  );
};

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

const labels = computed(() =>
  locale.value === "zh"
    ? {
        title: "个人简历",
        subtitle: "开源开发者 / 软件工程本科生",
        highlights: "个人亮点",
        nickname: "昵称",
        profile: "个人信息",
        contact: "联系方式",
        education: "教育背景",
        internships: "实习经历",
        work: "工作经历",
        projects: "项目经历",
        games: "游戏经历",
        awards: "获奖经历",
        languages: "语言能力",
        print: "打印 / 导出 PDF",
        nationality: "国籍",
        email: "电子邮箱",
        homepage: "个人主页",
        none: "暂无记录",
        expand: "悬停展开",
        github: "开源贡献",
        stars: "获星数",
        forks: "复刻数",
        repositories: "仓库数",
        prs: "合并请求",
        issues: "议题",
        contributions: "年度贡献",
      }
    : {
        title: "Resume",
        subtitle: "Open-source developer / SWE undergraduate",
        highlights: "Highlights",
        nickname: "Nickname",
        profile: "Profile",
        contact: "Contact",
        education: "Education",
        internships: "Internship",
        work: "Work",
        projects: "Projects",
        games: "Game Experience",
        awards: "Awards",
        languages: "Languages",
        print: "Print / Export PDF",
        nationality: "Nationality",
        email: "Email",
        homepage: "Homepage",
        none: "No records yet",
        expand: "Hover to expand",
        github: "Open Source",
        stars: "Stars",
        forks: "Forks",
        repositories: "Repositories",
        prs: "Pull Requests",
        issues: "Issues",
        contributions: "Total Contributions (last year)",
      }
);

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

const avatarSrc = ref("/avatar.png");
const handleAvatarError = () => {
  // Fallback for public main branch: use sample SVG when avatar.png is not present.
  if (avatarSrc.value !== "/avatar.sample.svg")
    avatarSrc.value = "/avatar.sample.svg";
};

const { data: githubStats } = await useAsyncData(
  "github-stats",
  async () => {
    if (!resumeView.value.github) return null;
    const { user, orgs } = resumeView.value.github;

    try {
      const requests = [
        $fetch<any[]>(
          `https://api.github.com/users/${user}/repos?per_page=100&type=owner`
        ),
        ...orgs.map((org) =>
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
      };
    } catch (e) {
      console.error("Failed to fetch GitHub stats", e);
      return {
        stars: 0,
        forks: 0,
        repoCount: 0,
        prs: 0,
        issues: 0,
        totalContributions: 0,
      };
    }
  },
  {
    watch: [() => resumeView.value.github?.user],
    default: () => ({
      stars: 0,
      forks: 0,
      repoCount: 0,
      prs: 0,
      issues: 0,
      totalContributions: 0,
    }),
  }
);

const processedProjects = computed(() => {
  const projects = resumeView.value.projects || [];
  return projects.map((project) => {
    let span = 6;
    if (project.printWidth) {
      span = Math.round((project.printWidth / 100) * 12);
      span = Math.max(1, Math.min(12, span));
    }
    return { ...project, printColSpan: span };
  });
});

const awardsPrintSpan = computed(() => {
  const width = resumeView.value.awardsPrintWidth;
  if (width) {
    return Math.max(1, Math.min(12, Math.round((width / 100) * 12)));
  }
  return 6;
});

useHead(() => ({
  title: resumeView.value.name
    ? `${resumeView.value.name} | ${labels.value.title}`
    : labels.value.title,
  htmlAttrs: { lang: locale.value },
  meta: [
    {
      name: "description",
      content:
        resumeView.value.highlights
          ?.map((b) =>
            b.kind === "split"
              ? `${b.domain} ${b.value}`
              : b.kind === "svg"
              ? b.alt ?? b.url
              : b.label
          )
          .join(" / ") || labels.value.subtitle,
    },
  ],
}));

const badgeColor = (badge: Badge) => "neutral";

const badgeBgClass = (badge: Badge) => {
  switch (badge.category) {
    case "award":
      return "bg-yellow-600";
    case "metric":
      return "bg-emerald-600";
    case "traffic":
      return "bg-sky-600";
    case "event":
      return "bg-orange-600";
    case "tech":
      return "bg-indigo-600";
    case "business":
      return "bg-purple-600";
    case "platform":
      return "bg-teal-600";
    default:
      return "bg-gray-600";
  }
};

const badgeBorderClass = (badge: Badge) => {
  switch (badge.category) {
    case "award":
      return "border-yellow-600";
    case "metric":
      return "border-emerald-600";
    case "traffic":
      return "border-sky-600";
    case "event":
      return "border-orange-600";
    case "tech":
      return "border-indigo-600";
    case "business":
      return "border-purple-600";
    case "platform":
      return "border-teal-600";
    default:
      return "border-gray-600";
  }
};

const badgeText = (badge: Badge) => {
  if (badge.kind === "svg") return badge.alt ?? badge.url;
  if (badge.kind === "split") return `${badge.domain}/${badge.value}`;
  return badge.label;
};

const getBadgeIcon = (badge: Badge) => {
  if (badge.icon) return badge.icon;
  switch (badge.category) {
    case "award":
      return "i-heroicons-trophy-solid";
    case "metric":
      return "i-heroicons-chart-bar-solid";
    case "traffic":
      return "i-heroicons-arrow-trending-up-solid";
    case "event":
      return "i-icon-park-solid-online-meeting";
    case "tech":
      return "i-heroicons-cpu-chip-solid";
    case "business":
      return "i-heroicons-briefcase-solid";
    case "platform":
      return "i-heroicons-building-library-solid";
    default:
      return undefined;
  }
};

const printPage = () => {
  if (typeof window !== "undefined") {
    window.print();
  }
};

const isAwardsHovered = ref(false);

const isImportantAward = (title: string) => {
  const t = title.toLowerCase();
  if (
    t.includes("校级") ||
    t.includes("省级") ||
    t.includes("区域") ||
    t.includes("创意组") ||
    t.includes("regional") ||
    t.includes("university") ||
    t.includes("creative group")
  )
    return false;
  return (
    t.includes("全国") ||
    t.includes("全球") ||
    t.includes("international") ||
    t.includes("mcm") ||
    t.includes("national") ||
    t.includes("global")
  );
};

type AwardGroup = {
  main: ResumeAward;
  subs: ResumeAward[];
};

const groupedAwards = computed(() => {
  const awards = resumeView.value.awards || [];
  const groups: AwardGroup[] = [];
  let currentGroup: AwardGroup | null = null;

  awards.forEach((award) => {
    const isImportant = isImportantAward(award.title);
    if (isImportant || !currentGroup) {
      currentGroup = { main: award, subs: [] };
      groups.push(currentGroup);
    } else {
      currentGroup.subs.push(award);
    }
  });
  return groups;
});

const chunkedGames = computed(() => {
  const games = resumeView.value.games || [];
  const chunkSize = 3;
  const chunks = [];
  for (let i = 0; i < games.length; i += chunkSize) {
    chunks.push(games.slice(i, i + chunkSize));
  }
  return chunks;
});

const hoveredCardTitle = ref<string | null>(null);
const isCardHovered = (title: string) => hoveredCardTitle.value === title;

const getRoleIcon = (role: string) => {
  const r = role.toLowerCase();
  if (r.includes("团支书") || r.includes("secretary"))
    return "i-heroicons-flag";
  if (r.includes("代表") || r.includes("representative"))
    return "i-heroicons-megaphone";
  if (r.includes("部长") || r.includes("head") || r.includes("lead"))
    return "i-heroicons-briefcase";
  if (
    r.includes("技术") ||
    r.includes("开源") ||
    r.includes("lug") ||
    r.includes("tech")
  )
    return "i-heroicons-command-line";
  return "i-heroicons-user";
};

const getRoleColor = (role: string) => {
  return "text-sky-500 dark:text-sky-400";
};

const waterfallContainer = ref<HTMLElement | null>(null);
const isLayoutReady = ref(false);

const pageRootRef = ref<HTMLElement | null>(null);

const avatarRef = ref<HTMLElement | null>(null);
const headerInfoRef = ref<HTMLElement | null>(null);

const updateAvatarSize = () => {
  if (!avatarRef.value || !headerInfoRef.value) return;

  const height = headerInfoRef.value.offsetHeight;
  // Set width to match height (square aspect ratio) using CSS variable
  avatarRef.value.style.setProperty("--avatar-size", `${height}px`);
};

let observer: ResizeObserver | null = null;
let headerObserver: ResizeObserver | null = null;

const nextFrame = () =>
  new Promise<void>((resolve) => {
    if (typeof window === "undefined") return resolve();
    window.requestAnimationFrame(() => resolve());
  });

const waitForImages = async (root: HTMLElement, timeoutMs = 2500) => {
  if (typeof window === "undefined") return;
  const images = Array.from(root.querySelectorAll("img")) as HTMLImageElement[];
  if (!images.length) return;

  const waitOne = (img: HTMLImageElement) => {
    if (img.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const done = () => resolve();
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    });
  };

  await Promise.race([
    Promise.all(images.map(waitOne)).then(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
};

let layoutJobId = 0;
const recalcLayout = async () => {
  if (typeof window === "undefined") return;
  const job = ++layoutJobId;
  isLayoutReady.value = false;

  // Wait until the actual content DOM (and refs) exists.
  // This avoids the first-load case where resume data is already present
  // but the watcher doesn't fire and refs are not yet bound.
  for (let i = 0; i < 30; i++) {
    await nextTick();
    if (pageRootRef.value && waterfallContainer.value) break;
    await nextFrame();
  }

  const root = pageRootRef.value;
  const container = waterfallContainer.value;
  if (!root || !container) {
    // Nothing to measure; don't block the UI forever.
    if (job === layoutJobId) isLayoutReady.value = true;
    return;
  }

  // Wait for DOM patch (watch flush: 'post' already helps, but keep this to be safe)
  await nextTick();

  // Wait for fonts + a couple of paints (avoids measuring before text metrics settle)
  if ("fonts" in document && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }
  await nextFrame();
  await nextFrame();

  // Let avatar/header sizing settle (there is a feedback relationship between header height and avatar size).
  // We sample a few frames and stop once the header height stabilizes.
  let lastHeaderH = -1;
  let stableCount = 0;
  for (let i = 0; i < 20; i++) {
    if (job !== layoutJobId) return;
    updateAvatarSize();
    await nextFrame();
    const h = headerInfoRef.value?.offsetHeight ?? -1;
    if (h === lastHeaderH && h > 0) stableCount++;
    else stableCount = 0;
    lastHeaderH = h;
    if (stableCount >= 2) break;
  }

  // Wait for images that affect layout (avatar, ghchart, badges...)
  await waitForImages(root);
  await nextFrame();

  if (job !== layoutJobId) return;
  updateWaterfall();
  updateAvatarSize();
  setupObserver();

  // One more pass after a paint, to catch late style/font/image effects.
  await nextFrame();
  if (job !== layoutJobId) return;
  updateWaterfall();
  updateAvatarSize();

  // Final paint before revealing
  await nextFrame();
  if (job !== layoutJobId) return;
  isLayoutReady.value = true;
};

const updateWaterfall = () => {
  if (!waterfallContainer.value) return;

  const container = waterfallContainer.value;
  const items = Array.from(container.children) as HTMLElement[];
  const awardsSection = container.querySelector(
    "#awards-section"
  ) as HTMLElement;

  // 1. Relax container to allow natural height measurement
  container.style.gridAutoRows = "auto";
  container.style.alignItems = "start";

  // Unlock awards section height for accurate measurement
  if (awardsSection) {
    awardsSection.style.height = "";
  }

  // 2. Reset item spans to let them flow naturally
  items.forEach((el) => {
    el.style.gridRowEnd = "auto";
  });

  // 3. Measure
  const spans = items.map((el) => {
    const height = el.offsetHeight;
    // Calculate span (1px rows + 24px gap)
    return Math.ceil(height + 24);
  });

  // Lock awards section height to prevent layout shift on hover
  if (awardsSection) {
    awardsSection.style.height = `${awardsSection.offsetHeight}px`;
  }

  // 4. Restore container constraint
  container.style.removeProperty("grid-auto-rows");
  container.style.removeProperty("align-items");

  // 5. Apply spans
  items.forEach((el, i) => {
    el.style.gridRowEnd = `span ${spans[i]}`;
  });
};

const setupObserver = () => {
  if (!waterfallContainer.value || !observer) return;

  const obs = observer;
  obs.observe(waterfallContainer.value);
  Array.from(waterfallContainer.value.children).forEach((child) => {
    obs.observe(child);
  });
};

onMounted(() => {
  // ResizeObserver for robustness
  observer = new ResizeObserver(() => {
    window.requestAnimationFrame(updateWaterfall);
  });

  headerObserver = new ResizeObserver(() => {
    window.requestAnimationFrame(updateAvatarSize);
  });

  setupObserver();
  if (headerInfoRef.value) {
    headerObserver.observe(headerInfoRef.value);
  }
  window.addEventListener("resize", updateAvatarSize);

  // First load: if resume payload is already hydrated, the watcher may not fire.
  // Measure once after mount to avoid getting stuck in the loading overlay.
  if (resume.value) {
    recalcLayout();
  }
});

// Watch for data/locale changes and measure AFTER the DOM updates.
watch(
  [() => locale.value, pending, resume],
  () => {
    // Only measure once the new locale content is actually ready.
    if (pending.value || !resume.value) return;
    recalcLayout();
  },
  { flush: "post", immediate: true }
);
</script>

<template>
  <UContainer class="py-8 print:p-0 max-w-7xl">
    <!-- Action Bar -->
    <div class="flex justify-end gap-3 mb-6 print:hidden">
      <UButton
        icon="i-heroicons-printer"
        size="sm"
        color="neutral"
        variant="solid"
        @click="printPage"
        >{{ labels.print }}</UButton
      >
      <UTabs
        v-model="locale"
        :items="localeItems"
        :content="false"
        size="xs"
        variant="pill"
        :ui="{
          list: 'bg-gray-100 dark:bg-gray-800 p-1 rounded-lg',
          trigger: 'px-3',
        }"
      />
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="内容加载失败"
      :description="error.message"
      class="mb-4"
    />

    <div
      v-else-if="pending || !resume"
      class="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-800"
    >
      <!-- Header Skeleton -->
      <div
        class="border-b border-gray-200 dark:border-gray-700 pb-8 mb-8 grid grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto] gap-6 items-stretch"
      >
        <!-- Avatar Skeleton -->
        <div class="flex justify-center md:justify-start order-1">
          <USkeleton
            class="w-32 h-32 rounded-full"
            :ui="{ rounded: 'rounded-full' }"
          />
        </div>

        <!-- Main Info Skeleton -->
        <div
          class="space-y-4 text-center self-start md:text-left order-2 w-full"
        >
          <USkeleton class="h-10 w-48 mx-auto md:mx-0" />
          <USkeleton class="h-6 w-64 mx-auto md:mx-0" />
          <div class="flex flex-wrap gap-2 justify-center md:justify-start">
            <USkeleton class="h-5 w-16" />
            <USkeleton class="h-5 w-20" />
            <USkeleton class="h-5 w-14" />
          </div>
        </div>

        <!-- Contact Info Skeleton -->
        <div
          class="flex flex-col gap-2 items-center md:items-start lg:items-end order-3 md:col-start-2 md:row-start-2 lg:col-start-3 lg:row-start-1"
        >
          <USkeleton class="h-5 w-32" />
          <USkeleton class="h-5 w-40" />
          <div class="flex gap-2 mt-2">
            <USkeleton class="h-8 w-20" />
            <USkeleton class="h-8 w-20" />
          </div>
        </div>
      </div>

      <!-- Body Skeleton -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <USkeleton class="h-64 w-full rounded-xl" />
        <USkeleton class="h-48 w-full rounded-xl" />
        <USkeleton class="h-56 w-full rounded-xl" />
        <USkeleton class="h-72 w-full rounded-xl" />
      </div>
    </div>

    <div
      v-else
      ref="pageRootRef"
      class="bg-white dark:bg-gray-900 rounded-xl shadow-xl print:shadow-none print:rounded-none px-4 py-8 sm:p-8 print:p-0 print:py-4 border border-gray-200 dark:border-gray-800 print:border-none relative"
    >
      <!-- Loading Overlay -->
      <div
        v-if="!isLayoutReady"
        class="absolute inset-0 z-20 bg-white dark:bg-gray-900 rounded-xl p-8 print:hidden overflow-hidden"
      >
        <!-- Header Skeleton -->
        <div
          class="border-b border-gray-200 dark:border-gray-700 pb-8 mb-8 grid grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto] gap-6 items-stretch"
        >
          <!-- Avatar Skeleton -->
          <div class="flex justify-center md:justify-start order-1">
            <USkeleton
              class="w-32 h-32 rounded-full"
              :ui="{ rounded: 'rounded-full' }"
            />
          </div>

          <!-- Main Info Skeleton -->
          <div
            class="space-y-4 text-center self-start md:text-left order-2 w-full"
          >
            <USkeleton class="h-10 w-48 mx-auto md:mx-0" />
            <USkeleton class="h-6 w-64 mx-auto md:mx-0" />
            <div class="flex flex-wrap gap-2 justify-center md:justify-start">
              <USkeleton class="h-5 w-16" />
              <USkeleton class="h-5 w-20" />
              <USkeleton class="h-5 w-14" />
            </div>
          </div>

          <!-- Contact Info Skeleton -->
          <div
            class="flex flex-col gap-2 items-center md:items-start lg:items-end order-3 md:col-start-2 md:row-start-2 lg:col-start-3 lg:row-start-1"
          >
            <USkeleton class="h-5 w-32" />
            <USkeleton class="h-5 w-40" />
            <div class="flex gap-2 mt-2">
              <USkeleton class="h-8 w-20" />
              <USkeleton class="h-8 w-20" />
            </div>
          </div>
        </div>

        <!-- Body Skeleton -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <USkeleton class="h-64 w-full rounded-xl" />
          <USkeleton class="h-48 w-full rounded-xl" />
          <USkeleton class="h-56 w-full rounded-xl" />
          <USkeleton class="h-72 w-full rounded-xl" />
        </div>
      </div>

      <!-- Header -->
      <header
        class="border-b border-gray-200 dark:border-gray-700 pb-8 mb-8 grid grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto] print:grid-cols-[1fr_auto] gap-2 sm:gap-6 items-stretch print:pb-2 print:mb-4 print:gap-y-2"
      >
        <!-- Avatar -->
        <div
          class="flex justify-start print:justify-end order-1 print:order-2 print:row-span-2 min-h-0"
        >
          <div
            ref="avatarRef"
            class="relative bg-gray-50 dark:bg-gray-800/50 rounded-full border border-gray-200 dark:border-gray-700 p-1 shadow-sm shrink-0 w-(--avatar-size) h-(--avatar-size) max-w-32 max-h-32 md:max-w-60 md:max-h-60 print:w-auto! print:h-full! print:max-w-none print:max-h-none aspect-square"
          >
            <img
              :src="avatarSrc"
              alt="Avatar"
              @error="handleAvatarError"
              class="rounded-full object-cover w-0 min-w-full h-full"
            />
          </div>
        </div>

        <!-- Main Info -->
        <div
          ref="headerInfoRef"
          class="space-y-4 text-left self-start print:text-left order-2 print:order-1"
        >
          <div class="m-0 sm:mb-2">
            <h1
              class="text-4xl font-bold text-gray-900 dark:text-white mb-2 print:mt-4"
            >
              {{ resumeView.name }}
            </h1>
            <p class="text-lg text-gray-500 dark:text-gray-400">
              {{ resumeView.subtitle || labels.subtitle }}
            </p>
          </div>
          <div
            v-if="resumeView.highlights.length"
            class="hidden sm:flex print:flex flex-wrap gap-2 justify-start print:justify-start"
          >
            <template
              v-for="tag in resumeView.highlights"
              :key="badgeText(tag) + (tag.kind === 'svg' ? tag.url : '')"
            >
              <span v-if="tag.kind === 'svg'" class="inline-flex items-center">
                <img :src="tag.url" :alt="tag.alt ?? 'badge'" class="h-5" />
              </span>
              <div
                v-else-if="tag.kind === 'split'"
                :class="[
                  'inline-flex items-center h-5 text-[11px] font-sans rounded-[3px] overflow-hidden border-[1.5px]',
                  badgeBorderClass(tag),
                ]"
              >
                <span
                  :class="[
                    'text-white px-1.5 h-full flex items-center font-bold gap-1',
                    badgeBgClass(tag),
                  ]"
                >
                  <template v-if="getBadgeIcon(tag)">
                    <UIcon :name="getBadgeIcon(tag)!" class="w-3 h-3" />
                  </template>
                  {{ tag.domain }}</span
                >
                <span
                  class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-1.5 h-full flex items-center font-bold"
                  >{{ tag.value }}</span
                >
              </div>
              <span
                v-else
                :class="[
                  'inline-flex items-center h-5 text-[11px] font-sans text-white px-1.5 rounded-[3px] overflow-hidden gap-1',
                  badgeBgClass(tag),
                ]"
              >
                <template v-if="getBadgeIcon(tag)">
                  <UIcon :name="getBadgeIcon(tag)!" class="w-3 h-3" />
                </template>
                {{ tag.label }}
              </span>
            </template>
          </div>
        </div>

        <!-- Mobile Highlights (Separate Row) -->
        <div
          v-if="resumeView.highlights.length"
          class="col-span-2 flex sm:hidden! print:hidden flex-wrap gap-2 justify-start order-3"
        >
          <template
            v-for="tag in resumeView.highlights"
            :key="
              'mobile-' + badgeText(tag) + (tag.kind === 'svg' ? tag.url : '')
            "
          >
            <span v-if="tag.kind === 'svg'" class="inline-flex items-center">
              <img :src="tag.url" :alt="tag.alt ?? 'badge'" class="h-5" />
            </span>
            <div
              v-else-if="tag.kind === 'split'"
              :class="[
                'inline-flex items-center h-5 text-[11px] font-sans rounded-[3px] overflow-hidden border-[1.5px]',
                badgeBorderClass(tag),
              ]"
            >
              <span
                :class="[
                  'text-white px-1.5 h-full flex items-center font-bold gap-1',
                  badgeBgClass(tag),
                ]"
              >
                <template v-if="getBadgeIcon(tag)">
                  <UIcon :name="getBadgeIcon(tag)!" class="w-3 h-3" />
                </template>
                {{ tag.domain }}</span
              >
              <span
                class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-1.5 h-full flex items-center font-bold"
                >{{ tag.value }}</span
              >
            </div>
            <span
              v-else
              :class="[
                'inline-flex items-center h-5 text-[11px] font-sans text-white px-1.5 rounded-[3px] overflow-hidden gap-1',
                badgeBgClass(tag),
              ]"
            >
              <template v-if="getBadgeIcon(tag)">
                <UIcon :name="getBadgeIcon(tag)!" class="w-3 h-3" />
              </template>
              {{ tag.label }}
            </span>
          </template>
        </div>

        <!-- Contact Info -->
        <div
          class="flex flex-col gap-2 text-sm text-left lg:text-right order-4 md:order-3 col-span-2 md:col-span-1 md:col-start-2 md:row-start-2 md:flex-row md:items-center md:justify-between lg:flex-col lg:col-start-3 lg:row-start-1 lg:items-end lg:justify-start lg:gap-2 print:flex print:flex-col print:col-start-1 print:col-span-1 print:row-start-2 print:text-left print:gap-2"
        >
          <!-- Basic Info (Nationality + Email) -->
          <div
            class="flex flex-wrap justify-start gap-4 md:justify-start lg:flex-col lg:gap-2 lg:items-end print:flex-row print:gap-x-6 print:items-center print:justify-start"
          >
            <div
              class="flex items-center justify-start lg:justify-end print:justify-start gap-2 text-gray-600 dark:text-gray-300"
            >
              <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-gray-400" />
              <span>{{ resumeView.nationality }}</span>
            </div>
            <div
              class="flex items-center justify-start lg:justify-end print:justify-start gap-2 text-gray-600 dark:text-gray-300"
            >
              <UIcon
                name="i-heroicons-envelope"
                class="w-5 h-5 text-gray-400"
              />
              <a
                :href="`mailto:${resumeView.email}`"
                class="hover:text-primary"
              >
                {{ resumeView.email }}
              </a>
            </div>
          </div>

          <!-- Homepages (Web Only) -->
          <div
            class="flex flex-wrap justify-start md:justify-end print:hidden gap-2 mt-0 lg:mt-1"
          >
            <UButton
              v-for="link in resumeView.homepages"
              :key="link.url"
              :to="link.url"
              target="_blank"
              size="xs"
              color="neutral"
              variant="soft"
            >
              <template #leading>
                <UIcon
                  :name="link.icon || 'i-heroicons-link'"
                  class="w-4 h-4"
                />
              </template>
              {{ link.label }}
            </UButton>
          </div>
        </div>

        <!-- Homepages (Print Only) -->
        <div
          class="hidden print:flex flex-wrap justify-start gap-2 mt-0 print:col-span-2 print:row-start-3"
        >
          <UButton
            v-for="link in resumeView.homepages"
            :key="link.url"
            :to="link.url"
            target="_blank"
            size="xs"
            color="neutral"
            variant="soft"
          >
            <template #leading>
              <UIcon :name="link.icon || 'i-heroicons-link'" class="w-4 h-4" />
            </template>
            {{ link.label }}
          </UButton>
        </div>
      </header>

      <!-- Main Content -->
      <div class="relative min-h-[500px]">
        <div
          v-if="!isLayoutReady"
          class="grid grid-cols-1 md:grid-cols-2 gap-6 absolute inset-0 z-10 bg-white dark:bg-gray-900 overflow-hidden"
        >
          <!-- Column 1 Skeletons -->
          <div class="space-y-6">
            <div class="space-y-4">
              <USkeleton class="h-8 w-32" />
              <USkeleton class="h-24 w-full" />
            </div>
            <div class="space-y-4">
              <USkeleton class="h-8 w-32" />
              <div class="space-y-4">
                <USkeleton class="h-20 w-full" />
                <USkeleton class="h-20 w-full" />
                <USkeleton class="h-20 w-full" />
              </div>
            </div>
          </div>
          <!-- Column 2 Skeletons -->
          <div class="space-y-6">
            <div class="space-y-4">
              <USkeleton class="h-8 w-32" />
              <div class="space-y-2">
                <USkeleton class="h-16 w-full" />
                <USkeleton class="h-16 w-full" />
                <USkeleton class="h-16 w-full" />
              </div>
            </div>
            <div class="space-y-4">
              <USkeleton class="h-8 w-32" />
              <USkeleton class="h-48 w-full" />
            </div>
          </div>
        </div>
        <div
          ref="waterfallContainer"
          class="waterfall-grid gap-x-6"
          :class="{
            'opacity-0 absolute top-0 left-0 w-full -z-10': !isLayoutReady,
          }"
        >
          <!-- Profile (Fixed Left) -->
          <section
            class="break-inside-avoid waterfall-item col-span-1 md:col-start-1 print:col-span-6 print:col-start-1"
          >
            <h2
              class="flex items-center gap-2 text-xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 print:border-b-0 print:border-l-4 print:border-(--theme-color) print:pl-2 print:bg-gray-50 print:py-1 print:mb-2 print:text-2xl"
              :style="{
                '--theme-color': resolveHexColor(
                  resumeView.colors?.profile || 'primary'
                ),
              }"
            >
              <UIcon
                name="i-heroicons-user"
                class="w-6 h-6"
                :class="sectionSettings.profile.icon"
              />
              {{ labels.profile }}
            </h2>
            <ResumeMarkdown
              :source="resumeView.summary"
              tag="div"
              class="text-gray-600 dark:text-gray-300 leading-relaxed"
            />
          </section>

          <!-- Education (Fixed Left) -->
          <section
            class="break-inside-avoid waterfall-item col-span-1 md:col-start-1 print:col-span-6 print:col-start-auto"
          >
            <h2
              class="flex items-center gap-2 text-xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 print:border-b-0 print:border-l-4 print:border-(--theme-color) print:pl-2 print:bg-gray-50 print:py-1 print:mb-2 print:text-2xl"
              :style="{
                '--theme-color': resolveHexColor(
                  resumeView.colors?.education || 'primary'
                ),
              }"
            >
              <UIcon
                name="i-heroicons-academic-cap"
                class="w-6 h-6"
                :class="sectionSettings.education.icon"
              />
              {{ labels.education }}
            </h2>
            <div class="space-y-6 print:space-y-4">
              <div
                v-for="edu in resumeView.education"
                :key="edu.school"
                class="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700"
              >
                <div
                  class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white dark:ring-gray-900"
                  :class="sectionSettings.education.bg"
                ></div>
                <h3 class="font-bold text-gray-900 dark:text-white">
                  {{ edu.school }}
                </h3>
                <div class="text-sm text-gray-500 mb-2">
                  {{ edu.major }} · {{ edu.degree }} · {{ edu.period }}
                </div>
                <ul
                  class="space-y-1 text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  <li
                    v-for="role in edu.roles"
                    :key="role"
                    class="flex items-start gap-2"
                  >
                    <UIcon
                      :name="getRoleIcon(role)"
                      :class="['w-4 h-4 mt-0.5 shrink-0', getRoleColor(role)]"
                    />
                    <ResumeMarkdown :source="role" tag="span" unwrap="p" />
                  </li>
                  <li
                    v-for="honor in edu.honors"
                    :key="honor"
                    class="flex items-start gap-2"
                  >
                    <UIcon
                      name="i-heroicons-star"
                      class="w-4 h-4 mt-0.5 shrink-0 text-primary-600 dark:text-primary-400"
                    />
                    <ResumeMarkdown :source="honor" tag="span" unwrap="p" />
                  </li>
                  <li
                    v-for="scholarship in edu.scholarships"
                    :key="scholarship"
                    class="flex items-start gap-2"
                  >
                    <UIcon
                      name="i-heroicons-currency-yen"
                      class="w-4 h-4 mt-0.5 shrink-0 text-yellow-600 dark:text-yellow-400"
                    />
                    <ResumeMarkdown
                      :source="scholarship"
                      tag="span"
                      unwrap="p"
                    />
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- GitHub Activity Stats (Fixed Left) -->
          <section
            v-if="resumeView.github"
            class="break-inside-avoid waterfall-item col-span-1 md:col-start-1 print:col-span-6 print:col-start-auto"
          >
            <h2
              class="flex items-center gap-2 text-xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 print:border-b-0 print:border-l-4 print:border-(--theme-color) print:pl-2 print:bg-gray-50 print:py-1 print:mb-2 print:text-2xl"
              :style="{
                '--theme-color': resolveHexColor(
                  resumeView.colors?.github || 'sky'
                ),
              }"
            >
              <UIcon
                name="i-iconoir-github"
                class="w-6 h-6"
                :class="sectionSettings.github.icon"
              />
              {{ labels.github }}
            </h2>
            <div class="space-y-6 print:space-y-4">
              <div
                class="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700"
              >
                <div
                  class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white dark:ring-gray-900"
                  :class="sectionSettings.github.bg"
                ></div>
                <h3 class="font-bold text-gray-900 dark:text-white">
                  GitHub Stats
                </h3>
                <div class="text-sm text-gray-500 mb-2">
                  @{{ resumeView.github.user }}
                </div>
                <ul
                  class="space-y-1 text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  <li class="flex items-start gap-2">
                    <UIcon
                      name="i-heroicons-star"
                      class="w-4 h-4 mt-0.5 shrink-0"
                      :class="sectionSettings.github.text"
                    />
                    {{ labels.stars }}: {{ githubStats?.stars || 0 }}
                  </li>
                  <li class="flex items-start gap-2">
                    <UIcon
                      name="i-octicon-git-commit-16"
                      class="w-4 h-4 mt-0.5 shrink-0"
                      :class="sectionSettings.github.text"
                    />
                    {{ labels.contributions }}:
                    {{ githubStats?.totalContributions || 0 }}
                  </li>
                  <li class="flex items-start gap-2">
                    <UIcon
                      name="i-octicon-git-pull-request-16"
                      class="w-4 h-4 mt-0.5 shrink-0"
                      :class="sectionSettings.github.text"
                    />
                    {{ labels.prs }}: {{ githubStats?.prs || 0 }}
                  </li>
                  <li class="flex items-start gap-2">
                    <UIcon
                      name="i-octicon-issue-opened-16"
                      class="w-4 h-4 mt-0.5 shrink-0"
                      :class="sectionSettings.github.text"
                    />
                    {{ labels.issues }}: {{ githubStats?.issues || 0 }}
                  </li>
                  <li class="flex items-start gap-2">
                    <UIcon
                      name="i-octicon-repo-16"
                      class="w-4 h-4 mt-0.5 shrink-0"
                      :class="sectionSettings.github.text"
                    />
                    {{ labels.repositories }}: {{ githubStats?.repoCount || 0 }}
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- GitHub Activity Heatmap (Fixed Left, Full Width in Print) -->
          <section
            v-if="resumeView.github"
            class="break-inside-avoid waterfall-item col-span-1 md:col-start-1 print:col-span-12 print:col-start-1 print:-mt-4"
            style="--print-col-span: 12"
          >
            <div
              class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2 border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <img
                :src="`https://ghchart.rshah.org/${resolveHexColor(
                  resumeView.colors?.github || 'sky'
                ).replace('#', '')}/${resumeView.github.user}`"
                alt="GitHub Contribution Graph"
                class="w-full dark:invert dark:hue-rotate-180"
              />
            </div>
          </section>

          <!-- Awards (Fixed Right) -->
          <section
            id="awards-section"
            class="break-inside-avoid group/section waterfall-item col-span-1 md:col-start-2 print:col-start-auto relative"
            :class="{ 'z-50': isAwardsHovered }"
            :style="{ '--print-col-span': awardsPrintSpan }"
            @mouseenter="isAwardsHovered = true"
            @mouseleave="isAwardsHovered = false"
          >
            <h2
              class="flex items-center gap-2 text-xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 print:border-b-0 print:border-l-4 print:border-(--theme-color) print:pl-2 print:bg-gray-50 print:py-1 print:mb-2 print:text-2xl"
              :style="{
                '--theme-color': resolveHexColor(
                  resumeView.colors?.awards || 'yellow'
                ),
              }"
            >
              <UIcon
                name="i-heroicons-trophy"
                class="w-6 h-6"
                :class="sectionSettings.awards.icon"
              />
              {{ labels.awards }}
              <span
                class="text-xs font-normal text-gray-400 ml-auto opacity-100 group-hover/section:opacity-0 transition-opacity print:hidden"
              >
                {{ labels.expand }}
              </span>
            </h2>
            <div class="space-y-4">
              <div
                v-for="(group, gIndex) in groupedAwards"
                :key="gIndex"
                class="relative"
              >
                <!-- Main Award -->
                <div
                  class="relative z-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm overflow-hidden group"
                >
                  <!-- Decoration -->
                  <div
                    class="absolute -right-4 -top-4 opacity-[0.03] dark:opacity-[0.05] transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none"
                  >
                    <UIcon name="i-heroicons-trophy" class="w-20 h-20" />
                  </div>
                  <div
                    class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    :class="sectionSettings.awards.bg"
                  ></div>

                  <div class="relative z-10 flex items-center gap-3">
                    <UIcon
                      name="i-heroicons-star"
                      class="w-5 h-5 shrink-0"
                      :class="sectionSettings.awards.icon"
                    />
                    <div class="min-w-0 flex-1">
                      <ResumeMarkdown
                        :source="group.main.title"
                        tag="div"
                        unwrap="p"
                        class="font-bold text-gray-900 dark:text-white text-sm wrap-break-word"
                      />
                      <div class="text-xs text-gray-500 mt-0.5">
                        {{ group.main.date }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sub Awards (Stacked) -->
                <div
                  v-for="(sub, sIndex) in group.subs"
                  :key="sub.title"
                  class="relative bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-sm transition-all duration-500 ease-out origin-top group/card hover:mt-2! hover:shadow-md overflow-hidden"
                  @mouseenter="hoveredCardTitle = sub.title"
                  @mouseleave="hoveredCardTitle = null"
                  :style="{
                    marginTop: isAwardsHovered ? '-8px' : '-48px',
                    zIndex: 5 - sIndex,
                    transform: isAwardsHovered
                      ? `scale(${1 - (sIndex + 1) * 0.01})`
                      : `scale(${1 - (sIndex + 1) * 0.04})`,
                    opacity: 1,
                  }"
                  :class="{
                    'print:-mt-2! print:opacity-100! print:scale-100!': true,
                  }"
                >
                  <div
                    class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-50"
                    :class="sectionSettings.awards.bg"
                  ></div>
                  <div class="relative z-10 flex items-center gap-3 pl-2">
                    <UIcon
                      name="i-heroicons-star"
                      class="text-gray-300 w-4 h-4 shrink-0 group-hover/card:text-yellow-500 transition-colors"
                    />
                    <div class="min-w-0 flex-1">
                      <div
                        class="transition-[max-height] duration-500 ease-out overflow-hidden"
                        :class="isAwardsHovered ? 'max-h-24' : 'max-h-5'"
                      >
                        <ResumeMarkdown
                          :source="sub.title"
                          tag="div"
                          unwrap="p"
                          class="font-bold text-gray-700 dark:text-gray-200 text-sm group-hover/card:text-gray-900 dark:group-hover/card:text-white pr-2 wrap-break-word"
                          :class="{
                            'line-clamp-1': !isAwardsHovered,
                          }"
                        />
                      </div>
                      <div
                        class="grid transition-[grid-template-rows] duration-300 ease-out"
                        :class="
                          !isAwardsHovered || isCardHovered(sub.title)
                            ? 'grid-rows-[1fr]'
                            : 'grid-rows-[0fr]'
                        "
                      >
                        <div class="overflow-hidden">
                          <div
                            class="text-xs text-gray-500 mt-0.5 transition-opacity duration-300 print:hidden"
                            :class="{
                              'opacity-0':
                                isAwardsHovered && !isCardHovered(sub.title),
                              'opacity-100':
                                !isAwardsHovered || isCardHovered(sub.title),
                            }"
                          >
                            {{ sub.date }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Projects -->
          <div
            v-for="(item, index) in processedProjects"
            :key="item.name"
            class="waterfall-item break-inside-avoid"
            :style="{ '--print-col-span': item.printColSpan }"
          >
            <h2
              v-if="index === 0"
              class="flex items-center gap-2 text-xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 print:border-b-0 print:border-l-4 print:border-(--theme-color) print:pl-2 print:bg-gray-50 print:py-1 print:mb-2 print:text-2xl"
              :style="{
                '--theme-color': resolveHexColor(
                  resumeView.colors?.projects || 'primary'
                ),
              }"
            >
              <UIcon
                name="i-heroicons-code-bracket-square"
                class="w-6 h-6"
                :class="sectionSettings.projects.icon"
              />
              {{ labels.projects }}
            </h2>

            <div
              class="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <!-- Decoration -->
              <div
                class="absolute -right-6 -top-6 opacity-[0.03] dark:opacity-[0.05] transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none"
              >
                <UIcon name="i-heroicons-command-line" class="w-40 h-40" />
              </div>
              <div
                class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                :class="sectionSettings.projects.bg"
              ></div>

              <div class="relative z-10 flex flex-col gap-3">
                <div class="flex justify-between items-start gap-2">
                  <div class="flex flex-col gap-1">
                    <h3
                      class="font-bold text-lg text-gray-900 dark:text-white flex flex-col gap-1"
                    >
                      <span>{{ item.name }}</span>
                      <div
                        v-if="item.highlights?.length"
                        class="flex flex-wrap gap-1.5"
                      >
                        <template
                          v-for="tag in item.highlights"
                          :key="
                            badgeText(tag) + (tag.kind === 'svg' ? tag.url : '')
                          "
                        >
                          <span v-if="tag.kind === 'svg'" class="inline-flex">
                            <img
                              :src="tag.url"
                              :alt="tag.alt ?? 'badge'"
                              class="h-5"
                            />
                          </span>
                          <div
                            v-else-if="tag.kind === 'split'"
                            :class="[
                              'inline-flex items-center h-5 text-[11px] font-sans rounded-[3px] overflow-hidden border-[1.5px]',
                              badgeBorderClass(tag),
                            ]"
                          >
                            <span
                              :class="[
                                'text-white px-1.5 h-full flex items-center font-bold gap-1',
                                badgeBgClass(tag),
                              ]"
                            >
                              <template v-if="getBadgeIcon(tag)">
                                <UIcon
                                  :name="getBadgeIcon(tag)!"
                                  class="w-3 h-3"
                                />
                              </template>
                              {{ tag.domain }}</span
                            >
                            <span
                              class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-1.5 h-full flex items-center font-bold"
                              >{{ tag.value }}</span
                            >
                          </div>
                          <span
                            v-else
                            :class="[
                              'inline-flex items-center h-5 text-[11px] font-sans text-white px-1.5 rounded-[3px] overflow-hidden gap-1',
                              badgeBgClass(tag),
                            ]"
                          >
                            <template v-if="getBadgeIcon(tag)">
                              <UIcon
                                :name="getBadgeIcon(tag)!"
                                class="w-3 h-3"
                              />
                            </template>
                            {{ tag.label }}
                          </span>
                        </template>
                      </div>
                    </h3>
                  </div>
                  <div class="flex gap-1 shrink-0 print:hidden">
                    <UButton
                      v-for="link in item.links"
                      :key="link.url"
                      :to="link.url"
                      target="_blank"
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon="i-heroicons-arrow-top-right-on-square"
                    />
                  </div>
                </div>
                <div
                  v-if="item.links?.length"
                  class="hidden print:block text-xs text-gray-500 mb-1"
                >
                  <div v-for="link in item.links" :key="link.url">
                    {{ link.url }}
                  </div>
                </div>
                <div class="space-y-3 text-sm mt-1">
                  <ul
                    class="list-disc list-outside ml-4 space-y-1 text-gray-600 dark:text-gray-300 marker:text-gray-400"
                  >
                    <li v-for="desc in item.description" :key="desc">
                      <ResumeMarkdown
                        :source="desc"
                        tag="span"
                        unwrap="p"
                        class="inline-content"
                      />
                    </li>
                  </ul>
                  <div
                    class="pt-2 border-t border-gray-200 dark:border-gray-700/50"
                  >
                    <div
                      class="text-sm text-gray-500 flex flex-wrap gap-x-3 mb-2"
                    >
                      <span class="font-medium text-primary">{{
                        item.role
                      }}</span>
                      <span>·</span>
                      <span>{{ item.period }}</span>
                    </div>
                    <div v-if="item.responsibilities?.length">
                      <p
                        class="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider"
                      >
                        Responsibilities
                      </p>
                      <ul
                        class="list-disc list-outside ml-4 space-y-1 text-gray-600 dark:text-gray-300 marker:text-gray-400"
                      >
                        <li v-for="resp in item.responsibilities" :key="resp">
                          <ResumeMarkdown
                            :source="resp"
                            tag="span"
                            unwrap="p"
                            class="inline-content"
                          />
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Games -->
          <div
            v-for="(group, index) in chunkedGames"
            :key="index"
            class="waterfall-item break-inside-avoid"
          >
            <h2
              v-if="index === 0"
              class="flex items-center gap-2 text-xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 print:border-b-0 print:border-l-4 print:border-(--theme-color) print:pl-2 print:bg-gray-50 print:py-1 print:mb-2 print:text-2xl"
              :style="{
                '--theme-color': resolveHexColor(
                  resumeView.colors?.games || 'purple'
                ),
              }"
            >
              <UIcon
                name="i-heroicons-puzzle-piece"
                class="w-6 h-6"
                :class="sectionSettings.games.icon"
              />
              {{ labels.games }}
            </h2>

            <div class="space-y-4">
              <div
                v-for="game in group"
                :key="game.name"
                class="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <!-- Decoration -->
                <div
                  class="absolute -right-4 -top-4 opacity-[0.03] dark:opacity-[0.05] transform -rotate-12 group-hover:rotate-0 transition-transform duration-500 pointer-events-none"
                >
                  <UIcon name="i-heroicons-puzzle-piece" class="w-24 h-24" />
                </div>
                <div
                  class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  :class="sectionSettings.games.bg"
                ></div>

                <div class="relative z-10">
                  <div class="flex justify-between items-start mb-1">
                    <span
                      class="font-bold text-gray-900 dark:text-white text-sm"
                      >{{ game.name }}</span
                    >
                  </div>
                  <div class="text-xs text-gray-500 mb-2">
                    <ResumeMarkdown
                      :source="game.detail"
                      tag="span"
                      unwrap="p"
                    />
                  </div>
                  <div
                    v-if="game.notes"
                    class="text-xs text-gray-600 dark:text-gray-300 italic"
                  >
                    "<ResumeMarkdown
                      :source="game.notes"
                      tag="span"
                      unwrap="p"
                    />"
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Languages -->
          <section
            class="break-inside-avoid waterfall-item col-span-1 print:col-span-6"
          >
            <h2
              class="flex items-center gap-2 text-xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 print:border-b-0 print:border-l-4 print:border-(--theme-color) print:pl-2 print:bg-gray-50 print:py-1 print:mb-2 print:text-2xl"
              :style="{
                '--theme-color': resolveHexColor(
                  resumeView.colors?.languages || 'emerald'
                ),
              }"
            >
              <UIcon
                name="i-heroicons-language"
                class="w-6 h-6"
                :class="sectionSettings.languages.icon"
              />
              {{ labels.languages }}
            </h2>
            <div class="grid grid-cols-1 gap-3">
              <div
                v-for="lang in resumeView.languages"
                :key="lang.name"
                class="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-all overflow-hidden"
              >
                <div
                  class="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] transform rotate-12 group-hover:scale-110 transition-transform pointer-events-none"
                >
                  <UIcon
                    name="i-heroicons-chat-bubble-left-right"
                    class="w-20 h-20"
                  />
                </div>
                <div
                  class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  :class="sectionSettings.languages.bg"
                ></div>
                <div class="relative z-10">
                  <div class="font-bold text-gray-900 dark:text-white">
                    {{ lang.name }}
                  </div>
                  <div
                    v-if="lang.certificate"
                    class="text-xs text-gray-500 mt-0.5"
                  >
                    {{ lang.certificate }}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer
      v-if="resumeView.footer"
      class="mt-16 border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-sm text-gray-500 dark:text-gray-400 print:mt-8 print:pt-4 print:border-t-2"
    >
      <!-- Print View: Online URL & GitHub -->
      <div class="hidden print:flex flex-col gap-1 items-center text-xs">
        <p>
          {{ locale === "zh" ? "在线查看" : "View Online" }}:
          <span class="font-mono">{{ resumeView.footer.onlineUrl }}</span>
        </p>
        <p>
          GitHub:
          <span class="font-mono">
            https://github.com/jiwangyihao/HSResume
          </span>
        </p>
      </div>

      <!-- Screen View: Copyright, ICP, PSB -->
      <div class="print:hidden flex flex-col gap-4 items-center">
        <!-- Copyright & Powered By -->
        <div class="flex flex-col items-center gap-1">
          <div class="text-center">
            <ResumeMarkdown
              :source="resumeView.footer.copyright"
              tag="span"
              unwrap="p"
            />
          </div>
          <p class="text-xs text-gray-400">
            Powered by
            <a
              href="https://github.com/jiwangyihao/HSResume"
              target="_blank"
              class="hover:text-primary hover:underline"
              >HSResume</a
            >
          </p>
        </div>

        <!-- ICP & PSB -->
        <div class="flex flex-col items-center gap-2 text-xs">
          <a
            v-if="resumeView.footer.icp"
            :href="resumeView.footer.icp.link"
            target="_blank"
            class="text-gray-500! dark:text-gray-400! hover:underline underline-offset-2 hover:text-gray-500! dark:hover:text-gray-400!"
          >
            {{ resumeView.footer.icp.text }}
          </a>
          <a
            v-if="resumeView.footer.psb"
            :href="resumeView.footer.psb.link"
            target="_blank"
            class="flex items-center gap-1 text-gray-500! dark:text-gray-400! hover:underline underline-offset-2 hover:text-gray-500! dark:hover:text-gray-400!"
          >
            <img :src="resumeView.footer.psb.icon" alt="PSB" class="w-4 h-4" />
            {{ resumeView.footer.psb.text }}
          </a>
        </div>
      </div>
    </footer>
  </UContainer>
</template>

<style scoped>
.waterfall-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-auto-rows: 1px; /* Small unit for precise height */
  grid-auto-flow: row dense; /* Help fill gaps */
  row-gap: 0; /* Crucial: handle vertical spacing via JS spans */
}

.waterfall-item {
  /* Creates a block formatting context to ensure margins are included in offsetHeight */
  display: flow-root;
}

@media (min-width: 768px) {
  .waterfall-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media print {
  @page {
    margin: 3.5rem 1.5rem;
  }

  .waterfall-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: masonry;
    gap: 0rem;
    grid-auto-rows: auto; /* Reset to auto to prevent 1px rows if masonry is not supported */
  }

  .waterfall-item {
    break-inside: avoid;
    margin-bottom: 0;
    grid-row-end: auto !important;
    grid-column: span var(--print-col-span, 6);
    padding: 0.5rem;
  }

  .print\:hidden {
    display: none !important;
  }
  .print\:p-0 {
    padding: 0 !important;
  }
  .print\:shadow-none {
    box-shadow: none !important;
  }
  .print\:rounded-none {
    border-radius: 0 !important;
  }
  .print\:border-none {
    border: none !important;
  }

  /* Ensure background colors print */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
