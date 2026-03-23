import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Viatura {
  id?: number;
  marca: string;
  modelo: string;
  matricula: string;
  ano?: number;
  cor?: string;
  tipo?: string;
  capacidade?: number;
  capacidadeUnidade?: string;
  combustivel?: string;
  numeroChassis?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ViaturaService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  listarViaturas(): Observable<Viatura[]> {
    return this.http.get<Viatura[]>(`${this.apiUrl}/viaturas`);
  }

  obterViatura(id: number): Observable<Viatura> {
    return this.http.get<Viatura>(`${this.apiUrl}/viaturas/${id}`);
  }

  criarViatura(viatura: Viatura): Observable<Viatura> {
    return this.http.post<Viatura>(`${this.apiUrl}/viaturas`, viatura);
  }

  atualizarViatura(id: number, viatura: Viatura): Observable<Viatura> {
    return this.http.put<Viatura>(`${this.apiUrl}/viaturas/${id}`, viatura);
  }

  excluirViatura(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/viaturas/${id}`);
  }
}
