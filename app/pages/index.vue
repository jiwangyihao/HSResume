<script setup lang="ts">
import { useWaterfallLayout } from "../composables/useWaterfallLayout";
import Markdown from "../components/content/Markdown.vue";
import SectionHeader from "../components/shared/SectionHeader.vue";
import type { ResumeAward } from "../types/resume";
import {
  badgeBgClass,
  badgeBorderClass,
  badgeText,
  getBadgeIcon,
} from "../composables/useBadges";
import { useAwards } from "../composables/useAwards";
import { useProjects } from "../composables/useProjects";
import { usePrint } from "../composables/usePrint";
import { useGithubStats } from "../composables/useGithubStats";
import { useResumeContent } from "../composables/useResumeContent";
import { useResumeLocale } from "../composables/useResumeLocale";
import { useThemeColors } from "../composables/useThemeColors";

const runtimeConfig = useRuntimeConfig();
const buildTime = computed(() => runtimeConfig.public.buildTime || "");
const buildSha = computed(() => runtimeConfig.public.gitSha || "");

const { locale, localeItems, labels, switchLocale } = useResumeLocale();
const { resume, pending, error, refresh, resumeView } = await useResumeContent(
  locale
);
const { sectionSettings, resolveHexColor } = useThemeColors(resumeView);
const { printPage } = usePrint();

const { githubStats } = await useGithubStats(resumeView);

const avatarSrc = ref("/avatar.png");
const handleAvatarError = () => {
  // Fallback for public main branch: use sample SVG when avatar.png is not present.
  if (avatarSrc.value !== "/avatar.sample.svg")
    avatarSrc.value = "/avatar.sample.svg";
};

const getRoleIcon = (role: string) => {
  const text = role.toLowerCase();
  if (
    text.includes("leader") ||
    text.includes("president") ||
    text.includes("captain") ||
    role.includes("负责人") ||
    role.includes("主席") ||
    role.includes("班长")
  ) {
    return "i-heroicons-user-group";
  }
  if (
    text.includes("assistant") ||
    text.includes("ta") ||
    role.includes("助教") ||
    role.includes("助理")
  ) {
    return "i-heroicons-academic-cap";
  }
  return "i-heroicons-user";
};

const getRoleColor = (role: string) => {
  const text = role.toLowerCase();
  if (
    text.includes("leader") ||
    text.includes("president") ||
    text.includes("captain") ||
    role.includes("负责人") ||
    role.includes("主席") ||
    role.includes("班长")
  ) {
    return "text-primary-600 dark:text-primary-400";
  }
  if (
    text.includes("assistant") ||
    text.includes("ta") ||
    role.includes("助教") ||
    role.includes("助理")
  ) {
    return "text-emerald-600 dark:text-emerald-400";
  }
  return "text-gray-500 dark:text-gray-400";
};

const {
  waterfallContainer,
  isLayoutReady,
  pageRootRef,
  avatarRef,
  headerInfoRef,
} = useWaterfallLayout({
  locale,
  pending,
  resume,
});

const clampInt = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value)));

const {
  awardsPrintSpan,
  groupedAwards,
  isAwardsHovered,
  hoveredCardTitle,
  isCardHovered,
} = useAwards(resumeView);

const { processedProjects } = useProjects(resumeView);

const chunk = <T>(items: T[], size: number): T[][] => {
  const safeSize = Math.max(1, Math.floor(size));
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += safeSize) {
    out.push(items.slice(i, i + safeSize));
  }
  return out;
};

const chunkedGames = computed(() => {
  const games = resumeView.value.games || [];
  return chunk(games, 2);
});
</script>

<template>
  <UContainer class="py-8 print:p-0 max-w-7xl">
    <!-- Action Bar -->
    <div class="flex justify-end gap-3 mb-6 print:hidden">
      <UButton
        icon="i-heroicons-printer"
        size="sm"
        color="neutral"
        variant="solid"
        @click="printPage"
        >{{ labels.print }}</UButton
      >
      <UTabs
        v-model="locale"
        :items="localeItems"
        :content="false"
        size="xs"
        variant="pill"
        :ui="{
          list: 'bg-gray-100 dark:bg-gray-800 p-1 rounded-lg',
          trigger: 'px-3',
        }"
      />
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="内容加载失败"
      :description="error.message"
      class="mb-4"
    />

    <div
      v-else-if="pending || !resume"
      class="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-800"
    >
      <!-- Header Skeleton -->
      <div
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
        <div
          class="space-y-4 text-center self-start md:text-left order-2 w-full"
        >
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

    <div
      v-else
      ref="pageRootRef"
      class="bg-white dark:bg-gray-900 rounded-xl shadow-xl print:shadow-none print:rounded-none px-4 py-8 sm:p-8 print:p-0 print:py-4 border border-gray-200 dark:border-gray-800 print:border-none relative"
    >
      <!-- Loading Overlay -->
      <div
        v-if="!isLayoutReady"
        class="absolute inset-0 z-20 bg-white dark:bg-gray-900 rounded-xl p-8 print:hidden overflow-hidden"
      >
        <!-- Header Skeleton -->
        <div
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
          <div
            class="space-y-4 text-center self-start md:text-left order-2 w-full"
          >
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

      <!-- Header -->
      <header
        class="border-b border-gray-200 dark:border-gray-700 pb-8 mb-8 grid grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto] print:grid-cols-[1fr_auto] gap-2 sm:gap-6 items-stretch print:pb-2 print:mb-4 print:gap-y-2"
      >
        <!-- Avatar -->
        <div
          class="flex justify-start print:justify-end order-1 print:order-2 print:row-span-2 min-h-0"
        >
          <div
            ref="avatarRef"
            class="relative bg-gray-50 dark:bg-gray-800/50 rounded-full border border-gray-200 dark:border-gray-700 p-1 shadow-sm shrink-0 w-(--avatar-size) h-(--avatar-size) max-w-32 max-h-32 md:max-w-60 md:max-h-60 print:w-auto! print:h-full! print:max-w-none print:max-h-none aspect-square"
          >
            <img
              :src="avatarSrc"
              alt="Avatar"
              @error="handleAvatarError"
              class="rounded-full object-cover w-0 min-w-full h-full"
            />
          </div>
        </div>

        <!-- Main Info -->
        <div
          ref="headerInfoRef"
          class="space-y-4 text-left self-start print:text-left order-2 print:order-1"
        >
          <div class="m-0 sm:mb-2">
            <h1
              class="text-4xl font-bold text-gray-900 dark:text-white mb-2 print:mt-4"
            >
              {{ resumeView.name }}
            </h1>
            <p class="text-lg text-gray-500 dark:text-gray-400">
              {{ resumeView.subtitle || labels.subtitle }}
            </p>
          </div>
          <div
            v-if="resumeView.highlights.length"
            class="hidden sm:flex print:flex flex-wrap gap-2 justify-start print:justify-start"
          >
            <template
              v-for="tag in resumeView.highlights"
              :key="badgeText(tag) + (tag.kind === 'svg' ? tag.url : '')"
            >
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
        </div>

        <!-- Mobile Highlights (Separate Row) -->
        <div
          v-if="resumeView.highlights.length"
          class="col-span-2 flex sm:hidden! print:hidden flex-wrap gap-2 justify-start order-3"
        >
          <template
            v-for="tag in resumeView.highlights"
            :key="
              'mobile-' + badgeText(tag) + (tag.kind === 'svg' ? tag.url : '')
            "
          >
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
              <span>{{ resumeView.nationality }}</span>
            </div>
            <div
              class="flex items-center justify-start lg:justify-end print:justify-start gap-2 text-gray-600 dark:text-gray-300"
            >
              <UIcon
                name="i-heroicons-envelope"
                class="w-5 h-5 text-gray-400"
              />
              <a
                :href="`mailto:${resumeView.email}`"
                class="hover:text-primary"
              >
                {{ resumeView.email }}
              </a>
            </div>
          </div>

          <!-- Homepages (Web Only) -->
          <div
            class="flex flex-wrap justify-start md:justify-end print:hidden gap-2 mt-0 lg:mt-1"
          >
            <UButton
              v-for="link in resumeView.homepages"
              :key="link.url"
              :to="link.url"
              target="_blank"
              size="xs"
              color="neutral"
              variant="soft"
            >
              <template #leading>
                <UIcon
                  :name="link.icon || 'i-heroicons-link'"
                  class="w-4 h-4"
                />
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
            v-for="link in resumeView.homepages"
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
      </header>

      <!-- Main Content -->
      <div class="relative min-h-[500px]">
        <div
          v-if="!isLayoutReady"
          class="grid grid-cols-1 md:grid-cols-2 gap-6 absolute inset-0 z-10 bg-white dark:bg-gray-900 overflow-hidden"
        >
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
        <div
          ref="waterfallContainer"
          class="waterfall-grid gap-x-6"
          :class="{
            'opacity-0 absolute top-0 left-0 w-full -z-10': !isLayoutReady,
          }"
        >
          <!-- Profile (Fixed Left) -->
          <section
            class="break-inside-avoid waterfall-item col-span-1 md:col-start-1 print:col-span-6 print:col-start-1"
          >
            <SectionHeader
              :title="labels.profile"
              icon="i-heroicons-user"
              :icon-class="sectionSettings.profile.icon"
              :theme-color="
                resolveHexColor(resumeView.colors?.profile || 'primary')
              "
            />
            <Markdown
              :source="resumeView.summary"
              tag="div"
              class="text-gray-600 dark:text-gray-300 leading-relaxed"
            />
          </section>

          <!-- Education (Fixed Left) -->
          <section
            class="break-inside-avoid waterfall-item col-span-1 md:col-start-1 print:col-span-6 print:col-start-auto"
          >
            <SectionHeader
              :title="labels.education"
              icon="i-heroicons-academic-cap"
              :icon-class="sectionSettings.education.icon"
              :theme-color="
                resolveHexColor(resumeView.colors?.education || 'primary')
              "
            />
            <div class="space-y-6 print:space-y-4">
              <div
                v-for="edu in resumeView.education"
                :key="edu.school"
                class="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700"
              >
                <div
                  class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white dark:ring-gray-900"
                  :class="sectionSettings.education.bg"
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
                    <Markdown
                      :source="scholarship"
                      tag="span"
                      unwrap="p"
                    />
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- GitHub Activity Stats (Fixed Left) -->
          <section
            v-if="resumeView.github"
            class="break-inside-avoid waterfall-item col-span-1 md:col-start-1 print:col-span-6 print:col-start-auto"
          >
            <SectionHeader
              :title="labels.github"
              icon="i-iconoir-github"
              :icon-class="sectionSettings.github.icon"
              :theme-color="resolveHexColor(resumeView.colors?.github || 'sky')"
            />
            <div class="space-y-6 print:space-y-4">
              <div
                class="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700"
              >
                <div
                  class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white dark:ring-gray-900"
                  :class="sectionSettings.github.bg"
                ></div>
                <h3 class="font-bold text-gray-900 dark:text-white">
                  GitHub Stats
                </h3>
                <div class="text-sm text-gray-500 mb-2">
                  @{{ resumeView.github.user }}
                </div>
                <ul
                  class="space-y-1 text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  <li class="flex items-start gap-2">
                    <UIcon
                      name="i-heroicons-star"
                      class="w-4 h-4 mt-0.5 shrink-0"
                      :class="sectionSettings.github.text"
                    />
                    {{ labels.stars }}: {{ githubStats?.stars || 0 }}
                  </li>
                  <li class="flex items-start gap-2">
                    <UIcon
                      name="i-octicon-git-commit-16"
                      class="w-4 h-4 mt-0.5 shrink-0"
                      :class="sectionSettings.github.text"
                    />
                    {{ labels.contributions }}:
                    {{ githubStats?.totalContributions || 0 }}
                  </li>
                  <li class="flex items-start gap-2">
                    <UIcon
                      name="i-octicon-git-pull-request-16"
                      class="w-4 h-4 mt-0.5 shrink-0"
                      :class="sectionSettings.github.text"
                    />
                    {{ labels.prs }}: {{ githubStats?.prs || 0 }}
                  </li>
                  <li class="flex items-start gap-2">
                    <UIcon
                      name="i-octicon-issue-opened-16"
                      class="w-4 h-4 mt-0.5 shrink-0"
                      :class="sectionSettings.github.text"
                    />
                    {{ labels.issues }}: {{ githubStats?.issues || 0 }}
                  </li>
                  <li class="flex items-start gap-2">
                    <UIcon
                      name="i-octicon-repo-16"
                      class="w-4 h-4 mt-0.5 shrink-0"
                      :class="sectionSettings.github.text"
                    />
                    {{ labels.repositories }}: {{ githubStats?.repoCount || 0 }}
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- GitHub Activity Heatmap (Fixed Left, Full Width in Print) -->
          <section
            v-if="resumeView.github"
            class="break-inside-avoid waterfall-item col-span-1 md:col-start-1 print:col-span-12 print:col-start-1 print:-mt-4"
            style="--print-col-span: 12"
          >
            <div
              class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2 border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <img
                :src="`https://ghchart.rshah.org/${resolveHexColor(
                  resumeView.colors?.github || 'sky'
                ).replace('#', '')}/${resumeView.github.user}`"
                alt="GitHub Contribution Graph"
                class="w-full dark:invert dark:hue-rotate-180"
              />
            </div>
          </section>

          <!-- Awards (Fixed Right) -->
          <section
            id="awards-section"
            class="break-inside-avoid group/section waterfall-item col-span-1 md:col-start-2 print:col-start-auto relative"
            :class="{ 'z-50': isAwardsHovered }"
            :style="{ '--print-col-span': awardsPrintSpan }"
            @mouseenter="isAwardsHovered = true"
            @mouseleave="isAwardsHovered = false"
          >
            <SectionHeader
              :title="labels.awards"
              icon="i-heroicons-trophy"
              :icon-class="sectionSettings.awards.icon"
              :theme-color="
                resolveHexColor(resumeView.colors?.awards || 'yellow')
              "
            >
              <template #trailing>
                <span
                  class="text-xs font-normal text-gray-400 ml-auto opacity-100 group-hover/section:opacity-0 transition-opacity print:hidden"
                >
                  {{ labels.expand }}
                </span>
              </template>
            </SectionHeader>
            <div class="space-y-4">
              <div
                v-for="(group, gIndex) in groupedAwards"
                :key="gIndex"
                class="relative"
              >
                <!-- Main Award -->
                <div
                  class="relative z-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm overflow-hidden group"
                >
                  <!-- Decoration -->
                  <div
                    class="absolute -right-4 -top-4 opacity-[0.03] dark:opacity-[0.05] transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none"
                  >
                    <UIcon name="i-heroicons-trophy" class="w-20 h-20" />
                  </div>
                  <div
                    class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    :class="sectionSettings.awards.bg"
                  ></div>

                  <div class="relative z-10 flex items-center gap-3">
                    <UIcon
                      name="i-heroicons-star"
                      class="w-5 h-5 shrink-0"
                      :class="sectionSettings.awards.icon"
                    />
                    <div class="min-w-0 flex-1">
                      <Markdown
                        :source="group.main.title"
                        tag="div"
                        unwrap="p"
                        class="font-bold text-gray-900 dark:text-white text-sm wrap-break-word"
                      />
                      <div class="text-xs text-gray-500 mt-0.5">
                        {{ group.main.date }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sub Awards (Stacked) -->
                <div
                  v-for="(sub, sIndex) in group.subs"
                  :key="sub.title"
                  class="relative bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-sm transition-all duration-500 ease-out origin-top group/card hover:mt-2! hover:shadow-md overflow-hidden"
                  @mouseenter="hoveredCardTitle = sub.title"
                  @mouseleave="hoveredCardTitle = null"
                  :style="{
                    marginTop: isAwardsHovered ? '-8px' : '-48px',
                    zIndex: 5 - sIndex,
                    transform: isAwardsHovered
                      ? `scale(${1 - (sIndex + 1) * 0.01})`
                      : `scale(${1 - (sIndex + 1) * 0.04})`,
                    opacity: 1,
                  }"
                  :class="{
                    'print:-mt-2! print:opacity-100! print:scale-100!': true,
                  }"
                >
                  <div
                    class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-50"
                    :class="sectionSettings.awards.bg"
                  ></div>
                  <div class="relative z-10 flex items-center gap-3 pl-2">
                    <UIcon
                      name="i-heroicons-star"
                      class="text-gray-300 w-4 h-4 shrink-0 group-hover/card:text-yellow-500 transition-colors"
                    />
                    <div class="min-w-0 flex-1">
                      <div
                        class="transition-[max-height] duration-500 ease-out overflow-hidden"
                        :class="isAwardsHovered ? 'max-h-24' : 'max-h-5'"
                      >
                        <Markdown
                          :source="sub.title"
                          tag="div"
                          unwrap="p"
                          class="font-bold text-gray-700 dark:text-gray-200 text-sm group-hover/card:text-gray-900 dark:group-hover/card:text-white pr-2 wrap-break-word"
                          :class="{
                            'line-clamp-1': !isAwardsHovered,
                          }"
                        />
                      </div>
                      <div
                        class="grid transition-[grid-template-rows] duration-300 ease-out"
                        :class="
                          !isAwardsHovered || isCardHovered(sub.title)
                            ? 'grid-rows-[1fr]'
                            : 'grid-rows-[0fr]'
                        "
                      >
                        <div class="overflow-hidden">
                          <div
                            class="text-xs text-gray-500 mt-0.5 transition-opacity duration-300 print:hidden"
                            :class="{
                              'opacity-0':
                                isAwardsHovered && !isCardHovered(sub.title),
                              'opacity-100':
                                !isAwardsHovered || isCardHovered(sub.title),
                            }"
                          >
                            {{ sub.date }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Projects -->
          <div
            v-for="(item, index) in processedProjects"
            :key="item.name"
            class="waterfall-item break-inside-avoid"
            :style="{ '--print-col-span': item.printColSpan }"
          >
            <SectionHeader
              v-if="index === 0"
              :title="labels.projects"
              icon="i-heroicons-code-bracket-square"
              :icon-class="sectionSettings.projects.icon"
              :theme-color="
                resolveHexColor(resumeView.colors?.projects || 'primary')
              "
            />

            <div
              class="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <!-- Decoration -->
              <div
                class="absolute -right-6 -top-6 opacity-[0.03] dark:opacity-[0.05] transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none"
              >
                <UIcon name="i-heroicons-command-line" class="w-40 h-40" />
              </div>
              <div
                class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                :class="sectionSettings.projects.bg"
              ></div>

              <div class="relative z-10 flex flex-col gap-3">
                <div class="flex justify-between items-start gap-2">
                  <div class="flex flex-col gap-1">
                    <h3
                      class="font-bold text-lg text-gray-900 dark:text-white flex flex-col gap-1"
                    >
                      <span>{{ item.name }}</span>
                      <div
                        v-if="item.highlights?.length"
                        class="flex flex-wrap gap-1.5"
                      >
                        <template
                          v-for="tag in item.highlights"
                          :key="
                            badgeText(tag) + (tag.kind === 'svg' ? tag.url : '')
                          "
                        >
                          <span v-if="tag.kind === 'svg'" class="inline-flex">
                            <img
                              :src="tag.url"
                              :alt="tag.alt ?? 'badge'"
                              class="h-5"
                            />
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
                                <UIcon
                                  :name="getBadgeIcon(tag)!"
                                  class="w-3 h-3"
                                />
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
                              <UIcon
                                :name="getBadgeIcon(tag)!"
                                class="w-3 h-3"
                              />
                            </template>
                            {{ tag.label }}
                          </span>
                        </template>
                      </div>
                    </h3>
                  </div>
                  <div class="flex gap-1 shrink-0 print:hidden">
                    <UButton
                      v-for="link in item.links"
                      :key="link.url"
                      :to="link.url"
                      target="_blank"
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon="i-heroicons-arrow-top-right-on-square"
                    />
                  </div>
                </div>
                <div
                  v-if="item.links?.length"
                  class="hidden print:block text-xs text-gray-500 mb-1"
                >
                  <div v-for="link in item.links" :key="link.url">
                    {{ link.url }}
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
                  <div
                    class="pt-2 border-t border-gray-200 dark:border-gray-700/50"
                  >
                    <div
                      class="text-sm text-gray-500 flex flex-wrap gap-x-3 mb-2"
                    >
                      <span class="font-medium text-primary">{{
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
            </div>
          </div>

          <!-- Games -->
          <div
            v-for="(group, index) in chunkedGames"
            :key="index"
            class="waterfall-item break-inside-avoid"
          >
            <SectionHeader
              v-if="index === 0"
              :title="labels.games"
              icon="i-heroicons-puzzle-piece"
              :icon-class="sectionSettings.games.icon"
              :theme-color="resolveHexColor(resumeView.colors?.games || 'purple')"
            />

            <div class="grid grid-cols-1 gap-(--masonry-gap) print:gap-4">
              <div
                v-for="game in group"
                :key="game.name"
                class="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <!-- Decoration -->
                <div
                  class="absolute -right-4 -top-4 opacity-[0.03] dark:opacity-[0.05] transform -rotate-12 group-hover:rotate-0 transition-transform duration-500 pointer-events-none"
                >
                  <UIcon name="i-heroicons-puzzle-piece" class="w-24 h-24" />
                </div>
                <div
                  class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  :class="sectionSettings.games.bg"
                ></div>

                <div class="relative z-10">
                  <div class="flex justify-between items-start mb-1">
                    <span
                      class="font-bold text-gray-900 dark:text-white text-sm"
                      >{{ game.name }}</span
                    >
                  </div>
                  <div class="text-xs text-gray-500 mb-2">
                    <Markdown
                      :source="game.detail"
                      tag="span"
                      unwrap="p"
                    />
                  </div>
                  <div
                    v-if="game.notes"
                    class="text-xs text-gray-600 dark:text-gray-300 italic"
                  >
                    "<Markdown
                      :source="game.notes"
                      tag="span"
                      unwrap="p"
                    />"
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Languages -->
          <section
            class="break-inside-avoid waterfall-item col-span-1 print:col-span-6"
          >
            <SectionHeader
              :title="labels.languages"
              icon="i-heroicons-language"
              :icon-class="sectionSettings.languages.icon"
              :theme-color="
                resolveHexColor(resumeView.colors?.languages || 'emerald')
              "
            />
            <div class="grid grid-cols-1 gap-3">
              <div
                v-for="lang in resumeView.languages"
                :key="lang.name"
                class="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-all overflow-hidden"
              >
                <div
                  class="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] transform rotate-12 group-hover:scale-110 transition-transform pointer-events-none"
                >
                  <UIcon
                    name="i-heroicons-chat-bubble-left-right"
                    class="w-20 h-20"
                  />
                </div>
                <div
                  class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  :class="sectionSettings.languages.bg"
                ></div>
                <div class="relative z-10">
                  <div class="font-bold text-gray-900 dark:text-white">
                    {{ lang.name }}
                  </div>
                  <div
                    v-if="lang.certificate"
                    class="text-xs text-gray-500 mt-0.5"
                  >
                    {{ lang.certificate }}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer
      v-if="resumeView.footer"
      class="mt-16 border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-sm text-gray-500 dark:text-gray-400 print:mt-8 print:pt-4 print:border-t-2"
    >
      <!-- Print View: Online URL & GitHub -->
      <div class="hidden print:flex flex-col gap-1 items-center text-xs">
        <p>
          {{ locale === "zh" ? "在线查看" : "View Online" }}:
          <span class="font-mono">{{ resumeView.footer.onlineUrl }}</span>
        </p>
        <p>
          GitHub:
          <span class="font-mono">
            https://github.com/jiwangyihao/HSResume
          </span>
        </p>
      </div>

      <!-- Screen View: Copyright, ICP, PSB -->
      <div class="print:hidden flex flex-col gap-4 items-center">
        <!-- Copyright & Powered By -->
        <div class="flex flex-col items-center gap-1">
          <div class="text-center">
            <Markdown
              :source="resumeView.footer.copyright"
              tag="span"
              unwrap="p"
            />
          </div>
          <p class="text-xs text-gray-400">
            Powered by
            <a
              href="https://github.com/jiwangyihao/HSResume"
              target="_blank"
              class="hover:text-primary hover:underline"
              >HSResume</a
            >
          </p>

          <p
            v-if="buildTime || buildSha"
            class="text-[10px] text-gray-400/70 dark:text-gray-500/70 opacity-70 select-none"
          >
            <span class="font-mono">
              Built {{ buildTime
              }}<template v-if="buildSha">
                · {{ buildSha.slice(0, 7) }}
              </template>
            </span>
          </p>
        </div>

        <!-- ICP & PSB -->
        <div class="flex flex-col items-center gap-2 text-xs">
          <a
            v-if="resumeView.footer.icp"
            :href="resumeView.footer.icp.link"
            target="_blank"
            class="text-gray-500! dark:text-gray-400! hover:underline underline-offset-2 hover:text-gray-500! dark:hover:text-gray-400!"
          >
            {{ resumeView.footer.icp.text }}
          </a>
          <a
            v-if="resumeView.footer.psb"
            :href="resumeView.footer.psb.link"
            target="_blank"
            class="flex items-center gap-1 text-gray-500! dark:text-gray-400! hover:underline underline-offset-2 hover:text-gray-500! dark:hover:text-gray-400!"
          >
            <img :src="resumeView.footer.psb.icon" alt="PSB" class="w-4 h-4" />
            {{ resumeView.footer.psb.text }}
          </a>
        </div>
      </div>
    </footer>
  </UContainer>
</template>

<style scoped>
.waterfall-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  /* Masonry trick: 1px rows for precision; JS controls spans */
  grid-auto-rows: 1px;
  grid-auto-flow: row dense; /* Help fill gaps */
  /* Keep row-gap at 0 and bake a consistent vertical spacing into spans to avoid
     quantization artifacts when row-gap participates in span math. */
  --masonry-gap: 24px;
  row-gap: 0;
}

.waterfall-item {
  /* Creates a block formatting context to ensure margins are included in offsetHeight */
  display: flow-root;
}

@media (min-width: 768px) {
  .waterfall-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media print {
  @page {
    margin: 3.5rem 1.5rem;
  }

  .waterfall-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: masonry;
    gap: 0rem;
    grid-auto-rows: auto; /* Reset to auto to prevent 1px rows if masonry is not supported */
  }

  .waterfall-item {
    break-inside: avoid;
    margin-bottom: 0;
    grid-row-end: auto !important;
    grid-column: span var(--print-col-span, 6);
    padding: 0.5rem;
  }

  .print\:hidden {
    display: none !important;
  }
  .print\:p-0 {
    padding: 0 !important;
  }
  .print\:shadow-none {
    box-shadow: none !important;
  }
  .print\:rounded-none {
    border-radius: 0 !important;
  }
  .print\:border-none {
    border: none !important;
  }

  /* Ensure background colors print */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
