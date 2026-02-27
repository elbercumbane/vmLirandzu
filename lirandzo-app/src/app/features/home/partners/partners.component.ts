import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.css'
})
export class PartnersComponent {
  partners = [
    { name: 'Parceiro A', logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 50"%3E%3Crect fill="%230066ff" width="120" height="50" rx="8"/%3E%3Ctext x="60" y="32" text-anchor="middle" fill="%23fff" font-size="18" font-weight="700"%3EPA%3C/text%3E%3C/svg%3E' },
    { name: 'Parceiro B', logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 50"%3E%3Crect fill="%2300a3a3" width="120" height="50" rx="8"/%3E%3Ctext x="60" y="32" text-anchor="middle" fill="%23fff" font-size="18" font-weight="700"%3EPB%3C/text%3E%3C/svg%3E' },
    { name: 'Parceiro C', logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 50"%3E%3Crect fill="%230047b3" width="120" height="50" rx="8"/%3E%3Ctext x="60" y="32" text-anchor="middle" fill="%23fff" font-size="18" font-weight="700"%3EPC%3C/text%3E%3C/svg%3E' },
    { name: 'Parceiro D', logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 50"%3E%3Crect fill="%230066ff" width="120" height="50" rx="8"/%3E%3Ctext x="60" y="32" text-anchor="middle" fill="%23fff" font-size="18" font-weight="700"%3EPD%3C/text%3E%3C/svg%3E' },
    { name: 'Parceiro E', logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 50"%3E%3Crect fill="%2300a3a3" width="120" height="50" rx="8"/%3E%3Ctext x="60" y="32" text-anchor="middle" fill="%23fff" font-size="18" font-weight="700"%3EPE%3C/text%3E%3C/svg%3E' },
    { name: 'Parceiro F', logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 50"%3E%3Crect fill="%230047b3" width="120" height="50" rx="8"/%3E%3Ctext x="60" y="32" text-anchor="middle" fill="%23fff" font-size="18" font-weight="700"%3EPF%3C/text%3E%3C/svg%3E' }
  ];
}
