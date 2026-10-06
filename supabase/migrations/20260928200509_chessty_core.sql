-- Chessty: Konten ohne E-Mail (Name + geheimer Sync-Code), Freunde, Ligen, Tagespuzzle.
-- Alle Zugriffe laufen über SECURITY-DEFINER-Funktionen; Tabellen sind für anon/authenticated gesperrt.
create extension if not exists pgcrypto with schema extensions;

create table public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 20),
  friend_code text not null unique,
  secret_hash text not null,
  xp int not null default 0,
  streak int not null default 0,
  puzzle_rating int not null default 1200,
  week text not null default '',
  weekly_xp int not null default 0,
  league int not null default 0 check (league between 0 and 4),
  progress jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index players_week_idx on public.players (week, league, weekly_xp desc);

create table public.friendships (
  player_id uuid not null references public.players(id) on delete cascade,
  friend_id uuid not null references public.players(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (player_id, friend_id),
  check (player_id <> friend_id)
);

create table public.daily_results (
  player_id uuid not null references public.players(id) on delete cascade,
  day date not null,
  solved boolean not null,
  ms int not null check (ms between 0 and 3600000),
  created_at timestamptz not null default now(),
  primary key (player_id, day)
);

alter table public.players enable row level security;
alter table public.friendships enable row level security;
alter table public.daily_results enable row level security;
revoke all on public.players, public.friendships, public.daily_results from anon, authenticated;

-- Hilfsfunktion: Sync-Code prüfen
create or replace function public._auth(p_id uuid, p_secret text) returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (select 1 from players where id = p_id and secret_hash = encode(digest(p_secret, 'sha256'), 'hex'));
$$;
revoke all on function public._auth(uuid, text) from public, anon, authenticated;

-- ISO-Woche als Text, z. B. 2026-W40
create or replace function public._week() returns text language sql stable as $$
  select to_char(now() at time zone 'Europe/Berlin', 'IYYY-"W"IW');
$$;

-- Konto anlegen: liefert id, geheimen Code und Freundescode
create or replace function public.chessty_register(p_name text)
returns table (id uuid, secret text, friend_code text)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_secret text := encode(gen_random_bytes(18), 'hex');
  v_code text;
  v_id uuid;
begin
  if p_name is null or char_length(trim(p_name)) not between 2 and 20 then
    raise exception 'Name muss 2 bis 20 Zeichen haben';
  end if;
  loop
    v_code := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 6));
    exit when not exists (select 1 from players p where p.friend_code = v_code);
  end loop;
  insert into players (name, friend_code, secret_hash, week)
  values (trim(p_name), v_code, encode(digest(v_secret, 'sha256'), 'hex'), _week())
  returning players.id into v_id;
  return query select v_id, v_secret, v_code;
end $$;

-- Fortschritt hochladen. Wochenwechsel: Liga-Auf-/Abstieg nach Platz der Vorwoche.
create or replace function public.chessty_push(p_id uuid, p_secret text, p_progress jsonb, p_xp int, p_streak int, p_rating int, p_week_xp int)
returns table (league int, week text, weekly_xp int, friend_code text, name text)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_week text := _week();
  r players%rowtype;
  v_rank int;
  v_size int;
begin
  if not _auth(p_id, p_secret) then raise exception 'Ungültiger Sync-Code'; end if;
  if octet_length(p_progress::text) > 400000 then raise exception 'Fortschritt zu groß'; end if;
  select * into r from players where id = p_id for update;
  if r.week <> v_week then
    -- Platz in der alten Liga bestimmen
    select count(*) + 1 into v_rank from players o where o.week = r.week and o.league = r.league and o.weekly_xp > r.weekly_xp;
    select count(*) into v_size from players o where o.week = r.week and o.league = r.league;
    if r.weekly_xp > 0 and v_size > 0 and v_rank <= greatest(1, ceil(v_size * 0.2)) then r.league := least(4, r.league + 1);
    elsif v_size >= 5 and v_rank > v_size - floor(v_size * 0.2) then r.league := greatest(0, r.league - 1);
    end if;
    r.week := v_week;
    r.weekly_xp := 0;
  end if;
  update players set
    progress = p_progress,
    xp = greatest(0, least(p_xp, 10000000)),
    streak = greatest(0, least(p_streak, 100000)),
    puzzle_rating = greatest(0, least(p_rating, 4000)),
    week = r.week,
    weekly_xp = greatest(r.weekly_xp, least(greatest(p_week_xp, 0), 100000)),
    league = r.league,
    updated_at = now()
  where players.id = p_id;
  return query select p.league, p.week, p.weekly_xp, p.friend_code, p.name from players p where p.id = p_id;
end $$;

-- Fortschritt herunterladen (z. B. auf einem zweiten Gerät)
create or replace function public.chessty_pull(p_id uuid, p_secret text)
returns table (name text, friend_code text, progress jsonb, league int)
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not _auth(p_id, p_secret) then raise exception 'Ungültiger Sync-Code'; end if;
  return query select p.name, p.friend_code, p.progress, p.league from players p where p.id = p_id;
end $$;

create or replace function public.chessty_rename(p_id uuid, p_secret text, p_name text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not _auth(p_id, p_secret) then raise exception 'Ungültiger Sync-Code'; end if;
  if char_length(trim(p_name)) not between 2 and 20 then raise exception 'Name muss 2 bis 20 Zeichen haben'; end if;
  update players set name = trim(p_name) where id = p_id;
end $$;

create or replace function public.chessty_delete(p_id uuid, p_secret text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not _auth(p_id, p_secret) then raise exception 'Ungültiger Sync-Code'; end if;
  delete from players where id = p_id;
end $$;

-- Freunde (gegenseitig) per Freundescode
create or replace function public.chessty_add_friend(p_id uuid, p_secret text, p_code text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare v_friend uuid; v_name text;
begin
  if not _auth(p_id, p_secret) then raise exception 'Ungültiger Sync-Code'; end if;
  select id, name into v_friend, v_name from players where friend_code = upper(trim(p_code));
  if v_friend is null then raise exception 'Freundescode nicht gefunden'; end if;
  if v_friend = p_id then raise exception 'Das ist dein eigener Code'; end if;
  insert into friendships values (p_id, v_friend, now()) on conflict do nothing;
  insert into friendships values (v_friend, p_id, now()) on conflict do nothing;
  return v_name;
end $$;

create or replace function public.chessty_remove_friend(p_id uuid, p_secret text, p_code text)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare v_friend uuid;
begin
  if not _auth(p_id, p_secret) then raise exception 'Ungültiger Sync-Code'; end if;
  select id into v_friend from players where friend_code = upper(trim(p_code));
  delete from friendships where (player_id = p_id and friend_id = v_friend) or (player_id = v_friend and friend_id = p_id);
end $$;

create or replace function public.chessty_friends(p_id uuid, p_secret text)
returns table (name text, friend_code text, xp int, weekly_xp int, streak int, puzzle_rating int, is_me boolean)
language plpgsql security definer set search_path = public, extensions as $$
declare v_week text := _week();
begin
  if not _auth(p_id, p_secret) then raise exception 'Ungültiger Sync-Code'; end if;
  return query
    select p.name, p.friend_code, p.xp, case when p.week = v_week then p.weekly_xp else 0 end, p.streak, p.puzzle_rating, p.id = p_id
    from players p
    where p.id = p_id or p.id in (select friend_id from friendships where player_id = p_id)
    order by 4 desc, 3 desc;
end $$;

-- Wochenliga: Spieler derselben Liga in dieser Woche
create or replace function public.chessty_league(p_id uuid, p_secret text)
returns table (name text, weekly_xp int, league int, is_me boolean)
language plpgsql security definer set search_path = public, extensions as $$
declare v_league int; v_week text := _week();
begin
  if not _auth(p_id, p_secret) then raise exception 'Ungültiger Sync-Code'; end if;
  select p.league into v_league from players p where p.id = p_id;
  return query
    select p.name, p.weekly_xp, p.league, p.id = p_id from players p
    where p.league = v_league and p.week = v_week and (p.weekly_xp > 0 or p.id = p_id)
    order by p.weekly_xp desc limit 50;
end $$;

-- Tagespuzzle: Ergebnis eintragen (einmal pro Tag) und Rangliste
create or replace function public.chessty_daily_submit(p_id uuid, p_secret text, p_day date, p_solved boolean, p_ms int)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not _auth(p_id, p_secret) then raise exception 'Ungültiger Sync-Code'; end if;
  if p_day not between (now() at time zone 'Europe/Berlin')::date - 1 and (now() at time zone 'Europe/Berlin')::date + 1 then
    raise exception 'Falscher Tag';
  end if;
  insert into daily_results values (p_id, p_day, p_solved, greatest(0, least(p_ms, 3600000)), now()) on conflict do nothing;
end $$;

create or replace function public.chessty_daily_board(p_day date)
returns table (name text, solved boolean, ms int)
language sql stable security definer set search_path = public as $$
  select p.name, d.solved, d.ms from daily_results d join players p on p.id = d.player_id
  where d.day = p_day order by d.solved desc, d.ms asc limit 30;
$$;

-- Nur die öffentlichen Funktionen freigeben
revoke all on all functions in schema public from public;
grant execute on function public.chessty_register(text) to anon, authenticated;
grant execute on function public.chessty_push(uuid, text, jsonb, int, int, int, int) to anon, authenticated;
grant execute on function public.chessty_pull(uuid, text) to anon, authenticated;
grant execute on function public.chessty_rename(uuid, text, text) to anon, authenticated;
grant execute on function public.chessty_delete(uuid, text) to anon, authenticated;
grant execute on function public.chessty_add_friend(uuid, text, text) to anon, authenticated;
grant execute on function public.chessty_remove_friend(uuid, text, text) to anon, authenticated;
grant execute on function public.chessty_friends(uuid, text) to anon, authenticated;
grant execute on function public.chessty_league(uuid, text) to anon, authenticated;
grant execute on function public.chessty_daily_submit(uuid, text, date, boolean, int) to anon, authenticated;
grant execute on function public.chessty_daily_board(date) to anon, authenticated;
