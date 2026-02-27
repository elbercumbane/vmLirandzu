# 🚀 Guia de Instalação - Angular 19

## Pré-requisitos

Antes de começar, você precisa ter instalado:
- **Node.js** (versão 18 ou superior)
- **npm** (vem com Node.js)

### Verificar se tem Node.js instalado:
```bash
node --version
npm --version
```

Se não tiver Node.js, baixe em: https://nodejs.org/

---

## Passo 1: Instalar Angular CLI Globalmente

Abra o **CMD** (Prompt de Comando) ou **PowerShell** como Administrador e execute:

```bash
npm install -g @angular/cli@19
```

Isso instalará o Angular CLI versão 19 globalmente no seu sistema.

### Verificar instalação:
```bash
ng version
```

Você deve ver algo como:
```
Angular CLI: 19.0.0
```

---

## Passo 2: Navegar até a pasta do projeto

```bash
cd "C:\Users\Elber Elizio\Desktop\DAP PROJECTOS\vmLirandzu"
```

---

## Passo 3: Instalar dependências do projeto

```bash
npm install
```

Isso instalará todas as dependências listadas no `package.json`.

---

## Passo 4: Executar o projeto

```bash
ng serve
```

ou simplesmente:

```bash
npm start
```

O servidor de desenvolvimento será iniciado e você verá:

```
✔ Browser application bundle generation complete.
Initial chunk files   | Names         |  Size
vendor.js             | vendor        |  2.50 MB
polyfills.js          | polyfills     |  314.85 kB
styles.css, styles.js | styles        |  1.20 MB
main.js               | main           |  57.23 kB

** Angular Live Development Server is listening on localhost:4200 **
```

---

## Passo 5: Acessar no navegador

Abra seu navegador e acesse:

```
http://localhost:4200
```

---

## 📝 Comandos Úteis

### Parar o servidor:
Pressione `Ctrl + C` no terminal

### Build para produção:
```bash
ng build
```

### Build com otimizações:
```bash
ng build --configuration production
```

---

## ⚠️ Problemas Comuns

### Erro: "ng não é reconhecido como comando"
**Solução:** O Angular CLI não está instalado ou não está no PATH. Reinstale:
```bash
npm install -g @angular/cli@19
```

### Erro: "EACCES" ou permissões
**Solução:** Execute o CMD como Administrador (clique com botão direito > Executar como administrador)

### Erro: Versão do Node.js muito antiga
**Solução:** Atualize o Node.js para versão 18 ou superior em https://nodejs.org/

### Porta 4200 já está em uso
**Solução:** Use outra porta:
```bash
ng serve --port 4201
```

---

## 🎯 Resumo Rápido

```bash
# 1. Instalar Angular CLI
npm install -g @angular/cli@19

# 2. Ir para a pasta do projeto
cd "C:\Users\Elber Elizio\Desktop\DAP PROJECTOS\vmLirandzu"

# 3. Instalar dependências
npm install

# 4. Executar projeto
ng serve

# 5. Abrir http://localhost:4200 no navegador
```
