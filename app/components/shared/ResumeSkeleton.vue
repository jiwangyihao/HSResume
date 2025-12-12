<script setup lang="ts">
withDefaults(
  defineProps<{
    /**
     * - full: header + body skeleton
     * - body: body skeleton only
     */
    mode?: "full" | "body";
  }>(),
  {
    mode: "full",
  }
);
</script>

<template>
  <div>
    <!-- Header Skeleton -->
    <div
      v-if="mode === 'full'"
      class="border-b border-gray-200 dark:border-gray-700 pb-8 mb-8 grid grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto] gap-6 items-stretch"
    >
      <!-- Avatar Skeleton -->
      <div class="flex justify-center md:justify-start order-1">
        <USkeleton
          class="w-32 h-32 rounded-full"
          :ui="{ rounded: 'rounded-full' }"
        />
      </div>

      <!-- Main Info Skeleton -->
      <div class="space-y-4 text-center self-start md:text-left order-2 w-full">
        <USkeleton class="h-10 w-48 mx-auto md:mx-0" />
        <USkeleton class="h-6 w-64 mx-auto md:mx-0" />
        <div class="flex flex-wrap gap-2 justify-center md:justify-start">
          <USkeleton class="h-5 w-16" />
          <USkeleton class="h-5 w-20" />
          <USkeleton class="h-5 w-14" />
        </div>
      </div>

      <!-- Contact Info Skeleton -->
      <div
        class="flex flex-col gap-2 items-center md:items-start lg:items-end order-3 md:col-start-2 md:row-start-2 lg:col-start-3 lg:row-start-1"
      >
        <USkeleton class="h-5 w-32" />
        <USkeleton class="h-5 w-40" />
        <div class="flex gap-2 mt-2">
          <USkeleton class="h-8 w-20" />
          <USkeleton class="h-8 w-20" />
        </div>
      </div>
    </div>

    <!-- Body Skeleton -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Column 1 Skeletons -->
      <div class="space-y-6">
        <div class="space-y-4">
          <USkeleton class="h-8 w-32" />
          <USkeleton class="h-24 w-full" />
        </div>
        <div class="space-y-4">
          <USkeleton class="h-8 w-32" />
          <div class="space-y-4">
            <USkeleton class="h-20 w-full" />
            <USkeleton class="h-20 w-full" />
            <USkeleton class="h-20 w-full" />
          </div>
        </div>
      </div>

      <!-- Column 2 Skeletons -->
      <div class="space-y-6">
        <div class="space-y-4">
          <USkeleton class="h-8 w-32" />
          <div class="space-y-2">
            <USkeleton class="h-16 w-full" />
            <USkeleton class="h-16 w-full" />
            <USkeleton class="h-16 w-full" />
          </div>
        </div>
        <div class="space-y-4">
          <USkeleton class="h-8 w-32" />
          <USkeleton class="h-48 w-full" />
        </div>
      </div>
    </div>
  </div>
</template>
