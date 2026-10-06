-- Ausweich-Transport für Online-Partien (wenn WebSockets blockiert sind): Nachrichten-Log pro Partiecode.
create table public.online_msgs (
  code text not null check (code ~ '^[A-Z0-9]{6}$'),
  seq int not null,
  sender text not null check (char_length(sender) <= 16),
  msg jsonb not null check (octet_length(msg::text) < 2000),
  created_at timestamptz not null default now(),
  primary key (code, seq)
);
alter table public.online_msgs enable row level security;
revoke all on public.online_msgs from anon, authenticated;

create or replace function public.chessty_game_send(p_code text, p_sender text, p_msg jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare v_seq int;
begin
  perform pg_advisory_xact_lock(hashtext(p_code));
  select coalesce(max(seq), 0) + 1 into v_seq from online_msgs where code = p_code;
  if v_seq > 800 then raise exception 'Partie zu lang'; end if;
  insert into online_msgs (code, seq, sender, msg) values (p_code, v_seq, p_sender, p_msg);
  -- Aufräumen: Partien älter als 2 Tage
  delete from online_msgs where created_at < now() - interval '2 days';
  return v_seq;
end $$;

create or replace function public.chessty_game_poll(p_code text, p_after int)
returns table (seq int, sender text, msg jsonb) language sql stable security definer set search_path = public as $$
  select seq, sender, msg from online_msgs where code = p_code and seq > p_after order by seq limit 200;
$$;

revoke all on function public.chessty_game_send(text, text, jsonb) from public;
revoke all on function public.chessty_game_poll(text, int) from public;
grant execute on function public.chessty_game_send(text, text, jsonb) to anon, authenticated;
grant execute on function public.chessty_game_poll(text, int) to anon, authenticated;
