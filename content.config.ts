import { defineCollection, defineContentConfig } from "@nuxt/content";

// Minimal Nuxt Content configuration.
// We explicitly define the default "content" collection so Nuxt Content
// doesn't fall back to an implicit config (which produces a warning).
//
// This keeps existing calls like `queryCollection('content')` working.
export default defineContentConfig({
  collections: {
    content: defineCollection({
      // Markdown pages under /content/**
      type: "page",
      source: "**/*.md",
    }),
  },
});
