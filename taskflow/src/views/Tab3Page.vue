<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Settings</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleDarkModeHeader">
            <ion-icon slot="icon-only" :icon="userStore.darkMode ? sunnyOutline : moonOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Settings</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- User Profile Section -->
      <ion-list v-if="userStore.isLoggedIn">
        <ion-list-header>
          <ion-label>Account</ion-label>
        </ion-list-header>

        <ion-item>
          <ion-icon :icon="personOutline" slot="start"></ion-icon>
          <ion-label>
            <h2>{{ userStore.currentUser }}</h2>
            <p>Current user</p>
          </ion-label>
        </ion-item>
      </ion-list>

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
          <ion-toggle slot="end" :checked="userStore.darkMode" @ionChange="toggleDarkMode"></ion-toggle>
        </ion-item>
      </ion-list>

      <div v-if="userStore.isLoggedIn" class="logout-container">
        <ion-button expand="block" color="danger" @click="handleLogout">
          <ion-icon slot="start" :icon="logOutOutline"></ion-icon>
          Logout
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
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
  IonIcon,
  IonButtons
} from '@ionic/vue';
import {
  moonOutline,
  sunnyOutline,
  personOutline,
  logOutOutline
} from 'ionicons/icons';

const router = useRouter();
const userStore = useUserStore();

// Initialize dark mode on mount
onMounted(() => {
  userStore.initDarkMode();
});

// Toggle dark mode from toggle switch
const toggleDarkMode = (event: CustomEvent) => {
  userStore.toggleDarkMode(event.detail.checked);
};

// Toggle dark mode from header button
const toggleDarkModeHeader = () => {
  userStore.toggleDarkMode(!userStore.darkMode);
};

// Handle logout
const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
ion-list-header {
  font-weight: 400;
  text-transform: uppercase;
  font-size: 0.875rem;
  color: var(--ion-color-medium);
}

ion-item h2 {
  font-weight: 400;
  margin: 0;
}

ion-item p {
  margin: 4px 0 0 0;
  font-size: 0.875rem;
  color: var(--ion-color-medium);
}

.logout-container {
  padding: 24px 16px 32px;
}

.logout-container ion-button {
  --background: var(--ion-color-danger);
  --background-hover: var(--ion-color-danger-shade);
  --background-activated: var(--ion-color-danger-shade);
  --background-focused: var(--ion-color-danger-shade);
  --color: var(--ion-color-danger-contrast);
}
</style>
