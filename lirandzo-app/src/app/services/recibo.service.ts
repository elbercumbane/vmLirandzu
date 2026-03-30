import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface ReciboResponse {
  id: number;
  pagamentoId: number;
  numeroPublico: string;
  ano: number;
  sequencia: number;
  dataEmissao: string;
  valor: number;
  clienteNome?: string;
  numeroFactura?: string;
  referenciaPagamento?: string;
  metodoPagamento?: string;
}

@Injectable({ providedIn: 'root' })
export class ReciboService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  listar(): Observable<ReciboResponse[]> {
    return this.http.get<ReciboResponse[]>(`${this.apiUrl}/recibos`);
  }

  obter(id: number): Observable<ReciboResponse> {
    return this.http.get<ReciboResponse>(`${this.apiUrl}/recibos/${id}`);
  }
}
