create table favorites (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamptz default now() not null
);

insert into favorites (name) values
  ('Kevin'),
  ('Andria'),
  ('Joy'),
  ('Josh'),
  ('Andrew'),
  ('Chris');
