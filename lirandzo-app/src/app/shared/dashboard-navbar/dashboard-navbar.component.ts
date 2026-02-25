import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Notification {
  id: number;
  type: 'debt' | 'trip';
  message: string;
  amount?: number;
}

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-navbar.component.html',
  styleUrl: './dashboard-navbar.component.css'
})
export class DashboardNavbarComponent implements OnInit, OnDestroy {
  @ViewChild('calendarDropdown', { static: false }) calendarDropdown?: ElementRef;
  @ViewChild('notificationsDropdown', { static: false }) notificationsDropdown?: ElementRef;
  @ViewChild('profileDropdown', { static: false }) profileDropdown?: ElementRef;

  currentTime = '';
  currentDate = '';
  openDropdown: 'calendario' | 'notificacoes' | 'perfil' | null = null;
  
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  calendarDays: (number | null)[] = [];
  daysWithOrders = [2, 5, 7, 9, 11, 12, 14, 15, 17, 18, 19, 20, 21, 22, 23];
  
  notifications: Notification[] = [
    { id: 1, type: 'debt', message: 'Fátima Cossa — 18 dias sem pagar', amount: 12800 },
    { id: 2, type: 'debt', message: 'Lurdes Sitoe — 11 dias sem pagar', amount: 29400 },
    { id: 3, type: 'trip', message: 'Viagem VGM-003 em curso — retorno hoje' }
  ];
  
  managerName = 'Nino Vieira';
  managerRole = 'Gestor Principal';
  managerInitials = 'NV';
  
  getShortDate(): string {
    const now = new Date();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }

  private timeInterval?: any;
  private colonBlink = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateTime();
    this.updateDate();
    this.generateCalendar();
    
    this.timeInterval = setInterval(() => {
      this.updateTime();
      this.colonBlink = !this.colonBlink;
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  updateTime(): void {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const colon = this.colonBlink ? ':' : ':';
    this.currentTime = `${hours}${colon}${minutes}${colon}${seconds}`;
  }

  updateDate(): void {
    const now = new Date();
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    this.currentDate = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
  }

  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
    
    this.calendarDays = [];
    
    // Days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      this.calendarDays.push(null);
    }
    
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push(i);
    }
  }

  getMonthName(): string {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[this.currentMonth];
  }

  navigateMonth(direction: 'prev' | 'next'): void {
    if (direction === 'prev') {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
    } else {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
    }
    this.generateCalendar();
  }

  isToday(day: number | null): boolean {
    if (day === null) return false;
    const today = new Date();
    return day === today.getDate() && 
           this.currentMonth === today.getMonth() && 
           this.currentYear === today.getFullYear();
  }

  hasOrders(day: number | null): boolean {
    if (day === null) return false;
    return this.daysWithOrders.includes(day);
  }

  toggleDropdown(dropdown: 'calendario' | 'notificacoes' | 'perfil'): void {
    if (this.openDropdown === dropdown) {
      this.openDropdown = null;
    } else {
      this.openDropdown = dropdown;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.openDropdown) {
      const target = event.target as HTMLElement;
      
      if (this.calendarDropdown && !this.calendarDropdown.nativeElement.contains(target) &&
          !target.closest('.navbar-calendar-button')) {
        if (this.openDropdown === 'calendario') {
          this.openDropdown = null;
        }
      }
      
      if (this.notificationsDropdown && !this.notificationsDropdown.nativeElement.contains(target) &&
          !target.closest('.navbar-notifications-button')) {
        if (this.openDropdown === 'notificacoes') {
          this.openDropdown = null;
        }
      }
      
      if (this.profileDropdown && !this.profileDropdown.nativeElement.contains(target) &&
          !target.closest('.navbar-profile-button')) {
        if (this.openDropdown === 'perfil') {
          this.openDropdown = null;
        }
      }
    }
  }

  goToSettings(): void {
    this.router.navigate(['/billing/configuracoes']);
    this.openDropdown = null;
  }

  logout(): void {
    // Implementar lógica de logout
    this.router.navigate(['/']);
    this.openDropdown = null;
  }
}
