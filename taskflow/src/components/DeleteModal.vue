<template>
</template>

<script setup lang="ts">
import { alertController } from '@ionic/vue';

interface Props {
  header?: string;
  message?: string;
}

interface Emits {
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  header: 'Delete',
  message: 'Are you sure you want to delete this task?'
});

const emit = defineEmits<Emits>();

// Show the delete modal to parent components
const show = async () => {
  const alert = await alertController.create({
    header: props.header,
    message: props.message,
    cssClass: 'delete-alert',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          emit('cancel');
        }
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => {
          emit('confirm');
        }
      }
    ]
  });

  await alert.present();
};

defineExpose({
  show
});
</script>