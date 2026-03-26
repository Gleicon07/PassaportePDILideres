-- =============================================
-- PASSAPORTE PDI - Setup do Banco de Dados
-- =============================================
-- Cole este SQL no Supabase:
-- 1. Abra seu projeto em supabase.com
-- 2. Vá em "SQL Editor" (menu lateral)
-- 3. Clique "New Query"
-- 4. Cole TUDO abaixo e clique "Run"
-- =============================================

-- Tabela principal
create table passaportes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  nome text not null default '',
  unidade text default '',
  talentos jsonb default '["","","","",""]',
  workshop_date text default '',
  encontros jsonb default '[{"com":"","data":""},{"com":"","data":""},{"com":"","data":""}]',
  mapa_date text default '',
  tutor_date text default '',
  carimbo_date text default '',
  reflexoes text default '',
  parada1 jsonb default '{"data":"","texto":""}',
  parada2 jsonb default '{"data":"","texto":""}',
  parada3 jsonb default '{"data":"","texto":""}',
  encerramento text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Segurança: cada pessoa só vê/edita os próprios dados
alter table passaportes enable row level security;

create policy "Usuarios veem apenas seus dados"
  on passaportes for select
  using (auth.uid() = user_id);

create policy "Usuarios inserem apenas seus dados"
  on passaportes for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam apenas seus dados"
  on passaportes for update
  using (auth.uid() = user_id);
