import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { NOTICIAS } from '../data/noticias.data';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule],
  templateUrl: './noticias.component.html',
  styleUrl: './noticias.component.css'
})
export class NoticiasComponent {
  private transloco = inject(TranslocoService);
  noticias = NOTICIAS;

  get noticiaDestaque() {
    return this.noticias.find(n => n.destaque);
  }

  get noticiasRecentes() {
    return this.noticias.filter(n => !n.destaque);
  }

  formatarData(data: string): string {
    const d = new Date(data);
    const locale = this.transloco.getActiveLang() === 'en' ? 'en-GB' : 'pt-MZ';
    return d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
