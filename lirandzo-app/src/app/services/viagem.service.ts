import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface ViagemRequest {
  motorista?: { id: number };
  viatura?: { id: number };
  origem: string;
  destino: string;
  dataPartida?: string;
  dataChegadaPrevista?: string;
  dataChegadaReal?: string;
  status?: string;
  combustivelConsumido?: number;
  custoCombustivel?: number;
}

export interface ViagemResponse {
  id: number;
  motorista?: any;
  viatura?: any;
  origem: string;
  destino: string;
  dataPartida?: string;
  dataChegadaPrevista?: string;
  dataChegadaReal?: string;
  status: string;
  combustivelConsumido?: number;
  custoCombustivel?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ViagemService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  criarViagem(viagem: ViagemRequest): Observable<ViagemResponse> {
    return this.http.post<ViagemResponse>(`${this.apiUrl}/viagens`, viagem);
  }

  listarViagens(): Observable<ViagemResponse[]> {
    return this.http.get<ViagemResponse[]>(`${this.apiUrl}/viagens`);
  }

  obterViagem(id: number): Observable<ViagemResponse> {
    return this.http.get<ViagemResponse>(`${this.apiUrl}/viagens/${id}`);
  }

  atualizarViagem(id: number, viagem: ViagemRequest): Observable<ViagemResponse> {
    return this.http.put<ViagemResponse>(`${this.apiUrl}/viagens/${id}`, viagem);
  }

  excluirViagem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/viagens/${id}`);
  }
}
