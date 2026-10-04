do $$
begin
  if exists (select 1 from cron.job where jobname = 'codest-notifications') then
    perform cron.unschedule('codest-notifications');
  end if;
  if exists (select 1 from cron.job where jobname = 'codest-rate-limit-cleanup') then
    perform cron.unschedule('codest-rate-limit-cleanup');
  end if;
end $$;

alter table public.inquiries drop constraint if exists inquiries_message_check;
alter table public.inquiries
  add constraint inquiries_message_check check (char_length(message) between 1 and 5000);

create or replace function public.submit_inquiry(p_inquiry jsonb, p_notification jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid; v_submission uuid;
begin
  if auth.role() <> 'service_role' then raise exception 'forbidden'; end if;
  v_submission := (p_inquiry->>'submission_id')::uuid;
  select id into v_id from public.inquiries where submission_id = v_submission;
  if v_id is not null then
    if not exists (
      select 1 from public.inquiries
      where id = v_id
        and name = p_inquiry->>'name'
        and phone = p_inquiry->>'phone'
        and email = p_inquiry->>'email'
        and message = p_inquiry->>'message'
    ) then raise exception 'submission_conflict'; end if;
    return jsonb_build_object('inquiry_id', v_id, 'created', false);
  end if;
  insert into public.inquiries (submission_id,name,phone,email,message,consent_version)
  values (v_submission,p_inquiry->>'name',p_inquiry->>'phone',p_inquiry->>'email',p_inquiry->>'message',p_inquiry->>'consent_version')
  returning id into v_id;
  insert into public.notification ("to",recipt,type,payload)
  values (
    p_notification->>'to', p_notification->'recipt', p_notification->>'type',
    jsonb_set(p_notification->'payload','{receiptId}',to_jsonb(v_id::text))
  );
  return jsonb_build_object('inquiry_id', v_id, 'created', true);
end $$;

revoke all on function public.submit_inquiry(jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.submit_inquiry(jsonb,jsonb) to service_role;
drop function if exists public.submit_inquiry(jsonb,jsonb,text);
drop function if exists public.claim_notification();
drop function if exists public.finish_notification(uuid,text);
drop function if exists public.enqueue_notification(jsonb);
