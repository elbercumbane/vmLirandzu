import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

/** Condição de pagamento na proposta (alinhado ao enum backend). */
export type CondicaoPagamentoCotacao =
  | 'TOTALIDADE'
  | 'ADIANTADO_TOTAL'
  | 'DUAS_PRESTACOES'
  | 'PARCIAL';

export interface CotacaoRequest {
  cliente: { id: number };
  origem: string;
  destino: string;
  tipoVeiculo?: string;
  tipoServico?: string;
  descricaoCarga?: string;
  valorTotal?: number;
  custoTransporte?: number;
  custoRecolha?: number;
  custoBillOfEntry?: number;
  discountAmount?: number;
  vatAmount?: number;
  vatRate?: number;
  vatReason?: string;
  dataCotacao?: string;
  dataValidade?: string;
  status?: string;
  observacoes?: string;
  condicoes?: string;
  condicaoPagamento?: CondicaoPagamentoCotacao;
  operador?: string;
  formaEnvioPreferida?: string;
  formaEnvioRealizada?: string;
}

export interface CotacaoResponse {
  id: number;
  referencia: string;
  cliente: any;
  origem: string;
  destino: string;
  tipoVeiculo?: string;
  descricaoCarga?: string;
  valorTotal?: number;
  custoTransporte?: number;
  custoRecolha?: number;
  custoBillOfEntry?: number;
  dataCotacao: string;
  dataCriacao?: string;
  dataValidade?: string;
  status: string;
  observacoes?: string;
  fontePedido?: string;
  condicoes?: string;
  condicaoPagamento?: CondicaoPagamentoCotacao;
  operador?: string;
  dataResposta?: string;
  formaEnvioPreferida?: string;
  formaEnvioRealizada?: string;
  tipoServico?: string;
  discountAmount?: number;
  vatAmount?: number;
  vatRate?: number;
  vatReason?: string;
}

export interface CotacaoPortalRequest {
  nome: string;
  email: string;
  telefone1?: string;
  hasWhatsApp1?: boolean;
  telefone2?: string;
  hasWhatsApp2?: boolean;
  origem: string;
  destino: string;
  mensagem?: string;
  formaEnvioPreferida: 'whatsapp' | 'email' | 'pdf' | 'chamada';
  tipoServico?: 'TRANSPORTE' | 'COMPRA_TRANSPORTE';
  condicaoPagamento?: CondicaoPagamentoCotacao;
  /** Opcional — alinhado à factura */
  nuit?: string;
  endereco?: string;
  provincia?: string;
  pessoaContacto?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CotacaoService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  criarCotacao(cotacao: CotacaoRequest): Observable<CotacaoResponse> {
    return this.http.post<CotacaoResponse>(`${this.apiUrl}/cotacoes`, cotacao);
  }

  criarPedidoPortal(pedido: CotacaoPortalRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/cotacoes/portal`, pedido);
  }

  listarCotacoes(status?: string): Observable<CotacaoResponse[]> {
    let params = new HttpParams();
    if (status) {
      params = params.append('status', status);
    }
    return this.http.get<CotacaoResponse[]>(`${this.apiUrl}/cotacoes`, { params });
  }

  listarCotacoesPorCliente(clienteId: number): Observable<CotacaoResponse[]> {
    return this.http.get<CotacaoResponse[]>(`${this.apiUrl}/cotacoes/cliente/${clienteId}`);
  }

  obterCotacao(id: number): Observable<CotacaoResponse> {
    return this.http.get<CotacaoResponse>(`${this.apiUrl}/cotacoes/${id}`);
  }

  atualizarCotacao(id: number, cotacao: CotacaoRequest): Observable<CotacaoResponse> {
    return this.http.put<CotacaoResponse>(`${this.apiUrl}/cotacoes/${id}`, cotacao);
  }

  excluirCotacao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cotacoes/${id}`);
  }
}
