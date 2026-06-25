<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useTaskStore } from './stores/taskStore';

const store = useTaskStore();

onMounted(() => {
  store.loadTasks();
});
</script>