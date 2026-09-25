DROP POLICY IF EXISTS "authenticated read catalog" ON public.permissions;
CREATE POLICY "tenant members read catalog" ON public.permissions
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()));
REVOKE ALL ON public.permissions FROM anon;
GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;