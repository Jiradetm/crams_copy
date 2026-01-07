<script setup lang="ts">
definePageMeta({
  title: 'จัดการพนักงาน',
  layout: 'default'
})

const config = useRuntimeConfig()

// State
const employees = ref<any[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const selectedDepartment = ref('')

// Fetch employees
const fetchEmployees = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('carms_token')
    const response = await $fetch<{ data: any[] }>(`${config.public.apiBase}/employees`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    employees.value = response.data
  } catch (error) {
    console.error('Failed to fetch employees:', error)
  } finally {
    isLoading.value = false
  }
}

// Computed filtered employees
const filteredEmployees = computed(() => {
  let result = employees.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(e => 
      e.firstName?.toLowerCase().includes(query) ||
      e.lastName?.toLowerCase().includes(query) ||
      e.employeeCode?.toLowerCase().includes(query) ||
      e.email?.toLowerCase().includes(query)
    )
  }

  if (selectedDepartment.value) {
    result = result.filter(e => e.department?.name === selectedDepartment.value)
  }

  return result
})

// Get unique departments
const departments = computed(() => {
  const depts = new Set(employees.value.map(e => e.department?.name).filter(Boolean))
  return Array.from(depts)
})

// Lifecycle
onMounted(() => {
  fetchEmployees()
})
</script>

<template>
  <div class="employees-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>🧑‍💼 จัดการพนักงาน</h1>
        <p class="text-muted">จัดการข้อมูลพนักงานในองค์กร</p>
      </div>
      <NuxtLink to="/backoffice/employees/new" class="btn btn-primary">
        <span>➕</span>
        เพิ่มพนักงานใหม่
      </NuxtLink>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="mini-stat">
        <span class="mini-stat-icon">👥</span>
        <div>
          <span class="mini-stat-value">{{ employees.length }}</span>
          <span class="mini-stat-label">พนักงานทั้งหมด</span>
        </div>
      </div>
      <div class="mini-stat">
        <span class="mini-stat-icon">🏢</span>
        <div>
          <span class="mini-stat-value">{{ departments.length }}</span>
          <span class="mini-stat-label">แผนก</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          v-model="searchQuery"
          type="text" 
          class="form-input" 
          placeholder="ค้นหาพนักงาน..."
        />
      </div>
      <select v-model="selectedDepartment" class="form-select">
        <option value="">ทุกแผนก</option>
        <option v-for="dept in departments" :key="dept" :value="dept">
          {{ dept }}
        </option>
      </select>
    </div>

    <!-- Employees Grid -->
    <div class="card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else-if="filteredEmployees.length === 0" class="empty-state">
        <span class="empty-state-icon">🧑‍💼</span>
        <h3 class="empty-state-title">ไม่พบพนักงาน</h3>
        <p class="empty-state-text">ลองเปลี่ยนเงื่อนไขการค้นหา</p>
      </div>

      <div v-else class="employees-grid">
        <div v-for="emp in filteredEmployees" :key="emp.id" class="employee-card">
          <div class="employee-header">
            <div class="employee-avatar">
              {{ emp.firstName?.charAt(0) }}
            </div>
            <div class="employee-status" :class="emp.isActive ? 'active' : 'inactive'"></div>
          </div>
          <div class="employee-info">
            <h4 class="employee-name">{{ emp.firstName }} {{ emp.lastName }}</h4>
            <p class="employee-position">{{ emp.position?.name || '-' }}</p>
            <span class="employee-department badge badge-primary">
              {{ emp.department?.name || '-' }}
            </span>
          </div>
          <div class="employee-details">
            <div class="detail-row">
              <span class="detail-icon">📧</span>
              <span class="detail-text truncate">{{ emp.email }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-icon">📱</span>
              <span class="detail-text">{{ emp.phone || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-icon">🔖</span>
              <span class="detail-text">{{ emp.employeeCode }}</span>
            </div>
          </div>
          <div class="employee-actions">
            <NuxtLink :to="`/backoffice/employees/${emp.id}`" class="btn btn-secondary btn-sm">
              ดูรายละเอียด
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.employees-page {
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

.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.mini-stat-icon {
  font-size: 1.5rem;
}

.mini-stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
}

.mini-stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.filters-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.search-box .form-input {
  padding-left: 48px;
}

.filters-bar .form-select {
  width: 200px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 16px;
}

.employees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.employee-card {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  transition: all var(--transition-fast);
}

.employee-card:hover {
  border-color: var(--primary-500);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.employee-header {
  display: flex;
  justify-content: center;
  position: relative;
  margin-bottom: 16px;
}

.employee-avatar {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  color: white;
  font-size: 2rem;
  font-weight: 600;
}

.employee-status {
  position: absolute;
  bottom: 4px;
  right: calc(50% - 48px);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid var(--bg-secondary);
}

.employee-status.active {
  background: var(--success);
}

.employee-status.inactive {
  background: var(--text-muted);
}

.employee-info {
  text-align: center;
  margin-bottom: 16px;
}

.employee-name {
  font-size: 1.125rem;
  margin-bottom: 4px;
}

.employee-position {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.employee-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.detail-icon {
  width: 20px;
  text-align: center;
}

.detail-text {
  color: var(--text-secondary);
}

.employee-actions {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .stats-row {
    flex-direction: column;
  }
  
  .filters-bar {
    flex-direction: column;
  }
  
  .search-box, .filters-bar .form-select {
    max-width: 100%;
    width: 100%;
  }
}
</style>
