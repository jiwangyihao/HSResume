<script setup lang="ts">
import Markdown from "../content/Markdown.vue";
import SectionHeader from "../shared/SectionHeader.vue";

import { useAwards } from "../../composables/useAwards";
import type { ResumeEntry } from "../../types/resume";

type Props = {
  resume: ResumeEntry;
  title: string;
  expandLabel: string;
  iconClass: string;
  accentBgClass: string;
  themeColor: string;
};

const props = defineProps<Props>();

const resumeView = computed(() => props.resume);

const {
  awardsPrintSpan,
  groupedAwards,
  isAwardsHovered,
  hoveredCardTitle,
  isCardHovered,
} = useAwards(resumeView);
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
            :class="accentBgClass"
          ></div>

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
