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
  showPassword = false;
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
      next: () => {
        this.loading = false;
        this.router.navigate(['/billing']);
      },
      error: (err) => {
        this.loading = false;
        const status = err?.status ?? 0;
        if (status === 401) {
          this.error = 'Utilizador ou senha incorrectos.';
        } else if (status === 0 || status === 404 || status === 502 || status === 504) {
          this.error = 'Backend não acessível. Verifique: 1) PostgreSQL em execução, 2) Base lirandzo_db criada, 3) Backend a correr (mvnw.cmd spring-boot:run na pasta lirandzo-backend).';
        } else {
          this.error = 'Erro de ligação. Verifique se o backend está em execução (porta 8080) e se a base de dados está acessível.';
        }
      }
    });
  }
}
