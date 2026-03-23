import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

interface ServiceDetail {
  id: string;
  icon: string;
  badge: string;
  title: string;
  description: string;
  features: string[];
  image: string;
}

@Component({
  selector: 'app-all-services',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule],
  templateUrl: './all-services.component.html',
  styleUrl: './all-services.component.css'
})
export class AllServicesComponent implements OnInit {
  private transloco = inject(TranslocoService);

  metrics: { value: string; label: string; trend: string; fill: number }[] = [];
  services: ServiceDetail[] = [];
  marqueeTags: string[] = [];

  private readonly svcMeta = [
    { key: 'truck', icon: 'truck', image: '/images/hero-truck-1.jpg' },
    { key: 'procurement', icon: 'procurement', image: '/images/about-warehouse.jpg' },
    { key: 'tracking', icon: 'tracking', image: '/camiao-terminal-carga.jpeg' },
    { key: 'logistics', icon: 'logistics', image: '/images/hero-warehouse-3.jpg' },
    { key: 'warehouse', icon: 'warehouse', image: '/images/about-warehouse.jpg' },
    { key: 'customs', icon: 'customs', image: '/camiao-carga-sacos.jpeg' }
  ];

  private readonly svcIds = ['SRV-01', 'SRV-02', 'SRV-03', 'SRV-04', 'SRV-05', 'SRV-06'];

  ngOnInit(): void {
    const build = () => this.buildContent();
    this.transloco.load(this.transloco.getActiveLang() || 'pt').subscribe(() => build());
    this.transloco.langChanges$.subscribe(lang => {
      this.transloco.load(lang).subscribe(() => build());
    });
  }

  private buildContent(): void {
    const t = (k: string) => this.transloco.translate(k);
    this.metrics = (['m1', 'm2', 'm3', 'm4'] as const).map(k => {
      const p = `servicesPage.metrics.${k}`;
      return {
        value: t(`${p}.value`),
        label: t(`${p}.label`),
        trend: t(`${p}.trend`),
        fill: +t(`${p}.fill`) || 0
      };
    });

    this.services = this.svcMeta.map((meta, i) => {
      const p = `servicesPage.services.${meta.key}`;
      return {
        id: this.svcIds[i],
        icon: meta.icon,
        image: meta.image,
        badge: t(`${p}.badge`),
        title: t(`${p}.title`),
        description: t(`${p}.description`),
        features: [t(`${p}.f1`), t(`${p}.f2`), t(`${p}.f3`)]
      };
    });

    this.marqueeTags = (['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'] as const).map(k => t(`servicesPage.marquee.${k}`));
  }
}
