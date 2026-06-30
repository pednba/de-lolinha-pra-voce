# De Lolinha pra Você 💄

Hotsite de **curadoria de kits de cosméticos** para a revendedora Lolinha.

As clientes acessam o hotsite, escolhem suas necessidades de beleza, recebem
sugestões de kits curados, e o fechamento da venda acontece via **WhatsApp** da
Lolinha.

## Como funciona

1. A cliente faz um quiz rápido escolhendo suas necessidades de beleza.
2. O catálogo (mantido pela Lolinha numa **Google Sheet**) é usado para montar
   kits curados.
3. Os kits sugeridos são exibidos para a cliente.
4. O pedido é salvo no **Supabase** e o fechamento acontece via link de WhatsApp.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — persistência de pedidos
- [Google Sheets API](https://developers.google.com/sheets/api) — catálogo de produtos
- Deploy na [Vercel](https://vercel.com/)

## Estrutura

```
app/
  page.tsx              # landing
  quiz/                 # seleção de necessidades
  kits/                 # kits curados sugeridos
  api/
    catalog/            # GET — lê o catálogo da Google Sheet
    orders/             # POST — salva pedido no Supabase
components/             # Header, Footer, KitCard, WhatsAppButton, ui/
lib/
  supabase/             # clients browser/server
  google-sheets.ts      # leitura do catálogo
  catalog.ts            # curadoria de kits
  whatsapp.ts           # geração do link de fechamento
  utils.ts
types/                  # tipos compartilhados
```

## Desenvolvimento

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

Veja `.env.example` para a lista de variáveis de ambiente necessárias
(Supabase, Google Sheets e número de WhatsApp da Lolinha).
