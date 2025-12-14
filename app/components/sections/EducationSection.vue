<script setup lang="ts">
import type {
  EducationItem,
  EducationItemCategory,
  ResumeEntry,
} from "~/types/resume";

type Props = {
  resume: ResumeEntry;

  title: string;
  iconClass: string;
  markerBgClass: string;
  themeColor: string;
};

defineProps<Props>();

const DEFAULT_EDUCATION_ITEM_ICON_BY_CATEGORY: Record<
  EducationItemCategory,
  string
> = {
  party: "i-heroicons-flag",
  representation: "i-heroicons-megaphone",
  leadership: "i-heroicons-briefcase",
  tech: "i-heroicons-command-line",
  award: "i-heroicons-star",
  scholarship: "i-heroicons-currency-yen",
  default: "i-heroicons-user",
};

const educationItemText = (item: EducationItem) =>
  typeof item === "string" ? item : item.text;

const educationItemKey = (item: EducationItem, index: number) =>
  `${educationItemText(item)}-${index}`;

const resolveEducationItemIcon = (
  item: EducationItem,
  kind: "role" | "honor" | "scholarship"
) => {
  if (typeof item !== "string") {
    if (item.icon) return item.icon;
    if (item.category)
      return DEFAULT_EDUCATION_ITEM_ICON_BY_CATEGORY[item.category];
  }

  // Default icons per list type (no string matching).
  if (kind === "role") return DEFAULT_EDUCATION_ITEM_ICON_BY_CATEGORY.default;
  if (kind === "honor") return DEFAULT_EDUCATION_ITEM_ICON_BY_CATEGORY.award;
  return DEFAULT_EDUCATION_ITEM_ICON_BY_CATEGORY.scholarship;
};

const resolveEducationItemIconClass = (
  item: EducationItem,
  kind: "role" | "honor" | "scholarship"
) => {
  if (kind === "role") return "text-sky-600 dark:text-sky-400";
  if (kind === "honor") return "text-green-600 dark:text-green-400";
  return "text-yellow-600 dark:text-yellow-400";
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
            v-for="(role, index) in edu.roles ?? []"
            :key="educationItemKey(role, index)"
            class="flex items-start gap-2"
          >
            <UIcon
              :name="resolveEducationItemIcon(role, 'role')"
              :class="[
                'w-4 h-4 mt-0.5 shrink-0',
                resolveEducationItemIconClass(role, 'role'),
              ]"
            />
            <Markdown :source="educationItemText(role)" tag="span" unwrap="p" />
          </li>

          <li
            v-for="(honor, index) in edu.honors ?? []"
            :key="educationItemKey(honor, index)"
            class="flex items-start gap-2"
          >
            <UIcon
              :name="resolveEducationItemIcon(honor, 'honor')"
              :class="[
                'w-4 h-4 mt-0.5 shrink-0',
                resolveEducationItemIconClass(honor, 'honor'),
              ]"
            />
            <Markdown
              :source="educationItemText(honor)"
              tag="span"
              unwrap="p"
            />
          </li>

          <li
            v-for="(scholarship, index) in edu.scholarships ?? []"
            :key="educationItemKey(scholarship, index)"
            class="flex items-start gap-2"
          >
            <UIcon
              :name="resolveEducationItemIcon(scholarship, 'scholarship')"
              :class="[
                'w-4 h-4 mt-0.5 shrink-0',
                resolveEducationItemIconClass(scholarship, 'scholarship'),
              ]"
            />
            <Markdown
              :source="educationItemText(scholarship)"
              tag="span"
              unwrap="p"
            />
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
