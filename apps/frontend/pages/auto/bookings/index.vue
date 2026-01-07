<script setup lang="ts">
definePageMeta({
  title: 'การจองรถ',
  layout: 'default'
})

const config = useRuntimeConfig()

// State
const bookings = ref<any[]>([])
const isLoading = ref(true)
const filterStatus = ref('')

// Fetch bookings
const fetchBookings = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('carms_token')
    const response = await $fetch<{ data: any[] }>(`${config.public.apiBase}/car-bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    bookings.value = response.data
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
  } finally {
    isLoading.value = false
  }
}

const filteredBookings = computed(() => {
  if (!filterStatus.value) return bookings.value
  return bookings.value.filter(b => b.status === filterStatus.value)
})

const getStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    'pending': 'badge-warning',
    'approved': 'badge-success',
    'rejected': 'badge-danger',
    'in-use': 'badge-info',
    'completed': 'badge-secondary',
    'cancelled': 'badge-danger'
  }
  return map[status] || 'badge-secondary'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'pending': 'รออนุมัติ',
    'approved': 'อนุมัติแล้ว',
    'rejected': 'ปฏิเสธ',
    'in-use': 'กำลังใช้งาน',
    'completed': 'เสร็จสิ้น',
    'cancelled': 'ยกเลิก'
  }
  return map[status] || status
}

onMounted(() => {
  fetchBookings()
})
</script>

<template>
  <div class="bookings-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>📅 การจองรถ</h1>
        <p class="text-muted">จัดการการจองรถส่วนกลาง</p>
      </div>
      <NuxtLink to="/auto/bookings/new" class="btn btn-primary">
        <span>➕</span>
        จองรถใหม่
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <select v-model="filterStatus" class="form-select">
        <option value="">ทุกสถานะ</option>
        <option value="pending">รออนุมัติ</option>
        <option value="approved">อนุมัติแล้ว</option>
        <option value="in-use">กำลังใช้งาน</option>
        <option value="completed">เสร็จสิ้น</option>
        <option value="cancelled">ยกเลิก</option>
      </select>
    </div>

    <!-- Bookings Table -->
    <div class="card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else-if="filteredBookings.length === 0" class="empty-state">
        <span class="empty-state-icon">📅</span>
        <h3 class="empty-state-title">ไม่มีการจอง</h3>
        <p class="empty-state-text">ยังไม่มีการจองรถ</p>
        <NuxtLink to="/auto/bookings/new" class="btn btn-primary">จองรถใหม่</NuxtLink>
      </div>

      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>รถ</th>
              <th>ผู้จอง</th>
              <th>วัตถุประสงค์</th>
              <th>วันที่</th>
              <th>สถานะ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in filteredBookings" :key="booking.id">
              <td>
                <div class="car-cell">
                  <span class="car-icon">🚗</span>
                  <div>
                    <strong>{{ booking.car?.licensePlate }}</strong>
                    <span class="text-muted text-sm">{{ booking.car?.brand }} {{ booking.car?.model }}</span>
                  </div>
                </div>
              </td>
              <td>{{ booking.employee?.name || '-' }}</td>
              <td>
                <div class="purpose-cell">
                  <p>{{ booking.purpose }}</p>
                  <span class="text-muted text-sm" v-if="booking.destination">
                    📍 {{ booking.destination }}
                  </span>
                </div>
              </td>
              <td>
                <div class="date-cell">
                  <span>{{ booking.startDate }}</span>
                  <span class="text-muted">→</span>
                  <span>{{ booking.endDate }}</span>
                </div>
              </td>
              <td>
                <span class="badge" :class="getStatusBadge(booking.status)">
                  {{ getStatusText(booking.status) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-ghost btn-sm" title="ดูรายละเอียด">👁️</button>
                  <button 
                    v-if="booking.status === 'pending'"
                    class="btn btn-success btn-sm"
                    title="อนุมัติ"
                  >
                    ✅
                  </button>
                  <button 
                    v-if="booking.status === 'pending'"
                    class="btn btn-danger btn-sm" 
                    title="ปฏิเสธ"
                  >
                    ❌
                  </button>
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
.bookings-page {
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

.car-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.car-icon {
  font-size: 1.5rem;
}

.car-cell div {
  display: flex;
  flex-direction: column;
}

.purpose-cell p {
  margin-bottom: 4px;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 4px;
}
</style>
