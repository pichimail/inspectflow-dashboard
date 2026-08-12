-- InspectFlow V8 RBAC/RLS migration
-- IMPORTANT: Apply through a verified Neon branch before production promotion.
-- This migration intentionally does not create database login roles; application
-- authorization is driven by app session context plus row-level policies.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.app_roles (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  scope text NOT NULL DEFAULT 'organization',
  is_system boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_permissions (
  key text PRIMARY KEY,
  module text NOT NULL,
  action text NOT NULL,
  description text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  password_hash text,
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  franchise_id uuid REFERENCES public.franchises(id) ON DELETE SET NULL,
  inspector_id uuid REFERENCES public.inspectors(id) ON DELETE SET NULL,
  client_email text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS app_users_email_lower_uidx ON public.app_users(lower(email));

CREATE TABLE IF NOT EXISTS public.app_user_roles (
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  role_id text NOT NULL REFERENCES public.app_roles(id) ON DELETE CASCADE,
  franchise_id uuid REFERENCES public.franchises(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES public.app_users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS public.app_role_permissions (
  role_id text NOT NULL REFERENCES public.app_roles(id) ON DELETE CASCADE,
  permission_key text NOT NULL REFERENCES public.app_permissions(key) ON DELETE CASCADE,
  effect text NOT NULL DEFAULT 'allow' CHECK(effect IN ('allow','deny')),
  PRIMARY KEY(role_id, permission_key)
);

CREATE TABLE IF NOT EXISTS public.app_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS app_sessions_user_idx ON public.app_sessions(user_id, expires_at DESC);

CREATE TABLE IF NOT EXISTS public.assistant_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation',
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS assistant_threads_user_updated_idx ON public.assistant_threads(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.assistant_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.assistant_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK(role IN ('user','assistant','system')),
  content text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS assistant_messages_thread_idx ON public.assistant_messages(thread_id, created_at);

CREATE TABLE IF NOT EXISTS public.assistant_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES public.assistant_threads(id) ON DELETE CASCADE,
  message_id uuid REFERENCES public.assistant_messages(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL DEFAULT 0,
  storage_url text,
  extracted_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'ready',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS assistant_attachments_user_idx ON public.assistant_attachments(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.assistant_field_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attachment_id uuid REFERENCES public.assistant_attachments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid,
  fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence numeric(5,4),
  state text NOT NULL DEFAULT 'draft' CHECK(state IN ('draft','approved','applied','rejected')),
  applied_at timestamptz,
  applied_by uuid REFERENCES public.app_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS assistant_field_drafts_user_state_idx ON public.assistant_field_drafts(user_id, state, created_at DESC);

CREATE TABLE IF NOT EXISTS public.training_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  role_audience jsonb NOT NULL DEFAULT '[]'::jsonb,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.training_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'assigned' CHECK(status IN ('assigned','in_progress','completed','overdue')),
  progress integer NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
  assigned_by uuid REFERENCES public.app_users(id) ON DELETE SET NULL,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id,module_id)
);
CREATE INDEX IF NOT EXISTS training_assignments_user_idx ON public.training_assignments(user_id, status);

INSERT INTO public.app_roles(id,name,description,scope) VALUES
 ('super_admin','Super Admin','Full platform, security, role and tenant control.','platform'),
 ('admin','Admin','Organization and franchise administration with delegated role management.','organization'),
 ('employee','Employee','Operational enquiries, inspections, reports and customer workflow.','franchise'),
 ('inspector','Inspector','Assigned field inspections, evidence and reports.','franchise'),
 ('client','Client','Own inspections, reports, documents and communication.','self'),
 ('trainee','Trainee','Guided read-first training workspace with supervised actions.','franchise')
ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,scope=EXCLUDED.scope;

INSERT INTO public.app_permissions(key,module,action,description) VALUES
 ('dashboard.read','dashboard','read','View permitted dashboard surfaces'),
 ('enquiries.read','enquiries','read','Read enquiries in scope'),
 ('enquiries.write','enquiries','write','Create and edit enquiries in scope'),
 ('inspections.read','inspections','read','Read inspections in scope'),
 ('inspections.write','inspections','write','Create and edit inspections in scope'),
 ('reports.read','reports','read','Read reports in scope'),
 ('reports.write','reports','write','Edit and issue reports in scope'),
 ('inspectors.read','inspectors','read','Read inspector directory'),
 ('inspectors.manage','inspectors','manage','Manage inspectors'),
 ('franchises.read','franchises','read','Read franchise directory'),
 ('franchises.manage','franchises','manage','Manage franchises'),
 ('referrals.read','referrals','read','Read referral network'),
 ('referrals.manage','referrals','manage','Manage referral network'),
 ('storage.read','storage','read','Read documents in scope'),
 ('storage.write','storage','write','Upload and manage documents'),
 ('assistant.use','assistant','use','Use InspectFlow assistant'),
 ('assistant.apply','assistant','apply','Approve assistant field changes'),
 ('users.read','users','read','Read user directory'),
 ('users.manage','users','manage','Manage users and role assignments'),
 ('roles.manage','roles','manage','Manage role permissions'),
 ('training.read','training','read','Access training content'),
 ('training.manage','training','manage','Manage training assignments'),
 ('audit.read','audit','read','Read activity and security audit trail')
ON CONFLICT(key) DO UPDATE SET module=EXCLUDED.module,action=EXCLUDED.action,description=EXCLUDED.description;

INSERT INTO public.app_role_permissions(role_id,permission_key,effect)
SELECT 'super_admin',key,'allow' FROM public.app_permissions ON CONFLICT DO NOTHING;
INSERT INTO public.app_role_permissions(role_id,permission_key,effect)
SELECT 'admin',key,'allow' FROM public.app_permissions WHERE key <> 'roles.manage' ON CONFLICT DO NOTHING;

INSERT INTO public.app_role_permissions(role_id,permission_key,effect) VALUES
 ('employee','dashboard.read','allow'),('employee','enquiries.read','allow'),('employee','enquiries.write','allow'),('employee','inspections.read','allow'),('employee','inspections.write','allow'),('employee','reports.read','allow'),('employee','reports.write','allow'),('employee','inspectors.read','allow'),('employee','franchises.read','allow'),('employee','referrals.read','allow'),('employee','storage.read','allow'),('employee','storage.write','allow'),('employee','assistant.use','allow'),('employee','assistant.apply','allow'),('employee','training.read','allow'),
 ('inspector','dashboard.read','allow'),('inspector','inspections.read','allow'),('inspector','inspections.write','allow'),('inspector','reports.read','allow'),('inspector','reports.write','allow'),('inspector','storage.read','allow'),('inspector','assistant.use','allow'),('inspector','training.read','allow'),
 ('client','dashboard.read','allow'),('client','inspections.read','allow'),('client','reports.read','allow'),('client','storage.read','allow'),('client','assistant.use','allow'),
 ('trainee','dashboard.read','allow'),('trainee','enquiries.read','allow'),('trainee','inspections.read','allow'),('trainee','reports.read','allow'),('trainee','inspectors.read','allow'),('trainee','franchises.read','allow'),('trainee','referrals.read','allow'),('trainee','storage.read','allow'),('trainee','assistant.use','allow'),('trainee','training.read','allow')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.inspectflow_actor_id() RETURNS uuid
LANGUAGE sql STABLE AS 'SELECT NULLIF(current_setting(''app.user_id'', true), '''')::uuid';
CREATE OR REPLACE FUNCTION public.inspectflow_actor_role() RETURNS text
LANGUAGE sql STABLE AS 'SELECT NULLIF(current_setting(''app.role'', true), '''')';
CREATE OR REPLACE FUNCTION public.inspectflow_actor_franchise_id() RETURNS uuid
LANGUAGE sql STABLE AS 'SELECT NULLIF(current_setting(''app.franchise_id'', true), '''')::uuid';
CREATE OR REPLACE FUNCTION public.inspectflow_actor_email() RETURNS text
LANGUAGE sql STABLE AS 'SELECT NULLIF(current_setting(''app.user_email'', true), '''')';
CREATE OR REPLACE FUNCTION public.inspectflow_is_admin() RETURNS boolean
LANGUAGE sql STABLE AS 'SELECT public.inspectflow_actor_role() IN (''super_admin'',''admin'')';

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_field_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_users_select_scope ON public.app_users;
CREATE POLICY app_users_select_scope ON public.app_users FOR SELECT
USING (public.inspectflow_is_admin() OR id=public.inspectflow_actor_id());
DROP POLICY IF EXISTS app_users_update_scope ON public.app_users;
CREATE POLICY app_users_update_scope ON public.app_users FOR UPDATE
USING (public.inspectflow_is_admin() OR id=public.inspectflow_actor_id())
WITH CHECK (public.inspectflow_is_admin() OR id=public.inspectflow_actor_id());

DROP POLICY IF EXISTS app_user_roles_scope ON public.app_user_roles;
CREATE POLICY app_user_roles_scope ON public.app_user_roles FOR SELECT
USING (public.inspectflow_is_admin() OR user_id=public.inspectflow_actor_id());
DROP POLICY IF EXISTS app_user_roles_admin_write ON public.app_user_roles;
CREATE POLICY app_user_roles_admin_write ON public.app_user_roles FOR ALL
USING (public.inspectflow_is_admin()) WITH CHECK (public.inspectflow_is_admin());

DROP POLICY IF EXISTS app_role_permissions_read ON public.app_role_permissions;
CREATE POLICY app_role_permissions_read ON public.app_role_permissions FOR SELECT
USING (public.inspectflow_actor_id() IS NOT NULL);
DROP POLICY IF EXISTS app_role_permissions_super_write ON public.app_role_permissions;
CREATE POLICY app_role_permissions_super_write ON public.app_role_permissions FOR ALL
USING (public.inspectflow_actor_role()='super_admin') WITH CHECK (public.inspectflow_actor_role()='super_admin');

DROP POLICY IF EXISTS assistant_threads_owner ON public.assistant_threads;
CREATE POLICY assistant_threads_owner ON public.assistant_threads FOR ALL
USING (user_id=public.inspectflow_actor_id() OR public.inspectflow_is_admin())
WITH CHECK (user_id=public.inspectflow_actor_id() OR public.inspectflow_is_admin());
DROP POLICY IF EXISTS assistant_messages_owner ON public.assistant_messages;
CREATE POLICY assistant_messages_owner ON public.assistant_messages FOR ALL
USING (user_id=public.inspectflow_actor_id() OR public.inspectflow_is_admin())
WITH CHECK (user_id=public.inspectflow_actor_id() OR public.inspectflow_is_admin());
DROP POLICY IF EXISTS assistant_attachments_owner ON public.assistant_attachments;
CREATE POLICY assistant_attachments_owner ON public.assistant_attachments FOR ALL
USING (user_id=public.inspectflow_actor_id() OR public.inspectflow_is_admin())
WITH CHECK (user_id=public.inspectflow_actor_id() OR public.inspectflow_is_admin());
DROP POLICY IF EXISTS assistant_field_drafts_owner ON public.assistant_field_drafts;
CREATE POLICY assistant_field_drafts_owner ON public.assistant_field_drafts FOR ALL
USING (user_id=public.inspectflow_actor_id() OR public.inspectflow_is_admin())
WITH CHECK (user_id=public.inspectflow_actor_id() OR public.inspectflow_is_admin());

DROP POLICY IF EXISTS training_modules_read ON public.training_modules;
CREATE POLICY training_modules_read ON public.training_modules FOR SELECT
USING (public.inspectflow_actor_id() IS NOT NULL);
DROP POLICY IF EXISTS training_modules_admin_write ON public.training_modules;
CREATE POLICY training_modules_admin_write ON public.training_modules FOR ALL
USING (public.inspectflow_is_admin()) WITH CHECK (public.inspectflow_is_admin());
DROP POLICY IF EXISTS training_assignments_scope ON public.training_assignments;
CREATE POLICY training_assignments_scope ON public.training_assignments FOR SELECT
USING (user_id=public.inspectflow_actor_id() OR public.inspectflow_is_admin());

-- Existing operational table policies. These rely on the existing InspectFlow
-- franchise_id / inspector_id / client_email ownership columns.
DROP POLICY IF EXISTS enquiries_scope ON public.enquiries;
CREATE POLICY enquiries_scope ON public.enquiries FOR SELECT USING (
 public.inspectflow_is_admin() OR
 (public.inspectflow_actor_role() IN ('employee','trainee') AND franchise_id IS NOT DISTINCT FROM public.inspectflow_actor_franchise_id())
);
DROP POLICY IF EXISTS enquiries_write_scope ON public.enquiries;
CREATE POLICY enquiries_write_scope ON public.enquiries FOR ALL USING (
 public.inspectflow_is_admin() OR
 (public.inspectflow_actor_role()='employee' AND franchise_id IS NOT DISTINCT FROM public.inspectflow_actor_franchise_id())
) WITH CHECK (
 public.inspectflow_is_admin() OR
 (public.inspectflow_actor_role()='employee' AND franchise_id IS NOT DISTINCT FROM public.inspectflow_actor_franchise_id())
);

DROP POLICY IF EXISTS inspections_scope ON public.inspections;
CREATE POLICY inspections_scope ON public.inspections FOR SELECT USING (
 public.inspectflow_is_admin() OR
 (public.inspectflow_actor_role() IN ('employee','trainee') AND franchise_id IS NOT DISTINCT FROM public.inspectflow_actor_franchise_id()) OR
 (public.inspectflow_actor_role()='inspector' AND inspector_id=(SELECT inspector_id FROM public.app_users WHERE id=public.inspectflow_actor_id())) OR
 (public.inspectflow_actor_role()='client' AND lower(coalesce(client_email,''))=lower(coalesce(public.inspectflow_actor_email(),'')))
);
DROP POLICY IF EXISTS inspections_write_scope ON public.inspections;
CREATE POLICY inspections_write_scope ON public.inspections FOR UPDATE USING (
 public.inspectflow_is_admin() OR
 (public.inspectflow_actor_role()='employee' AND franchise_id IS NOT DISTINCT FROM public.inspectflow_actor_franchise_id()) OR
 (public.inspectflow_actor_role()='inspector' AND inspector_id=(SELECT inspector_id FROM public.app_users WHERE id=public.inspectflow_actor_id()))
) WITH CHECK (
 public.inspectflow_is_admin() OR
 (public.inspectflow_actor_role()='employee' AND franchise_id IS NOT DISTINCT FROM public.inspectflow_actor_franchise_id()) OR
 (public.inspectflow_actor_role()='inspector' AND inspector_id=(SELECT inspector_id FROM public.app_users WHERE id=public.inspectflow_actor_id()))
);

DROP POLICY IF EXISTS inspection_reports_scope ON public.inspection_reports;
CREATE POLICY inspection_reports_scope ON public.inspection_reports FOR SELECT
USING (EXISTS(SELECT 1 FROM public.inspections i WHERE i.id=inspection_id));
DROP POLICY IF EXISTS inspection_reports_write_scope ON public.inspection_reports;
CREATE POLICY inspection_reports_write_scope ON public.inspection_reports FOR UPDATE
USING (public.inspectflow_actor_role() IN ('super_admin','admin','employee','inspector'))
WITH CHECK (public.inspectflow_actor_role() IN ('super_admin','admin','employee','inspector'));

DROP POLICY IF EXISTS inspectors_read_scope ON public.inspectors;
CREATE POLICY inspectors_read_scope ON public.inspectors FOR SELECT
USING ((public.inspectflow_actor_id() IS NOT NULL AND public.inspectflow_actor_role()<>'client') OR public.inspectflow_is_admin());
DROP POLICY IF EXISTS inspectors_admin_write ON public.inspectors;
CREATE POLICY inspectors_admin_write ON public.inspectors FOR ALL
USING (public.inspectflow_is_admin()) WITH CHECK (public.inspectflow_is_admin());

DROP POLICY IF EXISTS franchises_read_scope ON public.franchises;
CREATE POLICY franchises_read_scope ON public.franchises FOR SELECT
USING (public.inspectflow_actor_id() IS NOT NULL);
DROP POLICY IF EXISTS franchises_admin_write ON public.franchises;
CREATE POLICY franchises_admin_write ON public.franchises FOR ALL
USING (public.inspectflow_is_admin()) WITH CHECK (public.inspectflow_is_admin());

DROP POLICY IF EXISTS referral_agents_scope ON public.referral_agents;
CREATE POLICY referral_agents_scope ON public.referral_agents FOR SELECT USING (
 public.inspectflow_is_admin() OR
 (public.inspectflow_actor_role() IN ('employee','trainee') AND franchise_id IS NOT DISTINCT FROM public.inspectflow_actor_franchise_id())
);
DROP POLICY IF EXISTS referral_agents_write_scope ON public.referral_agents;
CREATE POLICY referral_agents_write_scope ON public.referral_agents FOR ALL USING (
 public.inspectflow_is_admin() OR
 (public.inspectflow_actor_role()='employee' AND franchise_id IS NOT DISTINCT FROM public.inspectflow_actor_franchise_id())
) WITH CHECK (
 public.inspectflow_is_admin() OR
 (public.inspectflow_actor_role()='employee' AND franchise_id IS NOT DISTINCT FROM public.inspectflow_actor_franchise_id())
);

DROP POLICY IF EXISTS storage_files_scope ON public.storage_files;
CREATE POLICY storage_files_scope ON public.storage_files FOR SELECT USING (
 public.inspectflow_is_admin() OR franchise_id IS NULL OR franchise_id IS NOT DISTINCT FROM public.inspectflow_actor_franchise_id()
);
DROP POLICY IF EXISTS storage_files_write_scope ON public.storage_files;
CREATE POLICY storage_files_write_scope ON public.storage_files FOR ALL
USING (public.inspectflow_is_admin() OR public.inspectflow_actor_role()='employee')
WITH CHECK (public.inspectflow_is_admin() OR public.inspectflow_actor_role()='employee');

DROP POLICY IF EXISTS campaigns_scope ON public.campaigns;
CREATE POLICY campaigns_scope ON public.campaigns FOR SELECT USING (
 public.inspectflow_is_admin() OR
 (public.inspectflow_actor_role()='employee' AND franchise_id IS NOT DISTINCT FROM public.inspectflow_actor_franchise_id())
);
DROP POLICY IF EXISTS campaigns_write_scope ON public.campaigns;
CREATE POLICY campaigns_write_scope ON public.campaigns FOR ALL USING (
 public.inspectflow_is_admin() OR
 (public.inspectflow_actor_role()='employee' AND franchise_id IS NOT DISTINCT FROM public.inspectflow_actor_franchise_id())
) WITH CHECK (
 public.inspectflow_is_admin() OR
 (public.inspectflow_actor_role()='employee' AND franchise_id IS NOT DISTINCT FROM public.inspectflow_actor_franchise_id())
);

DROP POLICY IF EXISTS activity_events_scope ON public.activity_events;
CREATE POLICY activity_events_scope ON public.activity_events FOR SELECT USING (
 public.inspectflow_is_admin() OR franchise_id IS NOT DISTINCT FROM public.inspectflow_actor_franchise_id()
);
