import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BillingSectionHeaderComponent } from '../shared/billing-section-header.component';

@Component({
  selector: 'app-manutencao-placeholder',
  standalone: true,
  imports: [CommonModule, RouterLink, BillingSectionHeaderComponent],
  template: `
    <app-billing-section-header
      [showBack]="true"
      [backLink]="'/billing'"
      title="Manutenção"
      subtitle="Controlo de manutenções preventivas e correctivas"
    ></app-billing-section-header>
    <div class="card" style="padding: 2rem; text-align: center;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🔧</div>
      <h2 style="margin-bottom: 0.5rem;">Módulo em desenvolvimento</h2>
      <p style="color: var(--text-muted); max-width: 400px; margin: 0 auto 1.5rem;">
        Aqui serão registadas manutenções preventivas, correctivas, peças substituídas e custos por viatura.
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
export class ManutencaoPlaceholderComponent {}
