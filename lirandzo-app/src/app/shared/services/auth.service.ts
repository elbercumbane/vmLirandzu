import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';

export type UserRole = 'admin' | 'gestor' | 'tecnico' | null;

export interface UserProfile {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
  avatar: string;
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

  readonly currentUser = signal<UserProfile | null>(null);
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

  login(username: string, password: string): Observable<UserProfile> {
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
        this.loginTime = Date.now();
        return profile;
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    this.loginTime = null;
  }
}
