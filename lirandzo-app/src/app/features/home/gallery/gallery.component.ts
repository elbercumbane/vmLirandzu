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
        'camiao-carga-sacos.jpeg',
        'frota-lirandzo-armazem.jpeg',
        'equipa-maos-juntas.jpg',
        'camiao-terminal-carga.jpeg'
      ]
    },
    {
      name: 'Corredor de Desenvolvimento',
      description:
        'Momentos captados ao longo do corredor de desenvolvimento, com foco na coordenação entre motoristas, equipa de operações e parceiros locais.',
      photos: [
        'motorista-camiao.jpg',
        'frota-camioes.jpg',
        'motorista-cabine.jpg'
      ]
    },
    {
      name: 'Sessão com Parceiros',
      description:
        'Encontro com parceiros estratégicos para alinhamento de processos, melhoria contínua do serviço e reforço da confiança mútua.',
      photos: [
        'equipa-maos-juntas.jpg',
        'frota-lirandzo-armazem.jpeg',
        'motorista-camiao.jpg',
        'camiao-terminal-carga.jpeg'
      ]
    },
    {
      name: 'Equipa VM Lirandzo',
      description:
        'Retratos da equipa VM Lirandzo em contexto de operação e planeamento, a mostrar o compromisso diário com cada cliente.',
      photos: [
        'frota-lirandzo-armazem.jpeg',
        'motorista-camiao.jpg',
        'equipa-maos-juntas.jpg'
      ]
    },
    {
      name: 'Entrega Maputo',
      description:
        'Operações de entrega e descarga em Maputo, com equipa e parceiros no terreno junto dos clientes finais.',
      photos: [
        'camiao-carga-sacos.jpeg',
        'camiao-terminal-carga.jpeg'
      ]
    },
    {
      name: 'Formação e Segurança',
      description:
        'Sessões de formação e boas práticas de segurança para motoristas e equipa operacional, num ambiente de partilha e celebração.',
      photos: [
        'motorista-cabine.jpg',
        'frota-camioes.jpg',
        'flyer-vm-transportes.jpeg'
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
