import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-faq-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './faq-preview.component.html',
  styleUrl: './faq-preview.component.css'
})
export class FaqPreviewComponent {
  faqs = [
    {
      question: 'Quais tipos de carga a Lirandzo transporta?',
      answer: 'Transportamos cargas gerais, fraccionadas, contentorizadas e volumes especiais.',
      open: false
    },
    {
      question: 'Como posso rastrear o meu envio?',
      answer: 'Aceda à página "Rastrear Pedido" e introduza o código de rastreio fornecido na expedição.',
      open: false
    },
    {
      question: 'Qual é o prazo de entrega?',
      answer: 'Entregas nacionais demoram entre 1 a 5 dias úteis. Rotas internacionais entre 5 a 15 dias úteis.',
      open: false
    },
    {
      question: 'Como solicito uma cotação?',
      answer: 'Preencha o formulário na página "Solicitar Cotação". Respondemos em até 24 horas úteis.',
      open: false
    }
  ];

  toggle(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
