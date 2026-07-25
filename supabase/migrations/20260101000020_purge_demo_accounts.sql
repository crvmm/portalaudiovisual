-- Remove seeded demo accounts and all related data (cascades from auth.users).

DELETE FROM auth.users
WHERE email LIKE '%@demo.portalaudiovisual.dev';
