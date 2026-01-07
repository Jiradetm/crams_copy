export default defineNuxtRouteMiddleware((to, from) => {
  // Skip auth check for login page
  if (to.path.startsWith('/auth')) {
    return
  }

  // Check if we're on client side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('carms_token')
    
    if (!token) {
      return navigateTo('/auth/login')
    }

    // Check admin-only routes
    if (to.path.startsWith('/backoffice')) {
      try {
        // Decode JWT to check role
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.role !== 'Admin') {
          return navigateTo('/')
        }
      } catch (e) {
        return navigateTo('/auth/login')
      }
    }
  }
})
