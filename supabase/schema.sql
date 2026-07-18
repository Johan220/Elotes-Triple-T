create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('Elotes', 'Esquites', 'Especiales', 'Bebidas')),
  price numeric(10, 2) not null check (price > 0),
  description text not null,
  tags text[] not null default '{}',
  image_url text not null,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Productos visibles para todos" on public.products;
create policy "Productos visibles para todos"
  on public.products
  for select
  using (true);

drop policy if exists "Administradores autenticados crean productos" on public.products;
create policy "Administradores autenticados crean productos"
  on public.products
  for insert
  to authenticated
  with check (true);

drop policy if exists "Administradores autenticados actualizan productos" on public.products;
create policy "Administradores autenticados actualizan productos"
  on public.products
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Administradores autenticados eliminan productos" on public.products;
create policy "Administradores autenticados eliminan productos"
  on public.products
  for delete
  to authenticated
  using (true);

insert into public.products (name, category, price, description, tags, image_url, featured)
values
  (
    'Elote Clásico',
    'Elotes',
    38,
    'Elote tierno con mayonesa, queso fresco, chilito y limón.',
    array['Queso fresco', 'Chilito', 'Limón'],
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmrSyHDcZUz97NutA1GHSYJ1zKr56tv0BfjzibUWm0OQ&s=10',
    true
  ),
  (
    'Esquite Triple T',
    'Esquites',
    52,
    'Vaso generoso de esquite con crema, queso, cacahuate y Takis.',
    array['Crujiente', 'Picante', 'Favorito'],
    'https://www.lala.com.mx/storage/app/media/esquites_optimized.jpg',
    true
  ),
  (
    'Elote Flamin',
    'Especiales',
    58,
    'Elote cubierto con salsa de la casa y fritura flamin molida.',
    array['Salsa de la casa', 'Muy picante'],
    'https://i.pinimg.com/736x/85/5b/30/855b301e56ccbfcf78181b7b4b7bb339.jpg',
    false
  ),
  (
    'Tostiesquite',
    'Especiales',
    65,
    'Tostitos con esquite preparado, queso, crema y salsa botanera.',
    array['Botana', 'Para compartir'],
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGxv0dHRBIXEka-X_Ekp4k6nuDIna8G34Swy4Y4rYG7A&s=10',
    false
  ),
  (
    'Agua de Horchata',
    'Bebidas',
    28,
    'Agua fresca cremosa, fría y perfecta para bajar el chilito.',
    array['Natural', 'Fría'],
    'https://mahatmarice.com/wp-content/uploads/2020/04/GettyImages-493110032.jpg',
    false
  ),
  (
    'Esquite Chico',
    'Esquites',
    34,
    'El tamaño ideal para un antojo rápido, preparado a tu gusto.',
    array['Ligero', 'A tu gusto'],
    'https://http2.mlstatic.com/D_NQ_NP_797203-MLM107949927238_032026-O.webp',
    false
  ),
  (
    'Agua de Jamaica',
    'Bebidas',
    28,
    'Agua fresca de jamaica con hielo, ligera y refrescante.',
    array['Natural', 'Refrescante'],
    'https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480_1_5x/img/recipe/ras/Assets/F34BC251-8877-40BD-BBEF-ADDD34D15543/Derivates/A86DA7B6-65EB-4512-A719-085699EF7072.jpg',
    false
  ),
  (
    'Agua de Tamarindo',
    'Bebidas',
    28,
    'Agua fresca de tamarindo con sabor dulce y acidito.',
    array['Natural', 'Dulce acidito'],
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFQUgBUrTGpxvugSv_kjuuuF1BxJFWfwDcnRknIzQEuw&s=10',
    false
  )
on conflict (id) do nothing;

update public.products
set image_url = case name
  when 'Elote Clásico' then 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmrSyHDcZUz97NutA1GHSYJ1zKr56tv0BfjzibUWm0OQ&s=10'
  when 'Esquite Triple T' then 'https://www.lala.com.mx/storage/app/media/esquites_optimized.jpg'
  when 'Elote Flamin' then 'https://i.pinimg.com/736x/85/5b/30/855b301e56ccbfcf78181b7b4b7bb339.jpg'
  when 'Tostiesquite' then 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGxv0dHRBIXEka-X_Ekp4k6nuDIna8G34Swy4Y4rYG7A&s=10'
  when 'Agua de Horchata' then 'https://mahatmarice.com/wp-content/uploads/2020/04/GettyImages-493110032.jpg'
  when 'Esquite Chico' then 'https://http2.mlstatic.com/D_NQ_NP_797203-MLM107949927238_032026-O.webp'
  when 'Agua de Jamaica' then 'https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480_1_5x/img/recipe/ras/Assets/F34BC251-8877-40BD-BBEF-ADDD34D15543/Derivates/A86DA7B6-65EB-4512-A719-085699EF7072.jpg'
  when 'Agua de Tamarindo' then 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFQUgBUrTGpxvugSv_kjuuuF1BxJFWfwDcnRknIzQEuw&s=10'
  else image_url
end
where name in (
  'Elote Clásico',
  'Esquite Triple T',
  'Elote Flamin',
  'Tostiesquite',
  'Agua de Horchata',
  'Esquite Chico',
  'Agua de Jamaica',
  'Agua de Tamarindo'
);
