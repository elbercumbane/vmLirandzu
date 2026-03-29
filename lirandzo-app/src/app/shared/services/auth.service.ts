import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';

const AUTH_STORAGE_KEY = 'lirandzo.auth.session';

export type UserRole = 'admin' | 'gestor' | 'tecnico' | null;
export type AccessContext = 'sistema' | 'cliente';

export interface UserProfile {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
  avatar: string;
}

interface StoredAuthSession {
  user: UserProfile;
  context: AccessContext;
  loginTime: number;
}

export interface AuthApiResponse {
  id: number;
  nome: string;
  email: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  tecnico: 'Técnico'
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl || 'http://localhost:8080/api';
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  readonly currentUser = signal<UserProfile | null>(null);
  readonly accessContext = signal<AccessContext>('sistema');
  private loginTime: number | null = null;

  get isLoggedIn(): boolean { return this.currentUser() !== null; }
  get role(): UserRole { return this.currentUser()?.role ?? null; }
  get isAdmin(): boolean { return this.role === 'admin'; }
  get isGestor(): boolean { return this.role === 'gestor'; }
  get isTecnico(): boolean { return this.role === 'tecnico'; }

  get roleLabel(): string {
    return this.role ? ROLE_LABELS[this.role] || this.role : '';
  }

  getTempoLogado(): string {
    if (!this.loginTime) return '00:00:00';
    const diff = Math.floor((Date.now() - this.loginTime) / 1000);
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

  /** Editar dados da factura/encomenda (não confundir com registar pagamento). */
  canEditFacturas(): boolean { return this.isAdmin || this.isGestor; }

  /** Baixas, aprovação de pagamentos de técnicos, recibos e tesouraria — técnico não acede. */
  canAccessBaixasERecibos(): boolean {
    return this.isAdmin || this.isGestor;
  }

  constructor() {
    this.restoreFromStorage();
  }

  private canUseStorage(): boolean {
    return isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined';
  }

  private restoreFromStorage(): void {
    if (!this.canUseStorage()) return;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as StoredAuthSession;
      if (!data?.user || typeof data.user.id !== 'number' || !data.user.nome || !data.user.email) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }
      if (data.context !== 'sistema' && data.context !== 'cliente') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }
      this.currentUser.set(data.user);
      this.accessContext.set(data.context);
      this.loginTime = typeof data.loginTime === 'number' ? data.loginTime : Date.now();
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  private persistToStorage(): void {
    if (!this.canUseStorage()) return;
    const user = this.currentUser();
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }
    const payload: StoredAuthSession = {
      user,
      context: this.accessContext(),
      loginTime: this.loginTime ?? Date.now()
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  }

  login(username: string, password: string, context: AccessContext = 'sistema'): Observable<UserProfile | null> {
    return this.http.post<AuthApiResponse>(`${this.apiUrl}/auth/login`, { username, password }).pipe(
      map(res => {
        const profile: UserProfile = {
          id: res.id,
          nome: res.nome,
          email: res.email,
          role: (res.role as UserRole) || 'tecnico',
          avatar: res.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        };
        this.currentUser.set(profile);
        this.accessContext.set(context);
        this.loginTime = Date.now();
        this.persistToStorage();
        return profile;
      })
    );
  }

  canAccessSistema(): boolean {
    return this.isLoggedIn && this.accessContext() === 'sistema';
  }

  canAccessAreaCliente(): boolean {
    return this.isLoggedIn && this.accessContext() === 'cliente';
  }

  logout(): void {
    this.currentUser.set(null);
    this.accessContext.set('sistema');
    this.loginTime = null;
    if (this.canUseStorage()) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }
}
