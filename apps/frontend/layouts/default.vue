<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
const route = useRoute();
const sidebarCollapsed = ref(false);

// Toggle sidebar
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

// Theme toggle
const isDark = ref(true);
const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.setAttribute(
    "data-theme",
    isDark.value ? "dark" : "light"
  );
};

// Navigation items
const navItems = [
  {
    title: "แดชบอร์ด",
    icon: "📊",
    path: "/",
    exact: true,
  },
  {
    title: "Backoffice",
    icon: "👥",
    adminOnly: true, // Only visible to Admin
    children: [
      { title: "ผู้ใช้งาน", path: "/backoffice/users", icon: "👤" },
      { title: "พนักงาน", path: "/backoffice/employees", icon: "🧑‍💼" },
      { title: "แผนก", path: "/backoffice/departments", icon: "🏢" },
      { title: "ตำแหน่ง", path: "/backoffice/roles", icon: "🎖️" },
    ],
  },
  {
    title: "จัดการรถ",
    icon: "🚗",
    children: [
      { title: "รายการรถ", path: "/auto/cars", icon: "🚙" },
      { title: "การจอง", path: "/auto/bookings", icon: "📅" },
      { title: "การแจ้งเตือน", path: "/auto/alerts", icon: "🔔" },
    ],
  },
  {
    title: "ห้องประชุม",
    icon: "🏛️",
    children: [
      { title: "ปฏิทินการจอง", path: "/meeting", icon: "📆" },
      {
        title: "จัดการห้อง",
        path: "/meeting/rooms",
        icon: "🚪",
        adminOnly: true,
      },
    ],
  },
  {
    title: "ลางาน",
    icon: "🏖️",
    children: [
      { title: "สรุปการลา", path: "/leave", icon: "📋" },
      { title: "ขอลา", path: "/leave/requests", icon: "✍️" },
      { title: "โควต้าวันลา", path: "/leave/quotas", icon: "📊" },
    ],
  },
];

// Filter nav items based on user role
const filteredNavItems = computed(() => {
  return navItems
    .filter((item) => {
      if (item.adminOnly) {
        return authStore.isAdmin;
      }
      return true;
    })
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter((child) => {
            if (child.adminOnly) {
              return authStore.isAdmin;
            }
            return true;
          }),
        };
      }
      return item;
    });
});

// Expanded menu state
const expandedMenus = ref<string[]>([
  "Backoffice",
  "จัดการรถ",
  "ห้องประชุม",
  "ลางาน",
]);

const toggleMenu = (title: string) => {
  const index = expandedMenus.value.indexOf(title);
  if (index === -1) {
    expandedMenus.value.push(title);
  } else {
    expandedMenus.value.splice(index, 1);
  }
};

const isMenuExpanded = (title: string) => expandedMenus.value.includes(title);

const isActive = (path: string, exact = false) => {
  if (exact) return route.path === path;
  return route.path.startsWith(path);
};

// Logout
const logout = async () => {
  await authStore.logout();
  navigateTo("/auth/login");
};

// Notifications
const showNotifications = ref(false);
const notifications = ref([
  {
    id: 1,
    text: "การจองห้องประชุมได้รับการอนุมัติ",
    time: "5 นาทีที่แล้ว",
    icon: "✅",
    read: false,
  },
  {
    id: 2,
    text: "มีการแจ้งเตือนประกันภัยรถยนต์",
    time: "1 ชั่วโมงที่แล้ว",
    icon: "⚠️",
    read: false,
  },
  {
    id: 3,
    text: "คำขอลาของคุณได้รับการอนุมัติ",
    time: "2 ชั่วโมงที่แล้ว",
    icon: "🎉",
    read: false,
  },
]);

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

const markAllRead = () => {
  notifications.value = [];
  showNotifications.value = false;
};
</script>

<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <!-- Logo -->
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">🏢</span>
          <span v-if="!sidebarCollapsed" class="logo-text">CARMS</span>
        </div>
        <button class="btn-toggle" @click="toggleSidebar">
          {{ sidebarCollapsed ? "→" : "←" }}
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <template v-for="item in filteredNavItems" :key="item.title">
          <!-- Simple link -->
          <NuxtLink
            v-if="!item.children"
            :to="item.path"
            class="nav-item"
            :class="{ active: isActive(item.path, item.exact) }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span v-if="!sidebarCollapsed" class="nav-text">{{
              item.title
            }}</span>
          </NuxtLink>

          <!-- Dropdown menu -->
          <div v-else class="nav-group">
            <button
              class="nav-item nav-dropdown"
              :class="{ expanded: isMenuExpanded(item.title) }"
              @click="toggleMenu(item.title)"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <span v-if="!sidebarCollapsed" class="nav-text">{{
                item.title
              }}</span>
              <span v-if="!sidebarCollapsed" class="nav-arrow">
                {{ isMenuExpanded(item.title) ? "▼" : "▶" }}
              </span>
            </button>
            <div
              v-if="!sidebarCollapsed && isMenuExpanded(item.title)"
              class="nav-submenu"
            >
              <NuxtLink
                v-for="child in item.children"
                :key="child.path"
                :to="child.path"
                class="nav-subitem"
                :class="{ active: isActive(child.path) }"
              >
                <span class="nav-icon">{{ child.icon }}</span>
                <span class="nav-text">{{ child.title }}</span>
              </NuxtLink>
            </div>
          </div>
        </template>
      </nav>

      <!-- User section -->
      <div class="sidebar-footer">
        <div class="user-info" v-if="!sidebarCollapsed">
          <div class="user-avatar">
            {{ authStore.user?.employee?.firstName?.charAt(0) || "U" }}
          </div>
          <div class="user-details">
            <span class="user-name">
              {{ authStore.user?.employee?.firstName || "User" }}
            </span>
            <span class="user-role">{{
              authStore.user?.systemRole || "User"
            }}</span>
          </div>
        </div>
        <button class="btn-logout" @click="logout" title="ออกจากระบบ">
          🚪
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main
      class="main-content"
      :class="{ 'sidebar-collapsed': sidebarCollapsed }"
    >
      <!-- Top Navbar -->
      <header class="navbar">
        <div class="navbar-left">
          <h1 class="page-title">{{ route.meta.title || "CARMS" }}</h1>
        </div>
        <div class="navbar-right">
          <!-- Theme Toggle -->
          <button class="btn-icon" @click="toggleTheme" title="สลับธีม">
            {{ isDark ? "🌙" : "☀️" }}
          </button>
          <!-- Notifications -->
          <!-- Notifications -->
          <div class="notification-wrapper">
            <button
              class="btn-icon notification-btn"
              @click="toggleNotifications"
              :class="{ active: showNotifications }"
            >
              🔔
              <span
                v-if="notifications.length > 0"
                class="notification-badge"
                >{{ notifications.length }}</span
              >
            </button>

            <!-- Notification Dropdown -->
            <transition name="fade">
              <div v-if="showNotifications" class="notification-dropdown">
                <div class="dropdown-header">
                  <h3>การแจ้งเตือน</h3>
                  <button class="btn-text-sm" @click="markAllRead">
                    อ่านทั้งหมด
                  </button>
                </div>
                <div class="dropdown-body">
                  <div v-if="notifications.length === 0" class="empty-state">
                    <p>ไม่มีการแจ้งเตือนใหม่ ✨</p>
                  </div>
                  <div
                    v-for="note in notifications"
                    :key="note.id"
                    class="notification-item"
                    :class="{ unread: !note.read }"
                  >
                    <div class="note-icon">{{ note.icon }}</div>
                    <div class="note-content">
                      <p class="note-text">{{ note.text }}</p>
                      <span class="note-time">{{ note.time }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="page-container">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Sidebar */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--gradient-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width var(--transition-normal);
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 1.75rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.btn-toggle {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-toggle:hover {
  background: var(--primary-500);
  color: white;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 0.9375rem;
}

.nav-item:hover {
  background: var(--bg-glass);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.nav-text {
  flex: 1;
}

.nav-arrow {
  font-size: 0.625rem;
  opacity: 0.5;
}

.nav-dropdown.expanded {
  color: var(--primary-400);
}

.nav-submenu {
  padding-left: 20px;
  margin-top: 4px;
}

.nav-subitem {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  margin-bottom: 2px;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}

.nav-subitem:hover {
  color: var(--text-primary);
  background: var(--bg-glass);
}

.nav-subitem.active {
  color: var(--primary-400);
  background: rgba(99, 102, 241, 0.1);
}

.nav-subitem .nav-icon {
  font-size: 1rem;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  color: white;
  font-weight: 600;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  font-size: 0.9375rem;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.btn-logout {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1.25rem;
  transition: all var(--transition-fast);
}

.btn-logout:hover {
  background: var(--danger);
}

/* Navbar */
.navbar {
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 50;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-btn {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--danger);
  border-radius: var(--radius-full);
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
}

/* Notification Dropdown */
.notification-wrapper {
  position: relative;
}

.notification-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 12px;
  width: 320px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1000;
  backdrop-filter: blur(20px);
}

.dropdown-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(99, 102, 241, 0.05);
}

.dropdown-header h3 {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0;
}

.btn-text-sm {
  font-size: 0.75rem;
  color: var(--primary-400);
  background: none;
  border: none;
  cursor: pointer;
}

.dropdown-body {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background 0.2s;
}

.notification-item:hover {
  background: var(--bg-glass-hover);
}

.notification-item.unread {
  background: rgba(99, 102, 241, 0.05);
}

.note-icon {
  font-size: 1.2rem;
}

.note-content p {
  font-size: 0.875rem;
  margin-bottom: 4px;
  line-height: 1.4;
}

.note-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0 !important;
  }
}
</style>
