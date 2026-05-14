import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface RastreamentoEvento {
  codigo: string;
  titulo: string;
  detalhe: string | null;
  dataOcorrencia: string;
  concluido: boolean;
}

export interface RastreamentoTimeline {
  numeroEncomenda: number;
  trackingCode: string | null;
  invoiceNumber: string | null;
  referenciaCotacao: string | null;
  eventos: RastreamentoEvento[];
  progressoPercentual: number;
}

@Injectable({ providedIn: 'root' })
export class RastreamentoService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  obterTimelinePorEncomenda(numeroEncomenda: number): Observable<RastreamentoTimeline> {
    return this.http.get<RastreamentoTimeline>(`${this.apiUrl}/rastreamento/encomenda/${numeroEncomenda}`);
  }
}
