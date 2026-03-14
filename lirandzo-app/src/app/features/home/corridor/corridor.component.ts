import { Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-corridor',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './corridor.component.html',
  styleUrl: './corridor.component.css'
})
export class CorridorComponent {}
