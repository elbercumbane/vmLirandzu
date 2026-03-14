import { Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-ceo-message',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './ceo-message.component.html',
  styleUrl: './ceo-message.component.css'
})
export class CeoMessageComponent {}
