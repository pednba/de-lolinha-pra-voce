-- Eventos de comportamento do funil do hotsite "De Lolinha pra Você".
--
-- Registra passos anônimos da visitante (sem PII): a identificação é um
-- `sessao_id` aleatório gerado no navegador, sem relação com identidade real.
-- A gravação é feita pelo servidor (route handler /api/track) com a service
-- role key, então o RLS fica ativo e sem políticas: a anon key não lê nem grava.

create table if not exists public.eventos (
  id          bigint generated always as identity primary key,
  sessao_id   text        not null,
  tipo        text        not null
                check (tipo in (
                  'home_vista',
                  'quiz_iniciado',
                  'necessidade_escolhida',
                  'kits_vistos',
                  'whatsapp_aberto'
                )),
  necessidades text[]      not null default '{}',
  kit_id      text,
  valor_total numeric(10, 2),
  criado_em   timestamptz not null default now()
);

comment on table public.eventos is 'Eventos anônimos do funil: da landing ao clique de fechamento no WhatsApp.';

create index if not exists eventos_tipo_idx      on public.eventos (tipo);
create index if not exists eventos_criado_em_idx on public.eventos (criado_em desc);
create index if not exists eventos_sessao_idx    on public.eventos (sessao_id);

alter table public.eventos enable row level security;

-- ---------------------------------------------------------------------------
-- Relatórios
-- ---------------------------------------------------------------------------

-- Funil por dia: quantas sessões distintas chegaram a cada passo.
-- A diferença entre uma coluna e a seguinte é o abandono daquele passo.
create or replace view public.funil_diario
with (security_invoker = true) as
select
  date_trunc('day', criado_em)::date                                        as dia,
  count(distinct sessao_id) filter (where tipo = 'home_vista')              as home,
  count(distinct sessao_id) filter (where tipo = 'quiz_iniciado')           as quiz,
  count(distinct sessao_id) filter (where tipo = 'necessidade_escolhida')   as escolheu,
  count(distinct sessao_id) filter (where tipo = 'kits_vistos')             as viu_kits,
  count(distinct sessao_id) filter (where tipo = 'whatsapp_aberto')         as foi_whatsapp
from public.eventos
group by 1
order by 1 desc;

comment on view public.funil_diario is 'Funil diário por sessões distintas; a queda entre colunas é o abandono.';

-- Interesses: quais necessidades as clientes mais escolhem no quiz.
create or replace view public.interesses
with (security_invoker = true) as
select
  necessidade,
  count(*)                    as escolhas,
  count(distinct sessao_id)   as sessoes
from public.eventos, unnest(necessidades) as necessidade
where tipo = 'necessidade_escolhida'
group by necessidade
order by escolhas desc;

comment on view public.interesses is 'Ranking de necessidades escolhidas no quiz — o que a clientela procura.';
