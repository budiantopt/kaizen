-- Replace 'your_email@example.com' with the actual email of the user you want to make an Admin
update public.profiles
set role = 'admin'
where email = 'your_email@example.com';
