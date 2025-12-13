<script setup lang="ts">
import { useWaterfallLayout } from "../composables/useWaterfallLayout";
import Markdown from "../components/content/Markdown.vue";
import ResumeHeader from "../components/sections/ResumeHeader.vue";
import EducationSection from "../components/sections/EducationSection.vue";
import ProjectsSection from "../components/sections/ProjectsSection.vue";
import GamesSection from "../components/sections/GamesSection.vue";
import AwardsSection from "../components/sections/AwardsSection.vue";
import GithubSection from "../components/sections/GithubSection.vue";
import SectionHeader from "../components/shared/SectionHeader.vue";
import ResumeSkeleton from "../components/shared/ResumeSkeleton.vue";
import ResumeActionBar from "../components/shared/ResumeActionBar.vue";
import { usePrint } from "../composables/usePrint";
import { useResumeContent } from "../composables/useResumeContent";
import { useResumeLocale } from "../composables/useResumeLocale";
import { useThemeColors } from "../composables/useThemeColors";
import type { ComponentPublicInstance } from "vue";

const runtimeConfig = useRuntimeConfig();
const buildTime = computed(() => runtimeConfig.public.buildTime || "");
const buildSha = computed(() => runtimeConfig.public.gitSha || "");

const { locale, localeItems, labels } = useResumeLocale();
const { resume, pending, error, refresh, resumeView } = await useResumeContent(
  locale
);
const { sectionSettings, resolveHexColor } = useThemeColors(resumeView);
const { printPage } = usePrint();

const avatarSrc = ref("/avatar.png");
const handleAvatarError = () => {
  // Fallback for public main branch: use sample SVG when avatar.png is not present.
  if (avatarSrc.value !== "/avatar.sample.svg")
    avatarSrc.value = "/avatar.sample.svg";
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

const setAvatarEl = (el: Element | ComponentPublicInstance | null) => {
  avatarRef.value = el instanceof HTMLElement ? el : null;
};

const setHeaderInfoEl = (el: Element | ComponentPublicInstance | null) => {
  headerInfoRef.value = el instanceof HTMLElement ? el : null;
};
</script>

<template>
  <UContainer class="py-8 print:p-0 max-w-7xl">
    <!-- Action Bar -->
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
      v-else-if="pending || !resume"
      class="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-800"
    >
      <ResumeSkeleton />
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
        <ResumeSkeleton />
      </div>

      <!-- Header -->
      <ResumeHeader
        :resume="resumeView"
        :subtitle-fallback="labels.subtitle"
        :avatar-src="avatarSrc"
        :on-avatar-error="handleAvatarError"
        :set-avatar-el="setAvatarEl"
        :set-header-info-el="setHeaderInfoEl"
      />

      <!-- Main Content -->
      <div class="relative min-h-[500px]">
        <div
          v-if="!isLayoutReady"
          class="grid grid-cols-1 md:grid-cols-2 gap-6 absolute inset-0 z-10 bg-white dark:bg-gray-900 overflow-hidden"
        >
          <ResumeSkeleton mode="body" />
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
          <EducationSection
            :resume="resumeView"
            :title="labels.education"
            :icon-class="sectionSettings.education.icon"
            :marker-bg-class="sectionSettings.education.bg"
            :theme-color="
              resolveHexColor(resumeView.colors?.education || 'primary')
            "
          />

          <!-- GitHub Activity Stats (Fixed Left) -->
          <GithubSection
            :resume="resumeView"
            :title="labels.github"
            :icon-class="sectionSettings.github.icon"
            :dot-bg-class="sectionSettings.github.bg"
            :text-class="sectionSettings.github.text"
            :theme-color="resolveHexColor(resumeView.colors?.github || 'sky')"
            :stars-label="labels.stars"
            :contributions-label="labels.contributions"
            :prs-label="labels.prs"
            :issues-label="labels.issues"
            :repositories-label="labels.repositories"
          />

          <!-- Awards (Fixed Right) -->
          <AwardsSection
            :resume="resumeView"
            :title="labels.awards"
            :expand-label="labels.expand"
            :icon-class="sectionSettings.awards.icon"
            :accent-bg-class="sectionSettings.awards.bg"
            :theme-color="
              resolveHexColor(resumeView.colors?.awards || 'yellow')
            "
          />

          <!-- Projects -->
          <ProjectsSection
            :resume="resumeView"
            :title="labels.projects"
            :icon-class="sectionSettings.projects.icon"
            :accent-bg-class="sectionSettings.projects.bg"
            :theme-color="
              resolveHexColor(resumeView.colors?.projects || 'primary')
            "
          />

          <!-- Games -->
          <GamesSection
            :resume="resumeView"
            :title="labels.games"
            :icon-class="sectionSettings.games.icon"
            :accent-bg-class="sectionSettings.games.bg"
            :theme-color="resolveHexColor(resumeView.colors?.games || 'purple')"
          />

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
