import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contato.component.html',
  styleUrl: './contato.component.css'
})
export class ContatoComponent {
  submitted = false;
  form = {
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: ''
  };

  onSubmit(): void {
    this.submitted = true;
  }
}
