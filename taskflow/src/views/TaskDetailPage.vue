<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { useUserStore } from '@/stores/userStore'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonButton,
  IonBadge,
  IonIcon,
  IonFab,
} from '@ionic/vue'
import {
  cameraOutline,
  moonOutline,
  sunnyOutline,
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

const route = useRoute()
const taskStore = useTaskStore()
const userStore = useUserStore()
const { addPhotoToTask } = taskStore

const task = computed(() => taskStore.tasks.find(t => t.id === Number(route.params.id)))

// Get priority color
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High':
      return 'danger';
    case 'Medium':
      return 'warning';
    case 'Low':
      return 'success';
    default:
      return 'medium';
  }
};

// Camera capture
async function capturePhoto(task) {
  if (!task) return
  try {
    const photo = await Camera.takePhoto({
      quality: 80,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    })
    const photoPath = photo.webPath
    addPhotoToTask(task.id, photoPath)
  } catch (err) {
    console.log('Camera error:', err)
  }
}

// Toggle dark mode
const toggleDarkMode = () => {
  userStore.toggleDarkMode(!userStore.darkMode);
};
</script>
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab1"></ion-back-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button @click="toggleDarkMode">
            <ion-icon slot="icon-only" :icon="userStore.darkMode ? sunnyOutline : moonOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="task" class="info-row">
        <span class="task-name">{{ task.name }}</span>
        <div class="detail-section">
          <span class="label">Status:</span>
          <ion-badge :color="task.done ? 'success' : 'warning'">{{ task.done ? 'Done' : 'Pending' }}</ion-badge>
        </div>
        <div class="detail-section">
          <span class="label">Priority:</span>
          <ion-badge :color="getPriorityColor(task.priority)">{{ task.priority }}</ion-badge>
        </div>
        <div v-if="task.photo">
          <img :src="task.photo" alt="Task Photo" style="margin-top: 24px; width: 100%; border-radius: 8px;" />
        </div>
        <ion-fab slot="fixed" vertical="top" horizontal="end">
          <ion-fab-button class="camera-button" @click="capturePhoto(task)">
            <ion-icon :icon="cameraOutline"></ion-icon>
          </ion-fab-button>
        </ion-fab>
        
      </div>
      <div v-else>
        Task not found.
      </div>
    </ion-content>
  </ion-page>
</template>
<style>
.info-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.task-name {
  font-size: 1.75rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  margin-top: 1rem;
  color: var(--ion-color-primary);
}
.detail-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.label {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}
ion-badge {
  width: fit-content;
}
.camera-button {
  margin-top: 20px;
}
</style>