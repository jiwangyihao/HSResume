<script setup lang="ts">
import type { ResumeEntry } from "~/types/resume";

type Props = {
  resume: ResumeEntry;

  title: string;
  iconClass: string;
  markerBgClass: string;
  themeColor: string;
};

defineProps<Props>();

// Inline helpers: only used by EducationSection, keep the concern local.
const getRoleIcon = (role: string) => {
  const r = role.toLowerCase();
  if (r.includes("团支书") || r.includes("secretary"))
    return "i-heroicons-flag";
  if (r.includes("代表") || r.includes("representative"))
    return "i-heroicons-megaphone";
  if (r.includes("部长") || r.includes("head") || r.includes("lead"))
    return "i-heroicons-briefcase";
  if (
    r.includes("技术") ||
    r.includes("开源") ||
    r.includes("lug") ||
    r.includes("tech")
  )
    return "i-heroicons-command-line";
  return "i-heroicons-user";
};

const getRoleColor = (_role: string) => {
  return "text-sky-500 dark:text-sky-400";
};
</script>

<template>
  <section
    class="break-inside-avoid waterfall-item col-span-1 md:col-start-1 print:col-span-6 print:col-start-auto"
  >
    <SectionHeader
      :title="title"
      icon="i-heroicons-academic-cap"
      :icon-class="iconClass"
      :theme-color="themeColor"
    />

    <div class="space-y-6 print:space-y-4">
      <div
        v-for="edu in resume.education"
        :key="edu.school"
        class="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700"
      >
        <div
          class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white dark:ring-gray-900"
          :class="markerBgClass"
        ></div>

        <h3 class="font-bold text-gray-900 dark:text-white">
          {{ edu.school }}
        </h3>
        <div class="text-sm text-gray-500 mb-2">
          {{ edu.major }} · {{ edu.degree }} · {{ edu.period }}
        </div>

        <ul
          class="space-y-1 text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          <li
            v-for="role in edu.roles"
            :key="role"
            class="flex items-start gap-2"
          >
            <UIcon
              :name="getRoleIcon(role)"
              :class="['w-4 h-4 mt-0.5 shrink-0', getRoleColor(role)]"
            />
            <Markdown :source="role" tag="span" unwrap="p" />
          </li>

          <li
            v-for="honor in edu.honors"
            :key="honor"
            class="flex items-start gap-2"
          >
            <UIcon
              name="i-heroicons-star"
              class="w-4 h-4 mt-0.5 shrink-0 text-primary-600 dark:text-primary-400"
            />
            <Markdown :source="honor" tag="span" unwrap="p" />
          </li>

          <li
            v-for="scholarship in edu.scholarships"
            :key="scholarship"
            class="flex items-start gap-2"
          >
            <UIcon
              name="i-heroicons-currency-yen"
              class="w-4 h-4 mt-0.5 shrink-0 text-yellow-600 dark:text-yellow-400"
            />
            <Markdown :source="scholarship" tag="span" unwrap="p" />
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
