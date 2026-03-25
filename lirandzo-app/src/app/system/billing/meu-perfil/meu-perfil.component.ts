import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../shared/services/auth.service';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';

@Component({
  selector: 'app-meu-perfil',
  standalone: true,
  imports: [CommonModule, BillingSectionHeaderComponent],
  templateUrl: './meu-perfil.component.html',
  styleUrls: ['../shared/billing-page.css', './meu-perfil.component.css']
})
export class MeuPerfilComponent {
  private readonly auth = inject(AuthService);

  readonly userProfile = this.auth.currentUser;
  readonly roleLabel = this.auth.roleLabel;

  get contaAtiva(): boolean {
    return !!this.userProfile();
  }
}
