CREATE TABLE IF NOT EXISTS public.bulk_packets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bulk_packet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  packet_id UUID NOT NULL REFERENCES public.bulk_packets(id) ON DELETE CASCADE,
  line_label TEXT NOT NULL,
  division_id UUID REFERENCES public.divisions(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bulk_packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_packet_items ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER bulk_packets_updated
  BEFORE UPDATE ON public.bulk_packets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_bulk_packet_items_packet_sort
  ON public.bulk_packet_items(packet_id, sort_order);

CREATE POLICY "bulk_packets_admin_select"
  ON public.bulk_packets
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "bulk_packets_admin_insert"
  ON public.bulk_packets
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "bulk_packets_admin_update"
  ON public.bulk_packets
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "bulk_packets_admin_delete"
  ON public.bulk_packets
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "bulk_packet_items_admin_select"
  ON public.bulk_packet_items
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "bulk_packet_items_admin_insert"
  ON public.bulk_packet_items
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "bulk_packet_items_admin_update"
  ON public.bulk_packet_items
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "bulk_packet_items_admin_delete"
  ON public.bulk_packet_items
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));
