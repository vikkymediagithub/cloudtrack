-- Disable RLS temporarily to clean up
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
DECLARE
    r RECORD;
    table_names TEXT[] := ARRAY['users', 'projects', 'tasks', 'reports', 'notes', 'notifications'];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY table_names LOOP
        FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = table_name AND schemaname = 'public') LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(table_name);
        END LOOP;
    END LOOP;
END $$;

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies (allow registration and self-management)
CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "users_update_policy" ON public.users
  FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "users_delete_policy" ON public.users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Projects policies (accessible to all authenticated users)
CREATE POLICY "projects_select_policy" ON public.projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "projects_insert_policy" ON public.projects
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "projects_update_policy" ON public.projects
  FOR UPDATE USING (
    auth.uid() = created_by OR
    auth.uid() = ANY(assigned_to) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "projects_delete_policy" ON public.projects
  FOR DELETE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tasks policies (accessible to all authenticated users)
CREATE POLICY "tasks_select_policy" ON public.tasks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "tasks_insert_policy" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tasks_update_policy" ON public.tasks
  FOR UPDATE USING (
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND (
        auth.uid() = p.created_by OR
        auth.uid() = ANY(p.assigned_to)
      )
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "tasks_delete_policy" ON public.tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND auth.uid() = p.created_by
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Reports policies (accessible to all authenticated users)
CREATE POLICY "reports_select_policy" ON public.reports
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "reports_insert_policy" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "reports_update_policy" ON public.reports
  FOR UPDATE USING (
    auth.uid() = submitted_by OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "reports_delete_policy" ON public.reports
  FOR DELETE USING (
    auth.uid() = submitted_by OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notes policies (accessible to all authenticated users)
CREATE POLICY "notes_select_policy" ON public.notes
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      visibility = 'public' OR
      (visibility = 'private' AND auth.uid() = created_by) OR
      (visibility = 'team' AND (
        EXISTS (
          SELECT 1 FROM public.projects p
          WHERE p.id = project_id AND (
            auth.uid() = p.created_by OR 
            auth.uid() = ANY(p.assigned_to)
          )
        ) OR
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role = 'admin'
        )
      ))
    )
  );

CREATE POLICY "notes_insert_policy" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "notes_update_policy" ON public.notes
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "notes_delete_policy" ON public.notes
  FOR DELETE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notifications policies (user-specific)
CREATE POLICY "notifications_select_policy" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_policy" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "notifications_update_policy" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_delete_policy" ON public.notifications
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Success message
SELECT 'Row Level Security policies created successfully!' as result;
