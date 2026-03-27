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
      'ACTIVE': 'DISPONÍVEL',
      'INACTIVE': 'INACTIVO',
      'ATIVO': 'DISPONÍVEL',
      'INATIVO': 'INACTIVO'
    };
    return statusMap[status?.toUpperCase() || ''] || status || 'N/A';
  }

  getStatusClass(status?: string): string {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'ACTIVE' || statusUpper === 'ATIVO') return 'badge-success';
    return 'badge-neutral';
  }

  formatarData(data?: string): string {
    if (!data) return 'N/A';
    const d = new Date(data);
    return isNaN(d.getTime()) ? data : d.toLocaleDateString('pt-MZ');
  }

  formatarFiliacao(m: Motorista): string {
    if (m.nomePai && m.nomeMae) return m.nomePai + ' / ' + m.nomeMae;
    if (m.nomePai) return m.nomePai;
    if (m.nomeMae) return m.nomeMae;
    return 'N/A';
  }

  editar() {
    if (this.motoristaId) {
      this.router.navigate(['/billing/motoristas', this.motoristaId, 'editar']);
    }
  }
}
