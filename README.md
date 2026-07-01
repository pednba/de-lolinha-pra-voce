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

## Dados

### Catálogo (Google Sheet)

O catálogo vive numa Google Sheet com uma aba **`Produtos`**. A partir da linha 2:

| Coluna | Campo          | Exemplo                          |
| ------ | -------------- | -------------------------------- |
| A      | `id`           | `serum-vit-c`                    |
| B      | `nome`         | Sérum Vitamina C                 |
| C      | `descricao`    | Ilumina e uniformiza a pele      |
| D      | `categoria`    | Skincare                         |
| E      | `preco`        | `R$ 89,90`                       |
| F      | `imagemUrl`    | https://…/serum.jpg              |
| G      | `necessidades` | `antiidade,hidratacao`           |
| H      | `ativo`        | `sim` / `não`                    |

Os ids da coluna `necessidades` devem casar com os ids definidos em
`lib/necessidades.ts` (usados no quiz).

### Pedidos (Supabase)

O schema fica em `supabase/migrations/0001_pedidos.sql`. Aplique com a
[Supabase CLI](https://supabase.com/docs/guides/cli) (`supabase db push`) ou
colando o SQL no editor do projeto. Os pedidos são gravados pelo servidor com a
service role key; o RLS fica habilitado sem políticas públicas.

## Desenvolvimento

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

Veja `.env.example` para a lista de variáveis de ambiente necessárias
(Supabase, Google Sheets e número de WhatsApp da Lolinha).

## Deploy na Vercel

O projeto é Next.js puro, autodetectado pela Vercel — não precisa de `vercel.json`.

1. Em [vercel.com/new](https://vercel.com/new), importe `pednba/de-lolinha-pra-voce`.
   Se o repo não aparecer, ajuste as permissões do GitHub App da Vercel.
2. **Production Branch** (em *Settings → Git*): aponte para a branch default do
   repositório.
3. Configure as **Environment Variables** antes do primeiro deploy:

   | Variável | Quando | Observação |
   | --- | --- | --- |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | sempre | número real da Lolinha, ex.: `5511999999999` |
   | `USE_SAMPLE_CATALOG` | teste | `true` para subir já funcional; remova ao conectar a Sheet |
   | `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` | catálogo real | — |
   | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | pedidos | — |

   > As variáveis `NEXT_PUBLIC_*` são embutidas em **build time** — defina-as antes
   > do deploy. `GOOGLE_PRIVATE_KEY` deve manter as quebras de linha como `\n`.

4. Deploy. Cada push na branch conectada gera um Preview Deployment automático.
