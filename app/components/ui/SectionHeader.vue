<script setup lang="ts">
type ClassValue = string | string[] | Record<string, boolean>;

defineProps<{
  title: string;
  icon: string;
  iconClass?: ClassValue;
  themeColor: string;
}>();
</script>

<template>
  <h2
    class="flex items-center gap-2 text-xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 print:border-b-0 print:border-l-4 print:border-(--theme-color) print:pl-2 print:bg-gray-50 print:py-1 print:mb-2 print:text-2xl"
    :style="{ '--theme-color': themeColor }"
  >
    <UIcon :name="icon" class="w-6 h-6" :class="iconClass" />
    {{ title }}
    <slot name="trailing" />
  </h2>
</template>
