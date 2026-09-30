CREATE TABLE public.assistant_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  context_paths text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assistant_messages_role_valid CHECK (role IN ('user', 'assistant'))
);

GRANT SELECT, INSERT, DELETE ON public.assistant_messages TO authenticated;
GRANT ALL ON public.assistant_messages TO service_role;

ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own assistant history"
ON public.assistant_messages
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND public.is_member(auth.uid(), tenant_id));

CREATE POLICY "users insert own assistant history"
ON public.assistant_messages
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND public.is_member(auth.uid(), tenant_id));

CREATE POLICY "users clear own assistant history"
ON public.assistant_messages
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND public.is_member(auth.uid(), tenant_id));

CREATE INDEX assistant_messages_user_tenant_created_idx
ON public.assistant_messages(user_id, tenant_id, created_at DESC);