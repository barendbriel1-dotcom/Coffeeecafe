CREATE OR REPLACE FUNCTION public.is_wedding_budget_owner()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) = 'barend@encounterchurch.co.za';
$$;

CREATE TABLE public.wedding_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL CHECK (section IN ('barend_bianca', 'others_to_pay')),
  item_name TEXT NOT NULL,
  quoted_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (quoted_amount >= 0),
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.wedding_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name TEXT NOT NULL,
  quoted_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (quoted_amount >= 0),
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wedding_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_donations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER wedding_expenses_updated BEFORE UPDATE ON public.wedding_expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER wedding_donations_updated BEFORE UPDATE ON public.wedding_donations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_wedding_expenses_section_sort ON public.wedding_expenses(section, sort_order);
CREATE INDEX idx_wedding_donations_sort ON public.wedding_donations(sort_order);

CREATE POLICY "wedding_expenses_select_owner" ON public.wedding_expenses
  FOR SELECT TO authenticated USING (public.is_wedding_budget_owner());

CREATE POLICY "wedding_expenses_insert_owner" ON public.wedding_expenses
  FOR INSERT TO authenticated WITH CHECK (public.is_wedding_budget_owner());

CREATE POLICY "wedding_expenses_update_owner" ON public.wedding_expenses
  FOR UPDATE TO authenticated
  USING (public.is_wedding_budget_owner())
  WITH CHECK (public.is_wedding_budget_owner());

CREATE POLICY "wedding_expenses_delete_owner" ON public.wedding_expenses
  FOR DELETE TO authenticated USING (public.is_wedding_budget_owner());

CREATE POLICY "wedding_donations_select_owner" ON public.wedding_donations
  FOR SELECT TO authenticated USING (public.is_wedding_budget_owner());

CREATE POLICY "wedding_donations_insert_owner" ON public.wedding_donations
  FOR INSERT TO authenticated WITH CHECK (public.is_wedding_budget_owner());

CREATE POLICY "wedding_donations_update_owner" ON public.wedding_donations
  FOR UPDATE TO authenticated
  USING (public.is_wedding_budget_owner())
  WITH CHECK (public.is_wedding_budget_owner());

CREATE POLICY "wedding_donations_delete_owner" ON public.wedding_donations
  FOR DELETE TO authenticated USING (public.is_wedding_budget_owner());

INSERT INTO public.wedding_expenses (section, item_name, quoted_amount, note, sort_order) VALUES
  ('barend_bianca', 'Venue', 32000, NULL, 10),
  ('barend_bianca', 'Bridal hair & makeup', 2150, NULL, 20),
  ('barend_bianca', 'Groom outfit', 2500, 'Gecover deur Barend ma', 30),
  ('barend_bianca', 'Groom ring', 1600, NULL, 40),
  ('barend_bianca', 'Bridal ring resize & clean', 300, NULL, 50),
  ('barend_bianca', 'Vir my kar', 3500, NULL, 60),
  ('barend_bianca', 'Perfumes', 600, NULL, 70),
  ('barend_bianca', 'Groom gift', 2500, NULL, 80),
  ('barend_bianca', 'Honeymoon', 20000, NULL, 90),
  ('barend_bianca', 'Prokureurs & dokumentasie', 2300, NULL, 100),
  ('barend_bianca', 'Bridal dress (Backup TBC)', 5000, NULL, 110),
  ('barend_bianca', 'Food & drinks in prep rooms (R500 each)', 500, NULL, 120),
  ('barend_bianca', 'Petrol for bridal dress fitting', 0, NULL, 130),
  ('others_to_pay', 'Cake', 600, 'Mom - Wedding', 10),
  ('others_to_pay', 'Decor (Bubble & smoke machine)', 1160, 'Mom - Wedding', 20),
  ('others_to_pay', 'Flowers (Decor)', 2000, 'Mom - Wedding', 30),
  ('others_to_pay', 'Printing (Decor)', 600, 'Mom - Wedding', 40),
  ('others_to_pay', 'Table gifts (Decor)', 900, 'Mom - Wedding', 50),
  ('others_to_pay', 'Dress (Shein)', 250, 'Bridesmaids own cost', 60),
  ('others_to_pay', 'Shoes', 0, 'Bridesmaids own cost', 70),
  ('others_to_pay', 'Hair & makeup', 0, 'Bridesmaids own cost', 80),
  ('others_to_pay', 'Pajamas, slippers (Shein)', 250, 'Bridesmaids own cost', 90),
  ('others_to_pay', 'Suits (China mall)', 1000, 'Groomsmen own cost', 100),
  ('others_to_pay', 'Shoes', 300, 'Groomsmen own cost', 110),
  ('others_to_pay', 'Barber', 150, 'Groomsmen own cost', 120),
  ('others_to_pay', 'Accessories (Belt etc.)', 200, 'Groomsmen own cost', 130);

INSERT INTO public.wedding_donations (person_name, quoted_amount, note, sort_order) VALUES
  ('PS Mari', 10000, 'Einde Mei', 10),
  ('Barend pa', 30000, 'Einde Mei TBC', 20),
  ('Bianca & Barend spaar teen Okt', 28000, 'Einde Sept', 30),
  ('Barend tannie', 10000, 'Einde Aril', 40);

NOTIFY pgrst, 'reload schema';
