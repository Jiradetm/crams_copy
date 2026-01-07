import { defineStore } from 'pinia'

interface Employee {
    id: string
    employeeCode: string
    firstName: string
    lastName: string
    firstNameEn: string
    lastNameEn: string
}

interface User {
    id: string
    email: string
    systemRole: string
    moduleRoles: string[]
    employee: Employee | null
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
    }),

    getters: {
        isAdmin: (state) => state.user?.systemRole === 'Admin',
        hasModuleRole: (state) => (role: string) => state.user?.moduleRoles?.includes(role) || false,
        fullName: (state) => {
            if (!state.user?.employee) return 'User'
            return `${state.user.employee.firstName} ${state.user.employee.lastName}`
        }
    },

    actions: {
        async login(email: string, password: string) {
            this.isLoading = true
            try {
                const config = useRuntimeConfig()
                const response = await $fetch<{ token: string; user: User }>(`${config.public.apiBase}/auth/login`, {
                    method: 'POST',
                    body: { email, password }
                })

                this.token = response.token
                this.user = response.user
                this.isAuthenticated = true

                // Store token in localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('carms_token', response.token)
                }

                return { success: true }
            } catch (error: any) {
                return {
                    success: false,
                    error: error.data?.error || 'Login failed'
                }
            } finally {
                this.isLoading = false
            }
        },

        async logout() {
            try {
                const config = useRuntimeConfig()
                await $fetch(`${config.public.apiBase}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                })
            } catch (error) {
                // Ignore error
            } finally {
                this.user = null
                this.token = null
                this.isAuthenticated = false

                if (typeof window !== 'undefined') {
                    localStorage.removeItem('carms_token')
                }
            }
        },

        async checkAuth() {
            if (typeof window === 'undefined') return

            const token = localStorage.getItem('carms_token')
            if (!token) {
                this.isAuthenticated = false
                return
            }

            this.token = token

            try {
                const config = useRuntimeConfig()
                const user = await $fetch<User>(`${config.public.apiBase}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                this.user = user
                this.isAuthenticated = true
            } catch (error) {
                this.logout()
            }
        },

        initAuth() {
            if (typeof window !== 'undefined') {
                this.checkAuth()
            }
        }
    }
})
