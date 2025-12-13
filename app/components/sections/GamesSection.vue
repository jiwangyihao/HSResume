<script setup lang="ts">
import SectionHeader from "../shared/SectionHeader.vue";
import Markdown from "../content/Markdown.vue";

import type { ResumeEntry } from "../../types/resume";

type Props = {
  resume: ResumeEntry;
  title: string;
  iconClass: string;
  accentBgClass: string;
  themeColor: string;
};

const props = defineProps<Props>();

const chunk = <T>(items: T[], size: number): T[][] => {
  const safeSize = Math.max(1, Math.floor(size));
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += safeSize) {
    out.push(items.slice(i, i + safeSize));
  }
  return out;
};

const chunkedGames = computed(() => {
  const games = props.resume.games || [];
  return chunk(games, 3);
});
</script>

<template>
  <div
    v-for="(group, index) in chunkedGames"
    :key="index"
    class="waterfall-item break-inside-avoid"
  >
    <SectionHeader
      v-if="index === 0"
      :title="title"
      icon="i-heroicons-puzzle-piece"
      :icon-class="iconClass"
      :theme-color="themeColor"
    />

    <div class="grid grid-cols-1 gap-(--masonry-gap) print:gap-4">
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
          :class="accentBgClass"
        ></div>

        <div class="relative z-10">
          <div class="flex justify-between items-start mb-1">
            <span class="font-bold text-gray-900 dark:text-white text-sm">{{
              game.name
            }}</span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            <Markdown :source="game.detail" tag="span" unwrap="p" />
          </div>
          <div
            v-if="game.notes"
            class="text-xs text-gray-600 dark:text-gray-300 italic"
          >
            "<Markdown :source="game.notes" tag="span" unwrap="p" />"
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
