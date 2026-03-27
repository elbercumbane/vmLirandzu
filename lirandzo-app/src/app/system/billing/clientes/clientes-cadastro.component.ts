import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-clientes-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent],
  templateUrl: './clientes-cadastro.component.html',
  styleUrls: ['../shared/billing-page.css', './clientes-cadastro.component.css']
})
export class ClientesCadastroComponent {
  cliente = {
    nome: '',
    telefone: '',
    email: '',
    nuit: '',
    cidade: '',
    endereco: '',
    observacoes: ''
  };

  provincias = [
    'Maputo', 'Maputo Cidade', 'Gaza', 'Inhambane', 'Sofala', 'Manica',
    'Tete', 'Zambézia', 'Nampula', 'Cabo Delgado', 'Niassa'
  ];

  guardando = false;
  erro: string | null = null;

  constructor(
    private clienteService: ClienteService,
    private router: Router
  ) {}

  salvar(): void {
    const nome = this.cliente.nome?.trim();
    if (!nome) {
      this.erro = 'Indique o nome do cliente.';
      return;
    }
    this.erro = null;
    this.guardando = true;

    const partesEndereco: string[] = [];
    if (this.cliente.cidade?.trim()) partesEndereco.push(this.cliente.cidade.trim());
    if (this.cliente.endereco?.trim()) partesEndereco.push(this.cliente.endereco.trim());
    if (this.cliente.observacoes?.trim()) partesEndereco.push('Obs.: ' + this.cliente.observacoes.trim());

    this.clienteService
      .criarCliente({
        nome,
        telefone: this.cliente.telefone?.trim() || undefined,
        email: this.cliente.email?.trim() || undefined,
        endereco: partesEndereco.length ? partesEndereco.join('\n') : undefined,
        nif: this.cliente.nuit?.trim() || undefined
      })
      .subscribe({
        next: () => {
          this.guardando = false;
          this.router.navigate(['/billing/clientes']);
        },
        error: () => {
          this.guardando = false;
          this.erro = 'Não foi possível guardar. Verifique os dados e a ligação ao servidor.';
        }
      });
  }
}
