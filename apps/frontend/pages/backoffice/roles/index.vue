<script setup lang="ts">
definePageMeta({
  title: 'จัดการบทบาท',
  layout: 'default'
})

const config = useRuntimeConfig()

// State
const roles = ref<any[]>([])
const isLoading = ref(true)

// Fetch roles
const fetchRoles = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('carms_token')
    const response = await $fetch<{ data: any[] }>(`${config.public.apiBase}/roles`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    roles.value = response.data
  } catch (error) {
    console.error('Failed to fetch roles:', error)
  } finally {
    isLoading.value = false
  }
}

const systemRoles = computed(() => roles.value.filter(r => r.type === 'system'))
const moduleRoles = computed(() => roles.value.filter(r => r.type === 'module'))

onMounted(() => {
  fetchRoles()
})
</script>

<template>
  <div class="roles-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>🎖️ จัดการบทบาท</h1>
        <p class="text-muted">จัดการสิทธิ์และบทบาทในระบบ</p>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <div v-else class="roles-grid">
      <!-- System Roles -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">🔐 บทบาทระบบ (System Roles)</h3>
        </div>
        <div class="roles-list">
          <div v-for="role in systemRoles" :key="role.id" class="role-item">
            <div class="role-icon system">🛡️</div>
            <div class="role-info">
              <h4>{{ role.name }}</h4>
              <span class="badge badge-primary">{{ role.code }}</span>
              <p>{{ role.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Module Roles -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📦 บทบาทโมดูล (Module Roles)</h3>
          <button class="btn btn-primary btn-sm">➕ เพิ่มบทบาท</button>
        </div>
        <div class="roles-list">
          <div v-for="role in moduleRoles" :key="role.id" class="role-item">
            <div class="role-icon module">🏷️</div>
            <div class="role-info">
              <h4>{{ role.name }}</h4>
              <span class="badge badge-info">{{ role.code }}</span>
              <p>{{ role.description }}</p>
            </div>
            <div class="role-actions">
              <button class="btn btn-ghost btn-sm">✏️</button>
              <button class="btn btn-ghost btn-sm">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.roles-page {
  animation: fadeIn 0.3s ease;
}

.page-header {
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

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.roles-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.role-item:hover {
  background: var(--bg-glass-hover);
}

.role-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-size: 1.5rem;
}

.role-icon.system { background: rgba(99, 102, 241, 0.2); }
.role-icon.module { background: rgba(59, 130, 246, 0.2); }

.role-info {
  flex: 1;
}

.role-info h4 {
  margin-bottom: 4px;
}

.role-info p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 8px;
}

.role-actions {
  display: flex;
  gap: 4px;
}

@media (max-width: 768px) {
  .roles-grid {
    grid-template-columns: 1fr;
  }
}
</style>
