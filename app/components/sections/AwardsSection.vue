<script setup lang="ts">
import type { ResumeAward, ResumeEntry } from "~/types/resume";

type AwardGroup = { main: ResumeAward; subs: ResumeAward[] };

const clampInt = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value)));

// Awards folding rule: start a new visible group when the award title looks
// "important"; otherwise fold it under the last important one.
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

type Props = {
  resume: ResumeEntry;
  title: string;
  expandLabel: string;
  iconClass: string;
  accentBgClass: string;
  themeColor: string;
};

const props = defineProps<Props>();

const isAwardsHovered = ref(false);
const hoveredCardTitle = ref<string | null>(null);
const isCardHovered = (title: string) => hoveredCardTitle.value === title;

const awardsPrintSpan = computed(() => {
  const width = props.resume.awardsPrintWidth;
  if (typeof width === "number") return clampInt((width / 100) * 12, 3, 12);
  return 6;
});

const groupedAwards = computed<AwardGroup[]>(() => {
  const awards = (props.resume.awards || []) as ResumeAward[];
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
</script>

<template>
  <section
    id="awards-section"
    class="break-inside-avoid group/section waterfall-item col-span-1 md:col-start-2 print:col-start-auto relative"
    :class="{ 'z-50': isAwardsHovered }"
    :style="{ '--print-col-span': awardsPrintSpan }"
    @mouseenter="isAwardsHovered = true"
    @mouseleave="isAwardsHovered = false"
  >
    <SectionHeader
      :title="title"
      icon="i-heroicons-trophy"
      :icon-class="iconClass"
      :theme-color="themeColor"
    >
      <template #trailing>
        <span
          class="text-xs font-normal text-gray-400 ml-auto opacity-100 group-hover/section:opacity-0 transition-opacity print:hidden"
        >
          {{ expandLabel }}
        </span>
      </template>
    </SectionHeader>

    <div class="space-y-4">
      <div
        v-for="(group, gIndex) in groupedAwards"
        :key="gIndex"
        class="relative"
      >
        <SectionCard
          :accent-bg-class="accentBgClass"
          class="z-10 p-4 shadow-sm"
        >
          <template #decoration>
            <div
              class="absolute -right-4 -top-4 opacity-[0.03] dark:opacity-[0.05] transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none"
            >
              <UIcon name="i-heroicons-trophy" class="w-20 h-20" />
            </div>
          </template>

          <div class="relative z-10 flex items-center gap-3">
            <UIcon
              name="i-heroicons-star"
              class="w-5 h-5 shrink-0"
              :class="iconClass"
            />
            <div class="min-w-0 flex-1">
              <Markdown
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
        </SectionCard>

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
            :class="accentBgClass"
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
                <Markdown
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
                      'opacity-0': isAwardsHovered && !isCardHovered(sub.title),
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
</template>
