import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface OcorrenciaRequest {
  vehicleId: number;
  driverId?: number;
  occurrenceDate: string;
  type: string;
  description: string;
  vehicleImpact: string;  // OPERACIONAL | EM_REPARACAO | PERDA_TOTAL — obrigatório
  severity?: string;
  status?: string;
  estimatedCost?: number;
}

export interface Ocorrencia {
  id: number;
  occurrenceDate: string;
  vehicleId: number;
  vehiclePlate: string;
  vehicleName: string;
  driverId?: number;
  driverName?: string;
  type: string;
  description: string;
  severity?: string;
  status: string;
  vehicleImpact?: string;
  estimatedCost?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OcorrenciaService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  listar(): Observable<Ocorrencia[]> {
    return this.http.get<Ocorrencia[]>(`${this.apiUrl}/viaturas/ocorrencias`);
  }

  obter(id: number): Observable<Ocorrencia> {
    return this.http.get<Ocorrencia>(`${this.apiUrl}/viaturas/ocorrencias/${id}`);
  }

  porViatura(vehicleId: number): Observable<Ocorrencia[]> {
    return this.http.get<Ocorrencia[]>(`${this.apiUrl}/viaturas/ocorrencias/viatura/${vehicleId}`);
  }

  criar(ocorrencia: OcorrenciaRequest): Observable<Ocorrencia> {
    return this.http.post<Ocorrencia>(`${this.apiUrl}/viaturas/ocorrencias`, ocorrencia);
  }

  actualizar(id: number, ocorrencia: OcorrenciaRequest): Observable<Ocorrencia> {
    return this.http.put<Ocorrencia>(`${this.apiUrl}/viaturas/ocorrencias/${id}`, ocorrencia);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/viaturas/ocorrencias/${id}`);
  }
}
