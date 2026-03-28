import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export type VerificationStatusApi =
  | 'CONFIRMED'
  | 'PENDING_BANK'
  | 'PENDING_APPROVAL'
  | 'REJECTED';

export interface PagamentoResponse {
  id: number;
  valor: number;
  dataPagamento?: string;
  referencia?: string;
  observacoes?: string;
  metodoPagamento?: string;
  verificationStatus: VerificationStatusApi;
  encomenda?: {
    numeroEncomenda: number;
    invoiceNumber?: string;
    cliente?: { nome?: string; telefone?: string };
  };
}

export interface PagamentoCreateRequest {
  encomenda: { numeroEncomenda: number };
  valor: number;
  dataPagamento?: string;
  referencia?: string;
  observacoes?: string;
  metodoPagamento?: string;
  verificationStatus: VerificationStatusApi;
}

@Injectable({
  providedIn: 'root'
})
export class PagamentoService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<PagamentoResponse[]> {
    return this.http.get<PagamentoResponse[]>(`${this.apiUrl}/pagamentos`);
  }

  listarPorEncomenda(encomendaId: number): Observable<PagamentoResponse[]> {
    return this.http.get<PagamentoResponse[]>(`${this.apiUrl}/pagamentos/encomenda/${encomendaId}`);
  }

  listarPendentesConciliacao(): Observable<PagamentoResponse[]> {
    return this.http.get<PagamentoResponse[]>(`${this.apiUrl}/pagamentos/pendentes-conciliacao`);
  }

  listarPendentesAprovacao(): Observable<PagamentoResponse[]> {
    return this.http.get<PagamentoResponse[]>(`${this.apiUrl}/pagamentos/pendentes-aprovacao`);
  }

  criar(p: PagamentoCreateRequest): Observable<PagamentoResponse> {
    return this.http.post<PagamentoResponse>(`${this.apiUrl}/pagamentos`, p);
  }

  confirmarConciliacao(id: number): Observable<PagamentoResponse> {
    return this.http.post<PagamentoResponse>(`${this.apiUrl}/pagamentos/${id}/confirmar`, {});
  }

  aprovarPagamentoGestor(id: number): Observable<PagamentoResponse> {
    return this.http.post<PagamentoResponse>(`${this.apiUrl}/pagamentos/${id}/aprovar`, {});
  }

  recusarPagamentoGestor(id: number, motivo?: string): Observable<PagamentoResponse> {
    return this.http.post<PagamentoResponse>(`${this.apiUrl}/pagamentos/${id}/recusar`, { motivo: motivo || '' });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pagamentos/${id}`);
  }
}
