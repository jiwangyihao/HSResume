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
      <SectionCard
        v-for="lang in resume.languages"
        :key="lang.name"
        :accent-bg-class="accentBgClass"
        class="p-3 hover:shadow-md transition-all"
      >
        <template #decoration>
          <div
            class="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] transform rotate-12 group-hover:scale-110 transition-transform pointer-events-none"
          >
            <UIcon
              name="i-heroicons-chat-bubble-left-right"
              class="w-20 h-20"
            />
          </div>
        </template>
        <div class="relative z-10">
          <div class="font-bold text-gray-900 dark:text-white">
            {{ lang.name }}
          </div>
          <div v-if="lang.certificate" class="text-xs text-gray-500 mt-0.5">
            {{ lang.certificate }}
          </div>
        </div>
      </SectionCard>
    </div>
  </section>
</template>
