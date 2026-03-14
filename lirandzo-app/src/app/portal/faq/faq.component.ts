import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent {
  searchQuery = signal('');

  faqs: FaqItem[] = [
    { question: 'Quais tipos de carga a Lirandzo transporta?', answer: 'Transportamos cargas gerais, fraccionadas, contentorizadas e volumes especiais. A nossa frota é adaptada para diferentes tipos de mercadoria, desde produtos industriais a bens de consumo.', open: false },
    { question: 'Como posso rastrear o meu envio?', answer: 'Através da nossa plataforma online, basta aceder à página "Rastrear Pedido" e introduzir o código de rastreio fornecido no momento da expedição. O sistema mostra a localização em tempo real.', open: false },
    { question: 'Qual é o prazo de entrega?', answer: 'O prazo depende da origem, destino e tipo de serviço escolhido. Entregas nacionais demoram entre 1 a 5 dias úteis. Para rotas internacionais, o prazo pode variar entre 5 a 15 dias úteis.', open: false },
    { question: 'Como solicito uma cotação?', answer: 'Pode solicitar uma cotação directamente na nossa página "Solicitar Cotação", preenchendo o formulário com os detalhes da carga. A nossa equipa responde em até 24 horas úteis.', open: false },
    { question: 'A Lirandzo faz transporte internacional?', answer: 'Sim. Operamos rotas internacionais estratégicas, incluindo corredores entre Moçambique e África do Sul, com toda a documentação aduaneira tratada pela nossa equipa.', open: false },
    { question: 'A carga está segurada durante o transporte?', answer: 'Sim, todas as cargas transportadas pela Lirandzo estão cobertas por seguro de transporte. Em caso de incidente, o processo de reclamação é acompanhado pela nossa equipa de suporte.', open: false },
    { question: 'Como posso tornar-me parceiro da Lirandzo?', answer: 'Estamos sempre abertos a novas parcerias. Entre em contacto connosco através do formulário de contacto ou envie um e-mail para contato@lirandzo.com com a sua proposta.', open: false },
    { question: 'A Lirandzo oferece serviço de armazenagem?', answer: 'Sim. Dispomos de armazéns estratégicos que funcionam como hubs logísticos para consolidação, armazenamento temporário e distribuição de mercadorias.', open: false },
    { question: 'Como funciona o pagamento?', answer: 'Aceitamos transferência bancária, pagamento móvel e acordos de facturação mensal para clientes regulares. Os detalhes de pagamento são enviados junto com a confirmação do pedido.', open: false },
    { question: 'Posso agendar uma recolha de carga?', answer: 'Sim. Oferecemos serviço de recolha no local. Basta indicar o endereço e horário pretendido ao solicitar a cotação ou contactar a nossa equipa de operações.', open: false }
  ];

  filteredFaqs = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.faqs;
    return this.faqs.filter(f =>
      f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  });


  toggle(faq: FaqItem): void {
    this.faqs.forEach(f => {
      if (f !== faq) f.open = false;
    });
    faq.open = !faq.open;
  }
}
