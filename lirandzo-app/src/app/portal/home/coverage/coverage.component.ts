import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

interface CoverageArea {
  key: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  l1: string;
  l2: string;
  l3: string;
}

@Component({
  selector: 'app-coverage',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  templateUrl: './coverage.component.html',
  styleUrl: './coverage.component.css'
})
export class CoverageComponent implements OnInit {
  private transloco = inject(TranslocoService);
  areas: CoverageArea[] = [];

  ngOnInit(): void {
    this.buildAreas();
    this.transloco.langChanges$.subscribe(() => this.buildAreas());
  }

  private buildAreas(): void {
    const t = (k: string) => this.transloco.translate(k);
    this.areas = [
      {
        key: 'mz',
        icon: 'map',
        title: t('coverage.mozambique.title'),
        description: t('coverage.mozambique.description'),
        color: '#b91c1c',
        l1: t('coverage.mozambique.l1'),
        l2: t('coverage.mozambique.l2'),
        l3: t('coverage.mozambique.l3'),
      },
      {
        key: 'za',
        icon: 'globe',
        title: t('coverage.southAfrica.title'),
        description: t('coverage.southAfrica.description'),
        color: '#b91c1c',
        l1: t('coverage.southAfrica.l1'),
        l2: t('coverage.southAfrica.l2'),
        l3: t('coverage.southAfrica.l3'),
      },
      {
        key: 'int',
        icon: 'route',
        title: t('coverage.international.title'),
        description: t('coverage.international.description'),
        color: '#b91c1c',
        l1: t('coverage.international.l1'),
        l2: t('coverage.international.l2'),
        l3: t('coverage.international.l3'),
      },
    ];
  }
}
