import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { Preferences } from '@capacitor/preferences'

// Task interface
export interface Task {
  id: number
  name: string
  done: boolean
  priority: 'Low' | 'Medium' | 'High'
  photo?: string
  dueDate?: string
}

// Task updates interface for editTask function
export interface TaskUpdates {
  name?: string
  priority?: 'Low' | 'Medium' | 'High'
  dueDate?: string
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const nextId = ref(1)

  // Count for statistics
  const totalCount = computed(() => tasks.value.length)
  const doneCount = computed(() => tasks.value.filter(task => task.done).length)
  const pendingCount = computed(() => tasks.value.filter(task => !task.done).length)

  // Storage keys
  const TASKS_KEY = 'taskflow-tasks'
  const NEXT_ID_KEY = 'taskflow-next-id'

  // Save tasks to Preferences
  async function saveTasks() {
    await Preferences.set({
      key: TASKS_KEY,
      value: JSON.stringify(tasks.value)
    })
    await Preferences.set({
      key: NEXT_ID_KEY,
      value: String(nextId.value)
    })
  }

  // Load tasks from Preferences
  async function loadTasks() {
    const tasksResult = await Preferences.get({ key: TASKS_KEY })
    const nextIdResult = await Preferences.get({ key: NEXT_ID_KEY })
    
    if (tasksResult.value) {
      tasks.value = JSON.parse(tasksResult.value)
    }
    
    if (nextIdResult.value) {
      nextId.value = Number(nextIdResult.value)
    }
  }

  // Add task with name and optional fields
  function addTask(name: string, priority: 'Low' | 'Medium' | 'High' = 'Low', dueDate?: string) {
    if (!name.trim()) return

    tasks.value.push({
      id: nextId.value++,
      name: name.trim(),
      done: false,
      priority,
      dueDate
    })

    saveTasks()
  }

  // Edit function for task name and priority
  function editTask(id: number, updates: TaskUpdates) {
    const task = tasks.value.find(task => task.id === id)
    if (!task) return

    if (updates.name !== undefined) {
      if (!updates.name.trim()) return
      task.name = updates.name.trim()
    }

    if (updates.priority !== undefined) {
      task.priority = updates.priority
    }

    if (updates.dueDate !== undefined) {
      task.dueDate = updates.dueDate
    }

    saveTasks()
  }

  // Toggles done status
  function toggleTask(id: number) {
    const task = tasks.value.find(task => task.id === id)
    if (task) {
      task.done = !task.done
      saveTasks()
    }
  }

  // Remove Task
  function removeTask(id: number) {
    tasks.value = tasks.value.filter(task => task.id !== id)
    saveTasks()
  }

  // Sets priority
  function setPriority(id: number, priority: 'Low' | 'Medium' | 'High') {
    const task = tasks.value.find(task => task.id === id)
    if (task) {
      task.priority = priority
      saveTasks()
    }
  }
  
  // Adds Photo Path
  function addPhotoToTask(taskId: number, photoPath: string) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.photo = photoPath
      saveTasks()
    }
  }

  // Removes Photo from Task
  function removePhotoFromTask(taskId: number) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.photo = undefined
      saveTasks()
    }
  }

  // Removes Due Date from Task
  function removeDueDate(taskId: number) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.dueDate = undefined
      saveTasks()
    }
  }

  return {
    tasks,
    nextId,
    totalCount,
    doneCount,
    pendingCount,
    loadTasks,
    saveTasks,
    addTask,
    editTask,
    toggleTask,
    removeTask,
    setPriority,
    addPhotoToTask,
    removePhotoFromTask,
    removeDueDate
  }
})