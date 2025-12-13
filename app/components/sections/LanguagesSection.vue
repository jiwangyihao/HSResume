<script setup lang="ts">
import type { ResumeEntry } from "~/types/resume";

type Props = {
  resume: ResumeEntry;
  title: string;
  iconClass: string;
  accentBgClass: string;
  themeColor: string;
};

defineProps<Props>();
</script>

<template>
  <section
    class="break-inside-avoid waterfall-item col-span-1 print:col-span-6"
  >
    <SectionHeader
      :title="title"
      icon="i-heroicons-language"
      :icon-class="iconClass"
      :theme-color="themeColor"
    />
    <div class="grid grid-cols-1 gap-3">
      <div
        v-for="lang in resume.languages"
        :key="lang.name"
        class="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-all overflow-hidden"
      >
        <div
          class="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] transform rotate-12 group-hover:scale-110 transition-transform pointer-events-none"
        >
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-20 h-20" />
        </div>
        <div
          class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
          :class="accentBgClass"
        ></div>
        <div class="relative z-10">
          <div class="font-bold text-gray-900 dark:text-white">
            {{ lang.name }}
          </div>
          <div v-if="lang.certificate" class="text-xs text-gray-500 mt-0.5">
            {{ lang.certificate }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
