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
      <div v-if="task" class="task-detail-container">
        <!-- Task Header -->
        <div class="task-header">
          <h1 class="task-name">{{ task.name }}</h1>
          <div class="task-badges">
            <ion-badge :color="task.done ? 'success' : 'warning'" class="status-badge">
              {{ task.done ? 'Completed' : 'Pending' }}
            </ion-badge>
            <ion-badge :color="getPriorityColor(task.priority)" class="priority-badge">
              {{ task.priority }} Priority
            </ion-badge>
          </div>
        </div>

        <!-- Task Details Card -->
        <div class="detail-card">
          <!-- Task ID and Due Date in 2 columns -->
          <div class="detail-row detail-row-columns">
            <div class="detail-item">
              <ion-icon :icon="informationCircleOutline" class="detail-icon"></ion-icon>
              <div class="detail-content">
                <span class="detail-label">Task ID</span>
                <span class="detail-value">#{{ task.id }}</span>
              </div>
            </div>

            <div class="detail-item">
              <ion-icon :icon="calendarOutline" class="detail-icon"></ion-icon>
              <div class="detail-content">
                <span class="detail-label">Due Date</span>
                <span class="detail-value">To follow</span>
              </div>
            </div>
          </div>

          <!-- Status and Priority in 2 columns -->
          <div class="detail-row detail-row-columns">
            <div class="detail-item">
              <ion-icon :icon="checkmarkCircleOutline" class="detail-icon"></ion-icon>
              <div class="detail-content">
                <span class="detail-label">Status</span>
                <span class="detail-value">{{ task.done ? 'Completed' : 'Pending' }}</span>
              </div>
            </div>

            <div class="detail-item">
              <ion-icon :icon="flagOutline" class="detail-icon"></ion-icon>
              <div class="detail-content">
                <span class="detail-label">Priority Level</span>
                <span class="detail-value">{{ task.priority }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Task Photo Section -->
        <div class="photo-section">
          <div class="photo-header">
            <h2 class="section-title">Task Photo</h2>
            <div class="photo-actions">
              <ion-button fill="clear" @click="capturePhoto(task)">
                <ion-icon slot="start" :icon="cameraOutline"></ion-icon>
                {{ task.photo ? 'Update' : 'Add Photo' }}
              </ion-button>
              <ion-button v-if="task.photo" fill="clear" color="danger" @click="removePhoto(task)">
                <ion-icon slot="start" :icon="trashOutline"></ion-icon>
                Remove
              </ion-button>
            </div>
          </div>
          <div v-if="task.photo" class="task-photo">
            <img :src="task.photo" alt="Task Photo" />
          </div>
          <div v-else class="no-photo">
            <ion-icon :icon="imageOutline" class="no-photo-icon"></ion-icon>
            <p>No photo added yet</p>
            <ion-button @click="capturePhoto(task)">
              <ion-icon slot="start" :icon="cameraOutline"></ion-icon>
              Take Photo
            </ion-button>
          </div>
        </div>
      </div>
      <div v-else class="not-found">
        <ion-icon :icon="alertCircleOutline" class="not-found-icon"></ion-icon>
        <h2>Task Not Found</h2>
        <p>The task you're looking for doesn't exist.</p>
        <ion-button routerLink="/tabs/tab1">
          Back to Tasks
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

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
} from '@ionic/vue'
import {
  cameraOutline,
  moonOutline,
  sunnyOutline,
  checkmarkCircleOutline,
  flagOutline,
  calendarOutline,
  imageOutline,
  alertCircleOutline,
  trashOutline,
  informationCircleOutline,
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

// Remove photo
function removePhoto(task) {
  if (!task) return
  taskStore.removePhotoFromTask(task.id)
}

// Toggle dark mode
const toggleDarkMode = () => {
  userStore.toggleDarkMode(!userStore.darkMode);
};
</script>

<style scoped>
.task-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem 0;
}

.task-header {
  margin-bottom: 2rem;
}

.task-name {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--ion-color-primary);
  line-height: 1.3;
}

.task-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-badge,
.priority-badge {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.detail-card {
  background: var(--ion-color-light);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-row {
  padding: 0.75rem 0;
}

.detail-row:not(:last-child) {
  border-bottom: 1px solid var(--ion-color-light-shade);
}

.detail-row-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detail-icon {
  font-size: 1.5rem;
  color: var(--ion-color-primary);
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.detail-label {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  font-weight: 500;
}

.detail-value {
  font-size: 1rem;
  color: var(--ion-text-color);
  font-weight: 600;
}

.photo-section {
  margin-top: 2rem;
}

.photo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--ion-text-color);
}

.photo-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.task-photo {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.task-photo img {
  width: 100%;
  height: auto;
  display: block;
}

.no-photo {
  background: var(--ion-color-light);
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  border: 2px dashed var(--ion-color-medium);
}

.no-photo-icon {
  font-size: 4rem;
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
}

.no-photo p {
  color: var(--ion-color-medium);
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}

.not-found {
  text-align: center;
  padding: 4rem 2rem;
}

.not-found-icon {
  font-size: 5rem;
  color: var(--ion-color-danger);
  margin-bottom: 1rem;
}

.not-found h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--ion-text-color);
}

.not-found p {
  color: var(--ion-color-medium);
  margin: 0 0 2rem 0;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .detail-card {
    background: var(--ion-color-step-50);
  }
  
  .no-photo {
    background: var(--ion-color-step-50);
  }
}
</style>