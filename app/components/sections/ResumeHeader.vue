<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";
import type { ResumeEntry } from "../../types/resume";

import BadgePills from "../shared/BadgePills.vue";

type Props = {
  resume: ResumeEntry;
  subtitleFallback: string;

  avatarSrc: string;
  onAvatarError: () => void;

  /** Layout measurement refs (owned by the page) */
  setAvatarEl: (el: Element | ComponentPublicInstance | null) => void;
  setHeaderInfoEl: (el: Element | ComponentPublicInstance | null) => void;
};

defineProps<Props>();
</script>

<template>
  <header
    class="border-b border-gray-200 dark:border-gray-700 pb-8 mb-8 grid grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto] print:grid-cols-[1fr_auto] gap-2 sm:gap-6 items-stretch print:pb-2 print:mb-4 print:gap-y-2"
  >
    <!-- Avatar -->
    <div
      class="flex justify-start print:justify-end order-1 print:order-2 print:row-span-2 min-h-0"
    >
      <div
        :ref="setAvatarEl"
        class="relative bg-gray-50 dark:bg-gray-800/50 rounded-full border border-gray-200 dark:border-gray-700 p-1 shadow-sm shrink-0 w-(--avatar-size) h-(--avatar-size) max-w-32 max-h-32 md:max-w-60 md:max-h-60 print:w-auto! print:h-full! print:max-w-none print:max-h-none aspect-square"
      >
        <img
          :src="avatarSrc"
          alt="Avatar"
          @error="onAvatarError"
          class="rounded-full object-cover w-0 min-w-full h-full"
        />
      </div>
    </div>

    <!-- Main Info -->
    <div
      :ref="setHeaderInfoEl"
      class="space-y-4 text-left self-start print:text-left order-2 print:order-1"
    >
      <div class="m-0 sm:mb-2">
        <h1
          class="text-4xl font-bold text-gray-900 dark:text-white mb-2 print:mt-4"
        >
          {{ resume.name }}
        </h1>
        <p class="text-lg text-gray-500 dark:text-gray-400">
          {{ resume.subtitle || subtitleFallback }}
        </p>
      </div>

      <div
        v-if="resume.highlights.length"
        class="hidden sm:flex print:flex flex-wrap gap-2 justify-start print:justify-start"
      >
        <BadgePills :tags="resume.highlights" />
      </div>
    </div>

    <!-- Mobile Highlights (Separate Row) -->
    <div
      v-if="resume.highlights.length"
      class="col-span-2 flex sm:hidden! print:hidden flex-wrap gap-2 justify-start order-3"
    >
      <BadgePills :tags="resume.highlights" key-prefix="mobile-" />
    </div>

    <!-- display: contents so grid positioning is controlled by the parent header grid -->
    <div class="contents">
      <!-- Contact Info -->
      <div
        class="flex flex-col gap-2 text-sm text-left lg:text-right order-4 md:order-3 col-span-2 md:col-span-1 md:col-start-2 md:row-start-2 md:flex-row md:items-center md:justify-between lg:flex-col lg:col-start-3 lg:row-start-1 lg:items-end lg:justify-start lg:gap-2 print:flex print:flex-col print:col-start-1 print:col-span-1 print:row-start-2 print:text-left print:gap-2"
      >
        <!-- Basic Info (Nationality + Email) -->
        <div
          class="flex flex-wrap justify-start gap-4 md:justify-start lg:flex-col lg:gap-2 lg:items-end print:flex-row print:gap-x-6 print:items-center print:justify-start"
        >
          <div
            class="flex items-center justify-start lg:justify-end print:justify-start gap-2 text-gray-600 dark:text-gray-300"
          >
            <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-gray-400" />
            <span>{{ resume.nationality }}</span>
          </div>
          <div
            class="flex items-center justify-start lg:justify-end print:justify-start gap-2 text-gray-600 dark:text-gray-300"
          >
            <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-gray-400" />
            <a :href="`mailto:${resume.email}`" class="hover:text-primary">
              {{ resume.email }}
            </a>
          </div>
        </div>

        <!-- Homepages (Web Only) -->
        <div
          class="flex flex-wrap justify-start md:justify-end print:hidden gap-2 mt-0 lg:mt-1"
        >
          <UButton
            v-for="link in resume.homepages"
            :key="link.url"
            :to="link.url"
            target="_blank"
            size="xs"
            color="neutral"
            variant="soft"
          >
            <template #leading>
              <UIcon :name="link.icon || 'i-heroicons-link'" class="w-4 h-4" />
            </template>
            {{ link.label }}
          </UButton>
        </div>
      </div>

      <!-- Homepages (Print Only) -->
      <div
        class="hidden print:flex flex-wrap justify-start gap-2 mt-0 print:col-span-2 print:row-start-3"
      >
        <UButton
          v-for="link in resume.homepages"
          :key="link.url"
          :to="link.url"
          target="_blank"
          size="xs"
          color="neutral"
          variant="soft"
        >
          <template #leading>
            <UIcon :name="link.icon || 'i-heroicons-link'" class="w-4 h-4" />
          </template>
          {{ link.label }}
        </UButton>
      </div>
    </div>
  </header>
</template>
