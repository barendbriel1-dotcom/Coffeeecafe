CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot delete your own account';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.assets
    WHERE current_holder = target_user_id
  ) THEN
    RAISE EXCEPTION 'This user cannot be deleted because they are still assigned to an asset';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.signouts
    WHERE signed_out_by = target_user_id
       OR signed_out_to = target_user_id
       OR signed_in_by = target_user_id
  ) THEN
    RAISE EXCEPTION 'This user cannot be deleted because they are linked to sign-out history';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.handovers
    WHERE from_user = target_user_id
       OR to_user = target_user_id
  ) THEN
    RAISE EXCEPTION 'This user cannot be deleted because they are linked to handover history';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.asset_requests
    WHERE requested_by = target_user_id
       OR reviewed_by = target_user_id
  ) THEN
    RAISE EXCEPTION 'This user cannot be deleted because they are linked to request history';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.asset_history
    WHERE performed_by = target_user_id
       OR from_user = target_user_id
       OR to_user = target_user_id
  ) THEN
    RAISE EXCEPTION 'This user cannot be deleted because they are linked to asset history';
  END IF;

  DELETE FROM auth.users
  WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
