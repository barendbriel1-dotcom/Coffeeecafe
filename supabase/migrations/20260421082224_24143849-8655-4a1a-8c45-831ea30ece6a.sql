
-- ===== ENUMS =====
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'volunteer');
CREATE TYPE public.asset_status AS ENUM ('available', 'signed_out', 'in_handover', 'maintenance', 'lost', 'retired');
CREATE TYPE public.signout_status AS ENUM ('active', 'returned', 'overdue');
CREATE TYPE public.handover_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected', 'fulfilled');

-- ===== UPDATED_AT TRIGGER FN =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== USER ROLES (separate table — never on profiles) =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer role check (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'staff');
$$;

-- ===== DEPARTMENTS =====
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code CHAR(1) NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  is_storage BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_department_fk FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;

-- ===== ITEM TYPES =====
CREATE TABLE public.item_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code CHAR(1) NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.item_types ENABLE ROW LEVEL SECURITY;

-- ===== ASSETS =====
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  department_id UUID NOT NULL REFERENCES public.departments(id),
  item_type_id UUID NOT NULL REFERENCES public.item_types(id),
  serial_number TEXT,
  status public.asset_status NOT NULL DEFAULT 'available',
  current_holder UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  current_location_id UUID REFERENCES public.departments(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER assets_updated BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_assets_dept ON public.assets(department_id);
CREATE INDEX idx_assets_holder ON public.assets(current_holder);
CREATE INDEX idx_assets_status ON public.assets(status);

-- Auto-generate asset code: DeptLetter + ItemLetter + 2-digit number
CREATE OR REPLACE FUNCTION public.generate_asset_code()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  d_code CHAR(1); i_code CHAR(1); next_num INT; prefix TEXT;
BEGIN
  IF NEW.code IS NOT NULL AND NEW.code <> '' THEN RETURN NEW; END IF;
  SELECT code INTO d_code FROM public.departments WHERE id = NEW.department_id;
  SELECT code INTO i_code FROM public.item_types WHERE id = NEW.item_type_id;
  prefix := d_code || i_code;
  SELECT COALESCE(MAX(SUBSTRING(code FROM 3)::INT), 0) + 1
    INTO next_num FROM public.assets WHERE code LIKE prefix || '%';
  NEW.code := prefix || LPAD(next_num::TEXT, 2, '0');
  RETURN NEW;
END; $$;

CREATE TRIGGER assets_generate_code BEFORE INSERT ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.generate_asset_code();

-- ===== SIGNOUTS =====
CREATE TABLE public.signouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name TEXT,
  signed_out_by UUID NOT NULL REFERENCES auth.users(id),
  signed_out_to UUID NOT NULL REFERENCES auth.users(id),
  to_department_id UUID REFERENCES public.departments(id),
  expected_return TIMESTAMPTZ,
  notes TEXT,
  status public.signout_status NOT NULL DEFAULT 'active',
  signed_in_by UUID REFERENCES auth.users(id),
  signed_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.signouts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER signouts_updated BEFORE UPDATE ON public.signouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.signout_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signout_id UUID NOT NULL REFERENCES public.signouts(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id),
  returned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.signout_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_signout_items_signout ON public.signout_items(signout_id);

-- ===== HANDOVERS =====
CREATE TABLE public.handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user UUID NOT NULL REFERENCES auth.users(id),
  to_user UUID NOT NULL REFERENCES auth.users(id),
  status public.handover_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.handovers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER handovers_updated BEFORE UPDATE ON public.handovers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.handover_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handover_id UUID NOT NULL REFERENCES public.handovers(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.handover_items ENABLE ROW LEVEL SECURITY;

-- ===== ASSET REQUESTS =====
CREATE TABLE public.asset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  asset_id UUID REFERENCES public.assets(id),
  item_description TEXT,
  needed_for TEXT,
  needed_by TIMESTAMPTZ,
  status public.request_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.asset_requests ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER asset_requests_updated BEFORE UPDATE ON public.asset_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== HISTORY =====
CREATE TABLE public.asset_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  from_user UUID REFERENCES auth.users(id),
  to_user UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.asset_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_history_asset ON public.asset_history(asset_id);

-- ===== AUTO PROFILE + DEFAULT VOLUNTEER ROLE ON SIGNUP =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'volunteer');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== RLS POLICIES =====

-- profiles: everyone authenticated reads; users update own; admins update any
CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- user_roles: read own + admins read all; only admins write
CREATE POLICY "roles_read_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- departments: all read; admin write
CREATE POLICY "depts_read" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "depts_admin" ON public.departments FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- item_types: all read; admin write
CREATE POLICY "items_read" ON public.item_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "items_admin" ON public.item_types FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- assets: all read; staff/admin update (sign-out flow); admin insert/delete
CREATE POLICY "assets_read" ON public.assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "assets_admin_insert" ON public.assets FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "assets_admin_delete" ON public.assets FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "assets_staff_update" ON public.assets FOR UPDATE TO authenticated USING (public.is_staff_or_admin(auth.uid()));

-- signouts: read all (audit); staff/admin create; only admin can mark returned (sign in)
CREATE POLICY "signouts_read" ON public.signouts FOR SELECT TO authenticated USING (true);
CREATE POLICY "signouts_staff_create" ON public.signouts FOR INSERT TO authenticated WITH CHECK (public.is_staff_or_admin(auth.uid()) AND signed_out_by = auth.uid());
CREATE POLICY "signouts_admin_update" ON public.signouts FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "signout_items_read" ON public.signout_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "signout_items_staff_create" ON public.signout_items FOR INSERT TO authenticated WITH CHECK (public.is_staff_or_admin(auth.uid()));
CREATE POLICY "signout_items_admin_update" ON public.signout_items FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- handovers: read if involved or admin; staff/admin create; recipient can update (accept/reject); initiator can cancel
CREATE POLICY "handovers_read_involved" ON public.handovers FOR SELECT TO authenticated
  USING (auth.uid() = from_user OR auth.uid() = to_user OR public.is_admin(auth.uid()));
CREATE POLICY "handovers_staff_create" ON public.handovers FOR INSERT TO authenticated
  WITH CHECK (public.is_staff_or_admin(auth.uid()) AND from_user = auth.uid());
CREATE POLICY "handovers_recipient_update" ON public.handovers FOR UPDATE TO authenticated
  USING (auth.uid() = to_user OR auth.uid() = from_user OR public.is_admin(auth.uid()));

CREATE POLICY "handover_items_read" ON public.handover_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.handovers h WHERE h.id = handover_id AND (h.from_user = auth.uid() OR h.to_user = auth.uid() OR public.is_admin(auth.uid())))
);
CREATE POLICY "handover_items_staff_create" ON public.handover_items FOR INSERT TO authenticated
  WITH CHECK (public.is_staff_or_admin(auth.uid()));

-- asset requests: read own + admin; any authenticated can create own; admin updates
CREATE POLICY "requests_read_own" ON public.asset_requests FOR SELECT TO authenticated
  USING (auth.uid() = requested_by OR public.is_admin(auth.uid()));
CREATE POLICY "requests_create_own" ON public.asset_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requested_by);
CREATE POLICY "requests_admin_update" ON public.asset_requests FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- history: all read; staff/admin insert (system writes via app)
CREATE POLICY "history_read" ON public.asset_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "history_staff_insert" ON public.asset_history FOR INSERT TO authenticated
  WITH CHECK (public.is_staff_or_admin(auth.uid()) OR auth.uid() = performed_by);

-- ===== SEED DATA =====
INSERT INTO public.departments (code, name, is_storage) VALUES
  ('A', 'Assets Management', true),
  ('M', 'Media / Production', false),
  ('W', 'Worship / Music', false),
  ('T', 'Tech / IT', false),
  ('P', 'Photography', false),
  ('V', 'Videography', false),
  ('K', 'eKids', false),
  ('C', 'eCafe', false),
  ('L', 'Lounge', false),
  ('G', 'Welcoming', false),
  ('R', 'Parking', false),
  ('H', 'Hope', false),
  ('S', 'Second Chance', false),
  ('N', 'Cleaning', false);

INSERT INTO public.item_types (code, name) VALUES
  ('C', 'Camera'),
  ('L', 'Lens'),
  ('B', 'Battery'),
  ('H', 'Charger'),
  ('M', 'Microphone'),
  ('S', 'Speaker'),
  ('T', 'Tripod'),
  ('A', 'Cable'),
  ('P', 'Laptop'),
  ('R', 'Projector'),
  ('I', 'Instrument'),
  ('D', 'Tablet'),
  ('K', 'Keyboard'),
  ('O', 'Other');
