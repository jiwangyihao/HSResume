<script setup lang="ts">
import type { ProcessedProject } from "~/types/resume";

type Props = {
  item: ProcessedProject;
  accentBgClass: string;
  roleTextClass?: string;
  /** Resolved section theme color (hex), used for the top-right link button */
  themeColor: string;
};

defineProps<Props>();

function getIconForLink(link: { category?: string; icon?: string }) {
  if (link.icon) return link.icon;

  switch (link.category?.toLowerCase()) {
    case "github":
      return "i-simple-icons-github";
    case "gitee":
      return "i-simple-icons-gitee";
    case "bilibili":
      return "i-simple-icons-bilibili";
    case "coolapk":
    case "酷安":
      return "i-custom-coolapk";
    case "doc":
    case "docs":
    case "文档":
      return "i-heroicons-document-text";
    case "website":
    case "官网":
    default:
      return "i-heroicons-arrow-top-right-on-square";
  }
}
</script>

<template>
  <SectionCard
    :accent-bg-class="accentBgClass"
    class="p-5 hover:shadow-lg transition-all duration-300"
  >
    <template #decoration>
      <div
        class="absolute -right-6 -top-6 opacity-[0.03] dark:opacity-[0.05] transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none"
      >
        <UIcon name="i-heroicons-command-line" class="w-40 h-40" />
      </div>
    </template>

    <div class="relative z-10 flex flex-col gap-3">
      <div class="flex justify-between items-start gap-2">
        <div class="flex flex-col gap-1">
          <h3
            class="font-bold text-lg text-gray-900 dark:text-white flex flex-col gap-1"
          >
            <span>{{ item.name }}</span>
            <div v-if="item.highlights?.length" class="flex flex-wrap gap-1.5">
              <BadgePills :tags="item.highlights" />
            </div>
          </h3>
        </div>
        <div
          class="flex gap-1 shrink-0 print:hidden"
          :style="{ '--project-accent': themeColor }"
        >
          <UButton
            v-for="link in item.links"
            :key="link.url"
            :to="link.url"
            target="_blank"
            size="xs"
            color="neutral"
            variant="ghost"
            :icon="getIconForLink(link)"
            class="text-(--project-accent)! hover:text-(--project-accent)!"
          />
        </div>
      </div>

      <div
        v-if="item.links?.length"
        class="hidden print:block text-xs text-gray-500 mb-1"
      >
        <div
          v-for="link in item.links"
          :key="link.url"
          class="flex items-start gap-1"
        >
          <UIcon
            :name="getIconForLink(link)"
            class="w-3 h-3 mt-[2px] shrink-0"
          />
          <span class="break-all">{{ link.url }}</span>
        </div>
      </div>

      <div class="space-y-3 text-sm mt-1">
        <ul
          class="list-disc list-outside ml-4 space-y-1 text-gray-600 dark:text-gray-300 marker:text-gray-400"
        >
          <li v-for="desc in item.description" :key="desc">
            <Markdown
              :source="desc"
              tag="span"
              unwrap="p"
              class="inline-content"
            />
          </li>
        </ul>

        <div class="pt-2 border-t border-gray-200 dark:border-gray-700/50">
          <div class="text-sm text-gray-500 flex flex-wrap gap-x-3 mb-2">
            <span :class="['font-medium', roleTextClass || 'text-primary']">{{
              item.role
            }}</span>
            <span>·</span>
            <span>{{ item.period }}</span>
          </div>

          <div v-if="item.responsibilities?.length">
            <p
              class="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider"
            >
              Responsibilities
            </p>
            <ul
              class="list-disc list-outside ml-4 space-y-1 text-gray-600 dark:text-gray-300 marker:text-gray-400"
            >
              <li v-for="resp in item.responsibilities" :key="resp">
                <Markdown
                  :source="resp"
                  tag="span"
                  unwrap="p"
                  class="inline-content"
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </SectionCard>
</template>
