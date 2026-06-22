import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref('')
  const isLoggedIn = ref(false)

  // Login with name
  function login(name) {
    if (!name.trim()) return
    currentUser.value = name.trim()
    isLoggedIn.value = true
  }

  // Logout and turn isLoggedIn to false
  function logout() {
    currentUser.value = ''
    isLoggedIn.value = false
  }

  return { currentUser, isLoggedIn, login, logout }
}, {
  persist: true
})