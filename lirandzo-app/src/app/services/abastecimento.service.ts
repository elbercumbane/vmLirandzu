import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface AbastecimentoRequest {
  vehicleId: number;
  refuelDate: string;
  liters: number;
  cost: number;
  kmReading?: number;
  station?: string;
  notes?: string;
}

export interface Abastecimento {
  id: number;
  refuelDate: string;
  vehicleId: number;
  vehiclePlate: string;
  vehicleName: string;
  liters: number;
  cost: number;
  kmReading?: number;
  station?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  listar(): Observable<Abastecimento[]> {
    return this.http.get<Abastecimento[]>(`${this.apiUrl}/combustivel/abastecimentos`);
  }

  obter(id: number): Observable<Abastecimento> {
    return this.http.get<Abastecimento>(`${this.apiUrl}/combustivel/abastecimentos/${id}`);
  }

  porViatura(vehicleId: number): Observable<Abastecimento[]> {
    return this.http.get<Abastecimento[]>(`${this.apiUrl}/combustivel/abastecimentos/viatura/${vehicleId}`);
  }

  criar(req: AbastecimentoRequest): Observable<Abastecimento> {
    return this.http.post<Abastecimento>(`${this.apiUrl}/combustivel/abastecimentos`, req);
  }

  actualizar(id: number, req: AbastecimentoRequest): Observable<Abastecimento> {
    return this.http.put<Abastecimento>(`${this.apiUrl}/combustivel/abastecimentos/${id}`, req);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/combustivel/abastecimentos/${id}`);
  }
}
