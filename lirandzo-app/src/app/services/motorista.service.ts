import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Motorista {
  id?: number;
  nome: string;
  telefone?: string;
  numeroCarta?: string;
  avaliacaoMedia?: number;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MotoristaService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  listarMotoristas(): Observable<Motorista[]> {
    return this.http.get<Motorista[]>(`${this.apiUrl}/motoristas`);
  }

  obterMotorista(id: number): Observable<Motorista> {
    return this.http.get<Motorista>(`${this.apiUrl}/motoristas/${id}`);
  }

  criarMotorista(motorista: Motorista): Observable<Motorista> {
    return this.http.post<Motorista>(`${this.apiUrl}/motoristas`, motorista);
  }

  atualizarMotorista(id: number, motorista: Motorista): Observable<Motorista> {
    return this.http.put<Motorista>(`${this.apiUrl}/motoristas/${id}`, motorista);
  }

  excluirMotorista(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/motoristas/${id}`);
  }
}
