import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-viaturas-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './viaturas-cadastro.component.html',
  styleUrls: ['../shared/billing-page.css', './viaturas-cadastro.component.css']
})
export class ViaturasCadastroComponent {
  viatura = {
    matricula: '',
    marca: '',
    modelo: '',
    tipo: '',
    ano: null as number | null,
    cor: '',
    chassi: '',
    kmActual: null as number | null,
    capacidadeCarga: null as number | null,
    consumoMedio: null as number | null,
    observacoes: ''
  };

  tiposViatura = ['Camião Pesado', 'Camião Médio', 'Camião Leve', 'Reboque', 'Semi-Reboque'];

  fotoPreview: string | null = null;

  onFotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.fotoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  removerFoto(): void {
    this.fotoPreview = null;
  }

  salvar() {
    console.log('Salvar viatura:', this.viatura);
  }
}
