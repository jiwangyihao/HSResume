<script setup lang="ts">
import SectionHeader from "../ui/SectionHeader.vue";
import ProjectCard from "../cards/ProjectCard.vue";

import type {
  ProcessedProject,
  ResumeEntry,
  ResumeProject,
} from "../../types/resume";

const clampInt = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value)));

type Props = {
  resume: ResumeEntry;
  title: string;
  iconClass: string;
  accentBgClass: string;
  themeColor: string;
};

const props = defineProps<Props>();

const items = computed<ProcessedProject[]>(() => {
  const projects = (props.resume.projects || []) as ResumeProject[];

  return projects.map((p) => {
    const links = p.links || [];
    const responsibilities = p.responsibilities || [];

    const spanFromWidth =
      typeof p.printWidth === "number"
        ? clampInt((p.printWidth / 100) * 12, 3, 12)
        : undefined;

    const printColSpan =
      typeof p.printColSpan === "number"
        ? clampInt(p.printColSpan, 3, 12)
        : spanFromWidth ?? 6;

    return {
      ...p,
      links,
      responsibilities,
      printColSpan,
    };
  });
});
</script>

<template>
  <div
    v-for="(item, index) in items"
    :key="item.name"
    class="waterfall-item break-inside-avoid"
    :style="{ '--print-col-span': item.printColSpan }"
  >
    <SectionHeader
      v-if="index === 0"
      :title="title"
      icon="i-heroicons-code-bracket-square"
      :icon-class="iconClass"
      :theme-color="themeColor"
    />

    <ProjectCard :item="item" :accent-bg-class="accentBgClass" />
  </div>
</template>
