-- ============================================================
-- Damage Report Notifications
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

-- 2. Trigger function to queue an email when a damage report is completed
CREATE OR REPLACE FUNCTION public.on_damage_report_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assigned_name TEXT;
  v_reported_name TEXT;
BEGIN
  -- Only trigger when status changes from pending to completed
  IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
    
    SELECT display_name INTO v_assigned_name FROM public.profiles WHERE id = NEW.assigned_to;
    SELECT display_name INTO v_reported_name FROM public.profiles WHERE id = NEW.reported_by;

    INSERT INTO public.email_notifications (to_email, subject, body)
    VALUES (
      'Barend@encounterchurch.co.za',
      format('Damage Report Submitted: %s (%s)', NEW.asset_name, NEW.asset_code),
      format(
        'A damage report has been submitted for item: %s (%s).' || char(10) ||
        'Assigned to: %s' || char(10) ||
        'Reported by: %s' || char(10) ||
        'Date Damaged: %s' || char(10) ||
        'Description: %s' || char(10) ||
        'View it in the Admin Hub.',
        NEW.asset_name, NEW.asset_code,
        coalesce(v_assigned_name, 'Unknown'),
        coalesce(v_reported_name, 'Unknown'),
        NEW.damaged_date,
        NEW.description
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
