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
    }
})
