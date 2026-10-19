-- Courtside accounts: run this once in Supabase (SQL Editor > New query > paste > Run).
-- Safe to run again: it only creates what is missing and replaces the functions and rules.
--
-- Two tables:
--   profiles  your username (one per account, no two the same)
--   saves     your whole game save as one block
-- Row-level security means a signed-in player can only ever read or write their own rows.

-- ---------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[A-Za-z0-9_]{3,16}$'),
  created_at timestamptz not null default now()
);
-- No two usernames the same, ignoring capitals (ARLO and arlo are the same name).
create unique index if not exists profiles_username_lower on public.profiles (lower(username));

alter table public.profiles enable row level security;
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
-- No insert, update or delete rules: the profile is made by the trigger below and removed with the account.
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;

-- ---------- saves
create table if not exists public.saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  rev integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint save_size check (pg_column_size(data) < 262144) -- 256 KB, far more than a save needs
);

alter table public.saves enable row level security;
drop policy if exists "read own save" on public.saves;
drop policy if exists "add own save" on public.saves;
drop policy if exists "change own save" on public.saves;
create policy "read own save" on public.saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "add own save" on public.saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "change own save" on public.saves for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on public.saves from anon;
revoke delete, truncate, references, trigger on public.saves from authenticated;

-- The server sets the time, not the game.
create or replace function public.save_stamp() returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists save_stamp on public.saves;
create trigger save_stamp before insert or update on public.saves for each row execute function public.save_stamp();

-- ---------- a new account gets its profile, with the username chosen at sign-up
-- If the username is missing, badly formed or taken, the sign-up fails.
create or replace function public.new_player() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username) values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end $$;
drop trigger if exists new_player on auth.users;
create trigger new_player after insert on auth.users for each row execute function public.new_player();

-- ---------- is a username free? (asked before sign-up; says yes or no, nothing else)
create or replace function public.username_free(name text) returns boolean language sql stable security definer set search_path = '' as $$
  select name ~ '^[A-Za-z0-9_]{3,16}$' and not exists (select 1 from public.profiles where lower(username) = lower(name));
$$;
revoke all on function public.username_free(text) from public;
grant execute on function public.username_free(text) to anon, authenticated;

-- ---------- delete my account (the DELETE ACCOUNT button): removes the login, the profile and the save
create or replace function public.delete_me() returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_me() from public, anon;
grant execute on function public.delete_me() to authenticated;
