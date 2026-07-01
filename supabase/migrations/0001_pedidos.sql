-- Tabela de pedidos do hotsite "De Lolinha pra Você".
-- Os pedidos são gravados pelo servidor (route handler /api/orders) usando a
-- service role key, então o RLS fica habilitado sem políticas públicas: nenhum
-- acesso direto via anon key é permitido.

create table if not exists public.pedidos (
  id           text primary key,
  cliente_nome text,
  necessidades text[]        not null default '{}',
  kit_id       text          not null,
  produto_ids  text[]        not null default '{}',
  valor_total  numeric(10, 2) not null default 0,
  status       text          not null default 'novo'
                 check (status in ('novo', 'enviado_whatsapp', 'concluido', 'cancelado')),
  criado_em    timestamptz   not null default now()
);

comment on table public.pedidos is 'Pedidos gerados a partir dos kits curados, antes do fechamento via WhatsApp.';

-- Consultas comuns da Lolinha: por status e por data.
create index if not exists pedidos_status_idx    on public.pedidos (status);
create index if not exists pedidos_criado_em_idx on public.pedidos (criado_em desc);

alter table public.pedidos enable row level security;
