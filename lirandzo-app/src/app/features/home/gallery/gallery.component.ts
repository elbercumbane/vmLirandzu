import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GalleryEvent {
  name: string;
  description: string;
  photos: string[];
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent {
  events: GalleryEvent[] = [
    {
      name: 'Operação Maputo – Porto Seco',
      description:
        'Registo fotográfico da nossa equipa a coordenar cargas e descargas num dos principais portos secos, garantindo segurança e cumprimento rigoroso dos prazos.',
      photos: [
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&q=80',
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11a?w=1200&q=80',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80'
      ]
    },
    {
      name: 'Corredor de Desenvolvimento',
      description:
        'Momentos captados ao longo do corredor de desenvolvimento, com foco na coordenação entre motoristas, equipa de operações e parceiros locais.',
      photos: [
        'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=80',
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=1200&q=80'
      ]
    },
    {
      name: 'Sessão com Parceiros',
      description:
        'Encontro com parceiros estratégicos para alinhamento de processos, melhoria contínua do serviço e reforço da confiança mútua.',
      photos: [
        'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8c?w=1200&q=80',
        'https://images.unsplash.com/photo-1524169358666-79f22534bc6e?w=1200&q=80',
        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80',
        'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=80'
      ]
    },
    {
      name: 'Equipa VM Lirandzo',
      description:
        'Retratos da equipa VM Lirandzo em contexto de operação e planeamento, a mostrar o compromisso diário com cada cliente.',
      photos: [
        'https://images.unsplash.com/photo-1552664688-cf412ec27db2?w=1200&q=80',
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11a?w=1200&q=80',
        'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1200&q=80'
      ]
    },
    {
      name: 'Entrega Maputo',
      description:
        'Operações de entrega e descarga em Maputo, com equipa e parceiros no terreno junto dos clientes finais.',
      photos: [
        'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&q=80',
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80'
      ]
    },
    {
      name: 'Formação e Segurança',
      description:
        'Sessões de formação e boas práticas de segurança para motoristas e equipa operacional, num ambiente de partilha e celebração.',
      photos: [
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&q=80',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80',
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80'
      ]
    }
  ];

  lightboxEvent: GalleryEvent | null = null;
  lightboxPhotoIndex: number = 0;

  getEventNumber(index: number): string {
    const num = index + 1;
    return num < 10 ? `0${num}` : String(num);
  }

  openLightbox(event: GalleryEvent): void {
    this.lightboxEvent = event;
    this.lightboxPhotoIndex = 0;
  }

  closeLightbox(): void {
    this.lightboxEvent = null;
  }

  setActivePhoto(index: number): void {
    if (this.lightboxEvent && index >= 0 && index < this.lightboxEvent.photos.length) {
      this.lightboxPhotoIndex = index;
    }
  }
}
