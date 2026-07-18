create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null check (char_length(trim(nombre)) > 0),
  edad smallint check (edad between 1 and 120),
  telefono text not null default '',
  correo text unique,
  created_at timestamptz not null default now()
);

alter table public.usuarios enable row level security;

drop policy if exists "Usuarios consultan su perfil" on public.usuarios;
create policy "Usuarios consultan su perfil"
  on public.usuarios
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Usuarios actualizan su perfil" on public.usuarios;
create policy "Usuarios actualizan su perfil"
  on public.usuarios
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke all on table public.usuarios from anon;
grant select, update on table public.usuarios to authenticated;

create or replace function public.guardar_usuario_registrado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  edad_registrada smallint;
begin
  edad_registrada := case
    when (new.raw_user_meta_data ->> 'edad') ~ '^[0-9]+$'
      then (new.raw_user_meta_data ->> 'edad')::smallint
    else null
  end;

  insert into public.usuarios (id, nombre, edad, telefono, correo)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nombre'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Usuario'
    ),
    edad_registrada,
    coalesce(trim(new.raw_user_meta_data ->> 'telefono'), ''),
    new.email
  )
  on conflict (id) do update
  set
    nombre = excluded.nombre,
    edad = excluded.edad,
    telefono = excluded.telefono,
    correo = excluded.correo;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.guardar_usuario_registrado();

-- Debe devolver una fila para confirmar que el trigger quedo instalado.
select
  trigger_definition.tgname as trigger_name,
  trigger_schema.nspname as schema_name,
  trigger_table.relname as table_name,
  trigger_function.proname as function_name
from pg_trigger as trigger_definition
join pg_class as trigger_table
  on trigger_table.oid = trigger_definition.tgrelid
join pg_namespace as trigger_schema
  on trigger_schema.oid = trigger_table.relnamespace
join pg_proc as trigger_function
  on trigger_function.oid = trigger_definition.tgfoid
where trigger_definition.tgisinternal = false
  and trigger_definition.tgname = 'on_auth_user_created';
