import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Ocorrencia {
  id: number;
  data: string;
  viaturaMatricula: string;
  viaturaNome: string;
  motorista: string;
  tipo: 'AVARIA' | 'ACIDENTE' | 'MANUTENÇÃO';
  descricao: string;
  gravidade: 'BAIXA' | 'MÉDIA' | 'ALTA' | 'CRÍTICA';
  estado: 'ABERTO' | 'EM REPARAÇÃO' | 'RESOLVIDO';
  custoEstimado: number;
}

@Component({
  selector: 'app-viaturas-estado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './viaturas-estado.component.html',
  styleUrls: ['../shared/billing-page.css', './viaturas-estado.component.css']
})
export class ViaturasEstadoComponent {
  filtroEstado = 'TODOS';
  mostrarFormOcorrencia = false;

  novaOcorrencia = {
    viatura: '',
    motorista: '',
    tipo: '' as 'AVARIA' | 'ACIDENTE' | 'MANUTENÇÃO' | '',
    descricao: '',
    gravidade: '' as 'BAIXA' | 'MÉDIA' | 'ALTA' | 'CRÍTICA' | '',
    custoEstimado: null as number | null,
    data: new Date().toISOString().split('T')[0]
  };

  viaturas = [
    { matricula: 'MDD-45-78', nome: 'Volvo FH16', estado: 'OPERACIONAL', ultimaOcorrencia: '—' },
    { matricula: 'MPT-12-34', nome: 'Scania R450', estado: 'EM REPARAÇÃO', ultimaOcorrencia: '17/01/2025' },
    { matricula: 'MNP-56-90', nome: 'Iveco Stralis', estado: 'AVARIADO', ultimaOcorrencia: '20/01/2025' },
    { matricula: 'MTT-67-89', nome: 'Isuzu NPR', estado: 'OPERACIONAL', ultimaOcorrencia: '—' },
    { matricula: 'MBR-89-12', nome: 'Mercedes Actros', estado: 'OPERACIONAL', ultimaOcorrencia: '08/01/2025' },
    { matricula: 'MGZ-34-56', nome: 'DAF XF', estado: 'ACIDENTADO', ultimaOcorrencia: '22/01/2025' }
  ];

  motoristas = ['João Macuácua', 'Alberto Chissano', 'Samuel Dinis', 'Mário Tembe', 'Carlos Sitoe', 'António Bila'];

  ocorrencias: Ocorrencia[] = [
    { id: 1, data: '22/01/2025', viaturaMatricula: 'MGZ-34-56', viaturaNome: 'DAF XF', motorista: 'Carlos Sitoe', tipo: 'ACIDENTE', descricao: 'Colisão lateral na EN1 — danos na carroçaria lado direito', gravidade: 'ALTA', estado: 'ABERTO', custoEstimado: 180000 },
    { id: 2, data: '20/01/2025', viaturaMatricula: 'MNP-56-90', viaturaNome: 'Iveco Stralis', motorista: 'Samuel Dinis', tipo: 'AVARIA', descricao: 'Falha no sistema de travagem — pastilhas gastas e disco empenado', gravidade: 'CRÍTICA', estado: 'EM REPARAÇÃO', custoEstimado: 45000 },
    { id: 3, data: '17/01/2025', viaturaMatricula: 'MPT-12-34', viaturaNome: 'Scania R450', motorista: 'Alberto Chissano', tipo: 'AVARIA', descricao: 'Vazamento de óleo no motor — junta da tampa de válvulas', gravidade: 'MÉDIA', estado: 'EM REPARAÇÃO', custoEstimado: 28000 },
    { id: 4, data: '08/01/2025', viaturaMatricula: 'MBR-89-12', viaturaNome: 'Mercedes Actros', motorista: 'Mário Tembe', tipo: 'MANUTENÇÃO', descricao: 'Revisão programada 250.000km — completa', gravidade: 'BAIXA', estado: 'RESOLVIDO', custoEstimado: 38000 },
    { id: 5, data: '05/01/2025', viaturaMatricula: 'MDD-45-78', viaturaNome: 'Volvo FH16', motorista: 'João Macuácua', tipo: 'AVARIA', descricao: 'Pneu traseiro estourado na estrada — substituição de emergência', gravidade: 'MÉDIA', estado: 'RESOLVIDO', custoEstimado: 22000 },
    { id: 6, data: '02/01/2025', viaturaMatricula: 'MNP-56-90', viaturaNome: 'Iveco Stralis', motorista: 'Samuel Dinis', tipo: 'ACIDENTE', descricao: 'Saída de pista em curva — danos no para-choques e farol', gravidade: 'ALTA', estado: 'RESOLVIDO', custoEstimado: 65000 }
  ];

  get viaturasOperacionais() { return this.viaturas.filter(v => v.estado === 'OPERACIONAL').length; }
  get viaturasParadas() { return this.viaturas.length - this.viaturasOperacionais; }
  get totalAcidentes() { return this.ocorrencias.filter(o => o.tipo === 'ACIDENTE').length; }
  get totalAvarias() { return this.ocorrencias.filter(o => o.tipo === 'AVARIA').length; }
  get custoTotalOcorrencias() { return this.ocorrencias.reduce((s, o) => s + o.custoEstimado, 0); }

  get ocorrenciasFiltradas() {
    if (this.filtroEstado === 'TODOS') return this.ocorrencias;
    return this.ocorrencias.filter(o => o.estado === this.filtroEstado);
  }

  get motoristaIncidentes() {
    const map = new Map<string, { acidentes: number; avarias: number; total: number }>();
    this.ocorrencias.forEach(o => {
      if (o.tipo === 'MANUTENÇÃO') return;
      if (!map.has(o.motorista)) map.set(o.motorista, { acidentes: 0, avarias: 0, total: 0 });
      const m = map.get(o.motorista)!;
      if (o.tipo === 'ACIDENTE') m.acidentes++;
      if (o.tipo === 'AVARIA') m.avarias++;
      m.total++;
    });
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
  }

  getEstadoBadge(estado: string): string {
    switch (estado) {
      case 'OPERACIONAL': return 'badge badge-success';
      case 'EM REPARAÇÃO': return 'badge badge-warning';
      case 'AVARIADO': return 'badge badge-danger';
      case 'ACIDENTADO': return 'badge badge-danger';
      default: return 'badge';
    }
  }

  getEstadoCor(estado: string): string {
    switch (estado) {
      case 'OPERACIONAL': return 'var(--success)';
      case 'EM REPARAÇÃO': return 'var(--warning)';
      case 'AVARIADO': return 'var(--danger)';
      case 'ACIDENTADO': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  }

  getEstadoSlug(estado: string): string {
    return (estado || '').toLowerCase()
      .replace(/\s+/g, '-').replace(/[ãâáà]/g, 'a').replace(/[êé]/g, 'e').replace(/ç/g, 'c') || 'default';
  }

  getTipoBadge(tipo: string): string {
    switch (tipo) {
      case 'ACIDENTE': return 'badge badge-danger';
      case 'AVARIA': return 'badge badge-warning';
      case 'MANUTENÇÃO': return 'badge badge-info';
      default: return 'badge';
    }
  }

  getGravidadeBadge(g: string): string {
    switch (g) {
      case 'CRÍTICA': return 'badge badge-danger';
      case 'ALTA': return 'badge badge-danger';
      case 'MÉDIA': return 'badge badge-warning';
      case 'BAIXA': return 'badge badge-info';
      default: return 'badge';
    }
  }

  getOcorrenciaEstadoBadge(e: string): string {
    switch (e) {
      case 'ABERTO': return 'badge badge-danger';
      case 'EM REPARAÇÃO': return 'badge badge-warning';
      case 'RESOLVIDO': return 'badge badge-success';
      default: return 'badge';
    }
  }

  registarOcorrencia(): void {
    console.log('Nova ocorrência:', this.novaOcorrencia);
    this.mostrarFormOcorrencia = false;
  }
}
