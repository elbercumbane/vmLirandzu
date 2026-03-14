import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, Input, Output, EventEmitter, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../services/theme.service';
interface Notification {
  id: number;
  type: 'debt' | 'trip';
  message: string;
  amount?: number;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  tecnico: 'Técnico'
};

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-navbar.component.html',
  styleUrl: './dashboard-navbar.component.css'
})
export class DashboardNavbarComponent implements OnInit, OnDestroy {
  @Input() hideNavLinks = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @ViewChild('profileDropdown', { static: false }) profileDropdown?: ElementRef;
  navMenuOpen = false;
  navDropdownOpen: string | null = null;

  private auth = inject(AuthService);

  @ViewChild('calendarDropdown', { static: false }) calendarDropdown?: ElementRef;
  @ViewChild('notificationsDropdown', { static: false }) notificationsDropdown?: ElementRef;

  currentTime = '';
  currentDate = '';
  currentLang: 'pt' | 'en' = 'pt';
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

  get managerName(): string {
    return this.auth.currentUser()?.nome ?? 'Utilizador';
  }

  get managerRole(): string {
    return this.auth.currentUser() ? ROLE_LABELS[this.auth.currentUser()!.role ?? ''] ?? this.auth.currentUser()!.role ?? '' : 'Sessão';
  }

  get managerInitials(): string {
    return this.auth.currentUser()?.avatar ?? '—';
  }

  get canAccessConfiguracoes(): boolean {
    return this.auth.canAccessConfiguracoes();
  }

  private timeInterval?: any;
  private colonBlink = true;

  constructor(private router: Router, public themeService: ThemeService) {}

  get isDark(): boolean {
    return this.themeService.isDark;
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  getShortDate(): string {
    const now = new Date();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }

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

    this.calendarDays = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      this.calendarDays.push(null);
    }
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
      this.currentMonth === 0 ? (this.currentMonth = 11, this.currentYear--) : this.currentMonth--;
    } else {
      this.currentMonth === 11 ? (this.currentMonth = 0, this.currentYear++) : this.currentMonth++;
    }
    this.generateCalendar();
  }

  isToday(day: number | null): boolean {
    if (day === null) return false;
    const today = new Date();
    return day === today.getDate() && this.currentMonth === today.getMonth() && this.currentYear === today.getFullYear();
  }

  hasOrders(day: number | null): boolean {
    if (day === null) return false;
    return this.daysWithOrders.includes(day);
  }

  toggleDropdown(dropdown: 'calendario' | 'notificacoes' | 'perfil'): void {
    this.openDropdown = this.openDropdown === dropdown ? null : dropdown;
  }

  toggleNavMenu(): void {
    this.navMenuOpen = !this.navMenuOpen;
  }

  toggleNavDropdown(key: string): void {
    this.navDropdownOpen = this.navDropdownOpen === key ? null : key;
  }

  closeNavDropdown(): void {
    this.navDropdownOpen = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.navbar-nav-dropdown')) {
      this.navDropdownOpen = null;
    }

    if (!this.openDropdown) return;
    if (this.openDropdown === 'calendario' && this.calendarDropdown &&
        !this.calendarDropdown.nativeElement.contains(target) && !target.closest('.navbar-calendar-button')) {
      this.openDropdown = null;
    }
    if (this.openDropdown === 'notificacoes' && this.notificationsDropdown &&
        !this.notificationsDropdown.nativeElement.contains(target) && !target.closest('.navbar-notifications-button')) {
      this.openDropdown = null;
    }
    if (this.openDropdown === 'perfil' && this.profileDropdown &&
        !this.profileDropdown.nativeElement.contains(target) && !target.closest('.navbar-profile-button')) {
      this.openDropdown = null;
    }
  }

  setLang(lang: 'pt' | 'en'): void {
    this.currentLang = lang;
    // Em app real: usar serviço de i18n
  }

  goToSettings(): void {
    this.router.navigate(['/billing/configuracoes']);
    this.openDropdown = null;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.openDropdown = null;
  }
}
