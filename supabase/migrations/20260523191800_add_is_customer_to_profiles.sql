-- Migration to add is_customer to profiles and create a trigger to auto-create profiles for new auth users.

ALTER TABLE public.profiles ADD COLUMN is_customer boolean not null default true;

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, organization_id, full_name, role, is_customer)
  VALUES (
    new.id,
    '00000000-0000-0000-0000-000000000001',
    new.raw_user_meta_data->>'full_name',
    'viewer', -- Default role for customers to prevent them from acting as admin
    true
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
