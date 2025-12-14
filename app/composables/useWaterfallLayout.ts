import type { Ref } from "vue";

type UseWaterfallLayoutOptions = {
  locale: Ref<unknown>;
  /** Content is ready for the current locale (e.g. resume matches active locale) */
  ready: Ref<boolean>;
  /** useAsyncData 的 data ref（truthy 表示内容已就绪） */
  resume: Ref<unknown | null | undefined>;
};

export const useWaterfallLayout = (options: UseWaterfallLayoutOptions) => {
  const waterfallContainer = ref<HTMLElement | null>(null);
  const isLayoutReady = ref(false);

  const pageRootRef = ref<HTMLElement | null>(null);
  const avatarRef = ref<HTMLElement | null>(null);
  const headerInfoRef = ref<HTMLElement | null>(null);

  const updateAvatarSize = () => {
    if (!avatarRef.value || !headerInfoRef.value) return;

    const height = headerInfoRef.value.offsetHeight;
    // Set width to match height (square aspect ratio) using CSS variable
    avatarRef.value.style.setProperty("--avatar-size", `${height}px`);
  };

  let observer: ResizeObserver | null = null;
  let headerObserver: ResizeObserver | null = null;

  const nextFrame = () =>
    new Promise<void>((resolve) => {
      if (typeof window === "undefined") return resolve();
      window.requestAnimationFrame(() => resolve());
    });

  const waitForImages = async (root: HTMLElement, timeoutMs = 2500) => {
    if (typeof window === "undefined") return;
    const images = (
      Array.from(root.querySelectorAll("img")) as HTMLImageElement[]
    ).filter((img) => {
      // If an image is layout-stable (reserved intrinsic size), it won't affect measurement.
      // Skipping them avoids waiting for lazy/low-priority images and reduces first-paint delays.
      const stableAttr = img.getAttribute("data-layout-stable");
      if (stableAttr === "1" || stableAttr === "true") return false;

      const w = img.getAttribute("width");
      const h = img.getAttribute("height");
      if (w && h && Number(w) > 0 && Number(h) > 0) return false;

      return true;
    });
    if (!images.length) return;

    const waitOne = (img: HTMLImageElement) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
    };

    await Promise.race([
      Promise.all(images.map(waitOne)).then(() => undefined),
      new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  };

  const updateWaterfall = () => {
    if (typeof window === "undefined") return;
    if (!waterfallContainer.value) return;

    const container = waterfallContainer.value;
    const items = Array.from(
      container.querySelectorAll(":scope > .waterfall-item")
    ) as HTMLElement[];
    const awardsSection = container.querySelector(
      "#awards-section"
    ) as HTMLElement | null;

    // Read current CSS-driven masonry parameters (we'll restore after measuring)
    const computed = window.getComputedStyle(container);
    const rowHeight = Number.parseFloat(computed.gridAutoRows || "1") || 1;
    const masonryGap =
      Number.parseFloat(computed.getPropertyValue("--masonry-gap") || "0") || 0;

    // 1. Relax container to allow natural height measurement
    container.style.gridAutoRows = "auto";
    container.style.alignItems = "start";

    // Unlock awards section height for accurate measurement
    if (awardsSection) {
      awardsSection.style.height = "";
    }

    // 2. Reset item spans to let them flow naturally
    items.forEach((el) => {
      el.style.gridRowEnd = "auto";
    });

    // 3. Measure
    const spans = items.map((el) => {
      const height = el.getBoundingClientRect().height;

      // Masonry trick:
      // We keep row-gap=0 to avoid extra quantization artifacts, and instead bake
      // a consistent vertical spacing into the span itself.
      const denom = Math.max(1, rowHeight);
      const span = Math.ceil((height + masonryGap) / denom);
      return Math.max(1, span);
    });

    // Lock awards section height to prevent layout shift on hover
    if (awardsSection) {
      awardsSection.style.height = `${awardsSection.offsetHeight}px`;
    }

    // 4. Restore container constraint
    container.style.removeProperty("grid-auto-rows");
    container.style.removeProperty("align-items");

    // 5. Apply spans
    items.forEach((el, i) => {
      el.style.gridRowEnd = `span ${spans[i]}`;
    });
  };

  const setupObserver = () => {
    if (typeof window === "undefined") return;
    if (!waterfallContainer.value || !observer) return;

    const obs = observer;
    obs.observe(waterfallContainer.value);
    Array.from(waterfallContainer.value.children).forEach((child) => {
      obs.observe(child);
    });
  };

  let layoutJobId = 0;
  const recalcLayout = async () => {
    if (typeof window === "undefined") return;
    const job = ++layoutJobId;
    isLayoutReady.value = false;

    // Wait until the actual content DOM (and refs) exists.
    // This avoids the first-load case where resume data is already present
    // but the watcher doesn't fire and refs are not yet bound.
    for (let i = 0; i < 30; i++) {
      await nextTick();
      if (pageRootRef.value && waterfallContainer.value) break;
      await nextFrame();
    }

    const root = pageRootRef.value;
    const container = waterfallContainer.value;
    if (!root || !container) {
      // Nothing to measure; don't block the UI forever.
      if (job === layoutJobId) isLayoutReady.value = true;
      return;
    }

    // Wait for DOM patch
    await nextTick();

    // Wait for fonts + a couple of paints (avoids measuring before text metrics settle)
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        // ignore
      }
    }
    await nextFrame();
    await nextFrame();

    // Let avatar/header sizing settle
    let lastHeaderH = -1;
    let stableCount = 0;
    for (let i = 0; i < 20; i++) {
      if (job !== layoutJobId) return;
      updateAvatarSize();
      await nextFrame();
      const h = headerInfoRef.value?.offsetHeight ?? -1;
      if (h === lastHeaderH && h > 0) stableCount++;
      else stableCount = 0;
      lastHeaderH = h;
      if (stableCount >= 2) break;
    }

    // Wait for images that affect layout
    await waitForImages(root);
    await nextFrame();

    if (job !== layoutJobId) return;
    updateWaterfall();
    updateAvatarSize();
    setupObserver();

    // One more pass after a paint
    await nextFrame();
    if (job !== layoutJobId) return;
    updateWaterfall();
    updateAvatarSize();

    // Final paint before revealing
    await nextFrame();
    if (job !== layoutJobId) return;
    isLayoutReady.value = true;
  };

  // Locale switching can temporarily show stale content while new payload is loading.
  // Reset immediately so the loading overlay stays until we measure the new DOM.
  watch(
    () => options.locale.value,
    () => {
      layoutJobId++;
      isLayoutReady.value = false;
    },
    { flush: "sync" }
  );

  onMounted(() => {
    if (typeof window === "undefined") return;

    // ResizeObserver for robustness
    if ("ResizeObserver" in window) {
      observer = new ResizeObserver(() => {
        window.requestAnimationFrame(updateWaterfall);
      });

      headerObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(updateAvatarSize);
      });

      setupObserver();
      if (headerInfoRef.value && headerObserver) {
        headerObserver.observe(headerInfoRef.value);
      }
    }

    window.addEventListener("resize", updateAvatarSize);

    // First load: if resume payload is already hydrated, the watcher may not fire.
    if (options.ready.value && options.resume.value) {
      recalcLayout();
    }
  });

  onBeforeUnmount(() => {
    if (typeof window === "undefined") return;
    window.removeEventListener("resize", updateAvatarSize);
    observer?.disconnect();
    headerObserver?.disconnect();
    observer = null;
    headerObserver = null;
  });

  // Watch for data/locale changes and measure AFTER the DOM updates.
  watch(
    [() => options.locale.value, options.ready, options.resume],
    () => {
      // Only measure once the new locale content is actually ready.
      if (!options.ready.value || !options.resume.value) return;
      recalcLayout();
    },
    { flush: "post", immediate: true }
  );

  return {
    waterfallContainer,
    isLayoutReady,
    pageRootRef,
    avatarRef,
    headerInfoRef,
    recalcLayout,
  };
};
