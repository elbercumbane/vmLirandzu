import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-popup.component.html',
  styleUrls: ['./notification-popup.component.css']
})
export class NotificationPopupComponent implements OnInit, OnDestroy {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';
  @Input() duration: number = 14000; // tempo de leitura confortável (sobrescrever por página se precisar)

  show: boolean = false;
  private timeoutId: any;

  ngOnInit() {
    // Mostrar popup após um pequeno delay para animação
    setTimeout(() => {
      this.show = true;
    }, 10);

    // Esconder após duração especificada
    this.timeoutId = setTimeout(() => {
      this.hide();
    }, this.duration);
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  hide() {
    this.show = false;
    // Remover do DOM após animação
    setTimeout(() => {
      const element = document.querySelector('app-notification-popup');
      if (element) {
        element.remove();
      }
    }, 300);
  }
}
