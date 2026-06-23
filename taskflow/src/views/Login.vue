<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="login-container">
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>Welcome to My Frontend Portfolio</ion-card-subtitle>
            <ion-card-title>
              Sign in to
              <ion-text color="success">Build With Miracle</ion-text>
            </ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <p class="login-description">
              Enter your name to log in
            </p>

            <ion-item lines="none">
              <ion-label position="stacked">Your name</ion-label>
              <ion-input
                v-model="nameInput"
                type="text"
                placeholder="e.g. Gichelle Miracle"
                @keyup.enter="handleLogin"
              ></ion-input>
            </ion-item>
            
            <ion-text v-if="error" color="danger">
              <p class="error-text">{{ error }}</p>
            </ion-text>

            <ion-button 
              expand="block" 
              @click="handleLogin"
              class="ion-margin-top"
            >
              Continue →
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { 
  IonPage, 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle, 
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText
} from '@ionic/vue'

const router = useRouter()
const userStore = useUserStore()
const { isLoggedIn } = storeToRefs(userStore)
const { login } = userStore

const nameInput = ref('')
const error = ref('')

function handleLogin() {
  if (!nameInput.value.trim()) {
    error.value = 'Please enter your name.'
    return
  }
  error.value = ''
  login(nameInput.value.trim())
  router.push('/tabs/tab1')        
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

ion-card {
  max-width: 560px;
  width: 100%;
}

ion-card-subtitle {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

ion-card-title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 800;
  line-height: 1.3;
}

.login-description {
  font-size: 1rem;
  line-height: 1.7;
  opacity: 0.7;
  margin-bottom: 1.5rem;
}

.error-text {
  font-size: 0.82rem;
  margin: 0.5rem 0 0 0;
  padding-left: 1rem;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 1rem;
}
</style>