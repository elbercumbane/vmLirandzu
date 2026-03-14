import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-viaturas-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './viaturas-categorias.component.html',
  styleUrls: ['../shared/billing-page.css', './viaturas-categorias.component.css']
})
export class ViaturasCategoriasComponent {
  novaCategoria = '';
  editandoId: number | null = null;
  editandoNome = '';

  categorias = [
    { id: 1, nome: 'Camião Pesado', descricao: 'Veículos acima de 16 toneladas', totalViaturas: 3 },
    { id: 2, nome: 'Camião Médio', descricao: 'Veículos de 7.5 a 16 toneladas', totalViaturas: 1 },
    { id: 3, nome: 'Camião Leve', descricao: 'Veículos até 7.5 toneladas', totalViaturas: 1 },
    { id: 4, nome: 'Reboque', descricao: 'Reboques e semi-reboques', totalViaturas: 2 },
    { id: 5, nome: 'Semi-Reboque', descricao: 'Semi-reboques de carga', totalViaturas: 1 }
  ];

  adicionarCategoria(): void {
    if (!this.novaCategoria.trim()) return;
    const id = Math.max(...this.categorias.map(c => c.id), 0) + 1;
    this.categorias.push({ id, nome: this.novaCategoria.trim(), descricao: '', totalViaturas: 0 });
    this.novaCategoria = '';
  }

  iniciarEdicao(cat: { id: number; nome: string; descricao: string; totalViaturas: number }): void {
    this.editandoId = cat.id;
    this.editandoNome = cat.nome;
  }

  salvarEdicao(cat: { id: number; nome: string; descricao: string; totalViaturas: number }): void {
    cat.nome = this.editandoNome;
    this.editandoId = null;
  }

  cancelarEdicao(): void {
    this.editandoId = null;
  }

  removerCategoria(id: number): void {
    this.categorias = this.categorias.filter(c => c.id !== id);
  }
}
