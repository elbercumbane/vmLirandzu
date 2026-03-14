import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NOTICIAS } from '../../../data/noticias.data';

@Component({
  selector: 'app-noticia-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './noticia-detalhe.component.html',
  styleUrl: './noticia-detalhe.component.css'
})
export class NoticiaDetalheComponent {
  private route = inject(ActivatedRoute);
  noticia = NOTICIAS.find(n => n.id === +this.route.snapshot.paramMap.get('id')!);

  formatarData(data: string): string {
    const d = new Date(data);
    return d.toLocaleDateString('pt-MZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  get paragrafos(): string[] {
    if (!this.noticia?.conteudo) return [];
    return this.noticia.conteudo.split(/\n\n+/).filter(p => p.trim());
  }
}
