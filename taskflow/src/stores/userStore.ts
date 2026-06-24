import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // Load from localStorage
  const storedUser = localStorage.getItem('currentUser')
  const storedLoggedIn = localStorage.getItem('isLoggedIn')
  const storedDarkMode = localStorage.getItem('darkMode')

  const currentUser = ref(storedUser || '')
  const isLoggedIn = ref(storedLoggedIn === 'true')
  const darkMode = ref(storedDarkMode === 'true')

  // Watch and persist to localStorage
  watch(currentUser, (newVal) => {
    localStorage.setItem('currentUser', newVal)
  })

  watch(isLoggedIn, (newVal) => {
    localStorage.setItem('isLoggedIn', String(newVal))
  })

  watch(darkMode, (newVal) => {
    localStorage.setItem('darkMode', String(newVal))
  })

  // Login with name
  function login(name: string) {
    if (!name.trim()) return
    currentUser.value = name.trim()
    isLoggedIn.value = true
  }

  // Register with name
  function register(name: string) {
    if (!name.trim()) return
    currentUser.value = name.trim()
    isLoggedIn.value = true
  }

  // Logout and turn isLoggedIn to false
  function logout() {
    currentUser.value = ''
    isLoggedIn.value = false
  }

  // Toggle dark mode
  function toggleDarkMode(enabled: boolean) {
    darkMode.value = enabled
    document.body.classList.toggle('dark', enabled)
  }

  // Initialize dark mode from stored preference
  function initDarkMode() {
    document.body.classList.toggle('dark', darkMode.value)
  }

  return { currentUser, isLoggedIn, darkMode, login, register, logout, toggleDarkMode, initDarkMode }
})