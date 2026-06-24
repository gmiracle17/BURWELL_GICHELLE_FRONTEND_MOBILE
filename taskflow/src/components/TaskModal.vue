<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleDismiss">
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
  IonInput,
  IonSelect,
  IonSelectOption,
  IonIcon,
} from '@ionic/vue';
import {
  addOutline,
  saveOutline,
  closeOutline,
} from 'ionicons/icons';
import type { Task } from '@/stores/taskStore';

interface Props {
  isOpen: boolean;
  task?: Task | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', data: { name: string; priority: 'Low' | 'Medium' | 'High' }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const taskName = ref('');
const taskPriority = ref<'Low' | 'Medium' | 'High'>('Low');

const isEditMode = ref(false);

// ResetForm to use in watchers
const resetForm = () => {
  taskName.value = '';
  taskPriority.value = 'Low';
};

// Check for task prop changes to populate form in edit mode
watch(() => props.task, (newTask) => {
  if (newTask) {
    isEditMode.value = true;
    taskName.value = newTask.name;
    taskPriority.value = newTask.priority;
  } else {
    isEditMode.value = false;
    resetForm();
  }
}, { immediate: true });

// Check for modal open/close to reset form
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm();
  }
});

const handleDismiss = () => {
  emit('close');
};

const handleSave = () => {
  if (taskName.value.trim()) {
    emit('save', {
      name: taskName.value,
      priority: taskPriority.value
    });
    resetForm();
  }
};
</script>

<style scoped>
ion-button ion-icon {
  font-size: 1.5rem;
}
</style>