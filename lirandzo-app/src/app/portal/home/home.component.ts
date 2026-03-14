import { Component } from '@angular/core';
import { HeroComponent } from './hero/hero.component';
import { VisionMissionValuesComponent } from './vision-mission-values/vision-mission-values.component';
import { ServicesComponent } from './services/services.component';
import { FrotaAccaoComponent } from './frota-accao/frota-accao.component';
import { NoticiasPreviewComponent } from './noticias-preview/noticias-preview.component';
import { PartnersComponent } from './partners/partners.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { CoverageComponent } from './coverage/coverage.component';
import { FaqPreviewComponent } from './faq-preview/faq-preview.component';
import { CeoMessageComponent } from '../ceo-message/ceo-message.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    VisionMissionValuesComponent,
    ServicesComponent,
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
export class HomeComponent {}
