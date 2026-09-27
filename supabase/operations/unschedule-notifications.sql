select cron.unschedule(jobid) from cron.job where jobname = 'codest-notifications';
select cron.unschedule(jobid) from cron.job where jobname = 'codest-rate-limit-cleanup';
