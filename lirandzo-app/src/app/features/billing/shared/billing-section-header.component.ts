import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-billing-section-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './billing-section-header.component.html',
  styleUrl: './billing-section-header.component.css'
})
export class BillingSectionHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() showBack = true;
  @Input() backLink: string | null = '/billing';
  @Input() showHelp = false;
  @Input() helpTitle = '';
  @Input() helpItems: string[] = [];

  helpOpen = false;

  toggleHelp(): void {
    if (!this.showHelp) return;
    this.helpOpen = !this.helpOpen;
  }
}

