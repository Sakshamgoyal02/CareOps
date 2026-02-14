# Email integration (production)

The app uses **Nodemailer** and only sends real email when SMTP env vars are set.

## Env vars (add to `.env`)

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM=CareOps <noreply@yourdomain.com>
```

- **SMTP_HOST** – e.g. `smtp.gmail.com`, `smtp.sendgrid.net`, `smtp.mailgun.org`
- **SMTP_PORT** – usually `587` (TLS) or `465` (SSL). If using 465 set `SMTP_SECURE=true`
- **SMTP_USER** / **SMTP_PASS** – SMTP auth (for Gmail use an [App Password](https://support.google.com/accounts/answer/185833))
- **EMAIL_FROM** – Sender address (and optional name)

## If not set

If any of `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, or `EMAIL_FROM` is missing, the service only logs to the console and does not send email. No code changes are required elsewhere.
