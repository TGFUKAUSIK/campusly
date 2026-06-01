-- Campusly / UniCC Next baseline schema
-- Run in a new Supabase project. Auth users are managed by Supabase Auth.

create extension if not exists "pgcrypto";

create type public.attendance_status as enum ('present', 'absent', 'on_duty', 'cancelled');
create type public.assignment_status as enum ('todo', 'in_progress', 'submitted', 'graded');
create type public.notification_kind as enum ('class', 'attendance', 'assignment', 'exam', 'community', 'placement', 'hostel', 'system');
create type public.application_status as enum ('eligible', 'applied', 'shortlisted', 'interview', 'offered', 'rejected');
create type public.request_status as enum ('draft', 'submitted', 'approved', 'rejected', 'closed');

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(code) between 2 and 12),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  registration_number text unique,
  full_name text not null,
  avatar_url text,
  phone text,
  campus text,
  program text,
  department_id uuid references public.departments(id) on delete set null,
  graduation_year smallint check (graduation_year between 2000 and 2200),
  theme text not null default 'system' check (theme in ('light', 'dark', 'amoled', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  upstream_id text,
  label text not null,
  starts_on date,
  ends_on date,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, label)
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  title text not null,
  short_title text,
  department_id uuid references public.departments(id) on delete set null,
  credits numeric(3,1) not null default 0 check (credits >= 0),
  created_at timestamptz not null default now(),
  unique (code, title)
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_id uuid not null references public.semesters(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  faculty_name text,
  slot text,
  created_at timestamptz not null default now(),
  unique (user_id, semester_id, subject_id)
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  attended integer not null default 0 check (attended >= 0),
  conducted integer not null default 0 check (conducted >= 0 and attended <= conducted),
  updated_at timestamptz not null default now(),
  unique (enrollment_id)
);

create table public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  class_date date not null,
  starts_at time,
  status public.attendance_status not null,
  source text not null default 'vtop',
  created_at timestamptz not null default now(),
  unique (enrollment_id, class_date, starts_at)
);

create table public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null check (ends_at > starts_at),
  room text,
  class_type text not null default 'lecture' check (class_type in ('lecture', 'lab', 'tutorial')),
  created_at timestamptz not null default now()
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  timetable_entry_id uuid references public.timetable_entries(id) on delete set null,
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  room text,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  created_at timestamptz not null default now()
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  description text,
  due_at timestamptz,
  priority smallint not null default 2 check (priority between 1 and 3),
  status public.assignment_status not null default 'todo',
  progress smallint not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.semesters(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  exam_type text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  room text,
  created_at timestamptz not null default now()
);

create table public.results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_id uuid not null references public.semesters(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  score numeric(5,2),
  grade text,
  grade_points numeric(3,2),
  published_at timestamptz,
  unique (user_id, semester_id, subject_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind public.notification_kind not null default 'system',
  title text not null,
  body text,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint check (size_bytes >= 0),
  is_shared boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo_url text,
  website_url text,
  created_at timestamptz not null default now()
);

create table public.placements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  role text not null,
  description text,
  min_cgpa numeric(3,2),
  allowed_departments uuid[] not null default '{}',
  apply_by timestamptz,
  created_at timestamptz not null default now()
);

create table public.placement_applications (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references public.placements(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.application_status not null default 'eligible',
  applied_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (placement_id, user_id)
);

create table public.hostel_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  block text,
  room text,
  bed text,
  hostel_type text,
  updated_at timestamptz not null default now()
);

create table public.mess_menu_items (
  id uuid primary key default gen_random_uuid(),
  hostel_type text not null,
  service_date date not null,
  meal text not null check (meal in ('breakfast', 'lunch', 'snacks', 'dinner')),
  items text[] not null default '{}',
  unique (hostel_type, service_date, meal)
);

create table public.hostel_complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  description text not null,
  status public.request_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  leaves_at timestamptz not null,
  returns_at timestamptz not null check (returns_at > leaves_at),
  destination text,
  status public.request_status not null default 'draft',
  upstream_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_semesters_user_active on public.semesters(user_id, is_active);
create index idx_enrollments_user_semester on public.enrollments(user_id, semester_id);
create index idx_attendance_logs_enrollment_date on public.attendance_logs(enrollment_id, class_date desc);
create index idx_timetable_entries_enrollment_weekday on public.timetable_entries(enrollment_id, weekday, starts_at);
create index idx_classes_enrollment_start on public.classes(enrollment_id, starts_at);
create index idx_assignments_user_due on public.assignments(user_id, due_at);
create index idx_exams_semester_start on public.exams(semester_id, starts_at);
create index idx_results_user_semester on public.results(user_id, semester_id);
create index idx_notifications_user_created on public.notifications(user_id, created_at desc);
create index idx_notes_owner_subject on public.notes(owner_id, subject_id);
create index idx_posts_subject_created on public.community_posts(subject_id, created_at desc);
create index idx_comments_post_created on public.comments(post_id, created_at);
create index idx_placement_applications_user on public.placement_applications(user_id, updated_at desc);
create index idx_hostel_complaints_user on public.hostel_complaints(user_id, created_at desc);
create index idx_leave_requests_user on public.leave_requests(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.semesters enable row level security;
alter table public.enrollments enable row level security;
alter table public.attendance_records enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.timetable_entries enable row level security;
alter table public.classes enable row level security;
alter table public.assignments enable row level security;
alter table public.exams enable row level security;
alter table public.results enable row level security;
alter table public.notifications enable row level security;
alter table public.notes enable row level security;
alter table public.community_posts enable row level security;
alter table public.comments enable row level security;
alter table public.placement_applications enable row level security;
alter table public.hostel_profiles enable row level security;
alter table public.hostel_complaints enable row level security;
alter table public.leave_requests enable row level security;

create policy "profiles_owner_all" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "semesters_owner_all" on public.semesters for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "enrollments_owner_all" on public.enrollments for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "attendance_records_owner_read" on public.attendance_records for select using (
  exists (select 1 from public.enrollments e where e.id = enrollment_id and e.user_id = auth.uid())
);
create policy "attendance_logs_owner_read" on public.attendance_logs for select using (
  exists (select 1 from public.enrollments e where e.id = enrollment_id and e.user_id = auth.uid())
);
create policy "timetable_entries_owner_read" on public.timetable_entries for select using (
  exists (select 1 from public.enrollments e where e.id = enrollment_id and e.user_id = auth.uid())
);
create policy "classes_owner_read" on public.classes for select using (
  exists (select 1 from public.enrollments e where e.id = enrollment_id and e.user_id = auth.uid())
);
create policy "assignments_owner_all" on public.assignments for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "exams_owner_read" on public.exams for select using (
  exists (select 1 from public.semesters s where s.id = semester_id and s.user_id = auth.uid())
);
create policy "results_owner_read" on public.results for select using (user_id = auth.uid());
create policy "notifications_owner_all" on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notes_owner_all" on public.notes for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "notes_shared_read" on public.notes for select using (is_shared = true);
create policy "posts_authenticated_read" on public.community_posts for select to authenticated using (true);
create policy "posts_author_write" on public.community_posts for all using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "comments_authenticated_read" on public.comments for select to authenticated using (true);
create policy "comments_author_write" on public.comments for all using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "applications_owner_all" on public.placement_applications for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "hostel_profile_owner_all" on public.hostel_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "hostel_complaints_owner_all" on public.hostel_complaints for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "leave_requests_owner_all" on public.leave_requests for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', 'Student'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
