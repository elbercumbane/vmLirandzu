import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Noticia {
  id: number;
  titulo: string;
  resumo: string;
  data: string;
  categoria: string;
}

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './noticias.component.html',
  styleUrl: './noticias.component.css'
})
export class NoticiasComponent {
  noticias: Noticia[] = [
    {
      id: 1,
      titulo: 'Novas rotas internacionais Maputo–Joanesburgo',
      resumo: 'Expandimos a nossa rede com frequência semanal para cargas gerais e contentorizadas entre Moçambique e África do Sul.',
      data: '2025-02-20',
      categoria: 'Operações'
    },
    {
      id: 2,
      titulo: 'Rastreio em tempo real agora disponível para todos os clientes',
      resumo: 'A plataforma de rastreio foi actualizada para incluir notificações por SMS e e-mail em cada etapa da entrega.',
      data: '2025-02-15',
      categoria: 'Tecnologia'
    },
    {
      id: 3,
      titulo: 'Lirandzo recebe certificação de qualidade ISO 9001',
      resumo: 'Conquistámos a certificação ISO 9001:2015, reforçando o nosso compromisso com processos padronizados e melhoria contínua.',
      data: '2025-02-10',
      categoria: 'Qualidade'
    },
    {
      id: 4,
      titulo: 'Nova frota: 5 camiões adicionados à operação',
      resumo: 'Investimos na ampliação da frota própria para responder ao aumento da procura e garantir maior flexibilidade de horários.',
      data: '2025-02-05',
      categoria: 'Frota'
    },
    {
      id: 5,
      titulo: 'Parceria com armazéns em Nacala e Beira',
      resumo: 'Novos pontos de consolidação permitem reduzir tempos de trânsito e custos para cargas com destino ao norte do país.',
      data: '2025-01-28',
      categoria: 'Infraestrutura'
    }
  ];

  formatarData(data: string): string {
    const d = new Date(data);
    return d.toLocaleDateString('pt-MZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
