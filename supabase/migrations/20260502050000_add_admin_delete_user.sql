create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.has_role('admin'::public.app_role) then
    raise exception 'Only admins can delete users.';
  end if;

  if auth.uid() = target_user_id then
    raise exception 'Admins cannot delete their own account.';
  end if;

  delete from auth.users
  where id = target_user_id;
end;
$$;

grant execute on function public.admin_delete_user(uuid) to authenticated;
