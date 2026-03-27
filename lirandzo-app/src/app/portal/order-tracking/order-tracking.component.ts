import { Component, AfterViewInit, ViewChild, ElementRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { gsap } from 'gsap';

type TrackingStep = {
  label: string;
  done: boolean;
  date: string;
  location?: string;
  longDuration?: boolean;
};

type ExampleMeta = {
  packageId: string;
  steps: { done: boolean; date: string; longDuration?: boolean }[];
};

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoModule],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.css'
})
export class OrderTrackingComponent implements OnInit, AfterViewInit {
  private transloco = inject(TranslocoService);

  @ViewChild('heroContent') heroContentRef!: ElementRef<HTMLElement>;

  trackingCode = '';
  searched = false;
  mockStatus = '';
  mockSteps: TrackingStep[] = [];
  currentFatura = '';
  currentPackageId = '';
  currentRoute = '';

  private readonly exampleMeta: Record<string, ExampleMeta> = {
    '001': {
      packageId: 'PKG-001-MZ',
      steps: [
        { done: true, date: '20/02/2025 10:12' },
        { done: true, date: '20/02/2025 16:40' },
        { done: true, date: '21/02/2025 08:05', longDuration: true },
        { done: true, date: '21/02/2025 15:20' },
        { done: true, date: '22/02/2025 07:10', longDuration: true },
        { done: false, date: '23/02/2025 09:00', longDuration: true }
      ]
    },
    '002': {
      packageId: 'PKG-002-MZ',
      steps: [
        { done: true, date: '18/02/2025 09:30' },
        { done: true, date: '18/02/2025 14:15' },
        { done: true, date: '19/02/2025 06:50', longDuration: true },
        { done: true, date: '19/02/2025 13:05' },
        { done: false, date: '20/02/2025 11:40', longDuration: true }
      ]
    },
    '003': {
      packageId: 'PKG-003-MZ',
      steps: [
        { done: true, date: '10/02/2025 08:20' },
        { done: true, date: '10/02/2025 15:00' },
        { done: true, date: '11/02/2025 06:30', longDuration: true },
        { done: true, date: '11/02/2025 18:10' },
        { done: true, date: '12/02/2025 09:15', longDuration: true },
        { done: true, date: '12/02/2025 11:02' }
      ]
    }
  };

  ngOnInit(): void {
    this.refreshIdle();
    this.transloco.langChanges$.subscribe(lang => {
      this.transloco.load(lang).subscribe(() => {
        this.refreshIdle();
        if (this.searched && this.trackingCode.trim()) this.search();
      });
    });
  }

  private refreshIdle(): void {
    this.mockStatus = this.transloco.translate('orderTracking.idleStatus');
  }

  ngAfterViewInit(): void {
    const el = this.heroContentRef?.nativeElement;
    if (!el) return;
    const title = el.querySelector('.tracking-hero-title');
    const desc = el.querySelector('.tracking-hero-description');
    const form = el.querySelector('.tracking-hero-form');
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo(title, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75 })
      .fromTo(desc, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.45')
      .fromTo(form, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.35');
  }

  search(): void {
    const raw = this.trackingCode.trim();
    if (!raw) {
      this.searched = false;
      this.refreshIdle();
      this.mockSteps = [];
      return;
    }

    const code = raw.toUpperCase();
    this.searched = true;
    this.currentFatura = code;

    const meta = this.exampleMeta[code];
    const t = (k: string) => this.transloco.translate(k);

    if (meta) {
      this.mockStatus = t(`orderTracking.examples.${code}.status`);
      this.currentRoute = t(`orderTracking.examples.${code}.route`);
      this.currentPackageId = meta.packageId;
      this.mockSteps = meta.steps.map((s, i) => ({
        ...s,
        label: t(`orderTracking.examples.${code}.steps.${i}.label`),
        location: t(`orderTracking.examples.${code}.steps.${i}.location`)
      }));
    } else {
      this.mockStatus = t('orderTracking.unknownStatus');
      this.currentPackageId = '';
      this.currentRoute = '';
      this.mockSteps = [
        {
          label: t('orderTracking.unknownSteps.0.label'),
          location: t('orderTracking.unknownSteps.0.location'),
          done: true,
          date: t('orderTracking.today')
        },
        {
          label: t('orderTracking.unknownSteps.1.label'),
          location: t('orderTracking.unknownSteps.1.location'),
          done: false,
          date: t('orderTracking.dash')
        }
      ];
    }
  }
}
