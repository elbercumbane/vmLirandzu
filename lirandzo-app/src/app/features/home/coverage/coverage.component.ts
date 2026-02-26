import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CoverageRegion {
  name: string;
  cities: string[];
  color: 'blue' | 'dark' | 'soft';
}

@Component({
  selector: 'app-coverage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coverage.component.html',
  styleUrl: './coverage.component.css'
})
export class CoverageComponent {
  regions: CoverageRegion[] = [
    {
      name: 'Sul de Moçambique',
      cities: ['Maputo', 'Matola', 'Xai-Xai', 'Inhambane', 'Maxixe'],
      color: 'blue'
    },
    {
      name: 'Centro de Moçambique',
      cities: ['Beira', 'Chimoio', 'Tete', 'Quelimane', 'Gurué'],
      color: 'dark'
    },
    {
      name: 'Norte de Moçambique',
      cities: ['Nampula', 'Nacala', 'Lichinga', 'Pemba', 'Mocímboa da Praia'],
      color: 'soft'
    },
    {
      name: 'África do Sul',
      cities: ['Johannesburg', 'Pretória', 'Durban', 'Nelspruit', 'Richards Bay'],
      color: 'blue'
    },
    {
      name: 'Eswatini (Suazilândia)',
      cities: ['Mbabane', 'Manzini', 'Matsapha'],
      color: 'soft'
    },
    {
      name: 'Zimbabué',
      cities: ['Harare', 'Mutare', 'Beitbridge'],
      color: 'dark'
    }
  ];

  corridors = [
    { route: 'Maputo — Beira', type: 'Nacional' },
    { route: 'Maputo — Nampula', type: 'Nacional' },
    { route: 'Maputo — Johannesburg', type: 'Internacional' },
    { route: 'Beira — Tete — Harare', type: 'Internacional' },
    { route: 'Maputo — Mbabane', type: 'Internacional' },
    { route: 'Nacala — Nampula — Maputo', type: 'Nacional' }
  ];
}
