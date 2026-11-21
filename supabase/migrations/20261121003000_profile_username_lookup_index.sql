-- Follow and watch-party lookups normalize the username before comparing it.
SET LOCAL lock_timeout = '2s';
CREATE INDEX IF NOT EXISTS profiles_username_lower_lookup_idx
  ON public.profiles (lower(username::text));
