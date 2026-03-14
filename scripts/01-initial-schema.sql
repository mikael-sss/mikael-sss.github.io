-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Organizations table
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Users table with tenant isolation
create table public.users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  password_hash text not null,
  full_name text not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(organization_id, email)
);

-- Products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  sku text,
  unit_price decimal(10, 2) not null,
  cost_price decimal(10, 2),
  stock_quantity integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(organization_id, sku)
);

-- Quotations table
create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  status text default 'draft' check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  total_amount decimal(10, 2) not null,
  notes text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Quotation items table
create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price decimal(10, 2) not null,
  created_at timestamp with time zone default now()
);

-- Sales table
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete set null,
  quotation_id uuid references public.quotations(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  total_amount decimal(10, 2) not null,
  status text default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Sale items table
create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price decimal(10, 2) not null,
  created_at timestamp with time zone default now()
);

-- Payment tracking table
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sale_id uuid not null references public.sales(id) on delete cascade,
  amount decimal(10, 2) not null,
  payment_method text not null check (payment_method in ('credit_card', 'debit_card', 'bank_transfer', 'cash', 'check')),
  status text default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  transaction_reference text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better query performance
create index users_organization_id_idx on public.users(organization_id);
create index products_organization_id_idx on public.products(organization_id);
create index quotations_organization_id_idx on public.quotations(organization_id);
create index quotations_user_id_idx on public.quotations(user_id);
create index sales_organization_id_idx on public.sales(organization_id);
create index sales_user_id_idx on public.sales(user_id);
create index payments_organization_id_idx on public.payments(organization_id);
create index payments_sale_id_idx on public.payments(sale_id);

-- Row Level Security (RLS) - Enable for all tables
alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.payments enable row level security;

-- RLS Policies - Organizations (users can only see their own org)
create policy "organizations_select" on public.organizations
  for select using (
    id in (
      select organization_id from public.users where id = auth.uid()
    )
  );

-- RLS Policies - Users (users can see other users in same org)
create policy "users_select" on public.users
  for select using (
    organization_id in (
      select organization_id from public.users where id = auth.uid()
    )
  );

create policy "users_update_own" on public.users
  for update using (id = auth.uid());

-- RLS Policies - Products
create policy "products_select" on public.products
  for select using (
    organization_id in (
      select organization_id from public.users where id = auth.uid()
    )
  );

create policy "products_insert" on public.products
  for insert with check (
    organization_id in (
      select organization_id from public.users 
      where id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "products_update" on public.products
  for update using (
    organization_id in (
      select organization_id from public.users 
      where id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- RLS Policies - Quotations
create policy "quotations_select" on public.quotations
  for select using (
    organization_id in (
      select organization_id from public.users where id = auth.uid()
    )
  );

create policy "quotations_insert" on public.quotations
  for insert with check (
    organization_id in (
      select organization_id from public.users where id = auth.uid()
    ) and user_id = auth.uid()
  );

create policy "quotations_update" on public.quotations
  for update using (
    organization_id in (
      select organization_id from public.users where id = auth.uid()
    )
  );

-- RLS Policies - Sales
create policy "sales_select" on public.sales
  for select using (
    organization_id in (
      select organization_id from public.users where id = auth.uid()
    )
  );

create policy "sales_insert" on public.sales
  for insert with check (
    organization_id in (
      select organization_id from public.users where id = auth.uid()
    ) and user_id = auth.uid()
  );

create policy "sales_update" on public.sales
  for update using (
    organization_id in (
      select organization_id from public.users where id = auth.uid()
    )
  );

-- RLS Policies - Payments
create policy "payments_select" on public.payments
  for select using (
    organization_id in (
      select organization_id from public.users where id = auth.uid()
    )
  );

create policy "payments_insert" on public.payments
  for insert with check (
    organization_id in (
      select organization_id from public.users where id = auth.uid()
    )
  );

create policy "payments_update" on public.payments
  for update using (
    organization_id in (
      select organization_id from public.users where id = auth.uid()
    )
  );

-- Quotation items and sale items inherit org_id from parent, so we add RLS via parent
create policy "quotation_items_select" on public.quotation_items
  for select using (
    quotation_id in (
      select id from public.quotations where organization_id in (
        select organization_id from public.users where id = auth.uid()
      )
    )
  );

create policy "sale_items_select" on public.sale_items
  for select using (
    sale_id in (
      select id from public.sales where organization_id in (
        select organization_id from public.users where id = auth.uid()
      )
    )
  );
