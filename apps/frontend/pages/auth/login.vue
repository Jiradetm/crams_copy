<script setup lang="ts">
definePageMeta({
  layout: false
})

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')
const showPassword = ref(false)

const { login } = useAuthStore()

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'กรุณากรอกอีเมลและรหัสผ่าน'
    return
  }

  isLoading.value = true
  error.value = ''

  const result = await login(email.value, password.value)

  if (result.success) {
    navigateTo('/')
  } else {
    error.value = result.error
  }

  isLoading.value = false
}
</script>

<template>
  <div class="login-page">
    <!-- Background Effects -->
    <div class="bg-effects">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- Login Card -->
    <div class="login-container animate-slide-up">
      <div class="login-card">
        <!-- Header -->
        <div class="login-header">
          <div class="logo">
            <span class="logo-icon">🏢</span>
            <h1 class="logo-text">CARMS</h1>
          </div>
          <p class="login-subtitle">Corporate Asset & Resource Management System</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Error Alert -->
          <div v-if="error" class="alert alert-danger">
            <span class="alert-icon">⚠️</span>
            <span>{{ error }}</span>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label class="form-label">อีเมล</label>
            <div class="input-with-icon">
              <span class="input-icon">📧</span>
              <input 
                v-model="email"
                type="email" 
                class="form-input" 
                placeholder="your@email.com"
                autocomplete="email"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label class="form-label">รหัสผ่าน</label>
            <div class="input-with-icon">
              <span class="input-icon">🔒</span>
              <input 
                v-model="password"
                :type="showPassword ? 'text' : 'password'" 
                class="form-input" 
                placeholder="••••••••"
                autocomplete="current-password"
              />
              <button 
                type="button" 
                class="input-action"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <!-- Remember & Forgot -->
          <div class="form-row">
            <label class="form-checkbox">
              <input type="checkbox" />
              <span>จดจำฉัน</span>
            </label>
            <a href="#" class="forgot-link">ลืมรหัสผ่าน?</a>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="btn btn-primary btn-lg w-full"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>เข้าสู่ระบบ</span>
          </button>
        </form>

        <!-- Demo Credentials -->
        <div class="demo-info">
          <p class="demo-title">🔑 Demo Credentials</p>
          <div class="demo-credentials">
            <div class="demo-item">
              <span class="demo-label">Admin:</span>
              <code>admin@carms.co.th</code>
            </div>
            <div class="demo-item">
              <span class="demo-label">HR:</span>
              <code>hr@carms.co.th</code>
            </div>
            <div class="demo-item">
              <span class="demo-label">User:</span>
              <code>user@carms.co.th</code>
            </div>
            <div class="demo-item">
              <span class="demo-label">Password:</span>
              <code>admin123</code>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <p class="login-footer">
        © 2026 CARMS. All rights reserved.
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

/* Background Effects */
.bg-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: var(--primary-500);
  top: -200px;
  right: -100px;
  animation: float 20s ease-in-out infinite;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: var(--secondary-500);
  bottom: -100px;
  left: -100px;
  animation: float 15s ease-in-out infinite reverse;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: var(--primary-600);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 10s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, 30px); }
}

/* Login Container */
.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
}

.login-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 40px;
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.logo-icon {
  font-size: 2.5rem;
}

.logo-text {
  font-size: 2rem;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Form */
.login-form {
  margin-bottom: 24px;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.125rem;
}

.input-with-icon .form-input {
  padding-left: 48px;
  padding-right: 48px;
}

.input-action {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.125rem;
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.input-action:hover {
  opacity: 1;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.forgot-link {
  font-size: 0.875rem;
  color: var(--primary-400);
}

.forgot-link:hover {
  text-decoration: underline;
}

/* Demo Info */
.demo-info {
  background: var(--bg-glass);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 16px;
}

.demo-title {
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 0.875rem;
}

.demo-credentials {
  display: grid;
  gap: 8px;
}

.demo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
}

.demo-label {
  color: var(--text-secondary);
  min-width: 70px;
}

.demo-item code {
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-family: monospace;
  font-size: 0.8125rem;
}

/* Footer */
.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Responsive */
@media (max-width: 480px) {
  .login-card {
    padding: 24px;
  }
  
  .logo-text {
    font-size: 1.5rem;
  }
}
</style>
