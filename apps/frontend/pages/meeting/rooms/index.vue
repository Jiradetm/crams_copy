<script setup lang="ts">
definePageMeta({
  title: 'จัดการห้องประชุม',
  layout: 'default'
})

const config = useRuntimeConfig()

// State
const rooms = ref<any[]>([])
const isLoading = ref(true)

// Fetch rooms
const fetchRooms = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('carms_token')
    const response = await $fetch<{ data: any[] }>(`${config.public.apiBase}/meeting-rooms`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    rooms.value = response.data
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchRooms()
})
</script>

<template>
  <div class="rooms-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>🚪 จัดการห้องประชุม</h1>
        <p class="text-muted">จัดการข้อมูลห้องประชุมทั้งหมด</p>
      </div>
      <button class="btn btn-primary">
        <span>➕</span>
        เพิ่มห้องประชุม
      </button>
    </div>

    <!-- Rooms Grid -->
    <div class="card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else class="rooms-grid">
        <div v-for="room in rooms" :key="room.id" class="room-card">
          <div class="room-image">
            🏛️
          </div>
          <div class="room-info">
            <h4>{{ room.name }}</h4>
            <p class="room-name-en">{{ room.nameEn || '-' }}</p>
            <div class="room-meta">
              <span class="badge badge-primary">👥 {{ room.capacity }} ที่นั่ง</span>
              <span class="badge badge-secondary">📍 {{ room.building }} ชั้น {{ room.floor }}</span>
            </div>
          </div>
          <div class="room-facilities">
            <h5>อุปกรณ์ในห้อง:</h5>
            <div class="facilities-list">
              <span v-for="facility in room.facilities" :key="facility" class="facility-tag">
                {{ facility }}
              </span>
            </div>
          </div>
          <div class="room-actions">
            <button class="btn btn-secondary btn-sm">✏️ แก้ไข</button>
            <button class="btn btn-ghost btn-sm">🗑️ ลบ</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rooms-page {
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

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.room-card {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-fast);
}

.room-card:hover {
  border-color: var(--primary-500);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.room-image {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: var(--gradient-card);
}

.room-info {
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
}

.room-info h4 {
  margin-bottom: 4px;
}

.room-name-en {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.room-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.room-facilities {
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
}

.room-facilities h5 {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.facilities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.facility-tag {
  padding: 4px 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
}

.room-actions {
  padding: 16px;
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .rooms-grid {
    grid-template-columns: 1fr;
  }
}
</style>
