# 🚛 Sistema de Facturação - VM Lirandzu Transportes

## 📋 Visão Geral

Sistema completo de facturação integrado no portal VM Lirandzu, separado através de rotas mas na mesma aplicação Angular 19.

## 🚀 Instalação

### 1. Instalar Dependências

```bash
npm install
```

Isso instalará:
- Angular 19
- Tailwind CSS
- date-fns
- jsPDF

### 2. Executar o Projeto

```bash
ng serve
```

### 3. Acessar

- **Portal público**: http://localhost:4200/
- **Sistema de facturação**: http://localhost:4200/facturacao

## 📁 Estrutura do Sistema

```
src/app/
├── models/              # Modelos TypeScript
│   ├── encomenda.model.ts
│   ├── cliente.model.ts
│   ├── viagem.model.ts
│   └── config.model.ts
├── services/            # Serviços de negócio
│   ├── storage.service.ts
│   └── encomenda.service.ts
└── facturacao/         # Componentes do sistema
    ├── layout/
    ├── dashboard/
    ├── encomendas/
    ├── nova-encomenda/
    ├── viagens/
    ├── clientes/
    ├── pagamentos/
    ├── relatorios/
    └── configuracoes/
```

## ✨ Funcionalidades Implementadas

### ✅ Dashboard
- KPIs em tempo real
- Gráficos de encomendas e pagamentos
- Alertas de encomendas atrasadas
- Lista das últimas encomendas

### ✅ Encomendas
- Listagem completa com todas as colunas
- Filtros avançados (status, data, pesquisa)
- Acções: Ver, Editar, PDF, Marcar Pago

### ✅ Nova Encomenda
- Formulário completo em 4 secções
- Múltiplos produtos por encomenda
- Cálculos automáticos
- Numeração automática (VML-2025-0001)

## 🎨 Paleta de Cores

- **Navy principal**: #0A1628
- **Navy cards**: #112240
- **Laranja primário**: #F97316
- **Verde (pago)**: #22C55E
- **Amarelo (parcial)**: #EAB308
- **Vermelho (não pago)**: #EF4444

## 📝 Próximos Passos

1. Implementar Guias de Viagem com vista mobile
2. Completar módulo de Clientes
3. Implementar registo de Pagamentos
4. Criar Relatórios (PDF/Excel)
5. Configurações da empresa
6. Geração de PDF de facturas

## 🔧 Tecnologias

- Angular 19 (Standalone Components)
- TypeScript
- Tailwind CSS
- localStorage (MVP)
- date-fns
- jsPDF (para PDFs)

## 📖 Documentação

Ver `local-notes/feature-sistema-facturacao.md` para detalhes técnicos completos.
