import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NOTICIAS } from '../../data/noticias.data';

@Component({
  selector: 'app-noticias-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './noticias-preview.component.html',
  styleUrl: './noticias-preview.component.css'
})
export class NoticiasPreviewComponent {
  noticias = NOTICIAS.slice(0, 3);

  formatarData(data: string): string {
    const d = new Date(data);
    return d.toLocaleDateString('pt-MZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
