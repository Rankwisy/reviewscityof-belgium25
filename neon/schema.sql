-- ============================================================
-- CityReview.be — Neon PostgreSQL Schema
-- Run this in: Neon Console → SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── CITIES ───────────────────────────────────────────────────
create table if not exists cities (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  slug              text not null unique,
  tagline           text,
  short_description text,
  description       text,
  hero_image        text,
  rating            numeric(3,1),
  region            text,
  population        integer,
  latitude          numeric(10,7),
  longitude         numeric(10,7),
  created_date      timestamptz default now()
);

-- ── ATTRACTIONS ──────────────────────────────────────────────
create table if not exists attractions (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  slug              text not null unique,
  city_slug         text,
  category          text,
  short_description text,
  description       text,
  rating            numeric(3,1),
  image             text,
  images            text[],
  address           text,
  phone             text,
  website           text,
  latitude          numeric(10,7),
  longitude         numeric(10,7),
  source            text,
  external_id       text unique,
  created_date      timestamptz default now()
);

create index if not exists attractions_city_idx     on attractions(city_slug);
create index if not exists attractions_category_idx on attractions(category);

-- ── RESTAURANTS ──────────────────────────────────────────────
create table if not exists restaurants (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  slug              text not null unique,
  city_slug         text,
  cuisine_type      text,
  price_range       text,
  rating            numeric(3,1),
  image             text,
  images            text[],
  short_description text,
  description       text,
  address           text,
  phone             text,
  website           text,
  latitude          numeric(10,7),
  longitude         numeric(10,7),
  source            text,
  external_id       text unique,
  created_date      timestamptz default now()
);

create index if not exists restaurants_city_idx    on restaurants(city_slug);
create index if not exists restaurants_cuisine_idx on restaurants(cuisine_type);

-- ── HOTELS ───────────────────────────────────────────────────
create table if not exists hotels (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  slug              text not null unique,
  city_slug         text,
  type              text,
  star_rating       integer,
  rating            numeric(3,1),
  price_range       text,
  image             text,
  images            text[],
  short_description text,
  description       text,
  address           text,
  phone             text,
  website           text,
  latitude          numeric(10,7),
  longitude         numeric(10,7),
  source            text,
  external_id       text unique,
  created_date      timestamptz default now()
);

create index if not exists hotels_city_idx on hotels(city_slug);

-- ── BUSINESS CATEGORIES ──────────────────────────────────────
create table if not exists business_categories (
  id      uuid primary key default uuid_generate_v4(),
  name    text not null,
  slug    text not null unique,
  "order" integer default 0
);

-- ── BUSINESSES ───────────────────────────────────────────────
create table if not exists businesses (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  city_slug     text,
  category_slug text,
  description   text,
  address       text,
  phone         text,
  email         text,
  website       text,
  image         text,
  images        text[],
  verified      boolean default false,
  rating        numeric(3,1),
  latitude      numeric(10,7),
  longitude     numeric(10,7),
  source        text,
  external_id   text unique,
  created_date  timestamptz default now()
);

create index if not exists businesses_city_idx     on businesses(city_slug);
create index if not exists businesses_category_idx on businesses(category_slug);

-- ── BUSINESS REVIEWS ─────────────────────────────────────────
create table if not exists business_reviews (
  id            uuid primary key default uuid_generate_v4(),
  business_id   uuid references businesses(id) on delete cascade,
  business_slug text,
  rating        integer check (rating between 1 and 5),
  title         text,
  comment       text,
  reviewer_name text default 'Anonymous',
  status        text default 'pending' check (status in ('pending','approved','rejected')),
  helpful_count integer default 0,
  source        text,
  created_date  timestamptz default now()
);

create index if not exists reviews_business_idx on business_reviews(business_slug);
create index if not exists reviews_status_idx   on business_reviews(status);

-- ── EVENTS ───────────────────────────────────────────────────
create table if not exists events (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  slug         text unique,
  city_slug    text,
  start_date   timestamptz,
  end_date     timestamptz,
  description  text,
  image        text,
  website      text,
  created_date timestamptz default now()
);

-- ── BLOG POSTS ───────────────────────────────────────────────
create table if not exists blogs (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  slug         text not null unique,
  content      text,
  excerpt      text,
  image        text,
  author       text,
  published    boolean default false,
  created_date timestamptz default now()
);
