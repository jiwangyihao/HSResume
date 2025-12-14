<script setup lang="ts">
import type { ResumeEntry } from "~/types/resume";

type Props = {
  resume: ResumeEntry;
  title: string;
  iconClass: string;
  themeColor: string;
};

defineProps<Props>();
</script>

<template>
  <section
    class="break-inside-avoid waterfall-item col-span-1 md:col-start-1 print:col-span-6 print:col-start-1"
  >
    <SectionHeader
      :title="title"
      icon="i-akar-icons-info"
      :icon-class="iconClass"
      :theme-color="themeColor"
    />
    <Markdown
      :source="resume.summary"
      tag="div"
      class="text-gray-600 dark:text-gray-300 leading-relaxed"
    />
  </section>
</template>
