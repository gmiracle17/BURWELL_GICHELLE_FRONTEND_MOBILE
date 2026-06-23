<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Settings</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-list-header>
          <ion-label>Appearance</ion-label>
        </ion-list-header>

        <ion-item>
          <ion-icon :icon="moonOutline" slot="start"></ion-icon>
          <ion-label>
            <h2>Dark Mode</h2>
            <p>Toggle dark theme</p>
          </ion-label>
          <ion-toggle slot="end" :checked="isDarkMode" @ionChange="toggleDarkMode"></ion-toggle>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonToggle,
  IonIcon
} from '@ionic/vue';
import {
  moonOutline
} from 'ionicons/icons';

const isDarkMode = ref(false);

// Check if dark mode is enabled on mount
onMounted(() => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const savedTheme = localStorage.getItem('darkMode');
  
  if (savedTheme !== null) {
    isDarkMode.value = savedTheme === 'true';
  } else {
    isDarkMode.value = prefersDark.matches;
  }
  
  applyTheme(isDarkMode.value);
});

// Toggle dark mode
const toggleDarkMode = (event: CustomEvent) => {
  isDarkMode.value = event.detail.checked;
  localStorage.setItem('darkMode', isDarkMode.value.toString());
  applyTheme(isDarkMode.value);
};

// Apply theme to document
const applyTheme = (dark: boolean) => {
  document.body.classList.toggle('dark', dark);
};
</script>

<style scoped>
ion-list-header {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  color: var(--ion-color-medium);
}

ion-item h2 {
  font-weight: 500;
  margin: 0;
}

ion-item p {
  margin: 4px 0 0 0;
  font-size: 0.875rem;
  color: var(--ion-color-medium);
}
</style>
