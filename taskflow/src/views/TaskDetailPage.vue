<!--
=============================================================
  DAY 3 ASSIGNMENT — TaskDetailView.vue
  Displays full details for a single task
=============================================================
-->
<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonSearchbar,
  IonChip,
  IonBadge,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonRouterOutlet,
  alertController
} from '@ionic/vue';

// TODO 1: Get the current route and router instances
const route  = useRoute()

const taskStore = useTaskStore()

// TODO 2: Find the task matching the route param
// Remember: route.params.id is a STRING — cast to Number before comparing
const task = computed(() => taskStore.tasks.find(task => task.id === Number(route.params.id)))
</script>

<template>
  <ion-page>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
            <ion-back-button default-href="/tabs/tab1"></ion-back-button>
            </ion-buttons>
        </ion-toolbar>
        </ion-header>
    <ion-content class="ion-padding">
      <div class="info-row">
        <span class="task-name"> {{ task.name }}</span>
        <span class="label">Status:</span>
        <ion-badge>{{ task.done ? 'Done' : 'Pending' }}</ion-badge>
        <span class="label">Priority:</span>
        <ion-badge>{{ task.priority }}</ion-badge>
      </div>
    </ion-content>
  </ion-page>
</template>

<style>
.info-row{
    display:flex;
    flex-direction: column;
}
.info-row .label {
    display:flex;
    flex-direction: row;
}

.info-row .task-name{
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
}
</style>