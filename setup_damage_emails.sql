-- ============================================================
-- Damage Report Notifications (Admin Conclusion ONLY)
-- ============================================================

-- 1. Table to log notifications (for external service like Resend to pick up)
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  error_message TEXT
);

ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_email_notifications" ON public.email_notifications
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 2. Trigger function to queue an email ONLY when an admin submits a conclusion
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
        'An admin has concluded the damage report for: %s (%s).' || char(10) ||
        'Final Status: %s' || char(10) ||
        'Admin Notes: %s' || char(10) ||
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

-- 3. The trigger itself
DROP TRIGGER IF EXISTS tr_damage_report_completed ON public.damage_reports;
CREATE TRIGGER tr_damage_report_completed
  AFTER UPDATE ON public.damage_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.on_damage_report_completed();
