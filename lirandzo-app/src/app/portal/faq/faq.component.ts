import { Component, computed, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslocoModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent implements OnInit {
  private transloco = inject(TranslocoService);
  searchQuery = signal('');

  faqs = signal<FaqItem[]>([]);

  ngOnInit(): void {
    const build = () => this.buildFaqs();
    this.transloco.load(this.transloco.getActiveLang() || 'pt').subscribe(() => build());
    this.transloco.langChanges$.subscribe(lang => {
      this.transloco.load(lang).subscribe(() => build());
    });
  }

  private buildFaqs(): void {
    const t = (k: string) => this.transloco.translate(k);
    const items: FaqItem[] = [];
    for (let i = 1; i <= 10; i++) {
      items.push({
        question: t(`faqPage.q${i}.question`),
        answer: t(`faqPage.q${i}.answer`),
        open: false
      });
    }
    this.faqs.set(items);
  }

  filteredFaqs = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.faqs();
    if (!q) return list;
    return list.filter(f =>
      f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  });

  toggle(faq: FaqItem): void {
    this.faqs.update(list =>
      list.map(f => ({
        ...f,
        open: f === faq ? !f.open : false
      }))
    );
  }
}
