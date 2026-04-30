CREATE TABLE public.wedding_checklist_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.wedding_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id UUID NOT NULL REFERENCES public.wedding_checklist_divisions(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false,
  checked_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wedding_checklist_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER wedding_checklist_divisions_updated BEFORE UPDATE ON public.wedding_checklist_divisions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER wedding_checklist_items_updated BEFORE UPDATE ON public.wedding_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_wedding_checklist_divisions_sort ON public.wedding_checklist_divisions(sort_order);
CREATE INDEX idx_wedding_checklist_items_division_sort ON public.wedding_checklist_items(division_id, checked, sort_order);

CREATE POLICY "wedding_checklist_divisions_select_owner" ON public.wedding_checklist_divisions
  FOR SELECT TO authenticated USING (public.is_wedding_budget_owner());

CREATE POLICY "wedding_checklist_divisions_insert_owner" ON public.wedding_checklist_divisions
  FOR INSERT TO authenticated WITH CHECK (public.is_wedding_budget_owner());

CREATE POLICY "wedding_checklist_divisions_update_owner" ON public.wedding_checklist_divisions
  FOR UPDATE TO authenticated
  USING (public.is_wedding_budget_owner())
  WITH CHECK (public.is_wedding_budget_owner());

CREATE POLICY "wedding_checklist_divisions_delete_owner" ON public.wedding_checklist_divisions
  FOR DELETE TO authenticated USING (public.is_wedding_budget_owner());

CREATE POLICY "wedding_checklist_items_select_owner" ON public.wedding_checklist_items
  FOR SELECT TO authenticated USING (public.is_wedding_budget_owner());

CREATE POLICY "wedding_checklist_items_insert_owner" ON public.wedding_checklist_items
  FOR INSERT TO authenticated WITH CHECK (public.is_wedding_budget_owner());

CREATE POLICY "wedding_checklist_items_update_owner" ON public.wedding_checklist_items
  FOR UPDATE TO authenticated
  USING (public.is_wedding_budget_owner())
  WITH CHECK (public.is_wedding_budget_owner());

CREATE POLICY "wedding_checklist_items_delete_owner" ON public.wedding_checklist_items
  FOR DELETE TO authenticated USING (public.is_wedding_budget_owner());

NOTIFY pgrst, 'reload schema';
