-- The first remote migration has the final corrected implementation already.
-- The remote correction at this version fixed PostgreSQL GREATEST() qualification.
-- The equivalent fix is incorporated in 20261121033417_notification_reads_account_sync.sql.
select 1;
