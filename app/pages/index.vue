<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";

const {
  buildTime,
  buildSha,
  locale,
  localeItems,
  labels,
  resume,
  pending,
  error,
  resumeView,
  sectionSettings,
  themeColorFor,
  printPage,
} = await useResumePageModel();

useHead({
  title: computed(() => {
    const name = resumeView.value.name;
    return name ? `${name} | ${labels.value.title}` : labels.value.title;
  }),
});

// Provide a page-level load barrier for child components that do async work
// (e.g. Markdown parsing) so we can keep the loading overlay until the DOM
// is truly ready.
const loadBarrier = useLoadBarrier({ provide: true });
watch(
  locale,
  () => {
    // Locale changes invalidate all in-flight child tasks.
    loadBarrier.reset();
  },
  { flush: "sync" }
);

// A locale switch may keep the previous payload while refreshing.
// We only consider content ready when the loaded resume matches the active locale.
const isResumeReady = computed(() => {
  if (pending.value) return false;
  if (!resume.value) return false;
  return resume.value.locale === locale.value;
});

const isSubtreeReady = computed(() => loadBarrier.pendingCount.value === 0);
const isReadyForLayout = computed(
  () => isResumeReady.value && isSubtreeReady.value
);

const AVATAR_SRC_CANDIDATES = [
  "/avatar.png",
  "/avatar.jpg",
  "/avatar.jpeg",
  "/avatar.sample.svg",
] as const;

const avatarSrc = ref<(typeof AVATAR_SRC_CANDIDATES)[number]>(
  AVATAR_SRC_CANDIDATES[0]
);
const handleAvatarError = () => {
  // Fallback for public main branch:
  // allow either avatar.png or avatar.jpg/jpeg, then fall back to sample SVG.
  const currentIndex = AVATAR_SRC_CANDIDATES.indexOf(avatarSrc.value);
  const next = AVATAR_SRC_CANDIDATES[Math.max(0, currentIndex + 1)];
  if (next && avatarSrc.value !== next) avatarSrc.value = next;
};

const {
  waterfallContainer,
  isLayoutReady,
  pageRootRef,
  avatarRef,
  headerInfoRef,
} = useWaterfallLayout({
  locale,
  ready: isReadyForLayout,
  resume,
});

const setAvatarEl = (el: Element | ComponentPublicInstance | null) => {
  avatarRef.value = el instanceof HTMLElement ? el : null;
};

const setHeaderInfoEl = (el: Element | ComponentPublicInstance | null) => {
  headerInfoRef.value = el instanceof HTMLElement ? el : null;
};
</script>

<template>
  <UContainer class="py-8 print:p-0 max-w-7xl">
    <ResumeActionBar
      v-model="locale"
      :locale-items="localeItems"
      :print-label="labels.print"
      @print="printPage"
    />

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
      v-else-if="!isResumeReady"
      class="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-800"
    >
      <ResumeSkeleton />
    </div>

    <div
      v-else
      ref="pageRootRef"
      class="resume-page bg-white dark:bg-gray-900 rounded-xl shadow-xl print:shadow-none print:rounded-none px-4 py-8 sm:p-8 print:p-0 print:py-4 border border-gray-200 dark:border-gray-800 print:border-none relative"
    >
      <div
        v-if="!isSubtreeReady || !isLayoutReady"
        class="absolute inset-0 z-20 bg-white dark:bg-gray-900 rounded-xl p-8 print:hidden overflow-hidden"
      >
        <ResumeSkeleton />
      </div>

      <ResumeHeader
        :resume="resumeView"
        :subtitle-fallback="labels.subtitle"
        :avatar-src="avatarSrc"
        :on-avatar-error="handleAvatarError"
        :set-avatar-el="setAvatarEl"
        :set-header-info-el="setHeaderInfoEl"
      />

      <div class="relative min-h-[500px]">
        <div
          v-if="!isSubtreeReady || !isLayoutReady"
          class="grid grid-cols-1 md:grid-cols-2 gap-6 absolute inset-0 z-10 bg-white dark:bg-gray-900 overflow-hidden"
        >
          <ResumeSkeleton mode="body" />
        </div>
        <div
          ref="waterfallContainer"
          class="waterfall-grid gap-x-6"
          :class="{
            'opacity-0 absolute top-0 left-0 w-full -z-10':
              !isSubtreeReady || !isLayoutReady,
          }"
        >
          <template v-for="section in resumeView.sectionOrder" :key="section">
            <ProfileSection
              v-if="section === 'profile'"
              :resume="resumeView"
              :title="labels.profile"
              :icon-class="sectionSettings.profile.icon"
              :theme-color="themeColorFor('profile', 'primary')"
            />

            <EducationSection
              v-else-if="
                section === 'education' && resumeView.education?.length > 0
              "
              :resume="resumeView"
              :title="labels.education"
              :icon-class="sectionSettings.education.icon"
              :marker-bg-class="sectionSettings.education.bg"
              :theme-color="themeColorFor('education', 'primary')"
            />

            <GithubSection
              v-else-if="section === 'github' && resumeView.github"
              :resume="resumeView"
              :title="labels.github"
              :icon-class="sectionSettings.github.icon"
              :dot-bg-class="sectionSettings.github.bg"
              :text-class="sectionSettings.github.text"
              :theme-color="themeColorFor('github', 'sky')"
              :stars-label="labels.stars"
              :contributions-label="labels.contributions"
              :prs-label="labels.prs"
              :issues-label="labels.issues"
              :repositories-label="labels.repositories"
            />

            <AwardsSection
              v-else-if="section === 'awards' && resumeView.awards?.length > 0"
              :resume="resumeView"
              :title="labels.awards"
              :expand-label="labels.expand"
              :icon-class="sectionSettings.awards.icon"
              :accent-bg-class="sectionSettings.awards.bg"
              :theme-color="themeColorFor('awards', 'yellow')"
            />

            <ProjectsSection
              v-else-if="
                section === 'projects' && resumeView.projects?.length > 0
              "
              :resume="resumeView"
              :title="labels.projects"
              :icon-class="sectionSettings.projects.icon"
              :accent-bg-class="sectionSettings.projects.bg"
              :role-text-class="sectionSettings.projects.text"
              :theme-color="themeColorFor('projects', 'primary')"
            />

            <GamesSection
              v-else-if="section === 'games' && resumeView.games?.length > 0"
              :resume="resumeView"
              :title="labels.games"
              :icon-class="sectionSettings.games.icon"
              :accent-bg-class="sectionSettings.games.bg"
              :theme-color="themeColorFor('games', 'purple')"
            />

            <LanguagesSection
              v-else-if="
                section === 'languages' && resumeView.languages?.length > 0
              "
              :resume="resumeView"
              :title="labels.languages"
              :icon-class="sectionSettings.languages.icon"
              :accent-bg-class="sectionSettings.languages.bg"
              :theme-color="themeColorFor('languages', 'emerald')"
            />
          </template>
        </div>
      </div>
    </div>

    <ResumeFooter
      :resume="resumeView"
      :locale="locale"
      :build-time="buildTime"
      :build-sha="buildSha"
    />
  </UContainer>
</template>
