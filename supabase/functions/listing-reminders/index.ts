// Supabase Edge Function: listing-reminders
// ------------------------------------------------------------------
// Finds listings that are within 3 days of their 30-day expiry and have
// not yet been reminded, then nudges the seller by email (Resend) and/or
// SMS (Twilio) to renew the post — "update it or watch it disappear".
//
// Schedule it to run daily (see README.md in this folder).
//
// Required secrets (set with `supabase secrets set ...`):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (provided automatically on deploy)
//   SITE_URL                                  e.g. https://techmart.app
//   RESEND_API_KEY        (optional — enables email)
//   RESEND_FROM           (optional — e.g. "TechMart <hello@techmart.app>")
//   TWILIO_ACCOUNT_SID    (optional — enables SMS)
//   TWILIO_AUTH_TOKEN     (optional)
//   TWILIO_FROM           (optional — your Twilio number)
// ------------------------------------------------------------------

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://example.com';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const RESEND_FROM = Deno.env.get('RESEND_FROM') ?? 'TechMart <onboarding@resend.dev>';

const TWILIO_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_FROM = Deno.env.get('TWILIO_FROM');

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

async function sendEmail(to: string, listingTitle: string, link: string, daysLeft: number) {
  if (!RESEND_API_KEY) return;
  const subject = `Your listing "${listingTitle}" expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#15181d">
      <h2 style="margin:0 0 8px">Heads up — your listing is about to disappear</h2>
      <p style="color:#5f6670;margin:0 0 16px">
        "<strong>${listingTitle}</strong>" goes offline in <strong>${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong>.
        Listings stay live for 30 days. Renew it to keep it visible, or let it expire.
      </p>
      <a href="${link}" style="display:inline-block;background:#16243f;color:#fff;text-decoration:none;
        padding:12px 22px;border-radius:999px;font-weight:600">Renew my listing</a>
      <p style="color:#9aa1ad;font-size:12px;margin-top:20px">If you no longer have the item, you can ignore this email.</p>
    </div>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: RESEND_FROM, to, subject, html }),
  });
}

async function sendSms(to: string, listingTitle: string, link: string, daysLeft: number) {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) return;
  const body = `TechMart: "${listingTitle}" expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Renew it or it will disappear: ${link}`;
  const form = new URLSearchParams({ To: to, From: TWILIO_FROM, Body: body });
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
  });
}

Deno.serve(async () => {
  const now = new Date();
  const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // within 3 days

  const { data: listings, error } = await admin
    .from('listings')
    .select('id, title, expires_at, reminder_sent_at, is_sold, profiles(email, phone, full_name)')
    .eq('is_sold', false)
    .is('reminder_sent_at', null)
    .gt('expires_at', now.toISOString())
    .lte('expires_at', soon.toISOString());

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let notified = 0;
  for (const l of listings ?? []) {
    const profile = (l as { profiles?: { email?: string; phone?: string } }).profiles;
    const link = `${SITE_URL}/listing/${l.id}`;
    const daysLeft = Math.max(
      1,
      Math.ceil((new Date(l.expires_at as string).getTime() - now.getTime()) / 86400000)
    );

    try {
      if (profile?.email) await sendEmail(profile.email, l.title as string, link, daysLeft);
      if (profile?.phone) await sendSms(profile.phone, l.title as string, link, daysLeft);
      await admin.from('listings').update({ reminder_sent_at: now.toISOString() }).eq('id', l.id);
      notified += 1;
    } catch (e) {
      console.error('reminder failed for', l.id, e);
    }
  }

  return new Response(JSON.stringify({ checked: listings?.length ?? 0, notified }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
