import { Routes } from '@angular/router';
import { configuracoesGuard } from './shared/guards/configuracoes.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'rastreio', loadComponent: () => import('./features/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent) },
  { path: 'orcamento', loadComponent: () => import('./features/request-quote/request-quote.component').then(m => m.RequestQuoteComponent) },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'recuperar-senha', loadComponent: () => import('./features/login/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'servicos', loadComponent: () => import('./features/all-services/all-services.component').then(m => m.AllServicesComponent) },
  { path: 'sobre', loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent) },
  { path: 'faq', loadComponent: () => import('./features/faq/faq.component').then(m => m.FaqComponent) },
  { path: 'noticias', loadComponent: () => import('./features/noticias/noticias.component').then(m => m.NoticiasComponent) },
  { path: 'contato', loadComponent: () => import('./features/contato/contato.component').then(m => m.ContatoComponent) },
  { path: 'avaliacoes', loadComponent: () => import('./features/avaliacoes/avaliacoes.component').then(m => m.AvaliacoesComponent) },
  { path: 'area-cliente', loadComponent: () => import('./features/client-area/client-area.component').then(m => m.ClientAreaComponent) },

  {
    path: 'billing',
    loadComponent: () => import('./features/billing/layout/billing-layout.component').then(m => m.BillingLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/billing/dashboard/billing-dashboard.component').then(m => m.BillingDashboardComponent) },
      { path: 'viaturas', loadComponent: () => import('./features/billing/viaturas/viaturas-lista.component').then(m => m.ViaturasListaComponent) },
      { path: 'viaturas/nova', loadComponent: () => import('./features/billing/viaturas/viaturas-cadastro.component').then(m => m.ViaturasCadastroComponent) },
      { path: 'viaturas/:id', loadComponent: () => import('./features/billing/viaturas/viaturas-detalhe.component').then(m => m.ViaturasDetalheComponent) },
      { path: 'viaturas/:id/editar', loadComponent: () => import('./features/billing/viaturas/viaturas-editar.component').then(m => m.ViaturasEditarComponent) },
      { path: 'viaturas/estado', loadComponent: () => import('./features/billing/viaturas/viaturas-estado.component').then(m => m.ViaturasEstadoComponent) },
      { path: 'motoristas', loadComponent: () => import('./features/billing/motoristas/motoristas-lista.component').then(m => m.MotoristasListaComponent) },
      { path: 'motoristas/novo', loadComponent: () => import('./features/billing/motoristas/motoristas-cadastro.component').then(m => m.MotoristasCadastroComponent) },
      { path: 'motoristas/:id', loadComponent: () => import('./features/billing/motoristas/motoristas-detalhe.component').then(m => m.MotoristasDetalheComponent) },
      { path: 'motoristas/:id/editar', loadComponent: () => import('./features/billing/motoristas/motoristas-editar.component').then(m => m.MotoristasEditarComponent) },
      { path: 'motoristas/destaques', loadComponent: () => import('./features/billing/motoristas/motoristas-destaque.component').then(m => m.MotoristasDestaqueComponent) },
      { path: 'encomendas', loadComponent: () => import('./features/billing/encomendas/encomendas-lista.component').then(m => m.EncomendasListaComponent) },
      { path: 'encomendas/nova', loadComponent: () => import('./features/billing/encomendas/encomendas-cadastro.component').then(m => m.EncomendasCadastroComponent) },
      { path: 'encomendas/:id', loadComponent: () => import('./features/billing/encomendas/encomendas-detalhe.component').then(m => m.EncomendasDetalheComponent) },
      { path: 'encomendas/:id/editar', loadComponent: () => import('./features/billing/encomendas/encomendas-editar.component').then(m => m.EncomendasEditarComponent) },
      { path: 'cotacoes', loadComponent: () => import('./features/billing/cotacoes/cotacoes-lista.component').then(m => m.CotacoesListaComponent) },
      { path: 'cotacoes/gerar', loadComponent: () => import('./features/billing/cotacoes/cotacoes-cadastro.component').then(m => m.CotacoesCadastroComponent) },
      { path: 'clientes', loadComponent: () => import('./features/billing/clientes/clientes-lista.component').then(m => m.ClientesListaComponent) },
      { path: 'clientes/historico', loadComponent: () => import('./features/billing/clientes/cliente-historico.component').then(m => m.ClienteHistoricoComponent) },
      { path: 'viagens', loadComponent: () => import('./features/billing/viagens/viagens-lista.component').then(m => m.ViagensListaComponent) },
      { path: 'viagens/nova', loadComponent: () => import('./features/billing/viagens/viagens-cadastro.component').then(m => m.ViagensCadastroComponent) },
      { path: 'viagens/:id', loadComponent: () => import('./features/billing/viagens/viagens-detalhe.component').then(m => m.ViagensDetalheComponent) },
      { path: 'viagens/:id/editar', loadComponent: () => import('./features/billing/viagens/viagens-editar.component').then(m => m.ViagensEditarComponent) },
      { path: 'guias', loadComponent: () => import('./features/billing/guias/guias-lista.component').then(m => m.GuiasListaComponent) },
      { path: 'guias/nova', loadComponent: () => import('./features/billing/guias/guias-cadastro.component').then(m => m.GuiasCadastroComponent) },
      { path: 'tesouraria', loadComponent: () => import('./features/billing/tesouraria/tesouraria.component').then(m => m.TesourariaComponent) },
      { path: 'relatorios', loadComponent: () => import('./features/billing-reports/billing-reports.component').then(m => m.BillingReportsComponent) },
      { path: 'configuracoes', loadComponent: () => import('./features/billing-settings/billing-settings.component').then(m => m.BillingSettingsComponent), canActivate: [configuracoesGuard] },
    ]
  },

  { path: '**', redirectTo: '' }
];
