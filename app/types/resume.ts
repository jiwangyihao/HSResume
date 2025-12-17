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

export type ResumeProjectLink = {
  category?: string;
  url: string;
  icon?: string;
};

export type EducationItemCategory =
  | "party"
  | "representation"
  | "leadership"
  | "tech"
  | "award"
  | "scholarship"
  | "default";

/**
 * Education list items can be either a plain string or a structured object.
 * This allows configuring per-item icons (and optional category-based defaults)
 * from markdown frontmatter.
 */
export type EducationItem =
  | string
  | {
      text: string;
      /** Optional icon name for UIcon (e.g. i-heroicons-flag). */
      icon?: string;
      /** Optional category used to pick a default icon in UI. */
      category?: EducationItemCategory;
    };

export type ResumeEducation = {
  period: string;
  school: string;
  city: string;
  degree: string;
  major: string;
  form: string;
  roles: EducationItem[];
  honors: EducationItem[];
  scholarships: EducationItem[];
};

export type ResumeProject = {
  period: string;
  name: string;
  role: string;
  description: string[];
  responsibilities: string[];
  highlights?: Badge[];
  links?: ResumeProjectLink[];
  /** 0-100 percentage for print view width */
  printWidth?: number;
  /** Calculated span for print view */
  printColSpan?: number;
};

// Derived type used by UI rendering: ensure optional fields are normalized.
export type ProcessedProject = ResumeProject & {
  links: NonNullable<ResumeProject["links"]>;
  responsibilities: ResumeProject["responsibilities"];
  printColSpan: number;
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

export type AwardsFoldingRules = {
  /**
   * If this pattern matches the award title, it is treated as explicitly unimportant
   * (so it will be folded under the previous important award).
   *
   * This check runs before `importantTitlePattern`.
   */
  unimportantTitlePattern?: string;
  /**
   * If this pattern matches the award title, it is treated as important
   * (so it will start a new visible group).
   */
  importantTitlePattern?: string;
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
  /** Optional folding rules for grouping awards (configurable from markdown frontmatter). */
  awardsFoldingRules?: AwardsFoldingRules;
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
  sectionOrder?: string[];
};
