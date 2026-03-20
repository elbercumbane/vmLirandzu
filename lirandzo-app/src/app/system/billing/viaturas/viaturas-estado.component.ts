import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { OcorrenciaService, Ocorrencia, OcorrenciaRequest } from '../../../services/ocorrencia.service';
import { ViaturaService, Viatura } from '../../../services/viatura.service';
import { MotoristaService, Motorista } from '../../../services/motorista.service';

interface ViaturaEstadoDisplay {
  id: number;
  matricula: string;
  nome: string;
  estado: string;
  ultimaOcorrencia: string;
}

@Component({
  selector: 'app-viaturas-estado',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BillingSectionHeaderComponent],
  templateUrl: './viaturas-estado.component.html',
  styleUrls: ['../shared/billing-page.css', './viaturas-estado.component.css']
})
export class ViaturasEstadoComponent implements OnInit {
  filtroEstado = 'TODOS';
  mostrarFormOcorrencia = false;

  novaOcorrencia = {
    vehicleId: null as number | null,
    driverId: null as number | null,
    data: new Date().toISOString().split('T')[0],
    tipo: '' as '' | 'AVARIA' | 'ACIDENTE' | 'MANUTENCAO',
    impactoVeiculo: '' as '' | 'OPERACIONAL' | 'EM_REPARACAO' | 'PERDA_TOTAL',
    descricao: '',
    gravidade: '' as '' | 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA',
    custoEstimado: null as number | null
  };

  viaturas: Viatura[] = [];
  motoristas: Motorista[] = [];
  ocorrencias: Ocorrencia[] = [];

  loading = true;
  loadingForm = false;
  error: string | null = null;

  constructor(
    private ocorrenciaService: OcorrenciaService,
    private viaturaService: ViaturaService,
    private motoristaService: MotoristaService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.carregarDados();
    const viaturaId = this.route.snapshot.queryParamMap.get('viatura');
    if (viaturaId) {
      const id = +viaturaId;
      if (!isNaN(id)) {
        this.novaOcorrencia.vehicleId = id;
        this.mostrarFormOcorrencia = true;
      }
    }
  }

  carregarDados() {
    this.loading = true;
    this.error = null;

    Promise.all([
      this.viaturaService.listarViaturas().toPromise(),
      this.motoristaService.listarMotoristas().toPromise(),
      this.ocorrenciaService.listar().toPromise()
    ]).then(([v, m, o]) => {
      this.viaturas = v || [];
      this.motoristas = m || [];
      this.ocorrencias = o || [];
      this.loading = false;
    }).catch(err => {
      console.error('Erro ao carregar dados:', err);
      this.error = 'Erro ao carregar dados.';
      this.loading = false;
    });
  }

  get viaturasDisplay(): ViaturaEstadoDisplay[] {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'OPERACIONAL',
      'UNDER_MAINTENANCE': 'EM REPARAÇÃO',
      'RESERVED': 'RESERVADA',
      'INACTIVE': 'PARADO'
    };

    return this.viaturas.map(v => {
      const ultima = this.ocorrencias
        .filter(o => o.vehicleId === v.id)
        .sort((a, b) => new Date(b.occurrenceDate).getTime() - new Date(a.occurrenceDate).getTime())[0];
      const ultimaStr = ultima
        ? new Date(ultima.occurrenceDate).toLocaleDateString('pt-MZ')
        : '—';

      return {
        id: v.id!,
        matricula: v.matricula,
        nome: `${v.marca} ${v.modelo}`,
        estado: statusMap[v.status || ''] || v.status || 'OPERACIONAL',
        ultimaOcorrencia: ultimaStr
      };
    });
  }

  get viaturasOperacionais() {
    return this.viaturasDisplay.filter(v => v.estado === 'OPERACIONAL').length;
  }

  get viaturasParadas() {
    return this.viaturasDisplay.length - this.viaturasOperacionais;
  }

  get totalAcidentes() {
    return this.ocorrencias.filter(o => o.type === 'ACIDENTE').length;
  }

  get totalAvarias() {
    return this.ocorrencias.filter(o => o.type === 'AVARIA').length;
  }

  get custoTotalOcorrencias() {
    return this.ocorrencias.reduce((s, o) => s + (o.estimatedCost || 0), 0);
  }

  get ocorrenciasFiltradas(): Ocorrencia[] {
    if (this.filtroEstado === 'TODOS') return this.ocorrencias;
    return this.ocorrencias.filter(o => o.status === this.filtroEstado);
  }

  /** Valores que a API retorna no campo status (para o filtro bater) */
  readonly ESTADOS_FILTRO = [
    { valor: 'TODOS', label: 'Todos' },
    { valor: 'ABERTO', label: 'Abertos' },
    { valor: 'EM REPARAÇÃO', label: 'Em Reparação' },
    { valor: 'RESOLVIDO', label: 'Resolvidos' }
  ];

  get motoristaIncidentes(): [string, { acidentes: number; avarias: number; total: number }][] {
    const map = new Map<string, { acidentes: number; avarias: number; total: number }>();
    this.ocorrencias.forEach(o => {
      if (o.type === 'MANUTENCAO') return;
      const nome = o.driverName || 'Motorista não identificado';
      if (!map.has(nome)) map.set(nome, { acidentes: 0, avarias: 0, total: 0 });
      const m = map.get(nome)!;
      if (o.type === 'ACIDENTE') m.acidentes++;
      if (o.type === 'AVARIA') m.avarias++;
      m.total++;
    });
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
  }

  registarOcorrencia() {
    if (!this.novaOcorrencia.vehicleId) {
      alert('Seleccione a viatura.');
      return;
    }
    if (!this.novaOcorrencia.tipo) {
      alert('Seleccione o tipo (Avaria, Acidente ou Manutenção).');
      return;
    }
    if (this.novaOcorrencia.tipo === 'ACIDENTE' && !this.novaOcorrencia.driverId) {
      alert('Motorista é obrigatório para acidentes.');
      return;
    }
    if (!this.novaOcorrencia.impactoVeiculo) {
      alert('Indique o estado da viatura após a ocorrência (Operacional, Em Reparação ou Perda Total).');
      return;
    }
    if (!this.novaOcorrencia.descricao?.trim()) {
      alert('Preencha a descrição.');
      return;
    }

    const req: OcorrenciaRequest = {
      vehicleId: this.novaOcorrencia.vehicleId,
      driverId: this.novaOcorrencia.driverId || undefined,
      occurrenceDate: this.novaOcorrencia.data,
      type: this.novaOcorrencia.tipo,
      description: this.novaOcorrencia.descricao.trim(),
      vehicleImpact: this.novaOcorrencia.impactoVeiculo,
      severity: this.novaOcorrencia.gravidade || undefined,
      status: 'ABERTO',
      estimatedCost: this.novaOcorrencia.custoEstimado || undefined
    };

    this.loadingForm = true;
    this.ocorrenciaService.criar(req).subscribe({
      next: () => {
        this.mostrarFormOcorrencia = false;
        this.limparForm();
        this.carregarDados();
        this.loadingForm = false;
      },
      error: err => {
        console.error('Erro ao registar ocorrência:', err);
        alert('Erro ao registar. Tente novamente.');
        this.loadingForm = false;
      }
    });
  }

  limparForm() {
    this.novaOcorrencia = {
      vehicleId: null,
      driverId: null,
      data: new Date().toISOString().split('T')[0],
      tipo: '',
      impactoVeiculo: '',
      descricao: '',
      gravidade: '',
      custoEstimado: null
    };
  }

  formatarData(data: string): string {
    return data ? new Date(data).toLocaleDateString('pt-MZ') : '—';
  }

  getEstadoBadge(estado: string): string {
    switch (estado) {
      case 'OPERACIONAL': return 'badge badge-success';
      case 'EM REPARAÇÃO': return 'badge badge-warning';
      case 'RESERVADA': return 'badge badge-info';
      case 'PARADO': return 'badge badge-danger';
      default: return 'badge badge-neutral';
    }
  }

  getEstadoCor(estado: string): string {
    switch (estado) {
      case 'OPERACIONAL': return 'var(--success)';
      case 'EM REPARAÇÃO': return 'var(--warning)';
      case 'RESERVADA': return 'var(--info)';
      case 'PARADO': return 'var(--danger)';
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
      case 'MANUTENCAO': return 'badge badge-info';
      default: return 'badge badge-neutral';
    }
  }

  formatarTipo(tipo: string): string {
    const map: Record<string, string> = { ACIDENTE: 'Acidente', AVARIA: 'Avaria', MANUTENCAO: 'Manutenção' };
    return map[tipo] || tipo;
  }

  getImpactoBadge(i?: string): string {
    const key = (i || '').toUpperCase().replace(/\s+/g, '_');
    switch (key) {
      case 'OPERACIONAL': return 'badge badge-success';
      case 'EM_REPARACAO': return 'badge badge-warning';
      case 'EM REPARAÇÃO': return 'badge badge-warning';
      case 'PERDA_TOTAL': return 'badge badge-danger';
      default: return 'badge badge-neutral';
    }
  }

  formatarImpacto(i?: string): string {
    if (!i) return '—';
    const key = i.toUpperCase().replace(/\s+/g, '_');
    const map: Record<string, string> = { OPERACIONAL: 'Operacional', EM_REPARACAO: 'Em Reparação', 'EM REPARAÇÃO': 'Em Reparação', PERDA_TOTAL: 'Perda Total' };
    return map[key] || i;
  }

  getGravidadeBadge(g: string): string {
    switch ((g || '').toUpperCase()) {
      case 'CRITICA': return 'badge badge-danger';
      case 'ALTA': return 'badge badge-danger';
      case 'MEDIA': return 'badge badge-warning';
      case 'BAIXA': return 'badge badge-info';
      default: return 'badge badge-neutral';
    }
  }

  formatarGravidade(g?: string): string {
    if (!g) return '—';
    const map: Record<string, string> = { BAIXA: 'Baixa', MEDIA: 'Média', ALTA: 'Alta', CRITICA: 'Crítica' };
    return map[g.toUpperCase()] || g;
  }

  getOcorrenciaEstadoBadge(e: string): string {
    const key = (e || '').toUpperCase().replace(/\s+/g, '_');
    switch (key) {
      case 'ABERTO': return 'badge badge-danger';
      case 'EM_REPARACAO': return 'badge badge-warning';
      case 'EM REPARAÇÃO': return 'badge badge-warning';
      case 'RESOLVIDO': return 'badge badge-success';
      default: return 'badge badge-neutral';
    }
  }

  formatarEstado(e?: string): string {
    if (!e) return '—';
    const key = e.toUpperCase().replace(/\s+/g, '_');
    const map: Record<string, string> = { ABERTO: 'Aberto', EM_REPARACAO: 'Em Reparação', 'EM REPARAÇÃO': 'Em Reparação', RESOLVIDO: 'Resolvido' };
    return map[key] || e;
  }
}
