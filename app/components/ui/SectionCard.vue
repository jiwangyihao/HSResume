<script setup lang="ts">
import { computed, useAttrs } from "vue";

type Props = {
  /** Optional left accent bar color class, e.g. "bg-primary-500" */
  accentBgClass?: string;

  /** Render element tag for the card root */
  tag?: string;
};

withDefaults(defineProps<Props>(), {
  accentBgClass: "",
  tag: "div",
});

defineOptions({
  inheritAttrs: false,
});

const attrs = useAttrs();

const boundAttrs = computed(() => {
  const rest: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") continue;
    rest[k] = v;
  }
  return rest;
});
</script>

<template>
  <component
    :is="tag"
    v-bind="boundAttrs"
    :class="[
      // Base card shell shared across sections.
      'relative bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden',
      // Many cards rely on group-hover for their decoration.
      'group',
      attrs.class,
    ]"
  >
    <div
      v-if="accentBgClass"
      class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
      :class="accentBgClass"
    />

    <template v-if="$slots.decoration">
      <slot name="decoration" />
    </template>

    <slot />
  </component>
</template>
