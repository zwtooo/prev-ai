-- ============================================================
-- prev.ai — Schema de Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default '',
  email text,
  role_job text default '',
  age integer,
  height text default '',
  weight text default '',
  goal text default '',
  streak integer default 0,
  total_sessions integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. REMINDERS
create table if not exists public.reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text default '',
  time text not null,
  days text[] not null default '{}',
  active boolean default true,
  icon text default '⏰',
  color text default 'orange',
  created_at timestamptz default now()
);

-- 3. TRAINING SESSIONS
create table if not exists public.training_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  routine_id integer,
  routine_title text,
  duration_minutes integer not null,
  category text default 'hogar',
  completed_at timestamptz default now()
);

-- 4. USER GOALS
create table if not exists public.user_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  completed boolean default false,
  completed_date text,
  created_at timestamptz default now()
);

-- 5. CHAT MESSAGES
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.reminders enable row level security;
alter table public.training_sessions enable row level security;
alter table public.user_goals enable row level security;
alter table public.chat_messages enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Reminders
create policy "Users can manage own reminders" on public.reminders for all using (auth.uid() = user_id);

-- Training Sessions
create policy "Users can manage own sessions" on public.training_sessions for all using (auth.uid() = user_id);

-- User Goals
create policy "Users can manage own goals" on public.user_goals for all using (auth.uid() = user_id);

-- Chat Messages
create policy "Users can manage own messages" on public.chat_messages for all using (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
