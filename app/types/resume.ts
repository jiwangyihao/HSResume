export type ResumeLocale = "zh" | "en";

export type BadgeCategory =
  | "award"
  | "metric"
  | "traffic"
  | "event"
  | "tech"
  | "business"
  | "platform"
  | "default";

export type Badge =
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

export type ResumeLink = { label: string; url: string; icon?: string };

export type ResumeEducation = {
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

export type ResumeProject = {
  period: string;
  name: string;
  role: string;
  description: string[];
  responsibilities: string[];
  highlights?: Badge[];
  links?: ResumeLink[];
  /** 0-100 percentage for print view width */
  printWidth?: number;
  /** Calculated span for print view */
  printColSpan?: number;
};

export type ResumeGame = { name: string; detail: string; notes?: string };

export type ResumeAward = { date: string; title: string };

export type ResumeLanguage = { name: string; certificate?: string };

export type ResumeFooter = {
  onlineUrl: string;
  icp?: { text: string; link: string };
  psb?: { text: string; link: string; icon: string };
  copyright: string;
};

export type ResumeEntry = {
  locale: ResumeLocale;
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
