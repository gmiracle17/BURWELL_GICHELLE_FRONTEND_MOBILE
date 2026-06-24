<template>
  <ion-searchbar :value="modelValue" @ionInput="handleInput" :placeholder="placeholder" :debounce="debounce"></ion-searchbar>
</template>

<script setup lang="ts">
import { IonSearchbar } from '@ionic/vue';

interface Props {
  modelValue: string;
  placeholder?: string;
  debounce?: number;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
  debounce: 300
});

const emit = defineEmits<Emits>();

const handleInput = (event: CustomEvent) => {
  emit('update:modelValue', event.detail.value);
};
</script>

<style scoped>
ion-searchbar {
  position: relative;
  --background: transparent;
  --box-shadow: none;
  margin-top: 1px;
}
ion-searchbar::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  width: 90%;
  margin: 0 auto;
  background: var(--ion-color-medium);
  pointer-events: none;
}
</style>