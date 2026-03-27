import { AfterViewInit, Component, ElementRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { gsap } from 'gsap';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslocoModule],
  templateUrl: './contato.component.html',
  styleUrl: './contato.component.css'
})
export class ContatoComponent implements AfterViewInit {
  private el = inject(ElementRef);

  submitted = false;
  form = {
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: ''
  };

  ngAfterViewInit(): void {
    const host = this.el.nativeElement as HTMLElement;
    const bannerContent = host.querySelector('.contato-banner-content') as HTMLElement | null;
    const grid = host.querySelector('.contato-grid') as HTMLElement | null;
    const formWrap = host.querySelector('.contato-form-wrap') as HTMLElement | null;

    if (bannerContent) {
      gsap.fromTo(bannerContent, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' });
    }
    if (grid) {
      gsap.fromTo(grid, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', delay: 0.08 });
    }
    if (formWrap) {
      gsap.fromTo(formWrap, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: 0.12 });
    }
  }

  onSubmit(): void {
    this.submitted = true;
  }
}
