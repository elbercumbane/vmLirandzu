import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = false;
  error = '';

  onSubmit(): void {
    this.error = '';
    const u = this.username.trim();
    const p = this.password;
    if (!u || !p) {
      this.error = 'Introduza o utilizador e a senha.';
      return;
    }
    this.loading = true;
    this.auth.login(u, p).subscribe({
      next: (user) => {
        this.loading = false;
        if (user) {
          this.router.navigate(['/billing']);
        } else {
          this.error = 'Utilizador ou senha incorrectos.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Erro de ligação. Verifique se o backend está em execução.';
      }
    });
  }
}
