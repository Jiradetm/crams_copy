<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  title: "ปฏิทินห้องประชุม",
  layout: "default",
});

const config = useRuntimeConfig();
const authStore = useAuthStore();

// State
const reservations = ref<any[]>([]);
const rooms = ref<any[]>([]);
const isLoading = ref(true);
const currentDate = ref(new Date());
const showModal = ref(false);
const selectedEvent = ref<any>(null);

// Cancel reservation (Admin only)
const cancelReservation = async (id: string) => {
  if (!confirm("ต้องการยกเลิกการจองนี้หรือไม่?")) return;

  try {
    const token = localStorage.getItem("carms_token");
    await $fetch(`${config.public.apiBase}/reservations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    showModal.value = false;
    fetchCalendarData();
  } catch (error) {
    console.error("Failed to cancel:", error);
    alert("ไม่สามารถยกเลิกได้");
  }
};

// Calendar data
const currentMonth = computed(() => currentDate.value.getMonth());
const currentYear = computed(() => currentDate.value.getFullYear());

const monthNames = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

// Event colors based on room (Google Calendar style)
const eventColors = [
  "#4285f4", // Google Blue
  "#0f9d58", // Google Green
  "#f4b400", // Google Yellow
  "#db4437", // Google Red
  "#673ab7", // Purple
  "#00bcd4", // Cyan
  "#ff5722", // Deep Orange
  "#795548", // Brown
];

const getEventColor = (roomId: string) => {
  const index = rooms.value.findIndex((r: any) => r.id === roomId);
  return eventColors[index % eventColors.length] || eventColors[0];
};

// Get days in current month
const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];

  // Add empty cells for days before the first day
  for (let i = 0; i < firstDay; i++) {
    days.push({ date: null, events: [] });
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const dayEvents = reservations.value.filter((r) => {
      if (!r.date) return false;
      const rDate =
        typeof r.date === "string"
          ? r.date.split("T")[0]
          : new Date(r.date).toISOString().split("T")[0];
      return rDate === dateStr && r.status === "confirmed";
    });
    days.push({
      date: day,
      dateStr,
      isToday: isToday(day),
      events: dayEvents,
    });
  }

  return days;
});

const isToday = (day: number) => {
  const today = new Date();
  return (
    today.getDate() === day &&
    today.getMonth() === currentMonth.value &&
    today.getFullYear() === currentYear.value
  );
};

// Navigation
const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
  fetchCalendarData();
};

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
  fetchCalendarData();
};

const goToToday = () => {
  currentDate.value = new Date();
  fetchCalendarData();
};

// Fetch data
const fetchCalendarData = async () => {
  isLoading.value = true;
  try {
    const token = localStorage.getItem("carms_token");
    const [resResponse, roomsResponse] = await Promise.all([
      $fetch<{ data: any[] }>(
        `${config.public.apiBase}/reservations/calendar`,
        {
          headers: { Authorization: `Bearer ${token}` },
          query: { year: currentYear.value, month: currentMonth.value + 1 },
        }
      ),
      $fetch<{ data: any[] }>(`${config.public.apiBase}/meeting-rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    reservations.value = resResponse.data;
    rooms.value = roomsResponse.data;
  } catch (error) {
    console.error("Failed to fetch calendar data:", error);
  } finally {
    isLoading.value = false;
  }
};

// Event click
const openEventModal = (event: any) => {
  selectedEvent.value = event;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedEvent.value = null;
};

onMounted(() => {
  fetchCalendarData();
});
</script>

<template>
  <div class="meeting-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>📆 ปฏิทินห้องประชุม</h1>
        <p class="text-muted">ดูและจัดการการจองห้องประชุม</p>
      </div>
      <NuxtLink to="/meeting/new" class="btn btn-primary">
        <span>➕</span>
        จองห้องประชุม
      </NuxtLink>
    </div>

    <!-- Calendar Controls -->
    <div class="calendar-controls">
      <div class="calendar-nav">
        <button class="btn btn-ghost" @click="prevMonth">◀</button>
        <h2 class="calendar-month">
          {{ monthNames[currentMonth] }} {{ currentYear + 543 }}
        </h2>
        <button class="btn btn-ghost" @click="nextMonth">▶</button>
      </div>
      <button class="btn btn-secondary" @click="goToToday">วันนี้</button>
    </div>

    <!-- Calendar -->
    <div class="card calendar-card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else class="calendar">
        <!-- Day Headers -->
        <div class="calendar-header">
          <div v-for="day in dayNames" :key="day" class="calendar-day-header">
            {{ day }}
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="calendar-grid">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="calendar-cell"
            :class="{
              empty: !day.date,
              today: day.isToday,
              'has-events': day.events?.length > 0,
            }"
          >
            <span v-if="day.date" class="cell-date">{{ day.date }} </span>
            <div v-if="day.events?.length > 0" class="cell-events">
              <div
                v-for="event in day.events.slice(0, 4)"
                :key="event.id"
                class="event-chip"
                :style="{ backgroundColor: getEventColor(event.roomId) }"
                @click="openEventModal(event)"
                :title="`${event.startTime} - ${event.endTime} | ${event.title} | ${event.room}`"
              >
                <span class="event-dot"></span>
                <span class="event-time-short">{{
                  event.startTime?.substring(0, 5)
                }}</span>
                <span class="event-text">{{ event.title }}</span>
              </div>
              <div
                v-if="day.events.length > 4"
                class="more-events"
                @click="openEventModal(day.events[0])"
              >
                +{{ day.events.length - 4 }} เพิ่มเติม
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rooms Summary -->
    <div class="rooms-summary">
      <h3>🚪 ห้องประชุมทั้งหมด</h3>
      <div class="rooms-grid">
        <div v-for="room in rooms" :key="room.id" class="room-card">
          <div class="room-icon">🏛️</div>
          <div class="room-info">
            <h4>{{ room.name }}</h4>
            <p>
              👥 {{ room.capacity }} ที่นั่ง • 📍 {{ room.building }} ชั้น
              {{ room.floor }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Reservation History -->
    <div class="reservation-history">
      <h3>📋 การจองเดือนนี้</h3>
      <div v-if="reservations.length === 0" class="empty-state">
        <span class="empty-state-icon">📅</span>
        <h4 class="empty-state-title">ไม่มีการจองในเดือนนี้</h4>
      </div>
      <div v-else class="history-list">
        <div
          v-for="res in reservations"
          :key="res.id"
          class="history-item"
          @click="openEventModal(res)"
        >
          <div class="history-date">
            <span class="history-day">{{ new Date(res.date).getDate() }}</span>
            <span class="history-month">{{
              monthNames[new Date(res.date).getMonth()].substring(0, 3)
            }}</span>
          </div>
          <div class="history-content">
            <h4>{{ res.title }}</h4>
            <div class="history-details">
              <span class="history-time"
                >🕐 {{ res.startTime }} - {{ res.endTime }}</span
              >
              <span class="history-room">🏛️ {{ res.room }}</span>
              <span class="history-booker">👤 {{ res.bookedBy }}</span>
            </div>
          </div>
          <div class="history-status">
            <span
              class="badge"
              :class="
                res.status === 'confirmed' ? 'badge-success' : 'badge-secondary'
              "
            >
              {{ res.status === "confirmed" ? "ยืนยัน" : "ยกเลิก" }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Detail Modal -->
    <div
      v-if="showModal && selectedEvent"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">📋 รายละเอียดการประชุม</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="event-detail">
            <h4>{{ selectedEvent.title }}</h4>
            <div class="detail-list">
              <div class="detail-item">
                <span class="detail-icon">🕐</span>
                <span
                  >{{ selectedEvent.startTime }} -
                  {{ selectedEvent.endTime }}</span
                >
              </div>
              <div class="detail-item">
                <span class="detail-icon">📅</span>
                <span>{{ selectedEvent.date }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">🏛️</span>
                <span>{{ selectedEvent.room }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">👤</span>
                <span>{{ selectedEvent.bookedBy }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            v-if="authStore.isAdmin && selectedEvent.status === 'confirmed'"
            class="btn btn-danger"
            @click="cancelReservation(selectedEvent.id)"
          >
            🗑️ ยกเลิกการจอง
          </button>
          <button class="btn btn-secondary" @click="closeModal">ปิด</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meeting-page {
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

.calendar-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.calendar-month {
  min-width: 200px;
  text-align: center;
}

.calendar-card {
  margin-bottom: 24px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 16px;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.calendar-day-header {
  text-align: center;
  padding: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-glass);
  border-radius: var(--radius-sm);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-cell {
  min-height: 120px;
  padding: 8px;
  background: var(--bg-glass);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.calendar-cell:hover:not(.empty) {
  border-color: var(--primary-500);
}

.calendar-cell.empty {
  background: transparent;
  border-color: transparent;
}

.calendar-cell.today {
  border-color: var(--primary-500);
  background: rgba(99, 102, 241, 0.1);
}

.calendar-cell.today .cell-date {
  background: var(--primary-500);
  color: white;
  border-radius: var(--radius-full);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell-date {
  font-weight: 600;
  margin-bottom: 8px;
  display: inline-block;
}

.cell-events {
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow: hidden;
}

/* Google Calendar-style event chip */
.event-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  color: white;
  cursor: pointer;
  transition: all var(--transition-fast);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-height: 20px;
}

.event-chip:hover {
  filter: brightness(1.1);
  transform: translateX(2px);
}

.event-dot {
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  flex-shrink: 0;
}

.event-time-short {
  font-weight: 600;
  font-size: 0.65rem;
  opacity: 0.9;
  flex-shrink: 0;
}

.event-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.more-events {
  font-size: 0.7rem;
  color: var(--primary-400);
  text-align: left;
  padding: 2px 6px;
  cursor: pointer;
  font-weight: 500;
}

.more-events:hover {
  text-decoration: underline;
}

/* Rooms Summary */
.rooms-summary h3 {
  margin-bottom: 16px;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.room-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.room-icon {
  font-size: 2rem;
}

.room-info h4 {
  margin-bottom: 4px;
}

.room-info p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Reservation History */
.reservation-history {
  margin-top: 24px;
}

.reservation-history h3 {
  margin-bottom: 16px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.history-item:hover {
  border-color: var(--primary-500);
  transform: translateX(4px);
}

.history-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
  padding: 8px;
  background: var(--gradient-primary);
  border-radius: var(--radius-md);
  color: white;
}

.history-day {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.history-month {
  font-size: 0.75rem;
  text-transform: uppercase;
}

.history-content {
  flex: 1;
}

.history-content h4 {
  margin-bottom: 4px;
}

.history-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.history-status {
  flex-shrink: 0;
}

/* Event Detail */
.event-detail h4 {
  font-size: 1.25rem;
  margin-bottom: 16px;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  font-size: 1.25rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .calendar-cell {
    min-height: 80px;
    padding: 4px;
  }

  .event-item {
    flex-direction: column;
    gap: 2px;
  }
}
</style>
