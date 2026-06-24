<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
</script>

<style>
ion-router-outlet {
  contain: layout style size;
}

.ion-page {
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.ion-page-invisible {
  opacity: 0;
}

ion-button, ion-chip, ion-fab-button, ion-item, ion-card {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

ion-button:hover, ion-chip:hover, ion-item:hover {
  transform: translateY(-1px);
}

ion-fab-button:hover {
  transform: scale(1.05);
}

* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

ion-modal {
  --backdrop-opacity: 0.6;
}

ion-modal::part(backdrop) {
  transition: opacity 0.3s ease-in-out;
}

ion-modal::part(content) {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out;
}

ion-content {
  --offset-bottom: auto !important;
  --overflow: hidden;
  overflow: auto;
  scroll-behavior: smooth;
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

ion-ripple-effect {
  --ripple-color: currentColor;
}
</style>
