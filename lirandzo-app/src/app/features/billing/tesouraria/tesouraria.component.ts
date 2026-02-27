import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tesouraria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tesouraria.component.html',
  styleUrls: ['../shared/billing-page.css', './tesouraria.component.css']
})
export class TesourariaComponent {
  activeTab = 'RECEBIMENTOS';
  mostrarFormRecebimento = false;
  mostrarFormDespesa = false;

  novoRecebimento = { data: '', cliente: '', referencia: '', valor: null as number | null, metodo: '', encomenda: '', observacao: '' };
  novaDespesa = { data: '', descricao: '', categoria: '', valor: null as number | null, viatura: '', observacao: '' };

  metodosPagamento = ['Transferência Bancária', 'M-Pesa', 'e-Mola', 'Depósito', 'Numerário', 'Cheque'];
  categoriasDespesa = ['Combustível', 'Manutenção', 'Pneus', 'Portagem', 'Multa', 'Seguro', 'Lavagem', 'Peças', 'Salários', 'Outros'];

  recebimentos = [
    { id: 1, data: '20/01/2025', cliente: 'Ana Rodrigues', referencia: 'PAG-001', valor: 45200, metodo: 'Transferência', encomenda: 'VML-2025-0001', observacao: '' },
    { id: 2, data: '18/01/2025', cliente: 'Carlos Mondlane', referencia: 'PAG-002', valor: 20000, metodo: 'M-Pesa', encomenda: 'VML-2025-0002', observacao: 'Pagamento parcial' },
    { id: 3, data: '15/01/2025', cliente: 'Pedro Nhantumbo', referencia: 'PAG-003', valor: 41600, metodo: 'Depósito', encomenda: 'VML-2025-0006', observacao: '' },
    { id: 4, data: '14/01/2025', cliente: 'António Bila', referencia: 'PAG-004', valor: 8750, metodo: 'Numerário', encomenda: 'VML-2025-0008', observacao: '' },
    { id: 5, data: '12/01/2025', cliente: 'Maria Machava', referencia: 'PAG-005', valor: 10000, metodo: 'M-Pesa', encomenda: 'VML-2025-0005', observacao: 'Pagamento parcial' },
    { id: 6, data: '10/01/2025', cliente: 'José Tembe', referencia: 'PAG-006', valor: 52000, metodo: 'Transferência', encomenda: 'VML-2025-0004', observacao: '' }
  ];

  despesas = [
    { id: 1, data: '19/01/2025', descricao: 'Combustível — Volvo FH16 (Maputo-Beira)', categoria: 'Combustível', valor: 12500, viatura: 'MDD-45-78', observacao: '350 litros' },
    { id: 2, data: '17/01/2025', descricao: 'Pneus dianteiros — Scania R450', categoria: 'Pneus', valor: 45000, viatura: 'MPT-12-34', observacao: '2 pneus Bridgestone' },
    { id: 3, data: '15/01/2025', descricao: 'Portagem EN1 Maputo-Xai-Xai (ida e volta)', categoria: 'Portagem', valor: 1800, viatura: 'MDD-45-78', observacao: '' },
    { id: 4, data: '12/01/2025', descricao: 'Multa — excesso de velocidade', categoria: 'Multa', valor: 5000, viatura: 'MNP-56-90', observacao: 'Auto nº 4521' },
    { id: 5, data: '10/01/2025', descricao: 'Combustível — Isuzu NPR (cidade)', categoria: 'Combustível', valor: 8200, viatura: 'MTT-67-89', observacao: '180 litros' },
    { id: 6, data: '08/01/2025', descricao: 'Revisão completa — Mercedes Actros', categoria: 'Manutenção', valor: 38000, viatura: 'MBR-89-12', observacao: 'Revisão 250.000km' },
    { id: 7, data: '05/01/2025', descricao: 'Seguro anual — Iveco Stralis', categoria: 'Seguro', valor: 65000, viatura: 'MNP-56-90', observacao: '' }
  ];

  dividasPendentes = [
    { cliente: 'Fátima Cossa', encomenda: 'VML-2025-0003', valor: 12800, dias: 18 },
    { cliente: 'Lurdes Sitoe', encomenda: 'VML-2025-0007', valor: 29400, dias: 11 },
    { cliente: 'Domingos Cuamba', encomenda: 'VML-2025-0010', valor: 33900, dias: 8 },
    { cliente: 'Carlos Mondlane', encomenda: 'VML-2025-0002', valor: 18500, dias: 21 },
    { cliente: 'Maria Machava', encomenda: 'VML-2025-0005', valor: 8300, dias: 14 },
    { cliente: 'Rosa Mahumane', encomenda: 'VML-2025-0009', valor: 7200, dias: 9 }
  ];

  get totalRecebido() { return this.recebimentos.reduce((s, r) => s + r.valor, 0); }
  get totalDespesas() { return this.despesas.reduce((s, d) => s + d.valor, 0); }
  get saldo() { return this.totalRecebido - this.totalDespesas; }
  get totalDividas() { return this.dividasPendentes.reduce((s, d) => s + d.valor, 0); }

  get despesasPorCategoria() {
    const map = new Map<string, number>();
    this.despesas.forEach(d => map.set(d.categoria, (map.get(d.categoria) || 0) + d.valor));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }

  getDiasBadgeClass(dias: number): string {
    if (dias > 14) return 'badge-danger';
    if (dias > 7) return 'badge-warning';
    return 'badge-info';
  }

  registarRecebimento(): void {
    console.log('Novo recebimento:', this.novoRecebimento);
    this.mostrarFormRecebimento = false;
  }

  registarDespesa(): void {
    console.log('Nova despesa:', this.novaDespesa);
    this.mostrarFormDespesa = false;
  }

  registarPagamentoDivida(divida: { cliente: string; encomenda: string; valor: number }): void {
    console.log('Registar pagamento dívida:', divida);
  }
}
