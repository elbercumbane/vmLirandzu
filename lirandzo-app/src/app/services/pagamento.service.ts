import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface PagamentoResponse {
  id: number;
  valor: number;
  dataPagamento?: string;
  referencia?: string;
  observacoes?: string;
  metodoPagamento?: string;
  verificationStatus: 'CONFIRMED' | 'PENDING_BANK';
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
  verificationStatus: 'CONFIRMED' | 'PENDING_BANK';
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

  criar(p: PagamentoCreateRequest): Observable<PagamentoResponse> {
    return this.http.post<PagamentoResponse>(`${this.apiUrl}/pagamentos`, p);
  }

  confirmarConciliacao(id: number): Observable<PagamentoResponse> {
    return this.http.post<PagamentoResponse>(`${this.apiUrl}/pagamentos/${id}/confirmar`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pagamentos/${id}`);
  }
}
