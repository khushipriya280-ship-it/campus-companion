ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.assignments DROP CONSTRAINT IF EXISTS assignments_status_check;
ALTER TABLE public.assignments ADD CONSTRAINT assignments_status_check CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'archived'::text]));