import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NOTICIAS } from '../data/noticias.data';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './noticias.component.html',
  styleUrl: './noticias.component.css'
})
export class NoticiasComponent {
  noticias = NOTICIAS;

  get noticiaDestaque() {
    return this.noticias.find(n => n.destaque);
  }

  get noticiasRecentes() {
    return this.noticias.filter(n => !n.destaque);
  }

  formatarData(data: string): string {
    const d = new Date(data);
    return d.toLocaleDateString('pt-MZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
