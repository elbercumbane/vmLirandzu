import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clientes-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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

  salvar() {
    console.log('Salvar cliente:', this.cliente);
  }
}
