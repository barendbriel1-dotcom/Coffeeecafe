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

-- 2. Update the notification trigger to include more details
CREATE OR REPLACE FUNCTION public.on_damage_report_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assigned_name TEXT;
  v_reported_name TEXT;
BEGIN
  -- Only trigger when status changes from pending to completed (User submission)
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
        'Time Damaged: %s' || char(10) ||
        'Damage Type: %s' || char(10) ||
        'Other Details: %s' || char(10) ||
        'Description: %s' || char(10) || char(10) ||
        'Please log in to the Admin Hub to provide a conclusion.',
        NEW.asset_name, NEW.asset_code,
        coalesce(v_assigned_name, 'Unknown'),
        coalesce(v_reported_name, 'Unknown'),
        NEW.damaged_date,
        coalesce(NEW.damaged_time::text, 'Not specified'),
        NEW.damage_type,
        coalesce(NEW.other_details, 'N/A'),
        NEW.description
      )
    );
  END IF;

  -- Trigger when admin submits a conclusion (status remains completed, but conclusion is added)
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
