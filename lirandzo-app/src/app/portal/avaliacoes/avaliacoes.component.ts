import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-avaliacoes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './avaliacoes.component.html',
  styleUrl: './avaliacoes.component.css'
})
export class AvaliacoesComponent {
  submitted = false;
  form = {
    tipo: 'sugestao' as 'sugestao' | 'reclamacao' | 'elogio',
    nome: '',
    email: '',
    telefone: '',
    nota: 0 as number,
    mensagem: ''
  };

  onSubmit(): void {
    this.submitted = true;
  }

  setNota(nota: number): void {
    this.form.nota = nota;
  }
}
