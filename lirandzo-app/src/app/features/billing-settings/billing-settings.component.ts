import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Manager {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatar: string;
  foto?: string;
}

interface ExchangeRateHistory {
  date: string;
  oldRate: number;
  newRate: number;
  changedBy: string;
}

interface CategoryRate {
  category: string;
  rate: number;
  description: string;
}

@Component({
  selector: 'app-billing-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing-settings.component.html',
  styleUrl: './billing-settings.component.css'
})
export class BillingSettingsComponent {
  // Active tab
  activeTab: 'empresa' | 'cambio' | 'gestores' | 'facturas' | 'backup' | 'notificacoes' = 'empresa';

  // Tab 1: Dados da Empresa
  companyData = {
    name: 'VM Lirandzu Transportes',
    nif: '400123456789',
    emailMain: 'vm.liranzotransportes@gmail.com',
    emailAdmin: 'admin@liranzoinvestment.co.za',
    phoneMZ: '+258 848 310 348',
    phoneZA: '+27 11 615 0697 / +27787026149',
    addressMZ: 'Bairro Djuba, Célula D, Q.1, NR7 – Mozal, ao pé do Complexo Palhota',
    addressZA: 'New Times Square, 36 Ernest Oppenheimer Drive, Bruma, 2198, Shop Nr. 102B – 1A',
    slogan: 'Faça compras na África do Sul sentado na sua casa'
  };

  // Tab 2: Taxas & Câmbio
  exchangeRate = 3.80;
  exchangeRateDate = '18/01/2025 às 09:30';
  defaultTransportRate = 1500;
  exchangeHistory: ExchangeRateHistory[] = [
    { date: '17/01', oldRate: 3.75, newRate: 3.80, changedBy: 'Ana Silva' },
    { date: '10/01', oldRate: 3.70, newRate: 3.75, changedBy: 'Carlos Matos' },
    { date: '03/01', oldRate: 3.68, newRate: 3.70, changedBy: 'Ana Silva' }
  ];
  categoryRates: CategoryRate[] = [
    { category: 'Electrónicos', rate: 2000, description: 'Itens frágeis, embalagem especial' },
    { category: 'Roupas & Calçado', rate: 800, description: 'Itens leves, sem restrição' },
    { category: 'Electrodomésticos', rate: 2500, description: 'Itens pesados/volumosos' },
    { category: 'Móveis', rate: 4000, description: 'Transporte especial necessário' },
    { category: 'Outros', rate: 1500, description: 'Taxa padrão' }
  ];

  // Tab 3: Gestores
  managers: Manager[] = [
    { id: 1, name: 'Nino Vieira', role: 'Gestor Principal', email: 'nino.vieira@lirandzu.com', phone: '+258 84 310 348', joinDate: 'Jan 2024', status: 'ACTIVE', avatar: 'NV' }
  ];
  isManagerModalOpen = false;
  selectedManager: Manager | null = null;
  managerForm = {
    name: '',
    role: '',
    email: '',
    phone: '',
    pin: '',
    confirmPin: '',
    foto: '' as string
  };

  // Tab 4: Configuração de Facturas
  invoiceSettings = {
    showLogo: true,
    showAddress: true,
    showNIF: true,
    showSlogan: true,
    orderFormat: 'VML-{ANO}-{NNNN}',
    nextNumber: 48,
    terms: 'A VM Lirandzu Transportes não se responsabiliza por atrasos causados por factores externos (alfândega, atrasos das lojas, etc). O cliente deve verificar o produto no acto da entrega. Reclamações aceites no prazo de 24 horas após levantamento.'
  };

  // Tab 5: Backup & Dados
  lastBackup = 'Nenhum backup realizado ainda';

  // Tab 6: Notificações
  notifications = {
    debtDays: 7,
    showDebtPanel: true,
    highlightDebtClients: true,
    tripReminder1Day: true,
    tripUnpaidAlert: true,
    tripCompletedNotification: true,
    dailySummary: true,
    showBadge: true
  };

  setActiveTab(tab: 'empresa' | 'cambio' | 'gestores' | 'facturas' | 'backup' | 'notificacoes'): void {
    this.activeTab = tab;
  }

  // Tab 1: Dados da Empresa
  saveCompanyData(): void {
    alert('✓ Dados da empresa actualizados!');
  }

  // Tab 2: Taxas & Câmbio
  updateExchangeRate(): void {
    this.exchangeRateDate = new Date().toLocaleDateString('pt-PT') + ' às ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    alert('✓ Taxa de câmbio actualizada!');
  }

  saveTransportRate(): void {
    alert('✓ Taxa de transporte guardada!');
  }

  // Tab 3: Gestores
  openManagerModal(manager?: Manager): void {
    if (manager) {
      this.selectedManager = manager;
      this.managerForm = {
        name: manager.name,
        role: manager.role,
        email: manager.email,
        phone: manager.phone,
        pin: '',
        confirmPin: '',
        foto: manager.foto ?? ''
      };
    } else {
      this.selectedManager = null;
      this.managerForm = {
        name: '',
        role: '',
        email: '',
        phone: '',
        pin: '',
        confirmPin: '',
        foto: ''
      };
    }
    this.isManagerModalOpen = true;
  }

  onManagerPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.managerForm.foto = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  closeManagerModal(): void {
    this.isManagerModalOpen = false;
    this.selectedManager = null;
  }

  saveManager(): void {
    if (this.managerForm.pin !== this.managerForm.confirmPin) {
      alert('Os PINs não coincidem!');
      return;
    }
    if (this.selectedManager) {
      // Update existing
      const index = this.managers.findIndex(m => m.id === this.selectedManager!.id);
      if (index !== -1) {
        this.managers[index] = {
          ...this.managers[index],
          name: this.managerForm.name,
          role: this.managerForm.role,
          email: this.managerForm.email,
          phone: this.managerForm.phone,
          foto: this.managerForm.foto || undefined
        };
      }
    } else {
      // Add new
      const newManager: Manager = {
        id: this.managers.length + 1,
        name: this.managerForm.name,
        role: this.managerForm.role,
        email: this.managerForm.email,
        phone: this.managerForm.phone,
        joinDate: new Date().toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' }),
        status: 'ACTIVE',
        avatar: this.managerForm.name.split(' ').map(n => n[0]).join(''),
        foto: this.managerForm.foto || undefined
      };
      this.managers.push(newManager);
    }
    this.closeManagerModal();
    alert('✓ Gestor guardado com sucesso!');
  }

  deactivateManager(manager: Manager): void {
    if (confirm('Tem a certeza que deseja desactivar este gestor?')) {
      manager.status = 'INACTIVE';
      alert('✓ Gestor desactivado!');
    }
  }

  getManagerFormInitials(): string {
    const n = this.managerForm.name.trim();
    return n ? n.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) : '?';
  }

  getManagerColor(name: string): string {
    const colors = ['#F97316', '#1E6FBF', '#22C55E', '#EAB308', '#8B5CF6', '#EF4444'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  // Tab 4: Configuração de Facturas
  saveInvoiceSettings(): void {
    alert('✓ Configurações de facturas guardadas!');
  }

  saveTerms(): void {
    alert('✓ Termos e condições guardados!');
  }

  // Tab 5: Backup & Dados
  makeBackup(): void {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    this.lastBackup = `Backup realizado em ${new Date().toLocaleDateString('pt-PT')}`;
    alert(`✓ Backup realizado — vmlirandzu_backup_${date}.json`);
  }

  exportData(type: string): void {
    alert(`✓ Dados exportados — ${type}`);
  }

  restoreBackup(): void {
    const confirmText = prompt('Tem a certeza? Digite CONFIRMAR para prosseguir:');
    if (confirmText === 'CONFIRMAR') {
      alert('✓ Backup restaurado com sucesso!');
    }
  }

  clearDemoData(): void {
    const confirmText = prompt('Tem a certeza? Digite CONFIRMAR para prosseguir:');
    if (confirmText === 'CONFIRMAR') {
      alert('✓ Dados de demonstração removidos!');
    }
  }

  // Tab 6: Notificações
  saveNotifications(): void {
    alert('✓ Preferências de notificação guardadas!');
  }
}
