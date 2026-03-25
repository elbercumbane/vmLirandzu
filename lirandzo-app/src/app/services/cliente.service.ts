import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Cliente {
  id?: number;
  nome: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  nif?: string;
  valorTotalFaturado?: number;
  valorEmDivida?: number;
  numeroEncomendas?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  listarClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/clientes`);
  }

  buscarClientes(nome?: string, telefone?: string): Observable<Cliente[]> {
    const params: any = {};
    if (nome) params.nome = nome;
    if (telefone) params.telefone = telefone;
    return this.http.get<Cliente[]>(`${this.apiUrl}/clientes/search`, { params });
  }

  obterClientePorEmail(email: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/clientes/by-email`, {
      params: { email }
    });
  }

  criarCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.apiUrl}/clientes`, cliente);
  }
}
