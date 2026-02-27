import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';

@Component({
  selector: 'app-motoristas-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BillingSectionHeaderComponent],
  templateUrl: './motoristas-cadastro.component.html',
  styleUrls: ['../shared/billing-page.css', './motoristas-cadastro.component.css']
})
export class MotoristasCadastroComponent {
  motorista = {
    nome: '',
    telefone: '',
    bi: '',
    dataNascimento: '',
    cartaConducao: '',
    categoriaCarta: '',
    validadeCarta: '',
    endereco: '',
    contactoEmergencia: '',
    observacoes: ''
  };

  categorias = ['B', 'C', 'C+E', 'D'];

  salvar() {
    console.log('Salvar motorista:', this.motorista);
  }
}
