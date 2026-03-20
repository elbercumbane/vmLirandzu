import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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

  username = '';
  password = '';
  showPassword = false;
  loading = false;
  errorKey = '';

  onSubmit(): void {
    this.errorKey = '';
    const u = this.username.trim();
    const p = this.password;
    if (!u || !p) {
      this.errorKey = 'auth.login.errors.required';
      return;
    }
    this.loading = true;
    this.auth.login(u, p).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/billing']);
      },
      error: (err) => {
        this.loading = false;
        const status = err?.status ?? 0;
        if (status === 401) {
          this.errorKey = 'auth.login.errors.invalidCredentials';
        } else if (status === 0 || status === 404 || status === 502 || status === 504) {
          this.errorKey = 'auth.login.errors.backendUnavailable';
        } else {
          this.errorKey = 'auth.login.errors.connection';
        }
      }
    });
  }
}
