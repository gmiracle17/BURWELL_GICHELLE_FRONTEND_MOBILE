<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Completed Tasks</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleDarkMode">
            <ion-icon slot="icon-only" :icon="userStore.darkMode ? sunnyOutline : moonOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Completed Tasks</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Search Bar -->
      <Searchbar v-model="searchQuery" placeholder="Search completed tasks..." :debounce="300" />

      <!-- Completed Task List -->
      <ion-list v-if="filteredCompletedTasks.length > 0">
        <ion-item-sliding v-for="task in filteredCompletedTasks" :key="task.id">
          <ion-item>
            <ion-checkbox slot="start" :checked="task.done" @ionChange="toggleTask(task.id)"></ion-checkbox>
            
            <ion-avatar v-if="task.photo != null" class="task-avatar">
              <img :src="task.photo" alt="" />
            </ion-avatar>
            <ion-avatar v-else class="task-avatar">
              <img :src="defaultImage" alt="" />
            </ion-avatar>
            
            <ion-label>
              <h2 class="task-done">{{ task.name }}</h2>
              <ion-badge :color="getPriorityColor(task.priority)"> {{ task.priority }}</ion-badge>
            </ion-label>

            <ion-button slot="end" fill="clear" color="primary" @click="openEditTaskModal(task)">
              <ion-icon :icon="createOutline"></ion-icon>
            </ion-button>

            <ion-button slot="end" fill="clear" color="danger" @click="confirmDelete(task.id)">
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

      <!-- Task Modal Component to handle edit -->
      <TaskModal
        :is-open="isModalOpen"
        :task="currentTask"
        @close="closeModal"
        @save="handleSaveTask"
      />

      <!-- Delete Confirmation Modal -->
      <DeleteModal
        ref="deleteModalRef"
        header="Delete Task"
        message="Are you sure you want to delete this completed task?"
        @confirm="handleDeleteConfirm"
      />
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
  IonButtons,
  IonIcon,
  IonBadge,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonAvatar,
} from '@ionic/vue';
import {
  trashOutline,
  checkmarkDoneOutline,
  createOutline,
  moonOutline,
  sunnyOutline,
} from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';
import { useUserStore } from '@/stores/userStore';
import type { Task } from '@/stores/taskStore';
import defaultImage from '@/assets/task-default.webp';
import Searchbar from '@/components/Searchbar.vue';
import DeleteModal from '@/components/DeleteModal.vue';
import TaskModal from '@/components/TaskModal.vue';

const taskStore = useTaskStore();
const userStore = useUserStore();

// Search state
const searchQuery = ref('');

// Modal state
const isModalOpen = ref(false);
const currentTask = ref<Task | null>(null);

// Delete modal ref and state
const deleteModalRef = ref<InstanceType<typeof DeleteModal> | null>(null);
const taskToDelete = ref<number | null>(null);

// Computed filtered completed tasks
const filteredCompletedTasks = computed(() => {
  // Filter for completed tasks only
  let filtered = taskStore.tasks.filter(task => task.done);

  // Filter by search query
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

// Confirm delete with DeleteModal
const confirmDelete = (id: number) => {
  taskToDelete.value = id;
  deleteModalRef.value?.show();
};

// Handle delete confirmation
const handleDeleteConfirm = () => {
  if (taskToDelete.value !== null) {
    taskStore.removeTask(taskToDelete.value);
    taskToDelete.value = null;
  }
};

// Open edit task modal
const openEditTaskModal = (task: Task) => {
  currentTask.value = task;
  isModalOpen.value = true;
};

// Close modal
const closeModal = () => {
  isModalOpen.value = false;
  currentTask.value = null;
};

// Handle save task for editting
const handleSaveTask = (data: { name: string; priority: 'Low' | 'Medium' | 'High' }) => {
  if (currentTask.value) {
    // Edit existing task
    taskStore.editTask(currentTask.value.id, {
      name: data.name,
      priority: data.priority
    });
  }
  
  closeModal();
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

// Toggle dark mode
const toggleDarkMode = () => {
  userStore.toggleDarkMode(!userStore.darkMode);
};

</script>

<style scoped>
@import '@/theme/task.css';
</style>
