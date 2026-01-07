<script setup lang="ts">
definePageMeta({
  title: 'จัดการแผนก',
  layout: 'default'
})

const config = useRuntimeConfig()

// State
const departments = ref<any[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const formData = ref({ name: '', code: '' })

// Fetch departments
const fetchDepartments = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('carms_token')
    const response = await $fetch<{ data: any[] }>(`${config.public.apiBase}/departments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    departments.value = response.data
  } catch (error) {
    console.error('Failed to fetch departments:', error)
  } finally {
    isLoading.value = false
  }
}

const openModal = () => {
  formData.value = { name: '', code: '' }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveDepartment = async () => {
  try {
    const token = localStorage.getItem('carms_token')
    await $fetch(`${config.public.apiBase}/departments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData.value
    })
    closeModal()
    await fetchDepartments()
  } catch (error) {
    console.error('Failed to create department:', error)
  }
}

onMounted(() => {
  fetchDepartments()
})
</script>

<template>
  <div class="departments-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>🏢 จัดการแผนก</h1>
        <p class="text-muted">จัดการโครงสร้างแผนกในองค์กร</p>
      </div>
      <button class="btn btn-primary" @click="openModal">
        <span>➕</span>
        เพิ่มแผนกใหม่
      </button>
    </div>

    <!-- Departments Grid -->
    <div class="card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else class="departments-grid">
        <div v-for="dept in departments" :key="dept.id" class="department-card">
          <div class="dept-icon">🏢</div>
          <div class="dept-info">
            <h4>{{ dept.name }}</h4>
            <span class="badge badge-primary">{{ dept.code }}</span>
          </div>
          <div class="dept-actions">
            <button class="btn btn-ghost btn-sm">✏️</button>
            <button class="btn btn-ghost btn-sm">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">➕ เพิ่มแผนกใหม่</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">ชื่อแผนก *</label>
            <input v-model="formData.name" type="text" class="form-input" placeholder="เช่น Human Resources" />
          </div>
          <div class="form-group">
            <label class="form-label">รหัสแผนก *</label>
            <input v-model="formData.code" type="text" class="form-input" placeholder="เช่น HR" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">ยกเลิก</button>
          <button class="btn btn-primary" @click="saveDepartment">สร้างแผนก</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.departments-page {
  animation: fadeIn 0.3s ease;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-content h1 {
  margin-bottom: 4px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 16px;
}

.departments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.department-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.department-card:hover {
  border-color: var(--primary-500);
}

.dept-icon {
  font-size: 2rem;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.2);
  border-radius: var(--radius-md);
}

.dept-info {
  flex: 1;
}

.dept-info h4 {
  margin-bottom: 4px;
}

.dept-actions {
  display: flex;
  gap: 4px;
}
</style>
