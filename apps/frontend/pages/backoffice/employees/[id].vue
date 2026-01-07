<script setup lang="ts">
definePageMeta({
  title: "รายละเอียดพนักงาน",
  layout: "default",
});

const route = useRoute();
const config = useRuntimeConfig();

const employee = ref<any>(null);
const isLoading = ref(true);

const fetchEmployee = async () => {
  try {
    const token = localStorage.getItem("carms_token");
    const response = await $fetch<any>(
      `${config.public.apiBase}/employees/${route.params.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    employee.value = response;
  } catch (error) {
    console.error("Failed to fetch employee:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchEmployee);
</script>

<template>
  <div class="employee-detail-page">
    <div class="page-header">
      <NuxtLink to="/backoffice/employees" class="btn btn-ghost"
        >&larr; กลับ</NuxtLink
      >
      <h1>🧑‍💼 รายละเอียดพนักงาน</h1>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>กำลังโหลด...</p>
    </div>

    <div v-else-if="!employee" class="empty-state">
      <span class="empty-state-icon">❌</span>
      <h3>ไม่พบพนักงาน</h3>
    </div>

    <div v-else class="card">
      <div class="employee-header">
        <div class="employee-avatar">
          {{ employee.firstName?.charAt(0) || "U" }}
        </div>
        <div class="employee-info">
          <h2>{{ employee.firstName }} {{ employee.lastName }}</h2>
          <p class="text-muted">{{ employee.employeeCode }}</p>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">📧 อีเมล</span>
          <span class="detail-value">{{ employee.email }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">📱 เบอร์โทร</span>
          <span class="detail-value">{{ employee.phone || "-" }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">🏢 แผนก</span>
          <span class="detail-value">{{
            employee.department?.name || "-"
          }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">💼 ตำแหน่ง</span>
          <span class="detail-value">{{ employee.position?.name || "-" }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.employee-detail-page {
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
.employee-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}
.employee-avatar {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  color: white;
  font-size: 2rem;
  font-weight: 700;
}
.employee-info h2 {
  margin-bottom: 4px;
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
