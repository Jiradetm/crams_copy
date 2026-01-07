<script setup lang="ts">
definePageMeta({
  title: 'การแจ้งเตือนรถ',
  layout: 'default'
})

const config = useRuntimeConfig()

// State
const alerts = ref<any[]>([])
const isLoading = ref(true)

// Fetch alerts
const fetchAlerts = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('carms_token')
    const response = await $fetch<{ data: any[] }>(`${config.public.apiBase}/cars/alerts`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    alerts.value = response.data
  } catch (error) {
    console.error('Failed to fetch alerts:', error)
  } finally {
    isLoading.value = false
  }
}

const getAlertIcon = (type: string) => {
  const map: Record<string, string> = {
    'insurance': '🛡️',
    'tax': '📋',
    'oil_change': '🛢️',
    'maintenance': '🔧'
  }
  return map[type] || '⚠️'
}

const getAlertTypeText = (type: string) => {
  const map: Record<string, string> = {
    'insurance': 'ประกันภัย',
    'tax': 'ภาษีรถ',
    'oil_change': 'เปลี่ยนน้ำมันเครื่อง',
    'maintenance': 'ซ่อมบำรุง'
  }
  return map[type] || type
}

onMounted(() => {
  fetchAlerts()
})
</script>

<template>
  <div class="alerts-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>🔔 การแจ้งเตือนรถ</h1>
        <p class="text-muted">การแจ้งเตือนเกี่ยวกับประกัน ภาษี และการซ่อมบำรุง</p>
      </div>
    </div>

    <!-- Alert Stats -->
    <div class="stats-row">
      <div class="mini-stat danger">
        <span class="mini-stat-icon">🔴</span>
        <div>
          <span class="mini-stat-value">{{ alerts.filter(a => a.level === 'danger').length }}</span>
          <span class="mini-stat-label">เร่งด่วน</span>
        </div>
      </div>
      <div class="mini-stat warning">
        <span class="mini-stat-icon">🟡</span>
        <div>
          <span class="mini-stat-value">{{ alerts.filter(a => a.level === 'warning').length }}</span>
          <span class="mini-stat-label">เตือน</span>
        </div>
      </div>
    </div>

    <!-- Alerts List -->
    <div class="card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else-if="alerts.length === 0" class="empty-state">
        <span class="empty-state-icon">✅</span>
        <h3 class="empty-state-title">ไม่มีการแจ้งเตือน</h3>
        <p class="empty-state-text">รถทุกคันอยู่ในสถานะปกติ</p>
      </div>

      <div v-else class="alerts-list">
        <div 
          v-for="alert in alerts" 
          :key="`${alert.carId}-${alert.type}`" 
          class="alert-card"
          :class="`alert-${alert.level}`"
        >
          <div class="alert-icon">
            {{ getAlertIcon(alert.type) }}
          </div>
          <div class="alert-content">
            <div class="alert-header">
              <span class="alert-car">{{ alert.licensePlate }}</span>
              <span class="badge" :class="alert.level === 'danger' ? 'badge-danger' : 'badge-warning'">
                {{ getAlertTypeText(alert.type) }}
              </span>
            </div>
            <p class="alert-message">{{ alert.message }}</p>
            <div class="alert-meta" v-if="alert.expiryDate">
              <span>📅 หมดอายุ: {{ alert.expiryDate }}</span>
            </div>
          </div>
          <div class="alert-action">
            <button class="btn btn-secondary btn-sm">ดำเนินการ</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alerts-page {
  animation: fadeIn 0.3s ease;
}

.page-header {
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
  border-radius: var(--radius-md);
}

.mini-stat.danger {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.mini-stat.warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 16px;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.alert-card.alert-danger {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.alert-card.alert-warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.alert-icon {
  font-size: 2rem;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-glass);
  border-radius: var(--radius-md);
}

.alert-content {
  flex: 1;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.alert-car {
  font-weight: 600;
  font-size: 1.125rem;
}

.alert-message {
  margin-bottom: 8px;
}

.alert-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .alert-card {
    flex-direction: column;
    text-align: center;
  }
  
  .alert-header {
    flex-direction: column;
  }
}
</style>
