<script setup lang="ts">
import SectionHeader from "../shared/SectionHeader.vue";
import { useGithubStats } from "../../composables/useGithubStats";
import type { ResumeEntry } from "../../types/resume";
import type { ComputedRef } from "vue";

type Props = {
  resume: ResumeEntry;
  title: string;
  iconClass: string;
  dotBgClass: string;
  textClass: string;
  themeColor: string;
  starsLabel: string;
  contributionsLabel: string;
  prsLabel: string;
  issuesLabel: string;
  repositoriesLabel: string;
};

const props = defineProps<Props>();

const resumeView = computed(() => props.resume) as ComputedRef<ResumeEntry>;
const { githubStats } = await useGithubStats(resumeView);

const githubUser = computed(() => props.resume.github?.user ?? "");
const githubColorHex = computed(() => props.themeColor.replace("#", ""));
const heatmapSrc = computed(() => {
  if (!githubUser.value) return "";
  return `https://ghchart.rshah.org/${githubColorHex.value}/${githubUser.value}`;
});
</script>

<template>
  <template v-if="resume.github">
    <!-- GitHub Activity Stats (Fixed Left) -->
    <section
      class="break-inside-avoid waterfall-item col-span-1 md:col-start-1 print:col-span-6 print:col-start-auto"
    >
      <SectionHeader
        :title="title"
        icon="i-iconoir-github"
        :icon-class="iconClass"
        :theme-color="themeColor"
      />
      <div class="space-y-6 print:space-y-4">
        <div class="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700">
          <div
            class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white dark:ring-gray-900"
            :class="dotBgClass"
          ></div>
          <h3 class="font-bold text-gray-900 dark:text-white">GitHub Stats</h3>
          <div class="text-sm text-gray-500 mb-2">@{{ resume.github.user }}</div>
          <ul class="space-y-1 text-sm font-medium text-gray-900 dark:text-gray-100">
            <li class="flex items-start gap-2">
              <UIcon
                name="i-heroicons-star"
                class="w-4 h-4 mt-0.5 shrink-0"
                :class="textClass"
              />
              {{ starsLabel }}: {{ githubStats?.stars || 0 }}
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-octicon-git-commit-16"
                class="w-4 h-4 mt-0.5 shrink-0"
                :class="textClass"
              />
              {{ contributionsLabel }}: {{ githubStats?.totalContributions || 0 }}
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-octicon-git-pull-request-16"
                class="w-4 h-4 mt-0.5 shrink-0"
                :class="textClass"
              />
              {{ prsLabel }}: {{ githubStats?.prs || 0 }}
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-octicon-issue-opened-16"
                class="w-4 h-4 mt-0.5 shrink-0"
                :class="textClass"
              />
              {{ issuesLabel }}: {{ githubStats?.issues || 0 }}
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-octicon-repo-16"
                class="w-4 h-4 mt-0.5 shrink-0"
                :class="textClass"
              />
              {{ repositoriesLabel }}: {{ githubStats?.repoCount || 0 }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- GitHub Activity Heatmap (Fixed Left, Full Width in Print) -->
    <section
      class="break-inside-avoid waterfall-item col-span-1 md:col-start-1 print:col-span-12 print:col-start-1 print:-mt-4"
      style="--print-col-span: 12"
    >
      <div
        class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2 border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <img
          v-if="heatmapSrc"
          :src="heatmapSrc"
          alt="GitHub Contribution Graph"
          class="w-full dark:invert dark:hue-rotate-180"
        />
      </div>
    </section>
  </template>
</template>
