create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2),
  rating numeric(2,1) not null default 0,
  reviews integer not null default 0,
  image_url text not null,
  description text not null,
  short_description text not null,
  tags text[] not null default '{}',
  features text[] not null default '{}',
  badge text,
  file_size text not null default '',
  format text not null default 'ZIP',
  level text not null default 'مبتدئ',
  storage_path text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'pending' check (status in ('pending','paid','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0)
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "public can read active products" on public.products for select using (is_active = true);
create policy "users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "users can read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "users can create own orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "users can read own order items" on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "users can create own order items" on public.order_items for insert with check (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into storage.buckets (id, name, public) values ('digital-products', 'digital-products', false)
on conflict (id) do nothing;

create policy "customers can download purchased files" on storage.objects for select to authenticated using (
  bucket_id = 'digital-products' and exists (
    select 1
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    join public.products p on p.id = oi.product_id
    where o.user_id = auth.uid() and o.status = 'paid' and p.storage_path = name
  )
);
