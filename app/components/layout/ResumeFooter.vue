<script setup lang="ts">
import Markdown from "../content/Markdown.vue";
import type { ResumeEntry } from "../../types/resume";

type Props = {
  resume: ResumeEntry;
  locale: string;
  buildTime: string;
  buildSha: string;
};

defineProps<Props>();
</script>

<template>
  <footer
    v-if="resume.footer"
    class="mt-16 border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-sm text-gray-500 dark:text-gray-400 print:mt-8 print:pt-4 print:border-t-2"
  >
    <!-- Print View: Online URL & GitHub -->
    <div class="hidden print:flex flex-col gap-1 items-center text-xs">
      <p>
        {{ locale === "zh" ? "在线查看" : "View Online" }}:
        <span class="font-mono">{{ resume.footer.onlineUrl }}</span>
      </p>
      <p>
        GitHub:
        <span class="font-mono">https://github.com/jiwangyihao/HSResume</span>
      </p>
    </div>

    <!-- Screen View: Copyright, ICP, PSB -->
    <div class="print:hidden flex flex-col gap-4 items-center">
      <!-- Copyright & Powered By -->
      <div class="flex flex-col items-center gap-1">
        <div class="text-center">
          <Markdown :source="resume.footer.copyright" tag="span" unwrap="p" />
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
            }}<template v-if="buildSha"> · {{ buildSha.slice(0, 7) }}</template>
          </span>
        </p>
      </div>

      <!-- ICP & PSB -->
      <div class="flex flex-col items-center gap-2 text-xs">
        <a
          v-if="resume.footer.icp"
          :href="resume.footer.icp.link"
          target="_blank"
          class="text-gray-500! dark:text-gray-400! hover:underline underline-offset-2 hover:text-gray-500! dark:hover:text-gray-400!"
        >
          {{ resume.footer.icp.text }}
        </a>
        <a
          v-if="resume.footer.psb"
          :href="resume.footer.psb.link"
          target="_blank"
          class="flex items-center gap-1 text-gray-500! dark:text-gray-400! hover:underline underline-offset-2 hover:text-gray-500! dark:hover:text-gray-400!"
        >
          <img :src="resume.footer.psb.icon" alt="PSB" class="w-4 h-4" />
          {{ resume.footer.psb.text }}
        </a>
      </div>
    </div>
  </footer>
</template>
