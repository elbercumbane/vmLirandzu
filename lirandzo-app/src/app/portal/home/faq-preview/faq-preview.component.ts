import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-faq-preview',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule],
  templateUrl: './faq-preview.component.html',
  styleUrl: './faq-preview.component.css'
})
export class FaqPreviewComponent implements OnInit {
  private transloco = inject(TranslocoService);
  faqs: { question: string; answer: string; open: boolean }[] = [];

  ngOnInit(): void {
    this.buildFaqs();
    this.transloco.langChanges$.subscribe(() => this.buildFaqs());
  }

  private buildFaqs(): void {
    const t = (k: string) => this.transloco.translate(k);
    this.faqs = [
      { question: t('faq.q1.question'), answer: t('faq.q1.answer'), open: false },
      { question: t('faq.q2.question'), answer: t('faq.q2.answer'), open: false },
      { question: t('faq.q3.question'), answer: t('faq.q3.answer'), open: false },
      { question: t('faq.q4.question'), answer: t('faq.q4.answer'), open: false }
    ];
  }

  toggle(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
