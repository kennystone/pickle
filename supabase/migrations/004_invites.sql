create table invites (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  game_id uuid not null references games(id) on delete cascade,
  player_name text not null,
  created_at timestamptz default now() not null
);
create unique index invites_game_player_unique on invites (game_id, lower(player_name));
alter table invites enable row level security;
create policy "invites_select" on invites for select using (true);
