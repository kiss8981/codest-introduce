create extension if not exists pgcrypto;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  name text not null check (char_length(name) between 1 and 80),
  phone text not null check (char_length(phone) between 1 and 30),
  email text not null check (char_length(email) between 3 and 254),
  message text not null check (char_length(message) between 20 and 5000),
  consent_version text not null,
  consented_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now()
);

create schema if not exists codest_internal;
revoke all on schema codest_internal from public, anon, authenticated;
create table if not exists codest_internal.inquiry_rate_limit (
  rate_key text not null,
  created_at timestamptz not null default now()
);
create index if not exists inquiry_rate_limit_key_created_idx on codest_internal.inquiry_rate_limit (rate_key, created_at desc);
create index if not exists inquiry_rate_limit_created_idx on codest_internal.inquiry_rate_limit (created_at);
revoke all on codest_internal.inquiry_rate_limit from public, anon, authenticated;

create table if not exists public.notification (
  id uuid primary key default gen_random_uuid(),
  "to" text not null,
  recipt jsonb,
  type text not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending','processing','sent','failed','needs_review')),
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index if not exists notification_pending_idx on public.notification (created_at) where status = 'pending';

alter table public.inquiries enable row level security;
alter table public.notification enable row level security;
revoke all on public.inquiries, public.notification from public, anon, authenticated;
grant all on public.inquiries, public.notification to service_role;

create or replace function public.submit_inquiry(p_inquiry jsonb, p_notification jsonb, p_limit_key text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid; v_created boolean := false; v_submission uuid;
begin
  if auth.role() <> 'service_role' then raise exception 'forbidden'; end if;
  v_submission := (p_inquiry->>'submission_id')::uuid;
  perform pg_advisory_xact_lock(hashtextextended(p_limit_key, 0));
  select id into v_id from public.inquiries where submission_id = v_submission;
  if v_id is not null then
    if not exists (select 1 from public.inquiries where id = v_id and name = p_inquiry->>'name' and phone = p_inquiry->>'phone' and email = p_inquiry->>'email' and message = p_inquiry->>'message') then
      raise exception 'submission_conflict';
    end if;
    return jsonb_build_object('inquiry_id', v_id, 'created', false);
  end if;
  delete from codest_internal.inquiry_rate_limit where created_at < now() - interval '15 minutes';
  if (select count(*) from codest_internal.inquiry_rate_limit where rate_key = p_limit_key and created_at > now() - interval '15 minutes') >= 3 then
    raise exception 'rate_limited';
  end if;
  insert into codest_internal.inquiry_rate_limit (rate_key) values (p_limit_key);
  insert into public.inquiries (submission_id,name,phone,email,message,consent_version)
  values (v_submission,p_inquiry->>'name',p_inquiry->>'phone',p_inquiry->>'email',p_inquiry->>'message',p_inquiry->>'consent_version')
  returning id into v_id;
  insert into public.notification ("to",recipt,type,payload)
  values (p_notification->>'to',p_notification->'recipt',p_notification->>'type',jsonb_set(p_notification->'payload','{receiptId}',to_jsonb(v_id::text)));
  return jsonb_build_object('inquiry_id', v_id, 'created', true);
end $$;

create or replace function public.enqueue_notification(p_notification jsonb)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if auth.role() <> 'service_role' then raise exception 'forbidden'; end if;
  insert into public.notification ("to",recipt,type,payload)
  values (p_notification->>'to',p_notification->'recipt',p_notification->>'type',p_notification->'payload') returning id into v_id;
  return v_id;
end $$;

create or replace function public.claim_notification()
returns public.notification language plpgsql security definer set search_path = public, pg_temp as $$
declare v_row public.notification;
begin
  if auth.role() <> 'service_role' then raise exception 'forbidden'; end if;
  select * into v_row from public.notification where status = 'pending' order by created_at, id for update skip locked limit 1;
  if not found then return null; end if;
  update public.notification set status = 'processing' where id = v_row.id returning * into v_row;
  return v_row;
end $$;

create or replace function public.finish_notification(p_id uuid, p_status text)
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if auth.role() <> 'service_role' then raise exception 'forbidden'; end if;
  if p_status not in ('sent','failed','needs_review') then raise exception 'invalid_status'; end if;
  update public.notification set status = p_status, sent_at = case when p_status = 'sent' then now() else null end
  where id = p_id and status = 'processing';
  return found;
end $$;

revoke all on function public.submit_inquiry(jsonb,jsonb,text), public.enqueue_notification(jsonb), public.claim_notification(), public.finish_notification(uuid,text) from public, anon, authenticated;
grant execute on function public.submit_inquiry(jsonb,jsonb,text), public.enqueue_notification(jsonb), public.claim_notification(), public.finish_notification(uuid,text) to service_role;
