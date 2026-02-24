import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request-quote',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-quote.component.html',
  styleUrl: './request-quote.component.css'
})
export class RequestQuoteComponent {
  submitted = false;
  form = {
    name: '',
    email: '',
    phone: '',
    origin: '',
    destination: '',
    cargoType: '',
    message: ''
  };

  onSubmit(): void {
    this.submitted = true;
  }
}
