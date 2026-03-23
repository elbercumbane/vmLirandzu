import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface EncomendaRequest {
  cliente: { id: number };
  produto: string;
  origem: string;
  destino: string;
  valorTotal: number;
  valorPago?: number;
  dataEncomenda?: string;
  viagem?: { id: number };
}

export interface EncomendaResponse {
  numeroEncomenda: number;
  cliente: any;
  produto: string;
  origem: string;
  destino: string;
  valorTotal: number;
  valorPago: number;
  valorDivida: number;
  status: string;
  dataEncomenda: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  cotacao?: { id: number; referencia?: string };
}

/** Corpo de POST /facturacao/cotacao/:id/emitir — só o necessário para redireccionar ao detalhe. */
export interface EmitirFacturaResponse {
  numeroEncomenda: number;
  invoiceNumber?: string;
  invoiceDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EncomendaService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  criarEncomenda(encomenda: EncomendaRequest): Observable<EncomendaResponse> {
    return this.http.post<EncomendaResponse>(`${this.apiUrl}/encomendas`, encomenda);
  }

  listarEncomendas(): Observable<EncomendaResponse[]> {
    return this.http.get<EncomendaResponse[]>(`${this.apiUrl}/encomendas`);
  }

  obterEncomenda(id: number): Observable<EncomendaResponse> {
    return this.http.get<EncomendaResponse>(`${this.apiUrl}/encomendas/${id}`);
  }

  atualizarEncomenda(id: number, encomenda: EncomendaRequest): Observable<EncomendaResponse> {
    return this.http.put<EncomendaResponse>(`${this.apiUrl}/encomendas/${id}`, encomenda);
  }

  /** Cria encomenda com factura a partir de uma cotação enviada (estado respondida ou cotação gerada). */
  emitirFacturaDeCotacao(cotacaoId: number): Observable<EmitirFacturaResponse> {
    return this.http.post<EmitirFacturaResponse>(`${this.apiUrl}/facturacao/cotacao/${cotacaoId}/emitir`, {});
  }
}
