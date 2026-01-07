<script setup lang="ts">
definePageMeta({
  title: "โควต้าวันลา",
  layout: "default",
});

import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
const config = useRuntimeConfig();

// State
const quotas = ref<any[]>([]);
const allQuotas = ref<any[]>([]);
const viewMode = ref<"my" | "all">("my");
const isLoading = ref(true);

// Fetch my quotas
const fetchQuotas = async () => {
  isLoading.value = true;
  try {
    const token = localStorage.getItem("carms_token");
    const response = await $fetch<any>(
      `${config.public.apiBase}/leave-requests/my-quota`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    quotas.value = response.quotas || [];
  } catch (error) {
    console.error("Failed to fetch quotas:", error);
  } finally {
    isLoading.value = false;
  }
};

// Fetch all quotas (Admin)
const fetchAllQuotas = async () => {
  if (!authStore.isAdmin) return;
  isLoading.value = true;
  try {
    const token = localStorage.getItem("carms_token");
    const response = await $fetch<any>(
      `${config.public.apiBase}/leave-requests/all-quotas`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    allQuotas.value = response.data || [];
  } catch (error) {
    console.error("Failed to fetch all quotas:", error);
  } finally {
    isLoading.value = false;
  }
};

const toggleView = (mode: "my" | "all") => {
  viewMode.value = mode;
  if (mode === "all" && allQuotas.value.length === 0) {
    fetchAllQuotas();
  } else if (mode === "my" && quotas.value.length === 0) {
    fetchQuotas();
  }
};

const getProgressColor = (used: number, total: number) => {
  if (total === 0) return "success";
  const percentage = (used / total) * 100;
  if (percentage >= 80) return "danger";
  if (percentage >= 50) return "warning";
  return "success";
};

onMounted(() => {
  fetchQuotas();
});
</script>

<template>
  <div class="quotas-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>📊 โควต้าวันลา</h1>
        <p class="text-muted">ดูโควต้าวันลาของคุณ</p>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          {{ viewMode === "my" ? "โควต้าปี 2569" : "โควต้าพนักงานทั้งหมด" }}
        </h3>
        <div v-if="authStore.isAdmin" class="view-toggle">
          <button
            class="btn btn-sm"
            :class="viewMode === 'my' ? 'btn-primary' : 'btn-ghost'"
            @click="toggleView('my')"
          >
            ของฉัน
          </button>
          <button
            class="btn btn-sm"
            :class="viewMode === 'all' ? 'btn-primary' : 'btn-ghost'"
            @click="toggleView('all')"
          >
            พนักงานทุกคน
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else>
        <!-- My Quota View -->
        <div v-if="viewMode === 'my'" class="quotas-grid">
          <div
            v-for="q in quotas"
            :key="q.leaveTypeId"
            class="quota-detail-card"
          >
            <div class="quota-icon">
              {{
                q.leaveType === "ลาป่วย"
                  ? "🤒"
                  : q.leaveType === "ลาพักร้อน"
                  ? "🏖️"
                  : "📋"
              }}
            </div>
            <div class="quota-content">
              <h4>{{ q.leaveType }}</h4>
              <div class="quota-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ q.total }}</span>
                  <span class="stat-label">รวม</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value used">{{ q.used }}</span>
                  <span class="stat-label">ใช้ไป</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value remaining">{{ q.remaining }}</span>
                  <span class="stat-label">คงเหลือ</span>
                </div>
              </div>
              <div class="quota-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :class="getProgressColor(q.used, q.total)"
                    :style="{ width: `${(q.used / q.total) * 100}%` }"
                  ></div>
                </div>
                <span class="progress-text"
                  >{{ ((q.used / q.total) * 100).toFixed(0) }}% ใช้แล้ว</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- All Quotas Grid (Admin) -->
        <div v-else class="all-quotas-list">
          <div
            v-for="emp in allQuotas"
            :key="emp.id"
            class="employee-quota-card"
          >
            <div class="emp-header">
              <div class="emp-avatar">{{ emp.name.charAt(0) }}</div>
              <div>
                <h4>{{ emp.name }}</h4>
                <span class="text-sm text-muted">{{ emp.code }}</span>
              </div>
            </div>
            <div class="emp-quotas">
              <div
                v-for="q in emp.quotas"
                :key="q.leaveTypeId"
                class="mini-quota-item"
              >
                <div class="mini-header">
                  <span class="mini-label">{{ q.leaveType }}</span>
                  <span class="mini-val">{{ q.used }} / {{ q.total }}</span>
                </div>
                <div class="progress-bar sm">
                  <div
                    class="progress-fill"
                    :class="getProgressColor(q.used, q.total)"
                    :style="{ width: `${(q.used / q.total) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Leave Policy -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">📜 นโยบายการลา</h3>
      </div>
      <div class="policy-list">
        <div class="policy-item">
          <span class="policy-icon">🤒</span>
          <div class="policy-content">
            <h4>ลาป่วย</h4>
            <p>
              ลาได้ไม่เกิน 30 วัน/ปี • ลาเกิน 3 วันต้องมีใบรับรองแพทย์ •
              ย้อนหลังได้ 30 วัน
            </p>
          </div>
        </div>
        <div class="policy-item">
          <span class="policy-icon">🏖️</span>
          <div class="policy-content">
            <h4>ลาพักร้อน</h4>
            <p>ลาได้ไม่เกิน 10 วัน/ปี • ต้องขอล่วงหน้าอย่างน้อย 3 วัน</p>
          </div>
        </div>
        <div class="policy-item">
          <span class="policy-icon">📋</span>
          <div class="policy-content">
            <h4>ลากิจ</h4>
            <p>ลาได้ไม่เกิน 5 วัน/ปี • ต้องระบุเหตุผลให้ชัดเจน</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quotas-page {
  animation: fadeIn 0.3s ease;
}

.page-header {
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

.quotas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.quota-detail-card {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.quota-detail-card:hover {
  border-color: var(--primary-500);
}

.quota-icon {
  font-size: 2.5rem;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-card);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.quota-content {
  flex: 1;
}

.quota-content h4 {
  margin-bottom: 12px;
}

.quota-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-value.used {
  color: var(--warning);
}

.stat-value.remaining {
  color: var(--success);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.quota-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.5s ease;
}

.progress-fill.success {
  background: var(--success);
}
.progress-fill.warning {
  background: var(--warning);
}
.progress-fill.danger {
  background: var(--danger);
}

.progress-text {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  min-width: 80px;
}

/* Policy Section */
.policy-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.policy-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--bg-glass);
  border-radius: var(--radius-md);
}

.policy-icon {
  font-size: 2rem;
}

.policy-content h4 {
  margin-bottom: 4px;
}

.policy-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.card + .card {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .quota-detail-card {
    flex-direction: column;
    text-align: center;
  }

  .quota-icon {
    margin: 0 auto;
  }

  .quota-stats {
    justify-content: center;
  }
}

/* Admin View Styles */
.view-toggle {
  display: flex;
  gap: 8px;
}

.all-quotas-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.employee-quota-card {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
}

.emp-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.emp-avatar {
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.emp-quotas {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mini-quota-item {
  font-size: 0.875rem;
}

.mini-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.mini-val {
  font-weight: 600;
  color: var(--text-secondary);
}

.progress-bar.sm {
  height: 6px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
