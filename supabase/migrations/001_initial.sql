-- Games table
create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  date date not null,
  time time not null,
  place text not null,
  people_needed integer not null check (people_needed >= 2 and people_needed <= 24),
  created_at timestamptz default now()
);

-- Attendees table
create table if not exists attendees (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- Prevent duplicate names per game (case-insensitive)
create unique index if not exists attendees_game_name_unique
  on attendees (game_id, lower(name));

-- RLS
alter table games enable row level security;
alter table attendees enable row level security;

-- Games: anyone can read, only service role can insert
create policy "games_select" on games for select using (true);

-- Attendees: anyone can read and insert
create policy "attendees_select" on attendees for select using (true);
create policy "attendees_insert" on attendees for insert with check (true);

-- Enable realtime on attendees
alter publication supabase_realtime add table attendees;
