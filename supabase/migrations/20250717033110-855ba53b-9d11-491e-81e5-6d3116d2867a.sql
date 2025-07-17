-- Give the current user super admin privileges
INSERT INTO public.user_roles (user_id, role)
VALUES ('581ebe5f-e01b-4373-81b6-a092197ffca5', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;