-- Create profiles table linked to auth.users
create table public.profiles (
  id uuid not null references auth.users on delete cascade primary key,
  email text,
  full_name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create stylists table
create table public.stylists (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  role text not null, -- e.g., 'Master Barber', 'Senior Barber'
  bio text,
  image_url text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- enable RLS for stylists
alter table public.stylists enable row level security;

create policy "Stylists are viewable by everyone."
  on stylists for select
  using ( true );

-- Create services table
create table public.services (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal(10, 2) not null,
  duration_minutes integer not null,
  category text, -- e.g., 'Corte', 'Barba', 'Combo'
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- enable RLS for services
alter table public.services enable row level security;

create policy "Services are viewable by everyone."
  on services for select
  using ( true );

-- Create bookings table
create table public.bookings (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  stylist_id uuid references public.stylists(id),
  service_id uuid references public.services(id),
  appointment_date timestamp with time zone not null,
  status text default 'pending', -- pending, confirmed, completed, cancelled
  source text default 'web', -- 'web', 'whatsapp' (for filtering analytics)
  price_at_booking decimal(10, 2) not null, -- capture price at time of booking for accurate revenue
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- enable RLS for bookings
alter table public.bookings enable row level security;

create policy "Users can view their own bookings."
  on bookings for select
  using ( auth.uid() = user_id );

create policy "Users can create their own bookings."
  on bookings for insert
  with check ( auth.uid() = user_id );

-- Create index for faster analytics queries
create index idx_bookings_stylist_source on bookings(stylist_id, source);
create index idx_bookings_service_source on bookings(service_id, source);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
