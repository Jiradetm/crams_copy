<script setup lang="ts">
definePageMeta({
  title: 'รายการรถ',
  layout: 'default'
})

const config = useRuntimeConfig()

// State
const cars = ref<any[]>([])
const isLoading = ref(true)
const filterType = ref('')
const filterStatus = ref('')

// Fetch cars
const fetchCars = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('carms_token')
    const response = await $fetch<{ data: any[] }>(`${config.public.apiBase}/cars`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    cars.value = response.data
  } catch (error) {
    console.error('Failed to fetch cars:', error)
  } finally {
    isLoading.value = false
  }
}

const filteredCars = computed(() => {
  let result = cars.value
  if (filterType.value) result = result.filter(c => c.usageType === filterType.value)
  if (filterStatus.value) result = result.filter(c => c.status === filterStatus.value)
  return result
})

const getStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    'available': 'badge-success',
    'in-use': 'badge-warning',
    'maintenance': 'badge-danger'
  }
  return map[status] || 'badge-secondary'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'available': 'ว่าง',
    'in-use': 'กำลังใช้งาน',
    'maintenance': 'ซ่อมบำรุง'
  }
  return map[status] || status
}

const getUsageTypeBadge = (type: string) => {
  return type === 'executive' ? 'badge-primary' : 'badge-secondary'
}

const getUsageTypeText = (type: string) => {
  return type === 'executive' ? 'รถผู้บริหาร' : 'รถส่วนกลาง'
}

onMounted(() => {
  fetchCars()
})
</script>

<template>
  <div class="cars-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>🚗 รายการรถ</h1>
        <p class="text-muted">จัดการรถขององค์กร</p>
      </div>
      <button class="btn btn-primary">
        <span>➕</span>
        เพิ่มรถใหม่
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary">🚙</div>
        <div class="stat-content">
          <h3>{{ cars.length }}</h3>
          <p>รถทั้งหมด</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">✅</div>
        <div class="stat-content">
          <h3>{{ cars.filter(c => c.status === 'available').length }}</h3>
          <p>พร้อมใช้งาน</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">🔧</div>
        <div class="stat-content">
          <h3>{{ cars.filter(c => c.status === 'in-use').length }}</h3>
          <p>กำลังใช้งาน</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon danger">⚠️</div>
        <div class="stat-content">
          <h3>{{ cars.filter(c => c.status === 'maintenance').length }}</h3>
          <p>ซ่อมบำรุง</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <select v-model="filterType" class="form-select">
        <option value="">ทุกประเภท</option>
        <option value="pool">รถส่วนกลาง</option>
        <option value="executive">รถผู้บริหาร</option>
      </select>
      <select v-model="filterStatus" class="form-select">
        <option value="">ทุกสถานะ</option>
        <option value="available">ว่าง</option>
        <option value="in-use">กำลังใช้งาน</option>
        <option value="maintenance">ซ่อมบำรุง</option>
      </select>
    </div>

    <!-- Cars Grid -->
    <div class="card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else class="cars-grid">
        <div v-for="car in filteredCars" :key="car.id" class="car-card">
          <div class="car-image">
            🚗
          </div>
          <div class="car-info">
            <div class="car-header">
              <h4 class="car-plate">{{ car.licensePlate }}</h4>
              <span class="badge" :class="getStatusBadge(car.status)">
                {{ getStatusText(car.status) }}
              </span>
            </div>
            <p class="car-model">{{ car.brand }} {{ car.model }} ({{ car.year }})</p>
            <span class="badge" :class="getUsageTypeBadge(car.usageType)">
              {{ getUsageTypeText(car.usageType) }}
            </span>
          </div>
          <div class="car-details">
            <div class="detail-row">
              <span>🎨 สี:</span>
              <span>{{ car.color || '-' }}</span>
            </div>
            <div class="detail-row">
              <span>📏 ไมล์:</span>
              <span>{{ car.currentMileage?.toLocaleString() }} km</span>
            </div>
            <div class="detail-row">
              <span>⛽ น้ำมัน:</span>
              <span>{{ car.fuelLevel }}%</span>
            </div>
          </div>
          <div class="car-actions">
            <NuxtLink :to="`/auto/cars/${car.id}`" class="btn btn-secondary btn-sm">
              รายละเอียด
            </NuxtLink>
            <NuxtLink 
              v-if="car.usageType === 'pool' && car.status === 'available'" 
              :to="`/auto/bookings/new?carId=${car.id}`" 
              class="btn btn-primary btn-sm"
            >
              จองรถ
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cars-page {
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

.cars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.car-card {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-fast);
}

.car-card:hover {
  border-color: var(--primary-500);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.car-image {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: var(--gradient-card);
}

.car-info {
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
}

.car-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.car-plate {
  font-size: 1.25rem;
  font-weight: 700;
}

.car-model {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.car-details {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.detail-row span:first-child {
  color: var(--text-muted);
}

.car-actions {
  padding: 16px;
  display: flex;
  gap: 8px;
  border-top: 1px solid var(--border-light);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .filters-bar {
    flex-direction: column;
  }
  
  .filters-bar .form-select {
    width: 100%;
  }
}
</style>
