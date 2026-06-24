import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTaskStore = defineStore('tasks', () => {

  const tasks  = ref([])
  const nextId = ref(1)

  // Count for statistics
  const totalCount   = computed(() => tasks.value.length)
  const doneCount    = computed(() => tasks.value.filter(task => task.done).length)
  const pendingCount = computed(() => tasks.value.filter(task => !task.done).length)

  // Add task with name
  function addTask(name: string, dueDate: string | null = null) {
    if (!name.trim()) return // guard against empty name

    // Push new task details
    tasks.value.push({
      id: nextId.value++,
      name: name.trim(),
      done: false,
      dueDate,
      priority: 'Low'
    })
  }

  // Edit function for task name and dueDate
  function editTask(id, updates) {
    const task = tasks.value.find(task => task.id === id)
    if (!task) return

    // Edit name
    if (updates.name !== undefined) {
      if (!updates.name.trim()) return   // guard against empty name
      task.name = updates.name.trim()
    }
  }

  // Toggles done status
  function toggleTask(id: number) {
    const task = tasks.value.find(task => task.id === id)
    if (task) task.done = !task.done
  }

  // Remove Task
  function removeTask(id: number) {
    tasks.value = tasks.value.filter(task => task.id !== id)
  }

  // Sets priority
  function setPriority(id: number, priority: 'Low' | 'Medium' | 'High') {
    const task = tasks.value.find(task => task.id === id)
    if (task) task.priority = priority
  }

  function addPhotoToTask(taskId, photoPath) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) task.photo = photoPath
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
    addPhotoToTask
  }

}, { persist: true })