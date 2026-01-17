-- Allow Admins to update user profiles (for changing roles/titles)
create policy "Admins can update any profile." 
on public.profiles 
for update 
using ( 
  exists ( select 1 from public.profiles where id = auth.uid() and role = 'admin' ) 
);
