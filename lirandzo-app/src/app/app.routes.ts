import { Routes } from '@angular/router';
import { billingFinanceiroGuard } from './shared/guards/billing-financeiro.guard';
import { configuracoesGuard } from './shared/guards/configuracoes.guard';
import { facturaEditarGuard } from './shared/guards/factura-editar.guard';
import { systemAuthGuard } from './shared/guards/system-auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./portal/home/home.component').then(m => m.HomeComponent) },
  { path: 'rastreio', loadComponent: () => import('./portal/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent) },
  { path: 'orcamento', loadComponent: () => import('./portal/request-quote/request-quote.component').then(m => m.RequestQuoteComponent) },
  { path: 'login', redirectTo: 'login-sistema', pathMatch: 'full' },
  { path: 'login-sistema', loadComponent: () => import('./system/login/login.component').then(m => m.LoginComponent), data: { accessContext: 'sistema' } },
  { path: 'login-cliente', loadComponent: () => import('./portal/client-login/client-login.component').then(m => m.ClientLoginComponent) },
  { path: 'recuperar-senha', loadComponent: () => import('./system/login/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'servicos', loadComponent: () => import('./portal/all-services/all-services.component').then(m => m.AllServicesComponent) },
  { path: 'sobre', loadComponent: () => import('./portal/about/about.component').then(m => m.AboutComponent) },
  { path: 'faq', loadComponent: () => import('./portal/faq/faq.component').then(m => m.FaqComponent) },
  { path: 'noticias/:id', loadComponent: () => import('./portal/noticias/noticia-detalhe/noticia-detalhe.component').then(m => m.NoticiaDetalheComponent) },
  { path: 'noticias', loadComponent: () => import('./portal/noticias/noticias.component').then(m => m.NoticiasComponent) },
  { path: 'contato', loadComponent: () => import('./portal/contato/contato.component').then(m => m.ContatoComponent) },
  { path: 'contacto', loadComponent: () => import('./portal/contato/contato.component').then(m => m.ContatoComponent) },
  { path: 'avaliacoes', loadComponent: () => import('./portal/avaliacoes/avaliacoes.component').then(m => m.AvaliacoesComponent) },
  { path: 'area-cliente', loadComponent: () => import('./portal/client-area/client-area.component').then(m => m.ClientAreaComponent) },

  {
    path: 'billing',
    loadComponent: () => import('./system/billing/layout/billing-layout.component').then(m => m.BillingLayoutComponent),
    canActivate: [systemAuthGuard],
    canActivateChild: [systemAuthGuard],
    children: [
      { path: '', loadComponent: () => import('./system/billing/dashboard/billing-dashboard.component').then(m => m.BillingDashboardComponent) },
      { path: 'viaturas', loadComponent: () => import('./system/billing/viaturas/viaturas-lista.component').then(m => m.ViaturasListaComponent) },
      { path: 'viaturas/nova', loadComponent: () => import('./system/billing/viaturas/viaturas-cadastro.component').then(m => m.ViaturasCadastroComponent) },
      { path: 'viaturas/estado', loadComponent: () => import('./system/billing/viaturas/viaturas-estado.component').then(m => m.ViaturasEstadoComponent) },
      { path: 'ocorrencias', loadComponent: () => import('./system/billing/viaturas/viaturas-estado.component').then(m => m.ViaturasEstadoComponent) },
      { path: 'ocorrencias/:id/editar', loadComponent: () => import('./system/billing/ocorrencias/ocorrencias-editar.component').then(m => m.OcorrenciasEditarComponent) },
      { path: 'viaturas/:id', loadComponent: () => import('./system/billing/viaturas/viaturas-detalhe.component').then(m => m.ViaturasDetalheComponent) },
      { path: 'viaturas/:id/editar', loadComponent: () => import('./system/billing/viaturas/viaturas-editar.component').then(m => m.ViaturasEditarComponent) },
      { path: 'motoristas', loadComponent: () => import('./system/billing/motoristas/motoristas-lista.component').then(m => m.MotoristasListaComponent) },
      { path: 'motoristas/novo', loadComponent: () => import('./system/billing/motoristas/motoristas-cadastro.component').then(m => m.MotoristasCadastroComponent) },
      { path: 'motoristas/:id', loadComponent: () => import('./system/billing/motoristas/motoristas-detalhe.component').then(m => m.MotoristasDetalheComponent) },
      { path: 'motoristas/:id/editar', loadComponent: () => import('./system/billing/motoristas/motoristas-editar.component').then(m => m.MotoristasEditarComponent) },
      { path: 'motoristas/destaques', loadComponent: () => import('./system/billing/motoristas/motoristas-destaque.component').then(m => m.MotoristasDestaqueComponent) },
      { path: 'encomendas', loadComponent: () => import('./system/billing/encomendas/encomendas-lista.component').then(m => m.EncomendasListaComponent) },
      { path: 'encomendas/nova', loadComponent: () => import('./system/billing/encomendas/encomendas-cadastro.component').then(m => m.EncomendasCadastroComponent) },
      {
        path: 'encomendas/pagamentos',
        loadComponent: () =>
          import('./system/billing/encomendas/encomendas-pagamentos.component').then((m) => m.EncomendasPagamentosComponent)
      },
      { path: 'encomendas/pagas', redirectTo: 'encomendas?estado=pago', pathMatch: 'full' },
      {
        path: 'encomendas/:id/historico',
        loadComponent: () => import('./system/billing/encomendas/encomendas-historico.component').then(m => m.EncomendasHistoricoComponent)
      },
      {
        path: 'encomendas/:id/editar',
        loadComponent: () => import('./system/billing/encomendas/encomendas-editar.component').then(m => m.EncomendasEditarComponent),
        canActivate: [facturaEditarGuard]
      },
      { path: 'encomendas/:id', loadComponent: () => import('./system/billing/encomendas/encomendas-detalhe.component').then(m => m.EncomendasDetalheComponent) },
      { path: 'cotacoes', loadComponent: () => import('./system/billing/cotacoes/cotacoes-lista.component').then(m => m.CotacoesListaComponent) },
      { path: 'cotacoes/gerar/:id', loadComponent: () => import('./system/billing/cotacoes/cotacoes-cadastro.component').then(m => m.CotacoesCadastroComponent) },
      { path: 'cotacoes/gerar', loadComponent: () => import('./system/billing/cotacoes/cotacoes-cadastro.component').then(m => m.CotacoesCadastroComponent) },
      { path: 'cotacoes/enviadas', loadComponent: () => import('./system/billing/cotacoes/cotacoes-enviadas.component').then(m => m.CotacoesEnviadasComponent) },
      {
        path: 'cotacoes/para-facturar',
        loadComponent: () => import('./system/billing/cotacoes/cotacoes-enviadas.component').then(m => m.CotacoesEnviadasComponent),
        data: { cotacaoModoParaFacturar: true }
      },
      { path: 'clientes', loadComponent: () => import('./system/billing/clientes/clientes-lista.component').then(m => m.ClientesListaComponent) },
      { path: 'clientes/novo', loadComponent: () => import('./system/billing/clientes/clientes-cadastro.component').then(m => m.ClientesCadastroComponent) },
      { path: 'clientes/historico', loadComponent: () => import('./system/billing/clientes/cliente-historico.component').then(m => m.ClienteHistoricoComponent) },
      { path: 'viagens', loadComponent: () => import('./system/billing/viagens/viagens-lista.component').then(m => m.ViagensListaComponent) },
      { path: 'viagens/nova', loadComponent: () => import('./system/billing/viagens/viagens-cadastro.component').then(m => m.ViagensCadastroComponent) },
      { path: 'viagens/:id', loadComponent: () => import('./system/billing/viagens/viagens-detalhe.component').then(m => m.ViagensDetalheComponent) },
      { path: 'viagens/:id/editar', loadComponent: () => import('./system/billing/viagens/viagens-editar.component').then(m => m.ViagensEditarComponent) },
      { path: 'guias', loadComponent: () => import('./system/billing/guias/guias-lista.component').then(m => m.GuiasListaComponent) },
      { path: 'guias/nova', loadComponent: () => import('./system/billing/guias/guias-cadastro.component').then(m => m.GuiasCadastroComponent) },
      { path: 'combustivel', loadComponent: () => import('./system/billing/combustivel/combustivel-lista.component').then(m => m.CombustivelListaComponent) },
      { path: 'combustivel/novo', loadComponent: () => import('./system/billing/combustivel/combustivel-cadastro.component').then(m => m.CombustivelCadastroComponent) },
      { path: 'combustivel/:id/editar', loadComponent: () => import('./system/billing/combustivel/combustivel-editar.component').then(m => m.CombustivelEditarComponent) },
      { path: 'combustivel/facturas', loadComponent: () => import('./system/billing/combustivel/combustivel-placeholder.component').then(m => m.CombustivelPlaceholderComponent) },
      { path: 'manutencao', loadComponent: () => import('./system/billing/manutencao/manutencao-lista.component').then(m => m.ManutencaoListaComponent) },
      { path: 'manutencao/nova', loadComponent: () => import('./system/billing/manutencao/manutencao-cadastro.component').then(m => m.ManutencaoCadastroComponent) },
      { path: 'manutencao/:id/editar', loadComponent: () => import('./system/billing/manutencao/manutencao-editar.component').then(m => m.ManutencaoEditarComponent) },
      {
        path: 'baixas',
        loadComponent: () => import('./system/billing/tesouraria/tesouraria.component').then((m) => m.TesourariaComponent),
        canActivate: [billingFinanceiroGuard],
        data: {
          tesourariaModoBaixas: true,
          tesourariaSomenteBaixas: true,
          tesourariaAbaInicial: 'BAIXAS'
        }
      },
      {
        path: 'tesouraria',
        loadComponent: () => import('./system/billing/tesouraria/tesouraria.component').then((m) => m.TesourariaComponent),
        canActivate: [billingFinanceiroGuard],
        data: { tesourariaAbaInicial: 'RECIBOS' }
      },
      { path: 'meu-perfil', loadComponent: () => import('./system/billing/meu-perfil/meu-perfil.component').then(m => m.MeuPerfilComponent) },
      { path: 'relatorios', loadComponent: () => import('./system/billing-reports/billing-reports.component').then(m => m.BillingReportsComponent) },
      { path: 'configuracoes', loadComponent: () => import('./system/billing-settings/billing-settings.component').then(m => m.BillingSettingsComponent), canActivate: [configuracoesGuard] },
    ]
  },

  { path: '**', redirectTo: '' }
];
