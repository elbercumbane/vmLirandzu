# VM Lirandzu Transportes - Portal Angular 19

Portal web moderno para VM Lirandzu Transportes & Logística, desenvolvido com Angular 19.

Este repositório integra:
- O **portal público** desenvolvido pelo Guilherme (Angular 19, layout com login e novo dashboard) dentro da pasta `lirandzo-app/`
- O **sistema de facturação/billing** que vive na raiz `src/app/billing` e partilha o mesmo domínio/porta via `app.routes.ts`

## 🚀 Instalação

1. Instale as dependências na raiz (billing + shell):
```bash
npm install
```

2. Instale as dependências do portal Angular principal (lirandzo-app):
```bash
cd lirandzo-app
npm install
cd ..
```

3. Execute o servidor de desenvolvimento (shell principal):
```bash
npm start
```

4. Acesse `http://localhost:4200` no navegador.

## 🛠️ Build para Produção

Na raiz do projecto:
```bash
npm run build
```

Os artefactos do Angular standalone (billing) serão gerados em `dist/` conforme configuração local.

Para o portal Angular 19 (`lirandzo-app`), use:
```bash
cd lirandzo-app
npm run build
cd ..
```

## 📁 Estrutura do Projeto (resumo)

### Shell / Facturação (este repo)
```
src/
├── app/
│   ├── billing/           # Módulos e páginas do sistema de facturação
│   ├── services/          # Serviços partilhados (orders, payments, trips, etc.)
│   ├── models/            # Modelos de domínio
│   └── app.routes.ts      # Rotas principais (/, /billing, etc.)
└── styles.css             # Estilos globais
```

### Portal Angular 19 do Guilherme (`lirandzo-app/`)
```
lirandzo-app/
├── src/app/features/      # Home, login, client-area, etc.
├── src/app/shared/        # Navbar, footer, sidebar, guards, services, etc.
├── src/app/billing/       # Layout e páginas de billing no portal
└── src/styles.css         # Estilos globais do portal
```

## ✨ Características

- ✅ Portal marketing + área de cliente da VM Lirandzu (branch do Guilherme)
- ✅ Sistema de facturação integrado no mesmo domínio/porta via rotas
- ✅ Design moderno com tema escuro e elementos animados
- ✅ Angular 19 com Standalone Components e arquitectura modular

## 📱 Responsividade

O portal e o módulo de facturação são responsivos e adaptam-se a diferentes tamanhos de ecrã.
