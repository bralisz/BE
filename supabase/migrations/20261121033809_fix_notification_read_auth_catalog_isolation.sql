-- This remote migration removed a catalog SELECT forbidden by content_items RLS.
-- The final RLS-compatible insert is incorporated in the initial migration.
select 1;
