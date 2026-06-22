<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tasks</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tasks</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Search Bar -->
      <ion-searchbar
        v-model="searchQuery"
        placeholder="Search tasks..."
        :debounce="300"
      ></ion-searchbar>

      <!-- Priority Filter Chips -->
      <div class="filter-container">
        <ion-chip
          :color="selectedPriority === 'All' ? 'primary' : 'medium'"
          @click="selectedPriority = 'All'"
        >
          <ion-label>All</ion-label>
        </ion-chip>
        <ion-chip
          :color="selectedPriority === 'Low' ? 'success' : 'medium'"
          @click="selectedPriority = 'Low'"
        >
          <ion-label>Low</ion-label>
        </ion-chip>
        <ion-chip
          :color="selectedPriority === 'Medium' ? 'warning' : 'medium'"
          @click="selectedPriority = 'Medium'"
        >
          <ion-label>Medium</ion-label>
        </ion-chip>
        <ion-chip
          :color="selectedPriority === 'High' ? 'danger' : 'medium'"
          @click="selectedPriority = 'High'"
        >
          <ion-label>High</ion-label>
        </ion-chip>
      </div>

      <!-- Task List -->
      <ion-list v-if="filteredTasks.length > 0">
        <ion-item-sliding v-for="task in filteredTasks" :key="task.id">
          <ion-item>
            <ion-checkbox
              slot="start"
              :checked="task.done"
              @ionChange="toggleTask(task.id)"
            ></ion-checkbox>
            
            <ion-label>
              <h2 :class="{ 'task-done': task.done }">{{ task.name }}</h2>
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
              REMOVE
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
        <p>{{ searchQuery || selectedPriority !== 'All' ? 'No tasks found' : 'No tasks yet. Add one to get started!' }}</p>
      </div>

      <!-- Floating Action Button -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="openAddTaskModal">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <!-- Add Task Modal -->
      <ion-modal :is-open="isModalOpen" @didDismiss="closeAddTaskModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>New Task</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeAddTaskModal">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Task Name</ion-label>
            <ion-input
              v-model="newTaskName"
              placeholder="Enter task name"
              @keyup.enter="addNewTask"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Priority</ion-label>
            <ion-select v-model="newTaskPriority" placeholder="Select priority">
              <ion-select-option value="Low">Low</ion-select-option>
              <ion-select-option value="Medium">Medium</ion-select-option>
              <ion-select-option value="High">High</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Due Date</ion-label>
            <ion-datetime-button datetime="datetime"></ion-datetime-button>
            <ion-modal :keep-contents-mounted="true">
              <ion-datetime
                id="datetime"
                v-model="newTaskDueDate"
                presentation="date"
              ></ion-datetime>
            </ion-modal>
          </ion-item>

          <ion-button expand="block" @click="addNewTask" class="ion-margin-top">
            <ion-icon slot="start" :icon="addOutline"></ion-icon>
            Add Task
          </ion-button>
        </ion-content>
      </ion-modal>
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
  IonDatetime,
  IonDatetimeButton,
  alertController
} from '@ionic/vue';
import {
  addOutline,
  trashOutline,
  checkmarkDoneOutline,
  calendarOutline
} from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';

const taskStore = useTaskStore();

// Search and filter state
const searchQuery = ref('');
const selectedPriority = ref('All');

// Modal state
const isModalOpen = ref(false);
const newTaskName = ref('');
const newTaskPriority = ref<'Low' | 'Medium' | 'High'>('Low');
const newTaskDueDate = ref('');

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

  // Filter by priority
  if (selectedPriority.value !== 'All') {
    filtered = filtered.filter(task => task.priority === selectedPriority.value);
  }

  return filtered;
});

// Toggle task completion
const toggleTask = (id: number) => {
  taskStore.toggleTask(id);
};

// Open add task modal
const openAddTaskModal = () => {
  isModalOpen.value = true;
  newTaskName.value = '';
  newTaskPriority.value = 'Low';
  newTaskDueDate.value = '';
};

// Close add task modal
const closeAddTaskModal = () => {
  isModalOpen.value = false;
};

// Add new task
const addNewTask = () => {
  if (newTaskName.value.trim()) {
    taskStore.addTask(newTaskName.value, newTaskDueDate.value || null);
    
    // Set priority for the newly added task
    const newTask = taskStore.tasks[taskStore.tasks.length - 1];
    if (newTask) {
      taskStore.setPriority(newTask.id, newTaskPriority.value);
    }
    
    closeAddTaskModal();
  }
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

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
</script>

<style scoped>
.filter-container {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
}

.task-done {
  text-decoration: line-through;
  opacity: 0.6;
}

.due-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  margin-top: 4px;
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

ion-fab {
  margin: 16px;
}
</style>
