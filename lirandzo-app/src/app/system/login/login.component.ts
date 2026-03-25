import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslocoModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  username = '';
  password = '';
  showPassword = false;
  loading = false;
  errorKey = '';
  toastMessage = '';
  toastType: 'success' | 'error' = 'error';
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private showToast(message: string, type: 'success' | 'error'): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
    this.toastMessage = message;
    this.toastType = type;
    this.toastTimeoutId = setTimeout(() => {
      this.toastMessage = '';
    }, 3500);
  }

  onSubmit(): void {
    this.errorKey = '';
    const u = this.username.trim();
    const p = this.password;
    if (!u && !p) {
      this.showToast('Preencha o utilizador e a senha.', 'error');
      return;
    }
    if (!u) {
      this.showToast('Erro no campo Utilizador: preencha o utilizador.', 'error');
      return;
    }
    if (!p) {
      this.showToast('Erro no campo Senha: preencha a senha.', 'error');
      return;
    }
    this.loading = true;
    this.auth.login(u, p, 'sistema').subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Login com sucesso. A redirecionar...', 'success');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        setTimeout(() => {
          this.router.navigate([returnUrl || '/billing']);
        }, 900);
      },
      error: (err) => {
        this.loading = false;
        const status = err?.status ?? 0;
        if (status === 401) {
          this.errorKey = 'auth.login.errors.invalidCredentials';
          this.showToast('Credenciais inválidas. Verifique o utilizador/email e a senha.', 'error');
        } else if (status === 0 || status === 404 || status === 502 || status === 504) {
          this.errorKey = 'auth.login.errors.backendUnavailable';
          this.showToast('Backend indisponível. Verifique se o servidor está em execução.', 'error');
        } else {
          this.errorKey = 'auth.login.errors.connection';
          this.showToast('Falha de ligação. Tente novamente em alguns instantes.', 'error');
        }
      }
    });
  }
}
