<script setup lang="ts">
definePageMeta({
  title: 'แดชบอร์ด',
  layout: 'default'
})

// Mock stats data
const stats = ref([
  { title: 'พนักงานทั้งหมด', value: 156, icon: '👥', type: 'primary', change: '+12%' },
  { title: 'การจองรถวันนี้', value: 8, icon: '🚗', type: 'info', change: '+3' },
  { title: 'การประชุมวันนี้', value: 12, icon: '🏛️', type: 'warning', change: '5 ห้อง' },
  { title: 'คำขอลารออนุมัติ', value: 5, icon: '📋', type: 'danger', change: 'Pending' },
])

// Mock recent activities
const activities = ref([
  { id: 1, type: 'leave', user: 'สมชาย ใจดี', action: 'ยื่นขอลาพักร้อน', time: '5 นาทีที่แล้ว', status: 'pending' },
  { id: 2, type: 'car', user: 'สมหญิง รักงาน', action: 'จองรถ กข 1234', time: '15 นาทีที่แล้ว', status: 'approved' },
  { id: 3, type: 'meeting', user: 'วิชัย เก่งมาก', action: 'จองห้องประชุม A', time: '30 นาทีที่แล้ว', status: 'confirmed' },
  { id: 4, type: 'leave', user: 'มานี มีทรัพย์', action: 'ลาป่วย 1 วัน', time: '1 ชั่วโมงที่แล้ว', status: 'approved' },
])

// Mock upcoming events
const upcomingEvents = ref([
  { id: 1, title: 'ประชุมทีม HR', time: '10:00 - 12:00', room: 'ห้องประชุม A', attendees: 10 },
  { id: 2, title: 'Sprint Planning', time: '14:00 - 16:00', room: 'ห้องประชุม B1', attendees: 6 },
  { id: 3, title: 'Review ผลงาน Q4', time: '16:30 - 17:30', room: 'ห้องประชุม A', attendees: 15 },
])

// Mock car alerts
const carAlerts = ref([
  { id: 1, car: 'กข 1234', type: 'insurance', message: 'ประกันภัยหมดอายุใน 15 วัน', level: 'warning' },
  { id: 2, car: 'ขค 5678', type: 'tax', message: 'ภาษีรถหมดอายุใน 30 วัน', level: 'warning' },
])

const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    pending: 'badge-warning',
    approved: 'badge-success',
    confirmed: 'badge-info',
    rejected: 'badge-danger'
  }
  return badges[status] || 'badge-secondary'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: 'รออนุมัติ',
    approved: 'อนุมัติแล้ว',
    confirmed: 'ยืนยันแล้ว',
    rejected: 'ปฏิเสธ'
  }
  return texts[status] || status
}
</script>

<template>
  <div class="dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section animate-fade-in">
      <div class="welcome-content">
        <h1>สวัสดี, สมชาย! 👋</h1>
        <p class="text-muted">ยินดีต้อนรับกลับมา นี่คือภาพรวมของวันนี้</p>
      </div>
      <div class="welcome-date">
        <span class="date-icon">📅</span>
        <div>
          <p class="date-day">วันอังคาร</p>
          <p class="date-full">7 มกราคม 2569</p>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div 
        v-for="stat in stats" 
        :key="stat.title" 
        class="stat-card animate-slide-up"
      >
        <div class="stat-icon" :class="stat.type">
          {{ stat.icon }}
        </div>
        <div class="stat-content">
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.title }}</p>
          <span class="stat-change" :class="stat.type">{{ stat.change }}</span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Recent Activities -->
      <div class="card animate-slide-in">
        <div class="card-header">
          <h3 class="card-title">📋 กิจกรรมล่าสุด</h3>
          <NuxtLink to="/activities" class="btn btn-ghost btn-sm">ดูทั้งหมด</NuxtLink>
        </div>
        <div class="activity-list">
          <div v-for="activity in activities" :key="activity.id" class="activity-item">
            <div class="activity-icon">
              {{ activity.type === 'leave' ? '🏖️' : activity.type === 'car' ? '🚗' : '🏛️' }}
            </div>
            <div class="activity-content">
              <p class="activity-text">
                <strong>{{ activity.user }}</strong> {{ activity.action }}
              </p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
            <span class="badge" :class="getStatusBadge(activity.status)">
              {{ getStatusText(activity.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Upcoming Events -->
      <div class="card animate-slide-in">
        <div class="card-header">
          <h3 class="card-title">📆 การประชุมวันนี้</h3>
          <NuxtLink to="/meeting" class="btn btn-ghost btn-sm">ดูปฏิทิน</NuxtLink>
        </div>
        <div class="events-list">
          <div v-for="event in upcomingEvents" :key="event.id" class="event-item">
            <div class="event-time">
              <span class="time-badge">{{ event.time.split(' - ')[0] }}</span>
            </div>
            <div class="event-content">
              <h4>{{ event.title }}</h4>
              <p>
                <span>📍 {{ event.room }}</span>
                <span>👥 {{ event.attendees }} คน</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Car Alerts -->
      <div class="card animate-slide-in">
        <div class="card-header">
          <h3 class="card-title">🔔 การแจ้งเตือนรถ</h3>
          <NuxtLink to="/auto/alerts" class="btn btn-ghost btn-sm">ดูทั้งหมด</NuxtLink>
        </div>
        <div class="alerts-list">
          <div 
            v-for="alert in carAlerts" 
            :key="alert.id" 
            class="alert-item"
            :class="`alert-${alert.level}`"
          >
            <span class="alert-icon">⚠️</span>
            <div class="alert-content">
              <strong>{{ alert.car }}</strong>
              <p>{{ alert.message }}</p>
            </div>
          </div>
          <div v-if="carAlerts.length === 0" class="empty-state">
            <p>ไม่มีการแจ้งเตือน ✨</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card animate-slide-in">
        <div class="card-header">
          <h3 class="card-title">⚡ ทางลัด</h3>
        </div>
        <div class="quick-actions">
          <NuxtLink to="/leave/requests/new" class="quick-action-btn">
            <span class="action-icon success">🏖️</span>
            <span>ขอลางาน</span>
          </NuxtLink>
          <NuxtLink to="/auto/bookings/new" class="quick-action-btn">
            <span class="action-icon info">🚗</span>
            <span>จองรถ</span>
          </NuxtLink>
          <NuxtLink to="/meeting/new" class="quick-action-btn">
            <span class="action-icon warning">🏛️</span>
            <span>จองห้องประชุม</span>
          </NuxtLink>
          <NuxtLink to="/backoffice/employees/new" class="quick-action-btn">
            <span class="action-icon primary">👤</span>
            <span>เพิ่มพนักงาน</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  animation: fadeIn 0.3s ease;
}

/* Welcome Section */
.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 24px;
  background: var(--gradient-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.welcome-content h1 {
  font-size: 1.75rem;
  margin-bottom: 4px;
}

.welcome-date {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: right;
}

.date-icon {
  font-size: 2rem;
}

.date-day {
  font-weight: 600;
  color: var(--primary-400);
}

.date-full {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Stats */
.stat-change {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  margin-top: 4px;
  display: inline-block;
}

.stat-change.primary { background: rgba(99, 102, 241, 0.2); color: var(--primary-400); }
.stat-change.info { background: rgba(59, 130, 246, 0.2); color: var(--info); }
.stat-change.warning { background: rgba(245, 158, 11, 0.2); color: var(--warning); }
.stat-change.danger { background: rgba(239, 68, 68, 0.2); color: var(--danger); }

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.activity-item:hover {
  background: var(--bg-glass-hover);
}

.activity-icon {
  font-size: 1.5rem;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 0.9375rem;
  margin-bottom: 2px;
}

.activity-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Events List */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary-500);
}

.time-badge {
  background: var(--primary-500);
  color: white;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  font-weight: 600;
}

.event-content h4 {
  font-size: 0.9375rem;
  margin-bottom: 4px;
}

.event-content p {
  display: flex;
  gap: 16px;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

/* Alerts List */
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-md);
}

.alert-item.alert-warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.alert-item.alert-danger {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.alert-content strong {
  display: block;
  margin-bottom: 4px;
}

.alert-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.quick-action-btn:hover {
  background: var(--bg-glass-hover);
  transform: translateY(-2px);
  border-color: var(--primary-500);
}

.action-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
}

.action-icon.primary { background: rgba(99, 102, 241, 0.2); }
.action-icon.success { background: rgba(34, 197, 94, 0.2); }
.action-icon.warning { background: rgba(245, 158, 11, 0.2); }
.action-icon.info { background: rgba(59, 130, 246, 0.2); }

/* Responsive */
@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .welcome-date {
    text-align: center;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
