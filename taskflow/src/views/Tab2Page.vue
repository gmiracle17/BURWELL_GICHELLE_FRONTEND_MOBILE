<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Completed Tasks</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Completed Tasks</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Search Bar -->
      <ion-searchbar
        v-model="searchQuery"
        placeholder="Search completed tasks..."
        :debounce="300"
      ></ion-searchbar>

      <!-- Completed Task List -->
      <ion-list v-if="filteredCompletedTasks.length > 0">
        <ion-item-sliding v-for="task in filteredCompletedTasks" :key="task.id">
          <ion-item>
            <ion-checkbox
              slot="start"
              :checked="task.done"
              @ionChange="toggleTask(task.id)"
            ></ion-checkbox>
            
            <ion-label>
              <h2 class="task-done">{{ task.name }}</h2>
              <ion-badge :color="getPriorityColor(task.priority)">
                {{ task.priority }}
              </ion-badge>
            </ion-label>

            <ion-button
              slot="end"
              fill="clear"
              color="danger"
              @click="confirmDelete(task.id)"
            >
              <ion-icon :icon="trashOutline"></ion-icon>
            </ion-button>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="danger" @click="confirmDelete(task.id)">
              <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <ion-icon :icon="checkmarkDoneOutline" size="large"></ion-icon>
        <p>{{ searchQuery ? 'No completed tasks found' : 'No completed tasks yet. Complete some tasks to see them here!' }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonBadge,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  alertController
} from '@ionic/vue';
import {
  trashOutline,
  checkmarkDoneOutline
} from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';

const taskStore = useTaskStore();

// Search state
const searchQuery = ref('');

// Computed filtered completed tasks
const filteredCompletedTasks = computed(() => {
  // First filter for completed tasks only
  let filtered = taskStore.tasks.filter(task => task.done);

  // Then filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(task =>
      task.name.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Toggle task completion
const toggleTask = (id: number) => {
  taskStore.toggleTask(id);
};

// Confirm delete with alert
const confirmDelete = async (id: number) => {
  const alert = await alertController.create({
    header: 'Delete Task',
    message: 'Are you sure you want to delete this task?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => {
          taskStore.removeTask(id);
        }
      }
    ]
  });

  await alert.present();
};

// Get priority color
const getPriorityColor = (priority: string) => {
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

</script>

<style scoped>
.task-done {
  text-decoration: line-through;
  opacity: 0.6;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  font-size: 80px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1rem;
  margin: 0;
}

ion-badge {
  margin-top: 8px;
}
</style>
