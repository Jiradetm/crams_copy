<script setup lang="ts">
definePageMeta({
  title: 'คำขอลางาน',
  layout: 'default'
})

const config = useRuntimeConfig()
const authStore = useAuthStore()

// State
const leaveRequests = ref<any[]>([])
const isLoading = ref(true)
const filterStatus = ref('')

// Fetch leave requests
const fetchRequests = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('carms_token')
    const response = await $fetch<{ data: any[] }>(`${config.public.apiBase}/leave-requests`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    leaveRequests.value = response.data
  } catch (error) {
    console.error('Failed to fetch requests:', error)
  } finally {
    isLoading.value = false
  }
}

const filteredRequests = computed(() => {
  if (!filterStatus.value) return leaveRequests.value
  return leaveRequests.value.filter(r => r.status === filterStatus.value)
})

const getStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    'pending': 'badge-warning',
    'approved': 'badge-success',
    'rejected': 'badge-danger',
    'cancelled': 'badge-secondary'
  }
  return map[status] || 'badge-secondary'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'pending': 'รออนุมัติ',
    'approved': 'อนุมัติแล้ว',
    'rejected': 'ปฏิเสธ',
    'cancelled': 'ยกเลิก'
  }
  return map[status] || status
}

const approveRequest = async (id: string) => {
  try {
    const token = localStorage.getItem('carms_token')
    await $fetch(`${config.public.apiBase}/leave-requests/${id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'approved' }
    })
    await fetchRequests()
  } catch (error) {
    console.error('Failed to approve:', error)
  }
}

const rejectRequest = async (id: string) => {
  try {
    const token = localStorage.getItem('carms_token')
    await $fetch(`${config.public.apiBase}/leave-requests/${id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: 'rejected' }
    })
    await fetchRequests()
  } catch (error) {
    console.error('Failed to reject:', error)
  }
}

onMounted(() => {
  fetchRequests()
})
</script>

<template>
  <div class="requests-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>✍️ คำขอลางาน</h1>
        <p class="text-muted">จัดการคำขอลางานทั้งหมด</p>
      </div>
      <NuxtLink to="/leave/requests/new" class="btn btn-primary">
        <span>➕</span>
        ขอลางานใหม่
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <select v-model="filterStatus" class="form-select">
        <option value="">ทุกสถานะ</option>
        <option value="pending">รออนุมัติ</option>
        <option value="approved">อนุมัติแล้ว</option>
        <option value="rejected">ปฏิเสธ</option>
        <option value="cancelled">ยกเลิก</option>
      </select>
    </div>

    <!-- Requests Table -->
    <div class="card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else-if="filteredRequests.length === 0" class="empty-state">
        <span class="empty-state-icon">📋</span>
        <h3 class="empty-state-title">ไม่มีคำขอลา</h3>
        <p class="empty-state-text">ยังไม่มีคำขอลางาน</p>
      </div>

      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>พนักงาน</th>
              <th>ประเภทการลา</th>
              <th>วันที่</th>
              <th>จำนวนวัน</th>
              <th>เหตุผล</th>
              <th>สถานะ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in filteredRequests" :key="request.id">
              <td>
                <div class="employee-cell">
                  <div class="employee-avatar">
                    {{ request.employee?.name?.charAt(0) || 'U' }}
                  </div>
                  <span>{{ request.employee?.name || '-' }}</span>
                </div>
              </td>
              <td>
                <span class="badge badge-primary">{{ request.leaveType?.name }}</span>
              </td>
              <td>
                <div class="date-cell">
                  <span>{{ request.startDate }}</span>
                  <span class="text-muted" v-if="request.startDate !== request.endDate">
                    → {{ request.endDate }}
                  </span>
                </div>
              </td>
              <td>{{ request.days }} วัน</td>
              <td class="truncate" style="max-width: 200px;">{{ request.reason }}</td>
              <td>
                <span class="badge" :class="getStatusBadge(request.status)">
                  {{ getStatusText(request.status) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-ghost btn-sm" title="ดูรายละเอียด">👁️</button>
                  <template v-if="request.status === 'pending' && authStore.isAdmin">
                    <button 
                      class="btn btn-success btn-sm"
                      @click="approveRequest(request.id)"
                      title="อนุมัติ"
                    >
                      ✅
                    </button>
                    <button 
                      class="btn btn-danger btn-sm"
                      @click="rejectRequest(request.id)"
                      title="ปฏิเสธ"
                    >
                      ❌
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.requests-page {
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
  margin-bottom: 24px;
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

.employee-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.date-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.875rem;
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
}
</style>
