import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type AssistantStep = 'inicio' | 'ja-cliente' | 'nao-cliente';

@Component({
  selector: 'app-client-area-entry',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-area-entry.component.html',
  styleUrl: './client-area-entry.component.css'
})
export class ClientAreaEntryComponent {
  showPopup = true;
  step: AssistantStep = 'inicio';

  openAssistant(): void {
    this.showPopup = true;
  }

  closeAssistant(): void {
    this.showPopup = false;
  }

  setStep(step: AssistantStep): void {
    this.step = step;
  }
}
