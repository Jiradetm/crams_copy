<script setup lang="ts">
definePageMeta({
  title: "รายละเอียดรถ",
  layout: "default",
});

const route = useRoute();
const config = useRuntimeConfig();

const car = ref<any>(null);
const isLoading = ref(true);

const fetchCar = async () => {
  try {
    const token = localStorage.getItem("carms_token");
    const response = await $fetch<{ data: any[] }>(
      `${config.public.apiBase}/cars`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    car.value = response.data.find((c) => c.id === route.params.id);
  } catch (error) {
    console.error("Failed to fetch car:", error);
  } finally {
    isLoading.value = false;
  }
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    available: "ว่าง",
    "in-use": "กำลังใช้งาน",
    maintenance: "ซ่อมบำรุง",
  };
  return map[status] || status;
};

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    available: "badge-success",
    "in-use": "badge-warning",
    maintenance: "badge-danger",
  };
  return map[status] || "badge-secondary";
};

onMounted(fetchCar);
</script>

<template>
  <div class="car-detail-page">
    <div class="page-header">
      <NuxtLink to="/auto/cars" class="btn btn-ghost">&larr; กลับ</NuxtLink>
      <h1>🚗 รายละเอียดรถ</h1>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>กำลังโหลด...</p>
    </div>

    <div v-else-if="!car" class="empty-state">
      <span class="empty-state-icon">❌</span>
      <h3>ไม่พบรถ</h3>
    </div>

    <div v-else class="card">
      <div class="car-header">
        <div class="car-icon">🚙</div>
        <div class="car-info">
          <h2>{{ car.brand }} {{ car.model }}</h2>
          <p class="license-plate">{{ car.licensePlate }}</p>
          <span class="badge" :class="getStatusClass(car.status)">
            {{ getStatusText(car.status) }}
          </span>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">📅 ปี</span>
          <span class="detail-value">{{ car.year }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">🎨 สี</span>
          <span class="detail-value">{{ car.color }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">📊 ระยะทาง</span>
          <span class="detail-value"
            >{{ car.currentMileage?.toLocaleString() }} km</span
          >
        </div>
        <div class="detail-item">
          <span class="detail-label">⛽ น้ำมัน</span>
          <span class="detail-value">{{ car.fuelLevel }}%</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">📋 ประเภท</span>
          <span class="detail-value">{{
            car.usageType === "executive" ? "ผู้บริหาร" : "ส่วนกลาง"
          }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">🛡️ ประกันหมดอายุ</span>
          <span class="detail-value">{{ car.insuranceExpiry || "-" }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">📄 ภาษีหมดอายุ</span>
          <span class="detail-value">{{ car.taxExpiry || "-" }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.car-detail-page {
  animation: fadeIn 0.3s ease;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px;
  gap: 16px;
}
.car-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}
.car-icon {
  font-size: 4rem;
}
.car-info h2 {
  margin-bottom: 4px;
}
.license-plate {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-400);
  margin-bottom: 8px;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
.detail-value {
  font-weight: 500;
}
@media (max-width: 600px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
