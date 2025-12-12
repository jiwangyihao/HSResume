<script setup lang="ts">
import { parseMarkdown } from "@nuxtjs/mdc/runtime";

const props = defineProps<{
  source: string;
  tag?: string;
  unwrap?: string | boolean;
}>();

const nuxtApp = useNuxtApp();
const key = useId();

const { data: ast } = await useAsyncData(
  `markdown-${key}`,
  async () => {
    if (!props.source) return null;

    try {
      const parsed = await parseMarkdown(props.source);

      // Handle unwrap='p' manually
      if (
        (props.unwrap === "p" || props.unwrap === true) &&
        parsed.body.children.length === 1
      ) {
        const firstChild = parsed.body.children[0];
        const node = firstChild as any;
        if (node && node.type === "element" && node.tag === "p") {
          parsed.body.children = node.children || [];
        }
      }
      return parsed;
    } catch (e) {
      console.error("MDC Parse Error:", e);
      return null;
    }
  },
  {
    watch: [() => props.source],
  }
);
</script>

<template>
  <component :is="tag || 'div'" class="resume-markdown">
    <MDCRenderer v-if="ast" :body="ast.body" :data="ast.data" />
  </component>
</template>

<style>
@reference "../../assets/css/main.css";

.resume-markdown strong,
.resume-markdown b {
  @apply text-black dark:text-white;
}

.resume-markdown.inline-content p,
.resume-markdown.inline-content div {
  @apply m-0 inline;
}
</style>
