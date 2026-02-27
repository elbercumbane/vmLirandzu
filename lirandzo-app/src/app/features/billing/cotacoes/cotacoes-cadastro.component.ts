import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ItemCotacao {
  descricao: string;
  quantidade: number;
  precoUnitario: number | null;
}

@Component({
  selector: 'app-cotacoes-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cotacoes-cadastro.component.html',
  styleUrls: ['../shared/billing-page.css', './cotacoes-cadastro.component.css']
})
export class CotacoesCadastroComponent {
  cotacao = {
    referencia: 'COT-2025-' + String(Math.floor(Math.random() * 900) + 100),
    data: new Date().toISOString().split('T')[0],
    validade: '',
    operador: '',
    clienteNome: '',
    clienteContacto: '',
    clienteTelefone: '',
    clienteEmail: '',
    origem: '',
    destino: '',
    tipoVeiculo: '',
    custoTransporte: null as number | null,
    custoRecolha: null as number | null,
    custoBillOfEntry: null as number | null,
    observacoes: '',
    condicoes: 'Entrega condicionada a pagamento. Preços sujeitos a alteração sem aviso prévio.'
  };

  itens: ItemCotacao[] = [
    { descricao: '', quantidade: 1, precoUnitario: null }
  ];

  operadores = ['Ana Silva', 'João Macuácua', 'Alberto Chissano', 'Mário Tembe'];
  tiposVeiculo = ['Camião Pesado (+16t)', 'Camião Médio (7.5-16t)', 'Camião Leve (até 7.5t)', 'Semi-Reboque'];

  adicionarItem(): void {
    this.itens.push({ descricao: '', quantidade: 1, precoUnitario: null });
  }

  removerItem(i: number): void {
    if (this.itens.length > 1) this.itens.splice(i, 1);
  }

  getSubtotalItem(item: ItemCotacao): number {
    return item.quantidade * (item.precoUnitario || 0);
  }

  get subtotalItens(): number {
    return this.itens.reduce((s, i) => s + this.getSubtotalItem(i), 0);
  }

  get totalCustos(): number {
    return (this.cotacao.custoTransporte || 0) + (this.cotacao.custoRecolha || 0) + (this.cotacao.custoBillOfEntry || 0);
  }

  get totalGeral(): number {
    return this.subtotalItens + this.totalCustos;
  }

  gerarCotacao(): void {
    console.log('Gerar cotação:', { cotacao: this.cotacao, itens: this.itens, total: this.totalGeral });
    alert('Cotação ' + this.cotacao.referencia + ' gerada com sucesso! Total: ' + this.totalGeral.toFixed(2) + ' MZN');
  }

  baixarCotacao(): void {
    console.log('Baixar cotação como PDF');
    alert('A funcionalidade de download será implementada com geração de PDF.');
  }
}
