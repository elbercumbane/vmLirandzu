## Feature: Vídeo de camião na estrada no Hero

### 1. O que foi feito

- Substituí a imagem estática do camião no Hero por um **vídeo real de camião na estrada**.
- O vídeo é carregado a partir de `src/assets/videos` e ocupa suavemente todo o lado direito do Hero.

### 2. Onde foi alterado

- Arquivo: `src/app/components/hero/hero.component.ts`
- Trecho do template (novo bloco com `<video>`):

```html
<div class="hero-truck">
  <!-- Vídeo do camiao na estrada vindo de assets/videos -->
  <video
    class="hero-video"
    autoplay
    muted
    loop
    playsinline
  >
    <source src="assets/videos/WhatsApp%20Video%202026-02-22%20at%2022.37.20.mp4" type="video/mp4" />
    O seu navegador não suporta vídeo em HTML5.
  </video>
</div>
```

- Estilos principais para o container e o vídeo:

```css
.hero-truck {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 55%;
  z-index: 1;
  opacity: 0.95;
  animation: fadeUp 0.8s 0.4s ease both;
  overflow: hidden;
  border-radius: 60px 0 0 60px;
  box-shadow:
    0 40px 120px rgba(0, 0, 0, 0.85),
    0 0 0 1px rgba(10, 27, 61, 0.6);
  background: radial-gradient(circle at 20% 0%, rgba(0, 0, 0, 0.35), transparent 60%);
}

.hero-video {
  width: 115%;
  height: 115%;
  object-fit: cover;
  transform: translateX(-5%) translateY(-5%);
  filter: saturate(1.05) contrast(1.05);
}

@media (max-width: 1200px) {
  .hero-truck {
    position: relative;
    width: 100%;
    height: 260px;
    border-radius: 32px;
    margin-top: 40px;
    box-shadow:
      0 30px 90px rgba(0, 0, 0, 0.7),
      0 0 0 1px rgba(10, 27, 61, 0.6);
  }

  .hero-video {
    width: 100%;
    height: 100%;
    transform: translateX(0) translateY(0);
  }
}
```

### 3. Como o vídeo é servido

- O Angular já está configurado para servir tudo de `src/assets` (incluindo subpastas `videos`).
- O caminho usado no `src` precisa considerar espaços no nome do ficheiro, por isso está com `%20`:
  - `WhatsApp%20Video%202026-02-22%20at%2022.37.20.mp4`

### 4. Como trocar o vídeo no futuro

- Colocar o novo ficheiro em `src/assets/videos/`.
- Copiar o nome do arquivo e atualizar o `src` do `<source>` no Hero:

```html
<source src="assets/videos/novo-nome-do-video.mp4" type="video/mp4" />
```

### 5. Notas visuais

- O Hero usa um fundo em degradê azul mais claro e suave (`styles.css` + estilos do Hero), o que combina melhor com o vídeo de estrada.
- O vídeo está **muted + autoplay + loop + playsinline**, ideal para Hero sem controles de player.

