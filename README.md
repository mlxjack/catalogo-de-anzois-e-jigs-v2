# Catálogo de Anzóis & Jig Heads — Chumbada Oficial (sem preços)

Catálogo digital de **anzóis e jig heads** da Chumbada Oficial. SPA em **React 19 + Vite**, com página de produto, seleção de variações, busca e filtro por categoria.

Esta é a versão **SEM preços** (`SHOW_PRICES = false` em `src/config.js`) — mostra produtos, variações e specs, e direciona ao WhatsApp/loja para valores. A versão com preços fica em `catalogo-de-anzois-e-jigs-com-preco-v2` (mesmo código, `SHOW_PRICES = true`).

## Seções / categorias

- **Anzóis Premium** — linha Quimipoint (afiação química de competição), com design oriental em destaque
- **Anzóis** — modelos japoneses avulsos (Kitsune, Sode, Chinu, Iseama…)
- **Jig Heads** — bananinha, football, articulados, kits
- **Anzóis EWG** — Extra Wide Gap anti-enrosco
- **Jig Head 90°** e **Jig Head 60°**
- **Com Mola** — sistema de mola/sapatinho

## Fonte de dados

Os produtos vêm de `public/products.csv` (export bruto da Shopify), parseado em runtime por `src/utils/csvParser.js`. A categorização é derivada automaticamente do título e das tags. **Editar o catálogo = editar o CSV** (ou re-exportar da Shopify).

## Desenvolvimento

```bash
npm install
npm run dev      # servidor local
npm run build    # gera dist/
npm run preview  # pré-visualiza o build
```

## Deploy

GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`), branch `main`. `vite.config.js` usa `base: './'` (caminhos relativos).
