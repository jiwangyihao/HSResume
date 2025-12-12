import type { ResumeAward, ResumeEntry } from "../types/resume";

type AwardGroup = { main: ResumeAward; subs: ResumeAward[] };

const clampInt = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value)));

// Awards folding rule (pre-refactor): start a new visible group when the award title
// looks "important"; otherwise fold it under the last important one.
const isImportantAward = (title: string) => {
  const t = title.toLowerCase();

  // Explicitly treat these as NOT important (so they get folded).
  if (
    t.includes("校级") ||
    t.includes("省级") ||
    t.includes("区域") ||
    t.includes("创意组") ||
    t.includes("regional") ||
    t.includes("university") ||
    t.includes("creative group")
  ) {
    return false;
  }

  return (
    t.includes("全国") ||
    t.includes("全球") ||
    t.includes("international") ||
    t.includes("mcm") ||
    t.includes("national") ||
    t.includes("global")
  );
};

export const useAwards = (resumeView: ComputedRef<ResumeEntry>) => {
  const isAwardsHovered = ref(false);
  const hoveredCardTitle = ref<string | null>(null);
  const isCardHovered = (title: string) => hoveredCardTitle.value === title;

  const awardsPrintSpan = computed(() => {
    const width = resumeView.value.awardsPrintWidth;
    if (typeof width === "number") return clampInt((width / 100) * 12, 3, 12);
    return 6;
  });

  const groupedAwards = computed<AwardGroup[]>(() => {
    const awards = (resumeView.value.awards || []) as ResumeAward[];
    const groups: AwardGroup[] = [];
    let currentGroup: AwardGroup | null = null;

    awards.forEach((award) => {
      const important = isImportantAward(award.title);
      if (important || !currentGroup) {
        currentGroup = { main: award, subs: [] };
        groups.push(currentGroup);
      } else {
        currentGroup.subs.push(award);
      }
    });

    return groups;
  });

  return {
    awardsPrintSpan,
    groupedAwards,
    isAwardsHovered,
    hoveredCardTitle,
    isCardHovered,
  };
};
