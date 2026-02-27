import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ItemEncomenda {
  quantidade: number;
  descricao: string;
  precoUnitario: number | null;
}

@Component({
  selector: 'app-encomendas-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './encomendas-cadastro.component.html',
  styleUrls: ['../shared/billing-page.css', './encomendas-cadastro.component.css']
})
export class EncomendasCadastroComponent {
  encomenda = {
    numeroFactura: '',
    data: '',
    clienteNome: '',
    clienteEndereco: '',
    clienteProvincia: '',
    clienteContacto: '',
    clienteTelefone: '',
    clienteNuit: '',
    custoTransporte: null as number | null,
    custoRecolha: null as number | null,
    custoBillOfEntry: null as number | null,
    termos: '',
    observacoes: ''
  };

  itens: ItemEncomenda[] = [
    { quantidade: 1, descricao: '', precoUnitario: null }
  ];

  provincias = ['Maputo Cidade', 'Maputo Província', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Niassa', 'Cabo Delgado'];

  adicionarItem(): void {
    this.itens.push({ quantidade: 1, descricao: '', precoUnitario: null });
  }

  removerItem(index: number): void {
    if (this.itens.length > 1) this.itens.splice(index, 1);
  }

  getSubtotalItem(item: ItemEncomenda): number {
    return item.quantidade * (item.precoUnitario || 0);
  }

  get subtotalItens(): number {
    return this.itens.reduce((s, i) => s + this.getSubtotalItem(i), 0);
  }

  get totalCustos(): number {
    return (this.encomenda.custoTransporte || 0) + (this.encomenda.custoRecolha || 0) + (this.encomenda.custoBillOfEntry || 0);
  }

  get totalGeral(): number {
    return this.subtotalItens + this.totalCustos;
  }

  salvar(): void {
    console.log('Salvar encomenda:', { encomenda: this.encomenda, itens: this.itens });
  }
}
