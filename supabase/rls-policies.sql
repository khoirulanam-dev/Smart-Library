-- Smart Library RLS policies
-- Run this file in the Supabase SQL Editor after enabling RLS.
-- It preserves the current app behavior: every logged-in Supabase user can
-- read and manage the application tables used by the dashboard.

alter table if exists public.mahasiswa enable row level security;
alter table if exists public.buku_master enable row level security;
alter table if exists public.buku_item enable row level security;
alter table if exists public.transaksi enable row level security;
alter table if exists public.logs enable row level security;
alter table if exists public.buku enable row level security;

do $$
begin
  if to_regclass('public.mahasiswa') is not null then
    drop policy if exists "smart library authenticated full access" on public.mahasiswa;
    create policy "smart library authenticated full access"
      on public.mahasiswa
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  if to_regclass('public.buku_master') is not null then
    drop policy if exists "smart library authenticated full access" on public.buku_master;
    create policy "smart library authenticated full access"
      on public.buku_master
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  if to_regclass('public.buku_item') is not null then
    drop policy if exists "smart library authenticated full access" on public.buku_item;
    create policy "smart library authenticated full access"
      on public.buku_item
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  if to_regclass('public.transaksi') is not null then
    drop policy if exists "smart library authenticated full access" on public.transaksi;
    create policy "smart library authenticated full access"
      on public.transaksi
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  if to_regclass('public.logs') is not null then
    drop policy if exists "smart library authenticated full access" on public.logs;
    create policy "smart library authenticated full access"
      on public.logs
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  if to_regclass('public.buku') is not null then
    drop policy if exists "smart library authenticated full access" on public.buku;
    create policy "smart library authenticated full access"
      on public.buku
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;
