<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
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
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

const route = useRoute()
const taskStore = useTaskStore()
const { addPhotoToTask } = taskStore

const task = computed(() => taskStore.tasks.find(t => t.id === Number(route.params.id)))
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
      <div v-if="task" class="info-row">
        <span class="task-name">{{ task.name }}</span>
        <span class="label">Status:</span>
        <ion-badge>{{ task.done ? 'Done' : 'Pending' }}</ion-badge>
        <span class="label">Priority:</span>
        <ion-badge>{{ task.priority }}</ion-badge>
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
}
.task-name {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
}
.label {
  margin-top: 10px;
  font-weight: bold;
}
.camera-button {
  margin-top: 20px;
}
</style>