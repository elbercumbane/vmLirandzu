import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';

interface Partner {
  name: string;
  icon: string;
  category: string;
}

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.css'
})
export class PartnersComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  isMobile = false;
  private resizeListener?: () => void;

  partners: Partner[] = [
    { name: 'Transnet', icon: 'ship', category: 'Logística' },
    { name: 'Grindrod', icon: 'warehouse', category: 'Transporte' },
    { name: 'Barloworld', icon: 'building', category: 'Equipamentos' },
    { name: 'Imperial', icon: 'factory', category: 'Distribuição' },
    { name: 'Super Spar', icon: 'store', category: 'Varejo' },
    { name: 'Shoprite', icon: 'store', category: 'Varejo' },
    { name: 'Pick n Pay', icon: 'store', category: 'Varejo' },
    { name: 'Game Stores', icon: 'building', category: 'Varejo' },
    { name: 'Builders', icon: 'factory', category: 'Construção' },
    { name: 'Makro', icon: 'warehouse', category: 'Atacado' },
    { name: 'Cape Union Mart', icon: 'plane', category: 'Vestuário' },
    { name: 'Sportsmans', icon: 'building', category: 'Esportes' },
  ];

  get duplicatedPartners(): Partner[] {
    return [...this.partners, ...this.partners];
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkMobile();
      this.resizeListener = () => this.checkMobile();
      window.addEventListener('resize', this.resizeListener);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth < 1024;
  }
}
