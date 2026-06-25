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
      <div style="display: flex; justify-content: flex-end; padding: 0 16px;">
        <ion-button fill="outline" :color="taskStore.doneCount === 0 ? 'medium' : 'danger'" @click="confirmClearAllDone" :disabled="taskStore.doneCount === 0">
          <ion-icon slot="start" :icon="trashOutline"></ion-icon>
          Clear Done
        </ion-button>
      </div>

      <!-- Completed Task List grouped by due date -->
      <template v-if="filteredCompletedTasks.length > 0">
        <div v-for="group in groupedCompletedTasks" :key="group.date">
          <div class="date-group-header">{{ group.date }}</div>
          <ion-list>
            <ion-item-sliding v-for="task in group.tasks" :key="task.id" :ref="el => setSlidingRef(task.id, el)">
              <ion-item>
                <ion-checkbox slot="start" :checked="task.done" @ionChange="toggleTask(task.id)"></ion-checkbox>
                
                <ion-avatar v-if="task.photo != null" class="task-avatar" @click="goToDetail(task.id)">
                  <img :src="task.photo" alt="" />
                </ion-avatar>
                <ion-avatar v-else class="task-avatar" @click="goToDetail(task.id)">
                  <img :src="defaultImage" alt="" />
                </ion-avatar>
                
                <ion-label @click="goToDetail(task.id)">
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

              <!-- Swipe Left to delete -->
              <ion-item-options side="end" @ionSwipe="handleSwipeDelete(task.id)">
                <ion-item-option color="danger">
                  Delete
                </ion-item-option>
              </ion-item-options>
              <!-- Swipe Right to toggle completion -->
              <ion-item-options side="start" @ionSwipe="handleSwipeToggle(task.id)">
                <ion-item-option color="success">
                  {{ task.done ? 'Incomplete' : 'Complete' }}
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          </ion-list>
        </div>
      </template>

      <!-- No more tasks message -->
      <div v-if="filteredCompletedTasks.length > 0" class="no-more-tasks">
        <p>No more completed tasks</p>
      </div>

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

      <!-- Clear All Done Confirmation Modal -->
      <DeleteModal
        ref="clearAllModalRef"
        header="Clear All Done Tasks"
        message="Are you sure you want to remove all completed tasks? This cannot be undone."
        @confirm="clearAllDone"
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
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia'
import defaultImage from '@/assets/task-default.webp';
import Searchbar from '@/components/Searchbar.vue';
import DeleteModal from '@/components/DeleteModal.vue';
import TaskModal from '@/components/TaskModal.vue';

const taskStore = useTaskStore();
const userStore = useUserStore();
const router = useRouter();

const { tasks } = storeToRefs(taskStore)

const goToDetail = (id: number) => {
  router.push(`/tabs/tasks/${id}`);
};

// Search state
const searchQuery = ref('');

// Modal state
const isModalOpen = ref(false);
const currentTask = ref<Task | null>(null);

// Delete modal ref and state
const deleteModalRef = ref<InstanceType<typeof DeleteModal> | null>(null);
const taskToDelete = ref<number | null>(null);

// Clear all done modal ref
const clearAllModalRef = ref<InstanceType<typeof DeleteModal> | null>(null);

// Sliding items refs
const slidingItemsMap = new Map<number, any>();
const setSlidingRef = async (taskId: number, el: any) => {
  if (el) {
    const ionComponent = await el.$el?.componentOnReady?.();
    slidingItemsMap.set(taskId, ionComponent || el.$el || el);
  } else {
    slidingItemsMap.delete(taskId);
  }
};

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

// Group filtered completed tasks by due date
const groupedCompletedTasks = computed(() => {
  const groups: Record<string, { label: string; sortKey: string; tasks: typeof filteredCompletedTasks.value }> = {};
  for (const task of filteredCompletedTasks.value) {
    const sortKey = task.dueDate ? task.dueDate.slice(0, 10) : 'zzz';
    const label = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : 'No Due Date';
    if (!groups[sortKey]) groups[sortKey] = { label, sortKey, tasks: [] };
    groups[sortKey].tasks.push(task);
  }
  return Object.values(groups)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ label, tasks }) => ({ date: label, tasks }));
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

// Prompt confirmation before clearing all done tasks
function confirmClearAllDone() {
  clearAllModalRef.value?.show();
}

// Remove All Completed Tasks
function clearAllDone() {
  const doneIds = tasks.value.filter(task => task.done).map(task => task.id);
  doneIds.forEach(id => taskStore.removeTask(id));
}

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

// Handle swipe to delete
const handleSwipeDelete = async (id: number) => {
  const slidingItem = slidingItemsMap.get(id);
  if (slidingItem?.close) await slidingItem.close();
  confirmDelete(id);
};

// Handle swipe to toggle completion
const handleSwipeToggle = async (id: number) => {
  const slidingItem = slidingItemsMap.get(id);
  toggleTask(id);
  if (slidingItem?.close) await slidingItem.close();
};

</script>

<style scoped>
@import '@/theme/task.css';
</style>
