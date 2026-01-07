<script setup lang="ts">
definePageMeta({
  title: 'สรุปการลา',
  layout: 'default'
})

const config = useRuntimeConfig()

// State
const leaveRequests = ref<any[]>([])
const quota = ref<any>(null)
const isLoading = ref(true)

// Fetch data
const fetchData = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('carms_token')
    const [requestsRes, quotaRes] = await Promise.all([
      $fetch<{ data: any[] }>(`${config.public.apiBase}/leave-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      $fetch<any>(`${config.public.apiBase}/leave-requests/my-quota`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
    leaveRequests.value = requestsRes.data
    quota.value = quotaRes
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    isLoading.value = false
  }
}

const pendingRequests = computed(() => leaveRequests.value.filter(r => r.status === 'pending'))
const recentRequests = computed(() => leaveRequests.value.slice(0, 5))

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

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="leave-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>🏖️ สรุปการลา</h1>
        <p class="text-muted">ภาพรวมการลางานของคุณ</p>
      </div>
      <NuxtLink to="/leave/requests/new" class="btn btn-primary">
        <span>➕</span>
        ขอลางาน
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <div v-else>
      <!-- Leave Quota -->
      <div class="quota-section">
        <h3>📊 โควต้าวันลาปี 2569</h3>
        <div class="quota-grid">
          <div v-for="q in quota?.quotas" :key="q.leaveTypeId" class="quota-card">
            <div class="quota-header">
              <span class="quota-type">{{ q.leaveType }}</span>
              <span class="quota-remaining">เหลือ {{ q.remaining }} วัน</span>
            </div>
            <div class="quota-bar">
              <div 
                class="quota-used" 
                :style="{ width: `${(q.used / q.total) * 100}%` }"
              ></div>
            </div>
            <div class="quota-detail">
              <span>ใช้ไป {{ q.used }}/{{ q.total }} วัน</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Requests -->
      <div v-if="pendingRequests.length > 0" class="pending-section">
        <h3>⏳ รออนุมัติ</h3>
        <div class="pending-list">
          <div v-for="request in pendingRequests" :key="request.id" class="pending-card">
            <div class="pending-info">
              <span class="badge badge-warning">{{ request.leaveType?.name }}</span>
              <p class="pending-dates">{{ request.startDate }} - {{ request.endDate }} ({{ request.days }} วัน)</p>
              <p class="pending-reason">{{ request.reason }}</p>
            </div>
            <div class="pending-actions">
              <button class="btn btn-ghost btn-sm">ดูรายละเอียด</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Requests -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📋 ประวัติการลาล่าสุด</h3>
          <NuxtLink to="/leave/requests" class="btn btn-ghost btn-sm">ดูทั้งหมด</NuxtLink>
        </div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>ประเภท</th>
                <th>วันที่</th>
                <th>จำนวนวัน</th>
                <th>เหตุผล</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in recentRequests" :key="request.id">
                <td>
                  <span class="badge badge-primary">{{ request.leaveType?.name }}</span>
                </td>
                <td>{{ request.startDate }} - {{ request.endDate }}</td>
                <td>{{ request.days }} วัน</td>
                <td class="truncate" style="max-width: 200px;">{{ request.reason }}</td>
                <td>
                  <span class="badge" :class="getStatusBadge(request.status)">
                    {{ getStatusText(request.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.leave-page {
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

/* Quota Section */
.quota-section {
  margin-bottom: 24px;
}

.quota-section h3 {
  margin-bottom: 16px;
}

.quota-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.quota-card {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
}

.quota-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.quota-type {
  font-weight: 600;
}

.quota-remaining {
  color: var(--success);
  font-weight: 600;
}

.quota-bar {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 8px;
}

.quota-used {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  transition: width 0.5s ease;
}

.quota-detail {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Pending Section */
.pending-section {
  margin-bottom: 24px;
}

.pending-section h3 {
  margin-bottom: 16px;
}

.pending-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pending-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: var(--radius-md);
}

.pending-dates {
  font-weight: 500;
  margin: 8px 0 4px;
}

.pending-reason {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
