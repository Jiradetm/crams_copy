<script setup lang="ts">
definePageMeta({
  title: "จองรถ",
  layout: "default",
});

const config = useRuntimeConfig();
const router = useRouter();

// State
const cars = ref<any[]>([]);
const isLoading = ref(false);
const form = ref({
  carId: "",
  purpose: "",
  destination: "",
  startDate: "",
  endDate: "",
});

// Fetch available cars
const fetchCars = async () => {
  try {
    const token = localStorage.getItem("carms_token");
    const response = await $fetch<{ data: any[] }>(
      `${config.public.apiBase}/cars`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    cars.value = response.data.filter((c) => c.status === "available");
  } catch (error) {
    console.error("Failed to fetch cars:", error);
  }
};

// Submit
const handleSubmit = async () => {
  if (
    !form.value.carId ||
    !form.value.purpose ||
    !form.value.startDate ||
    !form.value.endDate
  ) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  isLoading.value = true;
  try {
    const token = localStorage.getItem("carms_token");
    await $fetch(`${config.public.apiBase}/car-bookings`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form.value,
    });
    alert("จองรถสำเร็จ รอการอนุมัติ");
    router.push("/auto/bookings");
  } catch (error: any) {
    alert(error.data?.error || "เกิดข้อผิดพลาด");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchCars();
  form.value.startDate = new Date().toISOString().split("T")[0];
  form.value.endDate = new Date().toISOString().split("T")[0];
});
</script>

<template>
  <div class="new-booking-page">
    <div class="page-header">
      <NuxtLink to="/auto/bookings" class="btn btn-ghost">&larr; กลับ</NuxtLink>
      <h1>🚗 จองรถ</h1>
    </div>

    <div class="card form-card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">รถ *</label>
          <select v-model="form.carId" class="form-select" required>
            <option value="">-- เลือกรถ --</option>
            <option v-for="car in cars" :key="car.id" :value="car.id">
              {{ car.licensePlate }} - {{ car.brand }} {{ car.model }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">วัตถุประสงค์ *</label>
          <input
            v-model="form.purpose"
            type="text"
            class="form-input"
            placeholder="เช่น ไปพบลูกค้า"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">ปลายทาง</label>
          <input
            v-model="form.destination"
            type="text"
            class="form-input"
            placeholder="เช่น อาคาร ABC"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">วันที่เริ่มใช้ *</label>
            <input
              v-model="form.startDate"
              type="date"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">วันที่สิ้นสุด *</label>
            <input
              v-model="form.endDate"
              type="date"
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="form-actions">
          <NuxtLink to="/auto/bookings" class="btn btn-ghost">ยกเลิก</NuxtLink>
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            {{ isLoading ? "กำลังบันทึก..." : "✅ ยืนยันการจอง" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.new-booking-page {
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
.form-select {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 1rem;
}

.form-input:focus,
.form-select:focus {
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
