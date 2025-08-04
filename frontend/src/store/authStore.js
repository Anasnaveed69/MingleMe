import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      pendingVerificationEmail: null, // Store email for OTP verification

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      setPendingVerificationEmail: (email) => set({ pendingVerificationEmail: email }),

      clearPendingVerificationEmail: () => set({ pendingVerificationEmail: null }),

      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data.data;

          // Check if user is verified
          if (!user.isVerified) {
            // Store email for OTP verification
            set({ 
              pendingVerificationEmail: email,
              isLoading: false,
              error: null
            });
            return { 
              success: false, 
              error: 'Account not verified. Please verify your email first.',
              requiresVerification: true 
            };
          }

          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            pendingVerificationEmail: null // Clear pending verification
          });

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({
            isLoading: false,
            error: message
          });
          return { success: false, error: message };
        }
      },

      signup: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post('/auth/signup', userData);
          
          // Store email for OTP verification
          set({ 
            pendingVerificationEmail: userData.email,
            isLoading: false,
            error: null
          });

          return { 
            success: true, 
            data: response.data.data,
            requiresVerification: true 
          };
        } catch (error) {
          const message = error.response?.data?.message || 'Signup failed';
          set({
            isLoading: false,
            error: message
          });
          return { success: false, error: message };
        }
      },

      verifyOTP: async (email, otp) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post('/auth/verify-otp', { email, otp });
          const { token, user } = response.data.data;

          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            pendingVerificationEmail: null // Clear pending verification
          });

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'OTP verification failed';
          set({
            isLoading: false,
            error: message
          });
          return { success: false, error: message };
        }
      },

      resendOTP: async (email) => {
        try {
          set({ isLoading: true, error: null });
          
          await api.post('/auth/resend-otp', { email });
          
          set({
            isLoading: false,
            error: null
          });

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to resend OTP';
          set({
            isLoading: false,
            error: message
          });
          return { success: false, error: message };
        }
      },

      logout: () => {
        // Remove token from API headers
        delete api.defaults.headers.common['Authorization'];
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          pendingVerificationEmail: null
        });
      },

      updateProfile: (updatedUser) => {
        set((state) => ({
          user: { ...state.user, ...updatedUser }
        }));
      },

      // Initialize auth state from localStorage
      initializeAuth: () => {
        const { token } = get();
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      },

      // Check if token is still valid
      checkAuth: async () => {
        try {
          const { token } = get();
          if (!token) return false;

          // Try to get user profile
          try {
            const response = await api.get('/auth/profile');
            const user = response.data.data.user;
            
            // Check if user is verified
            if (!user.isVerified) {
              // User is not verified, clear auth state
              get().logout();
              return false;
            }
            
            set({
              user,
              isAuthenticated: true,
              error: null
            });
            return true;
          } catch (profileError) {
            // If profile fetch fails, logout
            get().logout();
            return false;
          }
        } catch (error) {
          // Token is invalid, logout
          get().logout();
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        pendingVerificationEmail: state.pendingVerificationEmail
      })
    }
  )
);

export default useAuthStore; 