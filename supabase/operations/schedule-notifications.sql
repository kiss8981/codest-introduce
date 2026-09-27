-- Save the deployed batch URL and a random batch secret in Supabase Vault:
-- select vault.create_secret('https://your-domain/api/internal/notifications', 'codest_batch_url');
-- select vault.create_secret('your-random-batch-secret', 'codest_batch_secret');
-- Use the same secret as NOTIFICATION_BATCH_SECRET in the Next deployment.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
select cron.unschedule(jobid) from cron.job where jobname = 'codest-notifications';
select cron.unschedule(jobid) from cron.job where jobname = 'codest-rate-limit-cleanup';
select cron.schedule('codest-rate-limit-cleanup', '*/15 * * * *', $$
  delete from codest_internal.inquiry_rate_limit where created_at < now() - interval '15 minutes';
$$);
select cron.schedule('codest-notifications', '*/5 * * * *', $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'codest_batch_url'),
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'codest_batch_secret')),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
$$);
