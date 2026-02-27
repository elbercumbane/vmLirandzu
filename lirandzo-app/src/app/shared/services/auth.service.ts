import { Injectable, signal } from '@angular/core';

export type UserRole = 'admin' | 'gestor' | 'tecnico' | null;

export interface UserProfile {
  nome: string;
  email: string;
  role: UserRole;
  avatar: string;
}

const PROFILES: Record<string, UserProfile> = {
  admin: { nome: 'Administrador Geral', email: 'admin@vmtransportes.co.mz', role: 'admin', avatar: 'AG' },
  gestor: { nome: 'Carlos Mondlane', email: 'carlos.gestor@vmtransportes.co.mz', role: 'gestor', avatar: 'CM' },
  tecnico: { nome: 'Ana Silva', email: 'ana.tecnico@vmtransportes.co.mz', role: 'tecnico', avatar: 'AS' }
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  tecnico: 'Técnico'
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'lirandzo-auth-role';
  private readonly LOGIN_TIME_KEY = 'lirandzo-auth-login-time';
  readonly currentUser = signal<UserProfile | null>(this.loadUser());

  get isLoggedIn(): boolean { return this.currentUser() !== null; }
  get role(): UserRole { return this.currentUser()?.role ?? null; }
  get isAdmin(): boolean { return this.role === 'admin'; }
  get isGestor(): boolean { return this.role === 'gestor'; }
  get isTecnico(): boolean { return this.role === 'tecnico'; }

  get roleLabel(): string {
    return this.role ? ROLE_LABELS[this.role] || this.role : '';
  }

  get loginTime(): number | null {
    const t = localStorage.getItem(this.LOGIN_TIME_KEY);
    return t ? parseInt(t, 10) : null;
  }

  getTempoLogado(): string {
    const t = this.loginTime;
    if (!t) return '00:00:00';
    const diff = Math.floor((Date.now() - t) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
  }

  canConfirmPayment(): boolean { return this.role === 'admin' || this.role === 'gestor'; }
  canRegisterTecnico(): boolean { return this.role === 'admin' || this.role === 'gestor'; }
  canRegisterGestor(): boolean { return this.role === 'admin'; }
  canRegisterAdmin(): boolean { return this.role === 'admin'; }
  canDeleteAccount(): boolean { return this.role === 'admin'; }
  canDeactivateAccount(): boolean { return this.role === 'admin' || this.role === 'gestor'; }
  canAccessConfiguracoes(): boolean { return this.role === 'admin' || this.role === 'gestor'; }

  loginAs(role: 'admin' | 'gestor' | 'tecnico'): void {
    const profile = PROFILES[role];
    this.currentUser.set(profile);
    localStorage.setItem(this.STORAGE_KEY, role);
    localStorage.setItem(this.LOGIN_TIME_KEY, String(Date.now()));
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.LOGIN_TIME_KEY);
  }

  private loadUser(): UserProfile | null {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved && PROFILES[saved]) return PROFILES[saved];
    return null;
  }
}
