# Identidade corporativa (Visão, Missão e Valores)

Componente Angular: **`app-vision-mission-values`**  
Path: `src/app/portal/home/vision-mission-values/`

Os textos visíveis (título, missão, visão, valores) vêm das chaves **`vmv`** em `public/assets/i18n/pt.json` e `en.json`, não estão hardcoded no HTML.

---

## TypeScript — `vision-mission-values.component.ts`

```typescript
import { Component, AfterViewInit, ElementRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type VmvType = 'missao' | 'visao' | 'valores';

interface Card {
  type: VmvType;
  title: string;
  text: string;
  icon: string;
  listItems?: string[];
  circleColor: string;
  titleColor: string;
  textColor: string;
}

@Component({
  selector: 'app-vision-mission-values',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  templateUrl: './vision-mission-values.component.html',
  styleUrl: './vision-mission-values.component.css'
})
export class VisionMissionValuesComponent implements OnInit, AfterViewInit {
  private el = inject(ElementRef);
  private transloco = inject(TranslocoService);
  cards: Card[] = [];

  ngOnInit(): void {
    this.buildCards();
    this.transloco.langChanges$.subscribe(() => this.buildCards());
  }

  private buildCards(): void {
    const t = (k: string) => this.transloco.translate(k);
    this.cards = [
      {
        type: 'missao',
        title: t('vmv.mission.title'),
        text: t('vmv.mission.text'),
        icon: 'target',
        circleColor: '#2b2d42',
        titleColor: '#f8fafc',
        textColor: '#f8fafc'
      },
      {
        type: 'visao',
        title: t('vmv.vision.title'),
        text: t('vmv.vision.text'),
        icon: 'eye',
        circleColor: 'var(--brand-red)',
        titleColor: '#f8fafc',
        textColor: '#ffffff'
      },
      {
        type: 'valores',
        title: t('vmv.values.title'),
        text: '',
        icon: 'heart',
        listItems: [
          this.transloco.translate('vmv.values.item1'),
          this.transloco.translate('vmv.values.item2'),
          this.transloco.translate('vmv.values.item3'),
          this.transloco.translate('vmv.values.item4')
        ],
        circleColor: '#0f5c6e',
        titleColor: '#f8fafc',
        textColor: '#cbd5e1'
      }
    ];
  }

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;
    const cards = host.querySelectorAll('.vmv-card');
    const section = host.querySelector('.vmv');
    if (cards.length && section) {
      gsap.fromTo(cards, { opacity: 0, scale: 0.9 }, {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        stagger: 0.15,
        ease: 'back.out(1.2)',
        scrollTrigger: { trigger: section, start: 'top 85%' }
      });
    }
  }
}
```

---

## HTML — `vision-mission-values.component.html`

```html
<section class="vmv" id="visao-missao-valores">
  <div class="vmv-container">
    <h2 class="vmv-title">{{ 'vmv.title' | transloco }}</h2>
    <div class="vmv-rings">
      @for (card of cards; track card.type; let i = $index) {
        <article class="vmv-card" [class.vmv-card--large]="i === 1" [attr.data-type]="card.type">
          <div
            class="vmv-circle"
            [style.background]="card.circleColor"
            [style.--title-color]="card.titleColor"
            [style.--text-color]="card.textColor"
          >
            <h3 class="vmv-circle-title">{{ card.title }}</h3>
            <div class="vmv-circle-icon" [attr.data-icon]="card.icon">
              @switch (card.icon) {
                @case ('target') {
                  <span class="icon-target"></span>
                }
                @case ('eye') {
                  <span class="icon-eye"></span>
                }
                @case ('heart') {
                  <span class="icon-heart"></span>
                }
              }
            </div>
            @if (card.listItems && card.listItems.length) {
              <ul class="vmv-circle-list">
                @for (item of card.listItems; track item) {
                  <li><span class="check"></span>{{ item }}</li>
                }
              </ul>
            } @else {
              <p class="vmv-circle-text">{{ card.text }}</p>
            }
          </div>
        </article>
      }
    </div>
  </div>
</section>
```

---

## CSS — `vision-mission-values.component.css`

```css
.vmv {
  width: 100%;
  padding: 4rem 2rem;
  background: linear-gradient(180deg, #f0f4ff 0%, #fff 50%, #e8f4fc 100%);
}

.vmv-container {
  width: 100%;
}

.vmv-title {
  font-size: clamp(1.75rem, 3.5vw, 2.35rem);
  font-weight: 700;
  color: var(--brand-red);
  margin: 0 0 3rem;
  text-align: center;
  letter-spacing: -0.02em;
}

.vmv-rings {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.vmv-card {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
}

.vmv-circle {
  --title-color: #fff;
  --text-color: #fff;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  padding: 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 4px solid rgba(255, 255, 255, 0.98);
  box-shadow:
    0 6px 20px rgba(19, 36, 58, 0.25),
    0 0 0 1px rgba(0, 0, 0, 0.04);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  position: relative;
}

.vmv-card--large .vmv-circle {
  width: 420px;
  height: 420px;
  padding: 2.5rem 2rem;
}

.vmv-card--large .vmv-circle-title { font-size: 1.2rem; }
.vmv-card--large .vmv-circle-text { font-size: 1.1rem; }
.vmv-card--large .vmv-circle-list li { font-size: 1.05rem; }

.vmv-card:hover .vmv-circle {
  transform: scale(1.06);
  box-shadow:
    0 16px 40px rgba(19, 36, 58, 0.3),
    0 0 0 1px rgba(0, 0, 0, 0.06);
}

.vmv-circle-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--title-color, #0f172a);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin: 0 0 0.75rem;
}

.vmv-circle-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-target,
.icon-eye,
.icon-heart {
  display: block;
  background-color: var(--title-color);
  mask-size: contain;
  mask-position: center;
  mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
}

.icon-target {
  width: 40px;
  height: 40px;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Ccircle cx='12' cy='12' r='6'/%3E%3Ccircle cx='12' cy='12' r='2'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Ccircle cx='12' cy='12' r='6'/%3E%3Ccircle cx='12' cy='12' r='2'/%3E%3C/svg%3E");
}

.icon-eye {
  width: 44px;
  height: 28px;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cellipse cx='12' cy='12' rx='3' ry='4'/%3E%3Cpath d='M2 12s3-6 10-6 10 6 10 6-3 6-10 6-10-6-10-6z'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cellipse cx='12' cy='12' rx='3' ry='4'/%3E%3Cpath d='M2 12s3-6 10-6 10 6 10 6-3 6-10 6-10-6-10-6z'/%3E%3C/svg%3E");
}

.icon-heart {
  width: 44px;
  height: 44px;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'/%3E%3C/svg%3E");
}

.vmv-circle-text {
  font-size: 1rem;
  color: var(--text-color, #334155);
  line-height: 1.5;
  margin: 0;
  opacity: 0.95;
}

.vmv-circle-list {
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: left;
  width: 100%;
  max-width: 200px;
}

.vmv-circle-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: var(--text-color, #334155);
  margin-bottom: 0.35rem;
  font-weight: 500;
}

.vmv-circle-list .check {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230047b3' stroke-width='3'%3E%3Cpath d='M5 12l5 5L20 7'/%3E%3C/svg%3E");
  mask-size: contain;
  mask-position: center;
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230047b3' stroke-width='3'%3E%3Cpath d='M5 12l5 5L20 7'/%3E%3C/svg%3E");
  -webkit-mask-size: contain;
  -webkit-mask-position: center;
}

@media (max-width: 1100px) {
  .vmv-rings {
    flex-direction: column;
    gap: 1.5rem;
  }

  .vmv-circle {
    width: 320px;
    height: 320px;
  }

  .vmv-card--large .vmv-circle {
    width: 360px;
    height: 360px;
  }
}
```

---

## Traduções (referência)

Chaves em `public/assets/i18n/pt.json` (objeto `vmv`):

| Chave | Uso |
|--------|-----|
| `vmv.title` | Título da secção |
| `vmv.mission.title` / `vmv.mission.text` | Missão |
| `vmv.vision.title` / `vmv.vision.text` | Visão |
| `vmv.values.title` | Valores |
| `vmv.values.item1` … `item4` | Itens da lista |

---

## Dependências

- **@ngneat/transloco** — textos e mudança de idioma.
- **gsap** + **ScrollTrigger** — animação de entrada ao scroll (`ngAfterViewInit`).
