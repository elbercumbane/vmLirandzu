import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface ItemGuiaRemessaRequest {
  cliente?: { id: number };
  encomenda?: { numeroEncomenda: number };
  descricao: string;
  quantidade: number;
  peso?: string;
  observacao?: string;
}

export interface GuiaRemessaRequest {
  motorista?: { id: number };
  viatura?: { id: number };
  viagem?: { id: number };
  origem: string;
  destino: string;
  kmSaida?: number;
  kmChegada?: number;
  valorTotal?: number;
  status?: string;
  observacoes?: string;
  dataGuia?: string;
  itens?: ItemGuiaRemessaRequest[];
}

export interface ItemGuiaRemessaResponse {
  id: number;
  cliente?: any;
  encomenda?: any;
  descricao: string;
  quantidade: number;
  peso?: string;
  observacao?: string;
}

export interface GuiaRemessaResponse {
  id: number;
  referencia: string;
  dataGuia: string;
  motorista?: any;
  viatura?: any;
  viagem?: any;
  origem: string;
  destino: string;
  kmSaida?: number;
  kmChegada?: number;
  kmPercorridos?: number;
  valorTotal?: number;
  status: string;
  observacoes?: string;
  itens?: ItemGuiaRemessaResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class GuiaRemessaService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  criarGuiaRemessa(guia: GuiaRemessaRequest): Observable<GuiaRemessaResponse> {
    return this.http.post<GuiaRemessaResponse>(`${this.apiUrl}/guias-remessa`, guia);
  }

  listarGuiasRemessa(status?: string): Observable<GuiaRemessaResponse[]> {
    let params = new HttpParams();
    if (status) {
      params = params.append('status', status);
    }
    return this.http.get<GuiaRemessaResponse[]>(`${this.apiUrl}/guias-remessa`, { params });
  }

  obterGuiaRemessa(id: number): Observable<GuiaRemessaResponse> {
    return this.http.get<GuiaRemessaResponse>(`${this.apiUrl}/guias-remessa/${id}`);
  }

  atualizarGuiaRemessa(id: number, guia: GuiaRemessaRequest): Observable<GuiaRemessaResponse> {
    return this.http.put<GuiaRemessaResponse>(`${this.apiUrl}/guias-remessa/${id}`, guia);
  }

  excluirGuiaRemessa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/guias-remessa/${id}`);
  }
}
