## Feature: Paleta Azul-Marinho + Laranja e foto real de camiao no Hero

### 1. O que foi feito

- Troquei toda a base de cores do portal para uma paleta **azul-marinho + laranja profissional**.
- Substituí o camiao em SVG no Hero por **uma foto real de camiao na estrada**, do lado direito, em alta qualidade.

### 2. Onde foi alterado

1. **Paleta de cores global**
   - Arquivo: `src/styles.css`
   - Bloco alterado:

```css
:root {
  /* Paleta Azul Marinho + Laranja profissional */
  --red: #ff7a1a; /* agora laranja principal */
  --red-dark: #c85b00; /* laranja escuro */
  --red-glow: rgba(255, 122, 26, 0.45);
  --black: #050814; /* azul-marinho quase preto */
  --dark: #070b20;  /* área de seções escuras */
  --card: #0f1224;  /* cartões sobre o fundo */
  --border: rgba(255, 122, 26, 0.2);
  --text: #f0f0f0;
  --muted: #8f93b2;
  --white: #ffffff;
}
```

- Todos os componentes que usam `var(--red)`, `var(--dark)`, etc., automaticamente passaram a usar a nova paleta.

2. **Hero com foto real de camiao**
   - Arquivo: `src/app/components/hero/hero.component.ts`
   - Substituí o `<svg>` do camiao por uma imagem:

```html
<div class="hero-truck">
  <!-- Foto real de camiao em alta qualidade (ficheiro local em assets) -->
  <img
    src="assets/truck-hero.jpg"
    alt="Camião de transporte na estrada"
    class="truck-photo"
  />
</div>
```

- Estilos principais para a foto:

```css
.hero-truck {
  position: absolute;
  right: 60px;
  top: 50%;
  transform: translateY(-50%);
  width: 520px;
  height: 380px;
  z-index: 1;
  opacity: 0.95;
  animation: fadeUp 0.8s 0.4s ease both, truckMove 10s ease-in-out infinite;
}

.truck-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 30px 120px rgba(0, 0, 0, 0.85),
    0 0 0 1px rgba(10, 27, 61, 0.6);
}
```

- Também ajustei detalhes de cor do fundo do Hero, badge e glow do título para combinar com o azul-marinho.

### 3. Como colocar a foto real de camiao

- Criei o arquivo de ajuda: `src/assets/README-truck-photo.txt` com os passos.
- Resumo rápido:
  1. Baixar da internet uma foto **horizontal** de camiao na estrada, em alta resolução.
  2. Renomear para: `truck-hero.jpg`.
  3. Colocar o ficheiro em: `src/assets/`.
  4. Rodar/atualizar o `ng serve` e recarregar o browser.

### 4. Como identificar essa feature no código

- Buscar por `truck-photo` ou `truck-hero.jpg` em `hero.component.ts`.
- Buscar por `Paleta Azul Marinho + Laranja profissional` em `styles.css`.

