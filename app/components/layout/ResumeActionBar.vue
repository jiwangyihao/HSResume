<script setup lang="ts">
import type { ResumeLocale } from "../../types/resume";

type LocaleItem = { label: string; value: ResumeLocale };

type Props = {
  modelValue: ResumeLocale;
  localeItems: ReadonlyArray<LocaleItem>;
  printLabel: string;
};

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:modelValue", v: ResumeLocale): void;
  (e: "print"): void;
}>();

const localeModel = computed({
  get: () => props.modelValue,
  set: (v: ResumeLocale) => emit("update:modelValue", v),
});
</script>

<template>
  <div class="flex justify-end gap-3 mb-6 print:hidden">
    <UButton
      icon="i-heroicons-printer"
      size="sm"
      color="neutral"
      variant="solid"
      @click="emit('print')"
    >
      {{ printLabel }}
    </UButton>
    <UTabs
      v-model="localeModel"
      :items="localeItems.slice()"
      :content="false"
      size="xs"
      variant="pill"
      :ui="{
        list: 'bg-gray-100 dark:bg-gray-800 p-1 rounded-lg',
        trigger: 'px-3',
      }"
    />
  </div>
</template>
