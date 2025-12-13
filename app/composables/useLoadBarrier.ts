import { inject, provide, ref, type InjectionKey, type Ref } from "vue";

export type LoadBarrier = {
  /** Number of in-flight tasks registered by child components */
  pendingCount: Ref<number>;
  /** Register a task; returns a function to mark it completed (idempotent) */
  start: () => () => void;
  /** Reset all pending tasks (useful on locale switches) */
  reset: () => void;
};

const LoadBarrierKey: InjectionKey<LoadBarrier> = Symbol("LoadBarrier");

const createLoadBarrier = (): LoadBarrier => {
  const pendingCount = ref(0);

  const start = () => {
    pendingCount.value++;
    let ended = false;
    return () => {
      if (ended) return;
      ended = true;
      pendingCount.value = Math.max(0, pendingCount.value - 1);
    };
  };

  const reset = () => {
    pendingCount.value = 0;
  };

  return { pendingCount, start, reset };
};

type UseLoadBarrierOptions = {
  /** Provide a new barrier to descendants (page/root usage) */
  provide?: boolean;
  /** Return null instead of throwing when no provider exists */
  optional?: boolean;
};

/**
 * A tiny page-level loading barrier.
 *
 * - Call `useLoadBarrier({ provide: true })` once at a page/root level.
 * - Descendants can call `useLoadBarrier({ optional: true })` and register tasks.
 */
export function useLoadBarrier(options: { provide: true }): LoadBarrier;
export function useLoadBarrier(options: { optional: true }): LoadBarrier | null;
export function useLoadBarrier(options?: UseLoadBarrierOptions): LoadBarrier;
export function useLoadBarrier(options: UseLoadBarrierOptions = {}) {
  if (options.provide) {
    const barrier = createLoadBarrier();
    provide(LoadBarrierKey, barrier);
    return barrier;
  }

  const injected = inject(LoadBarrierKey, null);
  if (!injected && options.optional) return null;
  if (!injected) {
    throw new Error(
      "useLoadBarrier() was called without a provider. Call useLoadBarrier({ provide: true }) in a parent component."
    );
  }
  return injected;
}
