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

      <!-- Task List -->
      <ion-list v-if="filteredTasks.length > 0">
        <ion-item-sliding v-for="task in filteredTasks" :key="task.id">
          <ion-item>
            <ion-checkbox slot="start" :checked="task.done" @ionChange="toggleTask(task.id)"></ion-checkbox>
            
            <ion-item @click="goToDetail(task.id)">
            <ion-avatar v-if="task.photo!=null"style="height:50px; width: 50px; margin-right: 10px">
              <img :src="task.photo" alt="" style="width: 100%; border-radius: 25px;" />
            </ion-avatar>
            <ion-avatar v-else style="height:50px; width: 50px; margin-right: 10px">
              <img :src="defaultImage" alt="" style="width: 100%; border-radius: 25px;" />
            </ion-avatar>
            <ion-label>
              <h2 :class="{ 'task-done': task.done }">{{ task.name }}</h2>
              <ion-badge :color="getPriorityColor(task.priority)"> {{ task.priority }} </ion-badge>
            </ion-label>
            </ion-item>

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
        <p>{{ searchQuery || selectedStatus !== 'Total' ? 'No tasks found' : 'No tasks yet. Add one to get started!' }}</p>
      </div>

      <!-- Floating Action Button (Add Task) -->
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
              <ion-button @click="closeAddTaskModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Task Name</ion-label>
            <ion-input v-model="newTaskName" placeholder="Enter task name" @keyup.enter="addNewTask"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Priority</ion-label>
            <ion-select v-model="newTaskPriority" placeholder="Select priority">
              <ion-select-option value="Low">Low</ion-select-option>
              <ion-select-option value="Medium">Medium</ion-select-option>
              <ion-select-option value="High">High</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-button expand="block" @click="addNewTask" class="ion-margin-top">
            <ion-icon slot="start" :icon="addOutline"></ion-icon>
            Add Task
          </ion-button>
        </ion-content>
      </ion-modal>

      <!-- Edit Task Modal -->
      <ion-modal :is-open="isEditModalOpen" @didDismiss="closeEditTaskModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Edit Task</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeEditTaskModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Task Name</ion-label>
            <ion-input v-model="editTaskName" placeholder="Enter task name" @keyup.enter="saveEditTask"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Priority</ion-label>
            <ion-select v-model="editTaskPriority" placeholder="Select priority">
              <ion-select-option value="Low">Low</ion-select-option>
              <ion-select-option value="Medium">Medium</ion-select-option>
              <ion-select-option value="High">High</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-button expand="block" @click="saveEditTask" class="ion-margin-top">
            <ion-icon slot="start" :icon="saveOutline"></ion-icon>
            Save Changes
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
  IonRouterOutlet,
  alertController,
  IonAvatar,
} from '@ionic/vue';
import {
  addOutline,
  trashOutline,
  checkmarkDoneOutline,
  createOutline,
  saveOutline,
  closeOutline,
} from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';
import { useRouter } from 'vue-router';
import defaultImage from '@/assets/task-default.webp';

const taskStore = useTaskStore();
const router = useRouter();

const goToDetail = (id: number) => {
  router.push(`/tabs/tab1/${id}`)
}

// Search and filter state
const searchQuery = ref('');
const selectedStatus = ref<'Total' | 'Pending' | 'Completed'>('Total');

// Add task modal state
const isModalOpen = ref(false);
const newTaskName = ref('');
const newTaskPriority = ref<'Low' | 'Medium' | 'High'>('Low');
const newTaskDueDate = ref('');

// Edit task modal state
const isEditModalOpen = ref(false);
const editTaskId = ref<number | null>(null);
const editTaskName = ref('');
const editTaskPriority = ref<'Low' | 'Medium' | 'High'>('Low');
const editTaskDueDate = ref('');

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
  // 'Total' shows all tasks, no additional filtering needed

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

// Open edit task modal
const openEditTaskModal = (task: any) => {
  editTaskId.value = task.id;
  editTaskName.value = task.name;
  editTaskPriority.value = task.priority;
  editTaskDueDate.value = task.dueDate || '';
  isEditModalOpen.value = true;
};

// Close edit task modal
const closeEditTaskModal = () => {
  isEditModalOpen.value = false;
  editTaskId.value = null;
  editTaskName.value = '';
  editTaskPriority.value = 'Low';
  editTaskDueDate.value = '';
};

// Save edited task
const saveEditTask = () => {
  if (editTaskId.value !== null && editTaskName.value.trim()) {
    taskStore.editTask(editTaskId.value, {
      name: editTaskName.value,
      dueDate: editTaskDueDate.value || null
    });
    taskStore.setPriority(editTaskId.value, editTaskPriority.value);
    closeEditTaskModal();
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

function chooseDisplayImage(task) {
  if (task.photo != null) return './assets/task-default.webp'
  return task.photo
}
</script>

<style scoped>
.stats-container {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: var(--ion-color-light);
  margin: 0 16px 8px 16px;
  border-radius: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item ion-icon {
  font-size: 28px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--ion-color-medium);
  text-transform: uppercase;
}

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

ion-button ion-icon {
  font-size: 1.5rem;
}
</style>