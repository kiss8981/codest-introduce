-- The webhook only observes new notifications. Its credential stays in Vault.
create or replace function codest_internal.dispatch_notification_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  webhook_secret text;
begin
  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'codest_notification_webhook';

  if webhook_secret is not null then
    perform net.http_post(
      url := 'https://codest.kr/api/internal/notifications',
      body := pg_catalog.jsonb_build_object(
        'type', 'INSERT',
        'table', 'notification',
        'schema', 'public',
        'record', pg_catalog.to_jsonb(new)
      ),
      headers := pg_catalog.jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || webhook_secret
      ),
      timeout_milliseconds := 10000
    );
  end if;

  return new;
exception when others then
  raise warning 'notification_webhook_enqueue_failed: %', sqlstate;
  return new;
end;
$$;

revoke all on function codest_internal.dispatch_notification_insert()
from public, anon, authenticated;

drop trigger if exists codest_notification_insert on public.notification;
create trigger codest_notification_insert
after insert on public.notification
for each row execute function codest_internal.dispatch_notification_insert();
