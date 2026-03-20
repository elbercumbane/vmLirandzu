import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-frota-accao',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  templateUrl: './frota-accao.component.html',
  styleUrl: './frota-accao.component.css'
})
export class FrotaAccaoComponent {}
