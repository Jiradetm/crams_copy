<script setup lang="ts">
definePageMeta({
  title: 'จัดการผู้ใช้งาน',
  layout: 'default'
})

const config = useRuntimeConfig()
const authStore = useAuthStore()

// State
const users = ref<any[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const selectedRole = ref('')
const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedUser = ref<any>(null)

// Form data
const formData = ref({
  email: '',
  password: '',
  employeeId: '',
  systemRole: 'User',
  moduleRoles: [] as string[]
})

// Fetch users
const fetchUsers = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('carms_token')
    const response = await $fetch<{ data: any[] }>(`${config.public.apiBase}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    users.value = response.data
  } catch (error) {
    console.error('Failed to fetch users:', error)
  } finally {
    isLoading.value = false
  }
}

// Computed filtered users
const filteredUsers = computed(() => {
  let result = users.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(u => 
      u.email.toLowerCase().includes(query) ||
      u.employee?.firstName?.toLowerCase().includes(query) ||
      u.employee?.lastName?.toLowerCase().includes(query)
    )
  }

  if (selectedRole.value) {
    result = result.filter(u => u.systemRole === selectedRole.value)
  }

  return result
})

// Modal handlers
const openCreateModal = () => {
  modalMode.value = 'create'
  formData.value = {
    email: '',
    password: '',
    employeeId: '',
    systemRole: 'User',
    moduleRoles: []
  }
  showModal.value = true
}

const openEditModal = (user: any) => {
  modalMode.value = 'edit'
  selectedUser.value = user
  formData.value = {
    email: user.email,
    password: '',
    employeeId: user.employee?.id || '',
    systemRole: user.systemRole,
    moduleRoles: user.moduleRoles || []
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
}

// Save user
const saveUser = async () => {
  // In real app, call API
  closeModal()
  await fetchUsers()
}

// Delete user
const deleteUser = async (userId: string) => {
  if (!confirm('ต้องการลบผู้ใช้นี้หรือไม่?')) return
  
  try {
    const token = localStorage.getItem('carms_token')
    await $fetch(`${config.public.apiBase}/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    await fetchUsers()
  } catch (error) {
    console.error('Failed to delete user:', error)
  }
}

// Get role badge class
const getRoleBadge = (role: string) => {
  return role === 'Admin' ? 'badge-primary' : 'badge-secondary'
}

// Lifecycle
onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="users-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>👤 จัดการผู้ใช้งาน</h1>
        <p class="text-muted">จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึงระบบ</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        <span>➕</span>
        เพิ่มผู้ใช้ใหม่
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          v-model="searchQuery"
          type="text" 
          class="form-input" 
          placeholder="ค้นหาผู้ใช้..."
        />
      </div>
      <select v-model="selectedRole" class="form-select">
        <option value="">ทุกบทบาท</option>
        <option value="Admin">Admin</option>
        <option value="User">User</option>
      </select>
    </div>

    <!-- Users Table -->
    <div class="card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="empty-state">
        <span class="empty-state-icon">👤</span>
        <h3 class="empty-state-title">ไม่พบผู้ใช้</h3>
        <p class="empty-state-text">ลองเปลี่ยนเงื่อนไขการค้นหา</p>
      </div>

      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ผู้ใช้</th>
              <th>อีเมล</th>
              <th>บทบาท</th>
              <th>Module Roles</th>
              <th>สถานะ</th>
              <th>เข้าสู่ระบบล่าสุด</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">
                    {{ user.employee?.firstName?.charAt(0) || 'U' }}
                  </div>
                  <div class="user-info">
                    <span class="user-name">
                      {{ user.employee?.firstName }} {{ user.employee?.lastName }}
                    </span>
                    <span class="user-code">{{ user.employee?.employeeCode || '-' }}</span>
                  </div>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge" :class="getRoleBadge(user.systemRole)">
                  {{ user.systemRole }}
                </span>
              </td>
              <td>
                <div class="module-roles">
                  <span 
                    v-for="role in user.moduleRoles" 
                    :key="role" 
                    class="badge badge-info"
                  >
                    {{ role }}
                  </span>
                  <span v-if="!user.moduleRoles?.length" class="text-muted">-</span>
                </div>
              </td>
              <td>
                <span class="badge" :class="user.isActive ? 'badge-success' : 'badge-danger'">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="text-muted text-sm">
                {{ user.lastLogin ? new Date(user.lastLogin).toLocaleString('th-TH') : 'ยังไม่เคยเข้าสู่ระบบ' }}
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-ghost btn-sm" @click="openEditModal(user)" title="แก้ไข">
                    ✏️
                  </button>
                  <button 
                    class="btn btn-ghost btn-sm" 
                    @click="deleteUser(user.id)"
                    title="ลบ"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ modalMode === 'create' ? '➕ เพิ่มผู้ใช้ใหม่' : '✏️ แก้ไขผู้ใช้' }}
          </h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">อีเมล *</label>
            <input 
              v-model="formData.email"
              type="email" 
              class="form-input" 
              placeholder="user@example.com"
            />
          </div>
          <div class="form-group" v-if="modalMode === 'create'">
            <label class="form-label">รหัสผ่าน *</label>
            <input 
              v-model="formData.password"
              type="password" 
              class="form-input" 
              placeholder="••••••••"
            />
          </div>
          <div class="form-group">
            <label class="form-label">บทบาทระบบ</label>
            <select v-model="formData.systemRole" class="form-select">
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">ยกเลิก</button>
          <button class="btn btn-primary" @click="saveUser">
            {{ modalMode === 'create' ? 'สร้างผู้ใช้' : 'บันทึกการเปลี่ยนแปลง' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.users-page {
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  color: white;
  font-weight: 600;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
}

.user-code {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.module-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.module-roles .badge {
  font-size: 0.625rem;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .filters-bar {
    flex-direction: column;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .filters-bar .form-select {
    width: 100%;
  }
}
</style>
