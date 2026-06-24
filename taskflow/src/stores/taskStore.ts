import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// Task interface
export interface Task {
  id: number
  name: string
  done: boolean
  priority: 'Low' | 'Medium' | 'High'
  photo?: string
}

// Task updates interface for editTask function
export interface TaskUpdates {
  name?: string
  priority?: 'Low' | 'Medium' | 'High'
}

export const useTaskStore = defineStore('tasks', () => {
  const storedTasks = localStorage.getItem('taskflow-tasks')
  const storedNextId = localStorage.getItem('taskflow-next-id')

  const tasks = ref<Task[]>(storedTasks ? JSON.parse(storedTasks) : [])
  const nextId = ref(storedNextId ? Number(storedNextId) : 1)

  // Count for statistics
  const totalCount = computed(() => tasks.value.length)
  const doneCount = computed(() => tasks.value.filter(task => task.done).length)
  const pendingCount = computed(() => tasks.value.filter(task => !task.done).length)

  function persistTasks() {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks.value))
    localStorage.setItem('taskflow-next-id', String(nextId.value))
  }

  // Add task with name
  function addTask(name: string) {
    if (!name.trim()) return

    tasks.value.push({
      id: nextId.value++,
      name: name.trim(),
      done: false,
      priority: 'Low'
    })

    persistTasks()
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

    persistTasks()
  }

  // Toggles done status
  function toggleTask(id: number) {
    const task = tasks.value.find(task => task.id === id)
    if (task) {
      task.done = !task.done
      persistTasks()
    }
  }

  // Remove Task
  function removeTask(id: number) {
    tasks.value = tasks.value.filter(task => task.id !== id)
    persistTasks()
  }

  // Sets priority
  function setPriority(id: number, priority: 'Low' | 'Medium' | 'High') {
    const task = tasks.value.find(task => task.id === id)
    if (task) {
      task.priority = priority
      persistTasks()
    }
  }
  
  // Adds Photo Path
  function addPhotoToTask(taskId: number, photoPath: string) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.photo = photoPath
      persistTasks()
    }
  }

  // Removes Photo from Task
  function removePhotoFromTask(taskId: number) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.photo = undefined
      persistTasks()
    }
  }

  return {
    tasks,
    nextId,
    totalCount,
    doneCount,
    pendingCount,
    addTask,
    editTask,
    toggleTask,
    removeTask,
    setPriority,
    addPhotoToTask,
    removePhotoFromTask
  }
})