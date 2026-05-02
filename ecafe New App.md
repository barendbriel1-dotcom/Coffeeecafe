# eCafe New App

## Current State

- GitHub repo in use:
  `https://github.com/barendbriel1-dotcom/Coffeeecafe.git`
- New app foundation replaced the old inventory app.
- Login supports signup, requested role selection, forgot password, and admin approval flow.
- Roles in use:
  `Admin`, `Pastor`, `Operator`
- Admin can approve users and assign roles manually.
- Dashboard now has a collapsible left sidebar.
- Admin can see all pages.
- Orders workflow is in place with role-specific behavior.
- Users can save one coffee preference and submit it quickly.
- Users now have a profile page from the top-right name button.
- Dashboard shows the user name, not the email address.
- Volunteer has been removed from active app flows and signup.
- Operators are now the only role allowed to change order status.
- Operators can create coffee orders for approved pastors from a pastor list.
- Admin can edit order content but cannot change order status.
- Admin can now delete approved users from the admin page.
- Only pastors can manage coffee preference on the profile page.
- Operators can now create priority `Preacher` orders with extra service items and guest details.
- Preacher orders are pinned above normal orders in the main queue.

## Pages

- `Dashboard`
- `Orders`
- `Admin`
- `Profile`

## Coffee Options

- Coffee type:
  `Cappachino`, `Flat White`, `Cortado`, `Latte`
- Milk type:
  `Fresh Milk`, `Lactose Free`, `Oat Milk`, `Almond Milk`
- Sugar type:
  `1 Sugar`, `2 Suger`, `3 Suger`, `Sweetner`

## Supabase SQL Added

- `supabase/migrations/20260502000000_initial_app_foundation.sql`
- `supabase/migrations/20260502005000_add_ecafe_role_values.sql`
- `supabase/migrations/20260502010000_add_ecafe_roles_approvals_orders.sql`
- `supabase/migrations/20260502020000_add_profile_fields.sql`
- `supabase/migrations/20260502030000_refine_ecafe_role_workflow.sql`
- `supabase/migrations/20260502040000_add_preacher_priority_orders.sql`
- `supabase/migrations/20260502050000_add_admin_delete_user.sql`

## Important Note

- The latest workflow migration still needs to be run in Supabase:
  `20260502050000_add_admin_delete_user.sql`

## Local Git State

- New local commits were created for:
  - coffee ordering workflow
  - enum migration split
  - sidebar and profile work
- Some of these may still need pushing from your GitHub-connected desktop flow, depending on which push already succeeded.
