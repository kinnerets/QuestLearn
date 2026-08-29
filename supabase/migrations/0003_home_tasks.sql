-- Home tasks ("מטלות בית"): parents define chores worth coins; kids check them
-- off once a day and earn the coins. Run once in the Supabase SQL editor.
create table if not exists home_tasks (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null default '11111111-1111-1111-1111-111111111111',
  title       text not null,
  coins       integer not null default 5,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists home_task_done (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references home_tasks(id) on delete cascade,
  child_id   uuid not null references users(id) on delete cascade,
  day        date not null default current_date,
  created_at timestamptz not null default now(),
  unique (task_id, child_id, day)
);

-- A couple of starter chores so the section isn't empty.
insert into home_tasks (title, coins) values
  ('לסדר את החדר', 10),
  ('לפנות את השולחן אחרי ארוחה', 8),
  ('להכין את התיק לבית הספר', 6);
