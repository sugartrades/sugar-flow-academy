-- Remove the duplicate trigger
DROP TRIGGER IF EXISTS on_auth_user_created_send_welcome_email ON auth.users;

-- Verify we only have one trigger
-- The send_welcome_email_after_signup trigger should remain active