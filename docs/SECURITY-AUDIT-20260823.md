# Security audit — 2026-08-23

## Public client configuration

- The Supabase project URL and `sb_publishable_...` key are intentionally public client configuration. They do **not** grant administrative access by themselves.
- No `service_role` value, `sb_secret_...` value, Stripe secret key, private key, admin password, GitHub token or Vercel token is embedded in the production client files.
- Server and Edge Function secrets are read from environment variables only.

## Changes applied

- Removed browser-side email-account enumeration. The login flow no longer calls `account_exists(email)`.
- Restricted `account_exists(text)` to `service_role` only.
- Removed anonymous access to `delete_my_account()` and `get_admin_dashboard_metrics()`.
- Removed historical excessive table privileges (`TRUNCATE`, `TRIGGER`, `REFERENCES`, and anonymous admin-table grants) while keeping RLS as the authorization layer.
- Sanitized `get_community_overview()` so public/community cards receive only explicitly allowed display/playback fields instead of raw `content_items.data`.
- Restricted `record_daily_user_visit()` to authenticated users.
- Narrowed CSP `connect-src` from any `*.supabase.co` project to this project's Supabase origin.
- Blocked deployment access to duplicate/private source files such as `/site.js`, project README files, `/development`, `/docs`, `/migrations`, `/supabase`, and `/server`.
- Update acknowledgement is stored with the deployed release version in local storage plus the `be_site_release_version` SameSite cookie so the same release banner does not return after refresh/revisit.

## Notes

- Any URL, media URL, public profile field, or publishable API key needed by browser code is observable by the visitor and must not be treated as a secret.
- Authorization continues to be enforced server-side with RLS, authenticated-user checks, admin checks, and service-role-only server operations.

## Storage review

- The only configured bucket found is `movie-subtitles`; it is public because subtitle files must be downloadable by viewers.
- Upload is limited by policy to authenticated admins and `.srt`/`.vtt` files. No user-private upload bucket was found.

## Remaining dashboard recommendation

- Supabase Security Advisor reports **Leaked Password Protection** disabled. This is an Auth setting rather than a database migration; enable it in Supabase Auth password/security settings when available for the project plan.
- The `citext` extension-in-public warning was not changed because relocating an extension on a live project can break dependent types/functions and does not represent a direct data disclosure by itself.
