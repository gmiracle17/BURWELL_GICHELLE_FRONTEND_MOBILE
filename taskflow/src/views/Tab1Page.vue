<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tasks</ion-title>
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
          <ion-title size="large">Tasks</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Search Bar -->
      <Searchbar v-model="searchQuery" placeholder="Search tasks..." :debounce="300" />

      <!-- Status Filters with Counts -->
      <div class="filter-container">
        <ion-chip :color="selectedStatus === 'Total' ? 'primary' : 'medium'" @click="selectedStatus = 'Total'">
          <ion-label>Total ({{ taskStore.totalCount }})</ion-label>
        </ion-chip>
        <ion-chip :color="selectedStatus === 'Pending' ? 'warning' : 'medium'" @click="selectedStatus = 'Pending'">
          <ion-label>Pending ({{ taskStore.pendingCount }})</ion-label>
        </ion-chip>
        <ion-chip :color="selectedStatus === 'Completed' ? 'success' : 'medium'" @click="selectedStatus = 'Completed'">
          <ion-label>Completed ({{ taskStore.doneCount }})</ion-label>
        </ion-chip>
      </div>

      <!-- Task List grouped by due date -->
      <template v-if="filteredTasks.length > 0">
        <div v-for="group in groupedTasks" :key="group.date">
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
                  <h2 :class="{ 'task-done': task.done }">{{ task.name }}</h2>
                  <ion-badge :color="getPriorityColor(task.priority)"> {{ task.priority }} </ion-badge>
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
      <div v-if="filteredTasks.length > 0" class="no-more-tasks">
        <p>No more tasks</p>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <ion-icon :icon="checkmarkDoneOutline" size="large"></ion-icon>
        <p>{{ searchQuery || selectedStatus !== 'Total' ? 'No tasks found' : 'No tasks yet. Add one to get started!' }}</p>
      </div>

      <!-- Floating Action Button (Add Task) -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="openAddTaskModal">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <!-- Task Modal Component for Add and Edit Task -->
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
        message="Are you sure you want to delete this task?"
        @confirm="handleDeleteConfirm"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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
  IonFab,
  IonFabButton,
  IonChip,
  IonBadge,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonAvatar,
} from '@ionic/vue';
import {
  addOutline,
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
import defaultImage from '@/assets/task-default.webp';
import TaskModal from '@/components/TaskModal.vue';
import Searchbar from '@/components/Searchbar.vue';
import DeleteModal from '@/components/DeleteModal.vue';

const taskStore = useTaskStore();
const userStore = useUserStore();
const router = useRouter();

// Load tasks on component mount
onMounted(() => {
  taskStore.loadTasks();
});

const goToDetail = (id: number) => {
  router.push(`/tabs/tasks/${id}`);
};

// Search and filter state
const searchQuery = ref('');
const selectedStatus = ref<'Total' | 'Pending' | 'Completed'>('Total');

// Modal state
const isModalOpen = ref(false);
const currentTask = ref<Task | null>(null);

// Delete modal ref and state
const deleteModalRef = ref<InstanceType<typeof DeleteModal> | null>(null);
const taskToDelete = ref<number | null>(null);

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

// Computed filtered tasks
const filteredTasks = computed(() => {
  let filtered = taskStore.tasks;

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(task =>
      task.name.toLowerCase().includes(query)
    );
  }

  // Filter by status
  if (selectedStatus.value === 'Pending') {
    filtered = filtered.filter(task => !task.done);
  } else if (selectedStatus.value === 'Completed') {
    filtered = filtered.filter(task => task.done);
  }

  // 'Total' shows all tasks
  return filtered;
});

// Group filtered tasks by due date
const groupedTasks = computed(() => {
  const groups: Record<string, { label: string; sortKey: string; tasks: typeof filteredTasks.value }> = {};
  for (const task of filteredTasks.value) {
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

// Open add task modal
const openAddTaskModal = () => {
  currentTask.value = null;
  isModalOpen.value = true;
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

// Handle save task for add and edit
const handleSaveTask = (data: { name: string; priority: 'Low' | 'Medium' | 'High'; dueDate?: string }) => {
  if (currentTask.value) {
    // Edit existing task
    taskStore.editTask(currentTask.value.id, {
      name: data.name,
      priority: data.priority,
      dueDate: data.dueDate
    });
    if (data.dueDate === undefined) {
      taskStore.removeDueDate(currentTask.value.id);
    }
  } else {
    // Add new task
    taskStore.addTask(data.name, data.priority, data.dueDate);
  }
  
  closeModal();
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

.task-done {
  text-decoration: line-through;
  opacity: 0.6;
}
</style>