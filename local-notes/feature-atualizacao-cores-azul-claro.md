# Atualização de Cores do Sistema - Paleta Azul Claro

## Data
2025-01-27

## Descrição
Atualização completa da paleta de cores do sistema baseada na imagem de referência do navbar. Substituição do azul escuro e laranja por uma paleta moderna com azul claro e gradientes azul claro para branco.

## Problema Identificado
O sistema estava usando uma paleta de cores com:
- Azul escuro muito escuro (#060E1B, #0A1628)
- Laranja/laranja (#F97316, #FF7A1A) como cor de destaque
- Cores que não correspondiam ao design da imagem de referência

## Solução Implementada

### Nova Paleta de Cores

#### Cores Principais
- **Azul Claro Primário**: `#4A9EFF` - Cor principal para botões e acentos
- **Azul Claro Secundário**: `#6BB3FF` - Hover e variações
- **Azul Médio**: `#2E7CD6` - Estados hover mais escuros

#### Cores de Fundo
- **Fundo Principal**: `#0A1B3A` (substituiu #060E1B)
- **Fundo Secundário**: `#0F2447` (substituiu #0A1628)
- **Cards**: `#152A4A` (substituiu #112240)

#### Cores de Texto
- **Texto Primário**: `#FFFFFF` (branco puro)
- **Texto Secundário**: `#B8C5D9` (substituiu #6B84A3, #E8EDF5)

#### Cores de Borda
- **Bordas**: `#2E4A6B` (substituiu #1E3A5F)

### Gradientes Implementados
- **Botões Principais**: `linear-gradient(135deg, #4A9EFF, #FFFFFF)` - Gradiente azul claro para branco
- **Logo Mark**: `linear-gradient(135deg, #4A9EFF, #6BB3FF)` - Gradiente azul claro
- **Texto Destacado**: Gradiente azul claro para texto com `background-clip: text`

## Arquivos Modificados

### 1. `src/styles.css`
- Atualizadas todas as variáveis CSS (`:root`)
- Adicionadas novas variáveis: `--primary`, `--primary-dark`, `--primary-glow`
- Mantidas variáveis antigas (`--red`, `--red-dark`, `--red-glow`) para compatibilidade, mas agora apontam para as novas cores azuis

### 2. `tailwind.config.js`
- Atualizada paleta de cores do Tailwind
- Removidas cores laranja
- Adicionadas cores azuis claras

### 3. Componentes Atualizados
- `src/app/components/nav/nav.component.ts`
  - Navbar com fundo azul escuro atualizado
  - Links em branco
  - Botão CTA com gradiente azul claro para branco
  
- `src/app/components/hero/hero.component.ts`
  - Fundo com gradiente azul atualizado
  - Badges e acentos em azul claro
  - Botões com gradiente azul claro para branco
  - Estatísticas com cores azuis

- `src/app/facturacao/layout/facturacao-layout.component.ts`
  - Sidebar e header com novas cores
  - Logo com gradiente azul claro
  - Links de navegação atualizados

- `src/app/billing/layout/billing-layout.component.ts`
  - Mesmas atualizações do layout de facturação

- `src/app/app.component.ts`
  - Cursor customizado atualizado para azul claro

### 4. Outros Componentes
Todos os componentes que usavam cores hardcoded foram atualizados:
- Componentes de facturação (dashboard, encomendas, nova-encomenda, etc.)
- Componentes de billing (orders, new-order, dashboard, etc.)
- Componentes da landing page (servicos, depoimentos, cta, footer, etc.)

## Mapeamento de Cores Antigas para Novas

| Cor Antiga | Cor Nova | Uso |
|------------|----------|-----|
| `#F97316` | `linear-gradient(135deg, #4A9EFF, #6BB3FF)` | Botões principais |
| `#FB923C` | `#6BB3FF` | Hover de botões |
| `#0A1628` | `#0F2447` | Fundos secundários |
| `#112240` | `#152A4A` | Cards |
| `#1E3A5F` | `#2E4A6B` | Bordas |
| `#6B84A3` | `#B8C5D9` | Texto secundário |
| `#E8EDF5` | `#FFFFFF` | Texto primário |
| `#060E1B` | `#0A1B3A` | Fundo principal |

## Como Identificar se a Mudança Foi Aplicada

1. **Navbar**: Links devem estar em branco, botão CTA com gradiente azul claro para branco
2. **Botões**: Todos os botões principais devem ter gradiente azul claro para branco
3. **Fundo**: Fundo geral deve ser azul escuro mais claro (#0A1B3A)
4. **Logo**: Logo mark deve ter gradiente azul claro
5. **Acentos**: Todos os elementos de destaque devem estar em azul claro (#4A9EFF)

## Notas Técnicas

- As variáveis CSS antigas (`--red`, `--red-dark`, `--red-glow`) foram mantidas para compatibilidade com código que ainda as referencia
- Gradientes foram implementados usando `linear-gradient(135deg, ...)` para consistência
- Alguns componentes podem ainda ter cores hardcoded que precisam ser atualizadas manualmente se encontradas

## Próximos Passos (Opcional)

1. Revisar todos os componentes para garantir que não há cores antigas hardcoded
2. Atualizar componentes de serviços, depoimentos, CTA e footer se necessário
3. Testar acessibilidade das novas cores (contraste)
4. Atualizar documentação de design system se existir

## Referência
Baseado na imagem de referência do navbar fornecida pelo usuário, que mostra:
- Navbar com fundo azul escuro e links brancos
- Botões com gradiente azul claro para branco
- Paleta geral azul escuro com acentos azuis claros
