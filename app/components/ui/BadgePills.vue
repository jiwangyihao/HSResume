<script setup lang="ts">
import type { Badge } from "~/types/resume";

const badgeBgClass = (badge: Badge) => {
  switch (badge.category) {
    case "award":
      return "bg-yellow-600";
    case "metric":
      return "bg-emerald-600";
    case "traffic":
      return "bg-sky-600";
    case "event":
      return "bg-orange-600";
    case "tech":
      return "bg-indigo-600";
    case "business":
      return "bg-purple-600";
    case "platform":
      return "bg-teal-600";
    default:
      return "bg-gray-600";
  }
};

const badgeBorderClass = (badge: Badge) => {
  switch (badge.category) {
    case "award":
      return "border-yellow-600";
    case "metric":
      return "border-emerald-600";
    case "traffic":
      return "border-sky-600";
    case "event":
      return "border-orange-600";
    case "tech":
      return "border-indigo-600";
    case "business":
      return "border-purple-600";
    case "platform":
      return "border-teal-600";
    default:
      return "border-gray-600";
  }
};

const badgeText = (badge: Badge) => {
  if (badge.kind === "svg") return badge.alt ?? badge.url;
  if (badge.kind === "split") return `${badge.domain}/${badge.value}`;
  return badge.label;
};

const getBadgeIcon = (badge: Badge) => {
  if (badge.icon) return badge.icon;

  switch (badge.category) {
    case "award":
      return "i-heroicons-trophy-solid";
    case "metric":
      return "i-heroicons-chart-bar-solid";
    case "traffic":
      return "i-heroicons-arrow-trending-up-solid";
    case "event":
      return "i-icon-park-solid-online-meeting";
    case "tech":
      return "i-heroicons-cpu-chip-solid";
    case "business":
      return "i-heroicons-briefcase-solid";
    case "platform":
      return "i-heroicons-building-library-solid";
    default:
      return undefined;
  }
};

const props = withDefaults(
  defineProps<{
    tags?: Badge[];
    /** Optional prefix to avoid key collisions across multiple lists */
    keyPrefix?: string;
  }>(),
  {
    tags: () => [],
    keyPrefix: "",
  }
);

const tagKey = (tag: Badge) =>
  props.keyPrefix + badgeText(tag) + (tag.kind === "svg" ? tag.url : "");
</script>

<template>
  <div class="contents">
    <template v-for="tag in props.tags" :key="tagKey(tag)">
      <span v-if="tag.kind === 'svg'" class="inline-flex items-center">
        <img :src="tag.url" :alt="tag.alt ?? 'badge'" class="h-5" />
      </span>

      <div
        v-else-if="tag.kind === 'split'"
        :class="[
          'inline-flex items-center h-5 text-[11px] font-sans rounded-[3px] overflow-hidden border-[1.5px]',
          badgeBorderClass(tag),
        ]"
      >
        <span
          :class="[
            'text-white px-1.5 h-full flex items-center font-bold gap-1',
            badgeBgClass(tag),
          ]"
        >
          <template v-if="getBadgeIcon(tag)">
            <UIcon :name="getBadgeIcon(tag)!" class="w-3 h-3" />
          </template>
          {{ tag.domain }}</span
        >
        <span
          class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-1.5 h-full flex items-center font-bold"
          >{{ tag.value }}</span
        >
      </div>

      <span
        v-else
        :class="[
          'inline-flex items-center h-5 text-[11px] font-sans text-white px-1.5 rounded-[3px] overflow-hidden gap-1',
          badgeBgClass(tag),
        ]"
      >
        <template v-if="getBadgeIcon(tag)">
          <UIcon :name="getBadgeIcon(tag)!" class="w-3 h-3" />
        </template>
        {{ tag.label }}
      </span>
    </template>
  </div>
</template>
