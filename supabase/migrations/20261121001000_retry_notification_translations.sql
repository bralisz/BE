-- Give exhausted notification jobs another attempt after a provider outage.
-- Keep the existing dispatcher's concurrency limit and discard jobs on its usual schedule.
select cron.schedule('betv-notification-translation-recovery', '17 */6 * * *', $job$
  update private.translation_jobs
     set attempts = 4, next_attempt_at = now()
   where collection = 'notifications' and attempts >= 5
     and request_id is null and next_attempt_at <= now()
     and queued_at >= now() - interval '7 days'
$job$);
