# listing-reminders

Daily job that warns sellers before their 30-day listing expires, by email
(Resend) and/or SMS (Twilio), then marks `reminder_sent_at` so nobody gets
spammed twice.

## Deploy

```bash
supabase functions deploy listing-reminders --no-verify-jwt
```

## Secrets

```bash
supabase secrets set SITE_URL=https://your-domain.com
# Email (optional)
supabase secrets set RESEND_API_KEY=re_xxx RESEND_FROM="TechMart <hello@your-domain.com>"
# SMS (optional)
supabase secrets set TWILIO_ACCOUNT_SID=ACxxx TWILIO_AUTH_TOKEN=xxx TWILIO_FROM=+1xxx
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.

## Schedule it daily

Using `pg_cron` + `pg_net` in the SQL editor (runs every day at 09:00 UTC):

```sql
select cron.schedule(
  'listing-reminders-daily',
  '0 9 * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.functions.supabase.co/listing-reminders',
    headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>')
  );
  $$
);
```

Listings whose `expires_at` has passed are hidden automatically by the app
(`getListings` filters them out), so an expired post simply disappears from
the marketplace until the owner renews it.
