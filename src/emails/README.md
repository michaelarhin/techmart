# TechMart Email Templates

Minimalist, dark-themed email templates for TechMart. All templates use inline CSS for maximum email client compatibility.

## Templates

| File | Purpose |
|------|---------|
| `welcome.html` | Sent after first login — introduces the platform |
| `verify-email.html` | Email verification with clickable link |
| `registration.html` | Confirms successful account creation |
| `confirmation.html` | Generic action confirmation (listing created, order placed, etc.) |
| `otp.html` | One-time password / verification code |
| `two-step-auth.html` | 2FA code with sign-in details (device, location, IP) |

## Template Variables

Replace these placeholders with actual values when sending:

### All templates
- `{{user_name}}` — Recipient's full name

### welcome.html
- `{{dashboard_url}}` — Link to the user's dashboard/marketplace

### verify-email.html
- `{{verification_url}}` — Email verification link

### registration.html
- `{{user_email}}` — User's email address
- `{{registration_date}}` — Date of registration
- `{{profile_url}}` — Link to complete profile

### confirmation.html
- `{{action_type}}` — What was confirmed (e.g., "Listing Created")
- `{{date}}` — Date of action
- `{{reference_id}}` — Reference/ID number
- `{{action_url}}` — Link to view the confirmed item

### otp.html
- `{{otp_code}}` — The 6-digit OTP code

### two-step-auth.html
- `{{otp_code}}` — The 6-digit verification code
- `{{device}}` — Device name (e.g., "Chrome on Windows")
- `{{location}}` — Approximate location (e.g., "Accra, Ghana")
- `{{ip_address}}` — IP address of the sign-in attempt
- `{{timestamp}}` — Date/time of the attempt
- `{{reset_password_url}}` — Password reset link

## Setup

1. Replace `https://your-domain.com/images/logo.png` in all templates with your hosted logo URL (emails can't use local paths — host the logo somewhere public, e.g. your domain or Supabase Storage).
2. Use these with Supabase Auth email templates, or any email service (Resend, SendGrid, Mailgun, etc.).
3. For Supabase: go to Authentication → Email Templates and paste the HTML. Map the template variables to Supabase's (e.g. `{{verification_url}}` → `{{ .ConfirmationURL }}`).

## Design system (light, on-brand)

- Canvas: `#ebede7` (warm off-white)
- Card: `#ffffff`
- Ink / text: `#15181d`, muted `#6b7280`, faint `#9aa1ad`
- Primary (buttons): `#16243f` (deep navy) with white text
- Accent: `#cdf24a` (lime)
- Font: Plus Jakarta Sans, with system fallbacks
- Every template carries the TechMart wordmark + logo in the header so it's clearly from TechMart.
