import type { ResumeLocale } from "../types/resume";

export type ResumeLabels = {
  title: string;
  subtitle: string;
  highlights: string;
  nickname: string;
  profile: string;
  contact: string;
  education: string;
  internships: string;
  work: string;
  projects: string;
  games: string;
  awards: string;
  languages: string;
  print: string;
  nationality: string;
  email: string;
  homepage: string;
  none: string;
  expand: string;
  github: string;
  stars: string;
  forks: string;
  repositories: string;
  prs: string;
  issues: string;
  contributions: string;
};

export const useResumeLocale = () => {
  const locale = useState<ResumeLocale>("locale", () => "zh");

  const localeItems: Array<{ label: string; value: ResumeLocale }> = [
    { label: "中文", value: "zh" },
    { label: "EN", value: "en" },
  ];

  const switchLocale = (l: ResumeLocale) => {
    locale.value = l;
  };

  const labels = computed<ResumeLabels>(() =>
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

  return { locale, localeItems, labels, switchLocale };
};
