CREATE TABLE public.library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('file','link','note')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  url text CHECK (url IS NULL OR url ~* '^https?://'),
  storage_path text,
  mime_type text,
  size_bytes bigint,
  body text CHECK (body IS NULL OR char_length(body) <= 200000),
  tags text[] NOT NULL DEFAULT '{}',
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_items TO authenticated;
GRANT ALL ON public.library_items TO service_role;
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own library select" ON public.library_items FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own library insert" ON public.library_items FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own library update" ON public.library_items FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own library delete" ON public.library_items FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX library_items_user_idx ON public.library_items(user_id, created_at DESC);

CREATE POLICY "library own read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'library' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "library own write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'library' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "library own delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'library' AND (storage.foldername(name))[1] = auth.uid()::text);