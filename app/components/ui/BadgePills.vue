<script setup lang="ts">
import type { Badge } from "~/types/resume";

type BadgeManifest = Record<string, string>;
type BadgeSizes = Record<string, { w: number; h: number }>;

// Dev behavior:
// - Default to cached local badges (so caching issues are visible during dev)
// - When HMR happens, refresh manifest/sizes and only for the *changed* badges,
//   fall back to remote URLs without width/height
// - If a cached badge fails to load, fall back to remote for that badge
const enableCachedBadges = true;

const devRemoteFallback = useState<Record<string, true>>(
  "badge-dev-remote-fallback",
  () => ({})
);

const badgeManifest = useState<BadgeManifest>("badge-manifest", () => ({}));
const badgeSizes = useState<BadgeSizes>("badge-sizes", () => ({}));

const loadBadgeManifest = async (opts?: {
  force?: boolean;
}): Promise<BadgeManifest> => {
  // Already loaded (SSR payload or previous client navigation)
  if (
    !opts?.force &&
    badgeManifest.value &&
    Object.keys(badgeManifest.value).length > 0
  ) {
    return badgeManifest.value;
  }

  try {
    if (import.meta.server) {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const p = path.join(process.cwd(), "public", "badges", "manifest.json");
      if (!fs.existsSync(p)) return badgeManifest.value;
      const parsed = JSON.parse(fs.readFileSync(p, "utf8")) as BadgeManifest;
      badgeManifest.value = parsed && typeof parsed === "object" ? parsed : {};
      return badgeManifest.value;
    }

    const parsed = await $fetch<BadgeManifest>("/badges/manifest.json", {
      query: import.meta.dev ? { t: Date.now() } : undefined,
    });
    badgeManifest.value = parsed && typeof parsed === "object" ? parsed : {};
    return badgeManifest.value;
  } catch {
    return badgeManifest.value;
  }
};

const loadBadgeSizes = async (opts?: {
  force?: boolean;
}): Promise<BadgeSizes> => {
  if (
    !opts?.force &&
    badgeSizes.value &&
    Object.keys(badgeSizes.value).length > 0
  ) {
    return badgeSizes.value;
  }

  try {
    if (import.meta.server) {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const p = path.join(process.cwd(), "public", "badges", "sizes.json");
      if (!fs.existsSync(p)) return badgeSizes.value;
      const parsed = JSON.parse(fs.readFileSync(p, "utf8")) as BadgeSizes;
      badgeSizes.value = parsed && typeof parsed === "object" ? parsed : {};
      return badgeSizes.value;
    }

    const parsed = await $fetch<BadgeSizes>("/badges/sizes.json", {
      query: import.meta.dev ? { t: Date.now() } : undefined,
    });
    badgeSizes.value = parsed && typeof parsed === "object" ? parsed : {};
    return badgeSizes.value;
  } catch {
    return badgeSizes.value;
  }
};

// Ensure manifest is available early for SSR and first paint.
if (import.meta.server && enableCachedBadges) {
  await loadBadgeManifest();
  await loadBadgeSizes();
} else {
  // Fire-and-forget: SSR payload usually already has it; this is a fallback.
  if (enableCachedBadges) {
    loadBadgeManifest();
    loadBadgeSizes();
  }
}

const shouldUseRemoteSvgBadge = (url: string) => {
  if (!import.meta.dev) return false;
  return devRemoteFallback.value?.[url] === true;
};

const isCachedSvgBadge = (url: string) => {
  const mapped = badgeManifest.value?.[url];
  return typeof mapped === "string" && mapped.startsWith("/badges/");
};

const resolveSvgBadgeUrl = (url: string) => {
  if (!enableCachedBadges) return url;
  if (shouldUseRemoteSvgBadge(url)) return url;

  const mapped = badgeManifest.value?.[url];
  if (typeof mapped !== "string") return url;
  return mapped;
};

const resolveSvgBadgeSize = (url: string) => {
  if (!enableCachedBadges) return null;
  if (shouldUseRemoteSvgBadge(url)) return null;
  if (!isCachedSvgBadge(url)) return null;

  const s = badgeSizes.value?.[url];
  // Fallback prevents "width=0" during first layout, which can cause line-wrap changes.
  return s && s.w > 0 && s.h > 0 ? s : { w: 80, h: 20 };
};

const onSvgBadgeError = (url: string) => {
  if (!import.meta.dev) return;
  devRemoteFallback.value = { ...devRemoteFallback.value, [url]: true };
};

// Dev: when content changes and introduces a new/edited svg badge URL, do NOT try to
// update the build cache. Instead, force just that badge to use the original remote URL
// (and avoid default width/height).
const props = withDefaults(
  defineProps<{
    tags?: Badge[];
    /** Optional prefix to avoid key collisions across multiple lists */
    keyPrefix?: string;
  }>(),
  {
    tags: () => [],
    keyPrefix: "",
  }
);

const currentSvgUrls = computed(() =>
  (props.tags ?? [])
    .filter((t) => t && t.kind === "svg" && typeof t.url === "string")
    .map((t) => (t as Badge & { url: string }).url)
);

watch(
  currentSvgUrls,
  (next, prev) => {
    if (!import.meta.dev) return;

    // Only treat URLs as "changed" when the *props* change after an edit/HMR.
    // This avoids incorrectly forcing remote on initial mount.
    if (!prev || prev.length === 0) return;

    const prevSet = new Set(prev);
    const remote = { ...devRemoteFallback.value };
    for (const url of next) {
      if (!prevSet.has(url)) {
        remote[url] = true;
      }
    }
    devRemoteFallback.value = remote;
  },
  { immediate: true }
);

const badgeBgClass = (badge: Badge) => {
  switch (badge.category) {
    case "award":
      return "bg-yellow-600";
    case "metric":
      return "bg-emerald-600";
    case "traffic":
      return "bg-sky-600";
    case "event":
      return "bg-orange-600";
    case "tech":
      return "bg-indigo-600";
    case "business":
      return "bg-purple-600";
    case "platform":
      return "bg-teal-600";
    default:
      return "bg-gray-600";
  }
};

const badgeBorderClass = (badge: Badge) => {
  switch (badge.category) {
    case "award":
      return "border-yellow-600";
    case "metric":
      return "border-emerald-600";
    case "traffic":
      return "border-sky-600";
    case "event":
      return "border-orange-600";
    case "tech":
      return "border-indigo-600";
    case "business":
      return "border-purple-600";
    case "platform":
      return "border-teal-600";
    default:
      return "border-gray-600";
  }
};

const badgeText = (badge: Badge) => {
  if (badge.kind === "svg") return badge.alt ?? badge.url;
  if (badge.kind === "split") return `${badge.domain}/${badge.value}`;
  return badge.label;
};

const getBadgeIcon = (badge: Badge) => {
  if (badge.icon) return badge.icon;

  switch (badge.category) {
    case "award":
      return "i-heroicons-trophy-solid";
    case "metric":
      return "i-heroicons-chart-bar-solid";
    case "traffic":
      return "i-heroicons-arrow-trending-up-solid";
    case "event":
      return "i-icon-park-solid-online-meeting";
    case "tech":
      return "i-heroicons-cpu-chip-solid";
    case "business":
      return "i-heroicons-briefcase-solid";
    case "platform":
      return "i-heroicons-building-library-solid";
    default:
      return undefined;
  }
};

const tagKey = (tag: Badge) =>
  props.keyPrefix + badgeText(tag) + (tag.kind === "svg" ? tag.url : "");
</script>

<template>
  <div class="contents">
    <template v-for="tag in props.tags" :key="tagKey(tag)">
      <span v-if="tag.kind === 'svg'" class="inline-flex items-center">
        <img
          :src="resolveSvgBadgeUrl(tag.url)"
          :alt="tag.alt ?? 'badge'"
          v-bind="
            enableCachedBadges &&
            isCachedSvgBadge(tag.url) &&
            !shouldUseRemoteSvgBadge(tag.url)
              ? {
                  width: resolveSvgBadgeSize(tag.url)?.w,
                  height: resolveSvgBadgeSize(tag.url)?.h,
                  'data-layout-stable': '1',
                }
              : {}
          "
          class="h-5"
          decoding="async"
          loading="lazy"
          @error="onSvgBadgeError(tag.url)"
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
</template>
