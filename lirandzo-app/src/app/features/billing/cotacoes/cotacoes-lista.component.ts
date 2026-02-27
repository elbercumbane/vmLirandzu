import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';

@Component({
  selector: 'app-cotacoes-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent],
  templateUrl: './cotacoes-lista.component.html',
  styleUrls: ['../shared/billing-page.css', './cotacoes-lista.component.css']
})
export class CotacoesListaComponent {
  filtro = '';
  filtroEstado = 'TODOS';

  pedidos = [
    { id: 1, ref: 'COT-2025-001', cliente: 'SLR Mining, Lda', contacto: 'Sr. Euclides', telefone: '847983277', origem: 'Maputo', destino: 'Cabo Delgado', descricaoCarga: 'Material de construção — 20 toneladas', dataEntrada: '20/01/2025', horaEntrada: '09:30', estado: 'PENDENTE', operador: '', dataResposta: '', tempoResposta: '' },
    { id: 2, ref: 'COT-2025-002', cliente: 'Cervejas de Moçambique', contacto: 'Sr. António', telefone: '841234567', origem: 'Maputo', destino: 'Beira', descricaoCarga: 'Bebidas — carga completa', dataEntrada: '18/01/2025', horaEntrada: '14:15', estado: 'RESPONDIDO', operador: 'Ana Silva', dataResposta: '18/01/2025 16:00', tempoResposta: '1h 45min' },
    { id: 3, ref: 'COT-2025-003', cliente: 'TotalEnergies Moçambique', contacto: 'Sra. Maria', telefone: '842345678', origem: 'Beira', destino: 'Tete', descricaoCarga: 'Equipamento industrial — 15 toneladas', dataEntrada: '15/01/2025', horaEntrada: '10:00', estado: 'COTAÇÃO GERADA', operador: 'João Macuácua', dataResposta: '15/01/2025 12:30', tempoResposta: '2h 30min' },
    { id: 4, ref: 'COT-2025-004', cliente: 'Shoprite Moçambique', contacto: 'Sr. Pedro', telefone: '844567890', origem: 'Maputo', destino: 'Nampula', descricaoCarga: 'Produtos alimentares — 3 paletes', dataEntrada: '22/01/2025', horaEntrada: '08:00', estado: 'PENDENTE', operador: '', dataResposta: '', tempoResposta: '' },
    { id: 5, ref: 'COT-2025-005', cliente: 'Kenmare Resources', contacto: 'Sr. James', telefone: '846789012', origem: 'Nampula', destino: 'Maputo', descricaoCarga: 'Minerais — 25 toneladas', dataEntrada: '12/01/2025', horaEntrada: '11:45', estado: 'RESPONDIDO', operador: 'Ana Silva', dataResposta: '13/01/2025 09:00', tempoResposta: '21h 15min' },
    { id: 6, ref: 'COT-2025-006', cliente: 'Hidroeléctrica de Cahora Bassa', contacto: 'Eng. Fátima', telefone: '847890123', origem: 'Tete', destino: 'Maputo', descricaoCarga: 'Transformadores eléctricos — carga especial', dataEntrada: '10/01/2025', horaEntrada: '16:30', estado: 'COTAÇÃO GERADA', operador: 'João Macuácua', dataResposta: '11/01/2025 10:00', tempoResposta: '17h 30min' }
  ];

  get pedidosFiltrados() {
    let lista = this.pedidos;
    if (this.filtroEstado !== 'TODOS') {
      lista = lista.filter(p => p.estado === this.filtroEstado);
    }
    if (this.filtro.trim()) {
      const f = this.filtro.toLowerCase();
      lista = lista.filter(p =>
        p.cliente.toLowerCase().includes(f) ||
        p.ref.toLowerCase().includes(f) ||
        p.destino.toLowerCase().includes(f) ||
        p.descricaoCarga.toLowerCase().includes(f)
      );
    }
    return lista;
  }

  get totalPendentes() { return this.pedidos.filter(p => p.estado === 'PENDENTE').length; }
  get totalRespondidos() { return this.pedidos.filter(p => p.estado === 'RESPONDIDO').length; }
  get totalGerados() { return this.pedidos.filter(p => p.estado === 'COTAÇÃO GERADA').length; }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDENTE': return 'badge badge-warning';
      case 'RESPONDIDO': return 'badge badge-info';
      case 'COTAÇÃO GERADA': return 'badge badge-success';
      default: return 'badge';
    }
  }
}
