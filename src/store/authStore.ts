import { create } from 'zustand';
import type { User, RegisterData, LoginData } from '../types/auth';
import { REST_BASE } from '../services/config';
import { apolloClient } from '../services/graphql-client';

interface AuthState {
  currentUser: User | null;
  error: string | null;
  
  // Stări noi pentru 3-Way Auth (OTP)
  requiresOTP: boolean;
  pendingEmail: string | null;

  register: (data: RegisterData) => Promise<boolean>;
  login: (data: LoginData) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>; // <-- Funcție nouă
  forgotPassword: (email: string) => Promise<boolean>; // <-- Funcție nouă
  
  logout: () => void;
  clearError: () => void;
  resetOtpState: () => void; // Pentru a te putea întoarce la login
  resetPassword: (token: string, password: string) => Promise<boolean>; // <-- Funcție nouă
}

async function postJson(path: string, body: unknown) {
  const res = await fetch(`${REST_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  error: null,
  requiresOTP: false,
  pendingEmail: null,

  register: async (body) => {
    try {
      const { ok, data } = await postJson('/auth/register', body);
      if (!ok) { set({ error: data.message ?? 'Eroare la înregistrare.' }); return false; }
      localStorage.setItem('token', data.accessToken);
      set({ currentUser: data.user, error: null });
      return true;
    } catch { set({ error: 'Server indisponibil.' }); return false; }
  },

  login: async (body) => {
    try {
      const { ok, data } = await postJson('/auth/login', body);
      if (!ok) { set({ error: data.message ?? 'Email sau parolă incorectă.' }); return false; }
      
      // Dacă backend-ul zice că e nevoie de OTP (logica pe care am pus-o în AuthService)
      if (data.requiresOTP) {
        // DEV/DEMO: afișăm codul OTP și în consola din browser (apare și în log-ul API)
        if (data.otp) console.log(`%c[OTP] Cod pentru ${data.email}: ${data.otp}`, 'color:#C9A84C;font-weight:bold');
        set({ requiresOTP: true, pendingEmail: data.email, error: null });
        return true;
      }

      // Fallback (dacă din vreo eroare nu trece prin OTP)
      localStorage.setItem('token', data.accessToken);
      set({ currentUser: data.user, error: null });
      return true;
    } catch { set({ error: 'Server indisponibil.' }); return false; }
  },

  verifyOtp: async (email, otp) => {
    try {
      const { ok, data } = await postJson('/auth/verify-otp', { email, otp });
      if (!ok) { set({ error: data.message ?? 'OTP Invalid sau expirat.' }); return false; }
      
      localStorage.setItem('token', data.accessToken);
      set({ currentUser: data.user, requiresOTP: false, pendingEmail: null, error: null });
      return true;
    } catch { set({ error: 'Server indisponibil.' }); return false; }
  },

  forgotPassword: async (email) => {
    try {
      const { ok, data } = await postJson('/auth/forgot-password', { email });
      if (!ok) { set({ error: data.message ?? 'Eroare la resetare parola.' }); return false; }
      return true;
    } catch { set({ error: 'Server indisponibil.' }); return false; }
  },

  resetPassword: async (token, password) => {
    try {
      // Schimbă "password" în "newPassword: password"
      const { ok, data } = await postJson('/auth/reset-password', { token, newPassword: password });
      
      if (!ok) { set({ error: data.message ?? 'Eroare la resetarea parolei.' }); return false; }
      return true;
    } catch { set({ error: 'Server indisponibil.' }); return false; }
  },

  logout: () => {
    localStorage.removeItem('token');
    // Golim cache-ul Apollo ca produsele/comenzile unui user să nu rămână
    // vizibile la următorul login (cauza erorii "Produsul nu a fost găsit").
    apolloClient.clearStore().catch(() => {});
    set({ currentUser: null, requiresOTP: false, pendingEmail: null });
  },
  
  clearError: () => set({ error: null }),
  resetOtpState: () => set({ requiresOTP: false, pendingEmail: null, error: null })

}));