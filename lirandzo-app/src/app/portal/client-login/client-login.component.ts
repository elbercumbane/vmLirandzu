import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-client-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './client-login.component.html',
  styleUrl: './client-login.component.css'
})
export class ClientLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  onSubmit(): void {
    this.error = '';
    const email = this.email.trim();
    const password = this.password;
    if (!email || !password) {
      this.error = 'Preencha o e-mail e a senha.';
      return;
    }

    this.loading = true;
    this.auth.login(email, password, 'cliente').subscribe({
      next: () => {
        this.loading = false;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigate([returnUrl || '/area-cliente']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Não foi possível iniciar sessão. Verifique as credenciais.';
      }
    });
  }
}
