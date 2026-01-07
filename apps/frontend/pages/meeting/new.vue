<script setup lang="ts">
definePageMeta({
  title: "จองห้องประชุม",
  layout: "default",
});

const config = useRuntimeConfig();
const router = useRouter();

// State
const rooms = ref<any[]>([]);
const isLoading = ref(false);
const form = ref({
  roomId: "",
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  attendeesCount: 1,
});

// Fetch rooms
const fetchRooms = async () => {
  try {
    const token = localStorage.getItem("carms_token");
    const response = await $fetch<{ data: any[] }>(
      `${config.public.apiBase}/meeting-rooms`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    rooms.value = response.data;
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
  }
};

// Min date (today)
const minDate = computed(() => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
});

// Submit
const handleSubmit = async () => {
  if (
    !form.value.roomId ||
    !form.value.title ||
    !form.value.date ||
    !form.value.startTime ||
    !form.value.endTime
  ) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  // Validate date
  if (form.value.date < minDate.value) {
    alert("ไม่สามารถจองย้อนหลังได้");
    return;
  }

  isLoading.value = true;
  try {
    const token = localStorage.getItem("carms_token");
    await $fetch(`${config.public.apiBase}/reservations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form.value,
    });
    alert("จองห้องประชุมสำเร็จ");
    router.push("/meeting");
  } catch (error: any) {
    alert(error.data?.error || "เกิดข้อผิดพลาด");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchRooms();
  // Set default date to today
  form.value.date = minDate.value;
});
</script>

<template>
  <div class="new-reservation-page">
    <div class="page-header">
      <NuxtLink to="/meeting" class="btn btn-ghost">&larr; กลับ</NuxtLink>
      <h1>📅 จองห้องประชุม</h1>
    </div>

    <div class="card form-card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">ห้องประชุม *</label>
          <select v-model="form.roomId" class="form-select" required>
            <option value="">-- เลือกห้องประชุม --</option>
            <option v-for="room in rooms" :key="room.id" :value="room.id">
              {{ room.name }} ({{ room.capacity }} คน)
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">หัวข้อการประชุม *</label>
          <input
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="เช่น ประชุมทีม IT"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">รายละเอียด</label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            rows="3"
            placeholder="รายละเอียดเพิ่มเติม..."
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">วันที่ *</label>
            <input
              v-model="form.date"
              type="date"
              class="form-input"
              :min="minDate"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">จำนวนผู้เข้าร่วม</label>
            <input
              v-model.number="form.attendeesCount"
              type="number"
              class="form-input"
              min="1"
              max="100"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">เวลาเริ่ม *</label>
            <input
              v-model="form.startTime"
              type="time"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">เวลาสิ้นสุด *</label>
            <input
              v-model="form.endTime"
              type="time"
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="form-actions">
          <NuxtLink to="/meeting" class="btn btn-ghost">ยกเลิก</NuxtLink>
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            {{ isLoading ? "กำลังบันทึก..." : "✅ ยืนยันการจอง" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.new-reservation-page {
  animation: fadeIn 0.3s ease;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.form-card {
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 1rem;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-500);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
