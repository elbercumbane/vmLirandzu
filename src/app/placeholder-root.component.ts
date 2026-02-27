import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-placeholder-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="text-align: center; max-width: 480px;">
        <h1 style="font-size: 1.75rem; margin-bottom: 0.75rem;">VM Lirandzu - App interna</h1>
        <p style="color: #4b5563; margin-bottom: 0.5rem;">
          O portal principal agora está em <code>lirandzo/lirandzo-app</code>.
        </p>
        <p style="color: #6b7280;">
          Para usar o portal com o sistema de gestão de facturas, sirva o projecto
          <strong>lirandzo-app</strong> e aceda a <code>/</code> e <code>/billing</code>.
        </p>
      </div>
    </div>
  `
})
export class PlaceholderRootComponent {}

