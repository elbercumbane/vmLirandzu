import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';

@Component({
  selector: 'app-combustivel-placeholder',
  standalone: true,
  imports: [CommonModule, RouterLink, BillingSectionHeaderComponent],
  template: `
    <app-billing-section-header
      [showBack]="true"
      [backLink]="'/billing'"
      title="Combustível"
      subtitle="Controlo de abastecimentos e facturação (Puma Energy)"
    ></app-billing-section-header>
    <div class="card" style="padding: 2rem; text-align: center;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">⛽</div>
      <h2 style="margin-bottom: 0.5rem;">Módulo em desenvolvimento</h2>
      <p style="color: var(--text-muted); max-width: 400px; margin: 0 auto 1.5rem;">
        Aqui serão registados os abastecimentos, facturas mensais da Puma Energy e relatórios de consumo por viatura.
      </p>
      <a routerLink="/billing" class="btn-primary">Voltar ao Dashboard</a>
    </div>
  `,
  styleUrls: ['../shared/billing-page.css'],
  styles: [`
    :host { display: block; }
    .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: var(--primary); color: white; border-radius: 6px; text-decoration: none; font-weight: 500; }
    .btn-primary:hover { opacity: 0.9; }
  `]
})
export class CombustivelPlaceholderComponent {}
