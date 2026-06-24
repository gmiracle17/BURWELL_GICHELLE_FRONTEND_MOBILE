<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="auth-container">
        <ion-card class="auth-card">
          <ion-card-header>
            <ion-card-subtitle>Join TaskFlow</ion-card-subtitle>
            <ion-card-title>
              Create your
              <ion-text color="success">Account</ion-text>
            </ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <ion-item lines="none">
              <ion-label position="stacked">Enter your name</ion-label>
              <ion-input v-model="nameInput" type="text" placeholder="e.g. Gichelle Miracle" @keyup.enter="handleRegister"></ion-input>
            </ion-item>
            
            <ion-text v-if="error" color="danger">
              <p class="auth-error-text">{{ error }}</p>
            </ion-text>

            <ion-button expand="block" @click="handleRegister" class="ion-margin-top"> Create Account → </ion-button>

            <div class="auth-link">
              Already have an account? <router-link to="/login">Login here</router-link>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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
const { register } = userStore

const nameInput = ref('')
const error = ref('')

function handleRegister() {
  if (!nameInput.value.trim()) {
    error.value = 'Please enter your name.'
    return
  }
  error.value = ''
  register(nameInput.value.trim())
  router.push('/tabs/tab1')        
}
</script>

<style scoped>
@import '@/theme/login.css';
</style>