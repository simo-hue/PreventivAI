-- Add policy to allow users to read their own profile to avoid RLS infinite recursion
create policy "Users can read own profile"
on public.profiles for select
using (id = auth.uid());
