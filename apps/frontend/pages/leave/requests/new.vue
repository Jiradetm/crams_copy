<script setup lang="ts">
definePageMeta({
  title: "ขอลางาน",
  layout: "default",
});

const config = useRuntimeConfig();
const router = useRouter();

// State
const leaveTypes = ref<any[]>([]);
const isLoading = ref(false);
const form = ref({
  leaveTypeId: "",
  startDate: "",
  endDate: "",
  reason: "",
});

// Computed days
const days = computed(() => {
  if (!form.value.startDate || !form.value.endDate) return 0;
  const start = new Date(form.value.startDate);
  const end = new Date(form.value.endDate);
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(1, diff + 1);
});

// Fetch leave types
const fetchLeaveTypes = async () => {
  try {
    const token = localStorage.getItem("carms_token");
    const response = await $fetch<{ data: any[] }>(
      `${config.public.apiBase}/leave-types`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    leaveTypes.value = response.data;
  } catch (error) {
    console.error("Failed to fetch leave types:", error);
  }
};

// Submit
const handleSubmit = async () => {
  if (
    !form.value.leaveTypeId ||
    !form.value.startDate ||
    !form.value.endDate ||
    !form.value.reason
  ) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  isLoading.value = true;
  try {
    const token = localStorage.getItem("carms_token");
    await $fetch(`${config.public.apiBase}/leave-requests`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        ...form.value,
        days: days.value,
      },
    });
    alert("ส่งคำขอลาสำเร็จ รอการอนุมัติ");
    router.push("/leave/requests");
  } catch (error: any) {
    alert(error.data?.error || "เกิดข้อผิดพลาด");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchLeaveTypes();
  form.value.startDate = new Date().toISOString().split("T")[0];
  form.value.endDate = new Date().toISOString().split("T")[0];
});
</script>

<template>
  <div class="new-leave-page">
    <div class="page-header">
      <NuxtLink to="/leave/requests" class="btn btn-ghost"
        >&larr; กลับ</NuxtLink
      >
      <h1>✍️ ขอลางาน</h1>
    </div>

    <div class="card form-card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">ประเภทการลา *</label>
          <select v-model="form.leaveTypeId" class="form-select" required>
            <option value="">-- เลือกประเภทการลา --</option>
            <option v-for="type in leaveTypes" :key="type.id" :value="type.id">
              {{ type.name }} (สูงสุด {{ type.maxDaysPerYear }} วัน/ปี)
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">วันที่เริ่มลา *</label>
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

        <div class="days-summary" v-if="days > 0">
          <span class="days-badge">รวม {{ days }} วัน</span>
        </div>

        <div class="form-group">
          <label class="form-label">เหตุผลการลา *</label>
          <textarea
            v-model="form.reason"
            class="form-textarea"
            rows="4"
            placeholder="ระบุเหตุผลการลา..."
            required
          ></textarea>
        </div>

        <div class="form-actions">
          <NuxtLink to="/leave/requests" class="btn btn-ghost">ยกเลิก</NuxtLink>
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            {{ isLoading ? "กำลังส่ง..." : "📤 ส่งคำขอ" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.new-leave-page {
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

.days-summary {
  margin-bottom: 20px;
}

.days-badge {
  display: inline-block;
  padding: 8px 16px;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  color: white;
  font-weight: 600;
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
