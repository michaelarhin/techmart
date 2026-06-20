// Supabase Edge Function: new-listing-notify
// ------------------------------------------------------------------
// Triggered by a Database Webhook on INSERT to the listings table.
// Looks up all followers of the seller and emails them that a new listing
// has been posted — "a seller you follow just added something new."
//
// Required secrets:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (auto-injected)
//   SITE_URL        e.g. https://techmart.app
//   RESEND_API_KEY  (enables email sending)
//   RESEND_FROM     e.g. "TechMart <hello@techmart.app>"
// ------------------------------------------------------------------

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://example.com';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const RESEND_FROM = Deno.env.get('RESEND_FROM') ?? 'TechMart <onboarding@resend.dev>';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const listing = body.record;
    if (!listing) return new Response('No record', { status: 400 });

    const sellerId = listing.user_id as string;
    const listingId = listing.id as string;
    const title = listing.title as string;
    const image = (listing.images as string[])?.[0] || '';

    // Get seller name
    const { data: seller } = await admin
      .from('profiles')
      .select('full_name')
      .eq('id', sellerId)
      .single();
    const sellerName = seller?.full_name || 'A seller you follow';

    // Get followers with email
    const { data: follows } = await admin
      .from('seller_follows')
      .select('profiles:follower_id(email, full_name)')
      .eq('seller_id', sellerId);

    const followers = (follows || [])
      .map((r: any) => r.profiles)
      .filter((p: any) => p?.email);

    if (!followers.length || !RESEND_API_KEY) {
      return new Response(JSON.stringify({ notified: 0, reason: !RESEND_API_KEY ? 'no_api_key' : 'no_followers' }));
    }

    const link = `${SITE_URL}/listing/${listingId}`;
    let sent = 0;

    for (const follower of followers) {
      const subject = `${sellerName} just listed "${title}"`;
      const html = `
        <div style="font-family:'Plus Jakarta Sans',Inter,Arial,sans-serif;color:#15181d;max-width:540px;margin:0 auto;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ebede7;padding:32px 16px;">
            <tr><td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:20px;border:1px solid rgba(17,20,24,0.07);overflow:hidden;">
                <tr><td style="padding:28px 32px 8px;">
                  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                    <td style="vertical-align:middle;"><img src="${SITE_URL}/images/logo.png" alt="TechMart" width="32" height="32" style="display:block;border-radius:999px;background:#16243f;"></td>
                    <td style="vertical-align:middle;padding-left:9px;font-size:16px;font-weight:800;color:#15181d;">TechMart</td>
                  </tr></table>
                </td></tr>
                <tr><td style="padding:20px 32px 8px;">
                  <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#15181d;">New listing from ${sellerName}</h1>
                  <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#6b7280;">
                    Hi ${follower.full_name || 'there'}, a seller you follow just added something new — take a look before it's gone.
                  </p>
                </td></tr>
                ${image ? `<tr><td style="padding:0 32px 12px;"><img src="${image}" alt="${title}" style="width:100%;max-height:220px;object-fit:cover;border-radius:14px;border:1px solid rgba(17,20,24,0.06);"></td></tr>` : ''}
                <tr><td style="padding:0 32px 8px;">
                  <p style="margin:0;font-size:18px;font-weight:700;color:#15181d;">${title}</p>
                </td></tr>
                <tr><td style="padding:16px 32px 8px;" align="center">
                  <a href="${link}" style="display:inline-block;padding:13px 30px;background:#16243f;color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:999px;">View listing</a>
                </td></tr>
                <tr><td style="padding:20px 32px;border-top:1px solid rgba(17,20,24,0.07);text-align:center;">
                  <p style="margin:0;font-size:12px;color:#9aa1ad;line-height:1.5;">
                    You're getting this because you follow ${sellerName} on TechMart.<br>
                    © 2026 TechMart · Accra, Ghana
                  </p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </div>`;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: RESEND_FROM, to: follower.email, subject, html }),
      });
      sent += 1;
    }

    return new Response(JSON.stringify({ notified: sent }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
