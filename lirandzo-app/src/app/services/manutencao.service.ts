import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface ManutencaoRequest {
  vehicleId: number;
  maintenanceDate: string;
  type: string;
  description: string;
  cost?: number;
  partsReplaced?: string;
  workshop?: string;
  kmReading?: number;
  status?: string;
}

export interface Manutencao {
  id: number;
  maintenanceDate: string;
  vehicleId: number;
  vehiclePlate: string;
  vehicleName: string;
  type: string;
  description: string;
  cost?: number;
  partsReplaced?: string;
  workshop?: string;
  kmReading?: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ManutencaoService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  listar(): Observable<Manutencao[]> {
    return this.http.get<Manutencao[]>(`${this.apiUrl}/manutencao`);
  }

  obter(id: number): Observable<Manutencao> {
    return this.http.get<Manutencao>(`${this.apiUrl}/manutencao/${id}`);
  }

  porViatura(vehicleId: number): Observable<Manutencao[]> {
    return this.http.get<Manutencao[]>(`${this.apiUrl}/manutencao/viatura/${vehicleId}`);
  }

  criar(req: ManutencaoRequest): Observable<Manutencao> {
    return this.http.post<Manutencao>(`${this.apiUrl}/manutencao`, req);
  }

  actualizar(id: number, req: ManutencaoRequest): Observable<Manutencao> {
    return this.http.put<Manutencao>(`${this.apiUrl}/manutencao/${id}`, req);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/manutencao/${id}`);
  }
}
