import { AfterViewInit, Component, ElementRef, inject } from '@angular/core';
import { HeroComponent } from './hero/hero.component';
import { VisionMissionValuesComponent } from './vision-mission-values/vision-mission-values.component';
import { FrotaAccaoComponent } from './frota-accao/frota-accao.component';
import { NoticiasPreviewComponent } from './noticias-preview/noticias-preview.component';
import { PartnersComponent } from './partners/partners.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { CoverageComponent } from './coverage/coverage.component';
import { FaqPreviewComponent } from './faq-preview/faq-preview.component';
import { CeoMessageComponent } from '../ceo-message/ceo-message.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    VisionMissionValuesComponent,
    FrotaAccaoComponent,
    NoticiasPreviewComponent,
    CeoMessageComponent,
    PartnersComponent,
    TestimonialsComponent,
    CoverageComponent,
    FaqPreviewComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {
  private el = inject(ElementRef);

  ngAfterViewInit(): void {
    const host = this.el.nativeElement as HTMLElement;
    const sections = host.querySelectorAll(
      'app-vision-mission-values, app-frota-accao, app-coverage, app-ceo-message, app-noticias-preview, app-partners, app-testimonials, app-faq-preview'
    );

    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });
  }
}
