create table if not exists public.ordenes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  total numeric(10, 2) not null check (total >= 0),
  estado text not null default 'registrada'
    check (estado in ('registrada', 'preparando', 'completada', 'cancelada')),
  productos jsonb not null default '[]'::jsonb
    check (jsonb_typeof(productos) = 'array'),
  created_at timestamptz not null default now()
);

create index if not exists ordenes_usuario_id_created_at_idx
  on public.ordenes (usuario_id, created_at desc);

alter table public.ordenes enable row level security;

drop policy if exists "Usuarios consultan sus ordenes" on public.ordenes;
create policy "Usuarios consultan sus ordenes"
  on public.ordenes
  for select
  to authenticated
  using ((select auth.uid()) = usuario_id);

drop policy if exists "Usuarios crean sus ordenes" on public.ordenes;
create policy "Usuarios crean sus ordenes"
  on public.ordenes
  for insert
  to authenticated
  with check ((select auth.uid()) = usuario_id);

revoke all on table public.ordenes from anon;
grant select, insert on table public.ordenes to authenticated;
