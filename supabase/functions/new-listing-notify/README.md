# new-listing-notify

Sends an email to all followers of a seller when they publish a new listing.

## Deploy

```bash
supabase functions deploy new-listing-notify --no-verify-jwt
```

## Trigger: Database Webhook

In Supabase Dashboard → Database → Webhooks, create a webhook:

- **Name:** `new_listing_notify`
- **Table:** `listings`
- **Events:** `INSERT`
- **Type:** Supabase Edge Function
- **Function:** `new-listing-notify`

This fires automatically every time a new listing row is inserted.

## Secrets

```bash
supabase secrets set SITE_URL=https://your-domain.com
supabase secrets set RESEND_API_KEY=re_xxx RESEND_FROM="TechMart <hello@your-domain.com>"
```

## How it works

1. Webhook fires with the new listing row.
2. Function looks up who follows the seller (`seller_follows` table).
3. For each follower with an email, it sends a branded notification via Resend.
4. Email includes the listing image, title, and a direct "View listing" link.
