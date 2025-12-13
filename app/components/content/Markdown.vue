<script setup lang="ts">
import { parseMarkdown } from "@nuxtjs/mdc/runtime";

type MDCParsed = Awaited<ReturnType<typeof parseMarkdown>>;

type MDCElementNode = {
  type: "element";
  tag: string;
  children?: unknown[];
};

const props = defineProps<{
  source: string;
  tag?: string;
  unwrap?: string | boolean;
}>();

// Note: this component is used many times on the resume page.
// We intentionally keep it lightweight and reactive.

// Optional page-level barrier (provided by the resume page) to keep skeleton/overlay
// visible until all Markdown nodes finish parsing.
const barrier = useLoadBarrier({ optional: true });

const ast = shallowRef<MDCParsed | null>(null);
let parseJobId = 0;

const parse = async (source: string) => {
  const job = ++parseJobId;
  const end = barrier?.start();

  try {
    const parsed = await parseMarkdown(source);
    if (job !== parseJobId) return;

    // Handle unwrap='p' manually
    if (
      (props.unwrap === "p" || props.unwrap === true) &&
      parsed.body.children.length === 1
    ) {
      const firstChild = parsed.body.children[0];
      const node = firstChild as MDCElementNode | null;
      if (node && node.type === "element" && node.tag === "p") {
        parsed.body.children = (node.children ??
          []) as typeof parsed.body.children;
      }
    }

    ast.value = parsed;
  } catch (e) {
    // Keep the error log safe (Nuxt devtools may stringify it)
    const errMsg =
      e instanceof Error
        ? `${e.name}: ${e.message}`
        : "Unknown MDC parse error";
    console.error(`MDC Parse Error: ${errMsg}`);
    if (job === parseJobId) ast.value = null;
  } finally {
    end?.();
  }
};

// First render (SSR + initial client paint): parse once and await so the content
// is present immediately (no "blank then text" flashes).
if (props.source) {
  await parse(props.source);
}

// Subsequent updates (locale switch): re-parse and let the page overlay cover it.
watch(
  () => props.source,
  (source, prev) => {
    if (source === prev) return;
    ast.value = null;
    if (!source) return;
    parse(source);
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
