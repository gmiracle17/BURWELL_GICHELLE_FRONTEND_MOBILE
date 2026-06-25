<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleDismiss" :initial-breakpoint="1" :breakpoints="[0, 1]">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isEditMode ? 'Edit Task' : 'New Task' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleDismiss">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">Task Name</ion-label>
        <ion-input v-model="taskName" placeholder="Enter task name" @keyup.enter="handleSave"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Priority</ion-label>
        <ion-select v-model="taskPriority" placeholder="Select priority">
          <ion-select-option value="Low">Low</ion-select-option>
          <ion-select-option value="Medium">Medium</ion-select-option>
          <ion-select-option value="High">High</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label>Due Date</ion-label>
        <ion-note slot="end" color="medium">{{ taskDueDate ? formatDate(taskDueDate) : 'None' }}</ion-note>
        <ion-button slot="end" fill="clear" @click="showDatePicker = true">
          <ion-icon :icon="calendarOutline"></ion-icon>
        </ion-button>
      </ion-item>

      <!-- Date picker modal rendered on top -->
      <ion-modal :is-open="showDatePicker" @didDismiss="showDatePicker = false" :initial-breakpoint="1" :breakpoints="[0, 1]" class="date-picker-modal">
        <ion-header>
          <ion-toolbar>
            <ion-title slot="start" class="picker-title">Pick a Due Date</ion-title>
            <ion-buttons slot="end">
              <ion-button color="primary" strong @click="confirmDate">Done</ion-button>
              <ion-button color="danger" fill="clear" @click="clearDate">Clear</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-datetime v-model="pendingDueDate" presentation="date" :show-default-buttons="false" class="full-width-datetime"></ion-datetime>
      </ion-modal>

      <ion-text v-if="error" color="danger">
        <p class="auth-error-text">{{ error }}</p>
      </ion-text>

      <ion-button expand="block" @click="handleSave" class="ion-margin-top">
        <ion-icon slot="start" :icon="isEditMode ? saveOutline : addOutline"></ion-icon>
        {{ isEditMode ? 'Save Changes' : 'Add Task' }}
      </ion-button>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonNote,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonDatetime,
} from '@ionic/vue';
import {
  addOutline,
  saveOutline,
  closeOutline,
  calendarOutline,
} from 'ionicons/icons';
import type { Task } from '@/stores/taskStore';

interface Props {
  isOpen: boolean;
  task?: Task | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', data: { name: string; priority: 'Low' | 'Medium' | 'High'; dueDate?: string }): void;
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const taskName = ref('')
const taskPriority = ref<'Low' | 'Medium' | 'High'>('Low')
const taskDueDate = ref<string | undefined>(undefined)
const pendingDueDate = ref<string | undefined>(undefined)
const showDatePicker = ref(false)
const isEditMode = ref(false)
const error = ref('')

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const confirmDate = () => {
  taskDueDate.value = pendingDueDate.value;
  showDatePicker.value = false;
};

const clearDate = () => {
  taskDueDate.value = undefined;
  pendingDueDate.value = undefined;
  showDatePicker.value = false;
};

// ResetForm to use in watchers
const resetForm = () => {
  taskName.value = '';
  taskPriority.value = 'Low';
  taskDueDate.value = undefined;
  pendingDueDate.value = undefined;
  showDatePicker.value = false;
};

// Populate form when modal opens, reset when it closes
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    const task = props.task;
    if (task) {
      isEditMode.value = true;
      taskName.value = task.name;
      taskPriority.value = task.priority;
      taskDueDate.value = task.dueDate;
      pendingDueDate.value = task.dueDate;
    } else {
      isEditMode.value = false;
      resetForm();
    }
  } else {
    resetForm();
  }
});

const handleDismiss = () => {
  emit('close');
};

const handleSave = () => {
  if (!taskName.value.trim()) {
    error.value = 'Please enter the task name.'
    return
  }
  error.value = ''
  if (taskName.value.trim()) {
    emit('save', {
      name: taskName.value,
      priority: taskPriority.value,
      dueDate: taskDueDate.value
    });
    resetForm();
  }
};
</script>

<style scoped>
.date-picker-modal {
  --height: auto;
  --border-radius: 16px;
}

.picker-title {
  padding-inline-start: 16px;
  font-size: 1rem;
  font-weight: 600;
}

.full-width-datetime {
  width: 100%;
  max-width: 100%;
}

ion-button ion-icon {
  font-size: 1.5rem;
}

ion-modal {
  --backdrop-opacity: 0.6;
  --border-radius: 16px;
  --box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

ion-item {
  margin-bottom: 12px;
}

/* Button animations */
ion-button {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

ion-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

ion-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* Content fade-in animation */
ion-content {
  animation: fadeIn 0.3s ease-in-out;
}

ion-note {
  font-size:15px;
  margin-top:0;
  margin-bottom: 5px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>