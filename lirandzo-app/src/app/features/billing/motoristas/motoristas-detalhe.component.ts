import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { MotoristaService, Motorista } from '../../../services/motorista.service';

@Component({
  selector: 'app-motoristas-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink, BillingSectionHeaderComponent],
  templateUrl: './motoristas-detalhe.component.html',
  styleUrls: ['../shared/billing-page.css', './motoristas-detalhe.component.css']
})
export class MotoristasDetalheComponent implements OnInit {
  motorista: Motorista | null = null;
  loading = true;
  error: string | null = null;
  motoristaId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private motoristaService: MotoristaService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.motoristaId = +id;
      this.carregarMotorista();
    } else {
      this.error = 'ID do motorista não fornecido';
      this.loading = false;
    }
  }

  carregarMotorista() {
    if (!this.motoristaId) return;

    this.loading = true;
    this.error = null;

    this.motoristaService.obterMotorista(this.motoristaId).subscribe({
      next: (motorista) => {
        this.motorista = motorista;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar motorista:', error);
        this.error = 'Erro ao carregar motorista da base de dados';
        this.loading = false;
      }
    });
  }

  formatarStatus(status?: string): string {
    const statusMap: { [key: string]: string } = {
      'ATIVO': 'DISPONÍVEL',
      'INATIVO': 'INACTIVO'
    };
    return statusMap[status?.toUpperCase() || ''] || status || 'N/A';
  }

  getStatusClass(status?: string): string {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'ATIVO') return 'badge-success';
    return 'badge-neutral';
  }

  editar() {
    if (this.motoristaId) {
      this.router.navigate(['/billing/motoristas', this.motoristaId, 'editar']);
    }
  }
}
