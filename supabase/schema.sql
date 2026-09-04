-- Auth users are managed by Supabase. Every application record belongs to auth.uid().
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  equipment text,
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  training_days text[] not null default '{}',
  duration_minutes integer,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plan_exercises (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.workout_plans(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  position integer not null default 0,
  target_sets integer not null default 3,
  target_reps integer not null default 10,
  rest_seconds integer not null default 90,
  unique (plan_id, exercise_id)
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.workout_plans(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer,
  volume_kg numeric(10,2) not null default 0,
  notes text
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  set_number integer not null,
  weight_kg numeric(8,2) not null default 0,
  reps integer not null default 0,
  rpe numeric(3,1),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_on date not null default current_date,
  weight_kg numeric(6,2),
  biceps_cm numeric(6,2),
  chest_cm numeric(6,2),
  waist_cm numeric(6,2),
  thigh_cm numeric(6,2),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.water_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  liters numeric(5,2) not null default 0,
  primary key (user_id, log_date)
);

create table if not exists public.training_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  training_date date not null,
  source text not null default 'manual',
  workout_id uuid references public.workouts(id) on delete set null,
  primary key (user_id, training_date)
);

create table if not exists public.achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_key text not null,
  tier text not null default 'bronze',
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_key)
);

-- Backward-compatible snapshot used by the current client while it migrates to the normalized tables.
create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array['profiles','exercises','workout_plans','plan_exercises','workouts','workout_sets','body_measurements','water_logs','training_days','achievements','user_data'] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

-- User-owned tables: only the signed-in owner can read or mutate their records.
drop policy if exists "profiles own data" on public.profiles;
create policy "profiles own data" on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "exercises own data" on public.exercises;
create policy "exercises can read system or own" on public.exercises for select using (user_id is null or auth.uid() = user_id);
drop policy if exists "exercises can manage own" on public.exercises;
create policy "exercises can manage own" on public.exercises for insert with check (auth.uid() = user_id);
create policy "exercises can update own" on public.exercises for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exercises can delete own" on public.exercises for delete using (auth.uid() = user_id);
drop policy if exists "plans own data" on public.workout_plans;
create policy "plans own data" on public.workout_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "plan exercises own data" on public.plan_exercises;
create policy "plan exercises own data" on public.plan_exercises for all using (exists (select 1 from public.workout_plans p where p.id = plan_id and p.user_id = auth.uid())) with check (exists (select 1 from public.workout_plans p where p.id = plan_id and p.user_id = auth.uid()));
drop policy if exists "workouts own data" on public.workouts;
create policy "workouts own data" on public.workouts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "sets own data" on public.workout_sets;
create policy "sets own data" on public.workout_sets for all using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid())) with check (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));
drop policy if exists "measurements own data" on public.body_measurements;
create policy "measurements own data" on public.body_measurements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "water own data" on public.water_logs;
create policy "water own data" on public.water_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "training days own data" on public.training_days;
create policy "training days own data" on public.training_days for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "achievements own data" on public.achievements;
create policy "achievements own data" on public.achievements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user snapshot own data" on public.user_data;
create policy "user snapshot own data" on public.user_data for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
