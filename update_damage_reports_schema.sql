-- ============================================================
-- ENHANCED DAMAGE REPORTS: Detailed fields + Admin Conclusion
-- ============================================================

-- 1. Update the table with new fields
ALTER TABLE public.damage_reports 
  ADD COLUMN IF NOT EXISTS damaged_time TIME,
  ADD COLUMN IF NOT EXISTS damage_type TEXT, -- Scratched, Cracked, Broken, Water Damage, Other
  ADD COLUMN IF NOT EXISTS other_details TEXT,
  ADD COLUMN IF NOT EXISTS admin_conclusion_notes TEXT,
  ADD COLUMN IF NOT EXISTS admin_conclusion_status public.asset_status,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);

-- 2. Make sure admins can conclude and remove detailed reports.
DROP POLICY IF EXISTS "damage_reports_admin_update" ON public.damage_reports;
CREATE POLICY "damage_reports_admin_update" ON public.damage_reports
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "damage_reports_admin_delete" ON public.damage_reports;
CREATE POLICY "damage_reports_admin_delete" ON public.damage_reports
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- 3. Update the notification trigger to include more details
CREATE OR REPLACE FUNCTION public.on_damage_report_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- ONLY trigger when admin submits a conclusion (admin_conclusion_status changes from NULL to NOT NULL)
  IF NEW.admin_conclusion_status IS NOT NULL AND OLD.admin_conclusion_status IS NULL THEN
    INSERT INTO public.email_notifications (to_email, subject, body)
    VALUES (
      'Barend@encounterchurch.co.za',
      format('Damage Report Concluded: %s (%s)', NEW.asset_name, NEW.asset_code),
      format(
        'An admin has concluded the damage report for: %s (%s).' || chr(10) ||
        'Final Status: %s' || chr(10) ||
        'Admin Notes: %s' || chr(10) ||
        'Reviewed on: %s',
        NEW.asset_name, NEW.asset_code,
        NEW.admin_conclusion_status,
        NEW.admin_conclusion_notes,
        NEW.reviewed_at
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_damage_report_completed ON public.damage_reports;
CREATE TRIGGER tr_damage_report_completed
  AFTER UPDATE ON public.damage_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.on_damage_report_completed();

NOTIFY pgrst, 'reload schema';
