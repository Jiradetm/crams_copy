<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  title: "เพิ่มพนักงานใหม่",
  layout: "default",
});

const config = useRuntimeConfig();
const router = useRouter();
const authStore = useAuthStore();

// Redirect if not admin
onMounted(() => {
  if (!authStore.isAdmin) {
    navigateTo("/backoffice/employees");
  }
});

const departments = ref<any[]>([]);
const positions = ref<any[]>([]);
const isLoading = ref(false);
const form = ref({
  employeeCode: "",
  firstName: "",
  lastName: "",
  firstNameEn: "",
  lastNameEn: "",
  email: "",
  phone: "",
  departmentId: "",
  positionId: "",
  hireDate: "",
});

// Fetch departments and positions
const fetchData = async () => {
  try {
    const token = localStorage.getItem("carms_token");
    const [deptRes, posRes] = await Promise.all([
      $fetch<{ data: any[] }>(`${config.public.apiBase}/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      $fetch<{ data: any[] }>(`${config.public.apiBase}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    departments.value = deptRes.data;
    // Get positions from a separate endpoint if available, or use a placeholder
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
};

const handleSubmit = async () => {
  if (
    !form.value.employeeCode ||
    !form.value.firstName ||
    !form.value.lastName ||
    !form.value.email
  ) {
    alert("กรุณากรอกข้อมูลที่จำเป็น");
    return;
  }

  isLoading.value = true;
  try {
    const token = localStorage.getItem("carms_token");
    await $fetch(`${config.public.apiBase}/employees`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form.value,
    });
    alert("เพิ่มพนักงานสำเร็จ");
    router.push("/backoffice/employees");
  } catch (error: any) {
    alert(error.data?.error || "เกิดข้อผิดพลาด");
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="new-employee-page">
    <div class="page-header">
      <NuxtLink to="/backoffice/employees" class="btn btn-ghost"
        >&larr; กลับ</NuxtLink
      >
      <h1>🧑‍💼 เพิ่มพนักงานใหม่</h1>
    </div>

    <div class="card form-card">
      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">รหัสพนักงาน *</label>
            <input
              v-model="form.employeeCode"
              type="text"
              class="form-input"
              placeholder="เช่น EMP001"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">วันที่เริ่มงาน</label>
            <input v-model="form.hireDate" type="date" class="form-input" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">ชื่อ (ไทย) *</label>
            <input
              v-model="form.firstName"
              type="text"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">นามสกุล (ไทย) *</label>
            <input
              v-model="form.lastName"
              type="text"
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">First Name (EN)</label>
            <input v-model="form.firstNameEn" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Last Name (EN)</label>
            <input v-model="form.lastNameEn" type="text" class="form-input" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">อีเมล *</label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">เบอร์โทร</label>
            <input v-model="form.phone" type="tel" class="form-input" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">แผนก</label>
            <select v-model="form.departmentId" class="form-select">
              <option value="">-- เลือกแผนก --</option>
              <option
                v-for="dept in departments"
                :key="dept.id"
                :value="dept.id"
              >
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">ตำแหน่ง</label>
            <select v-model="form.positionId" class="form-select">
              <option value="">-- เลือกตำแหน่ง --</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <NuxtLink to="/backoffice/employees" class="btn btn-ghost"
            >ยกเลิก</NuxtLink
          >
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            {{ isLoading ? "กำลังบันทึก..." : "💾 บันทึก" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.new-employee-page {
  animation: fadeIn 0.3s ease;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.form-card {
  max-width: 700px;
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
