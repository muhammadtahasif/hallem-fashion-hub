-- Restrict subcategories modifications to admin only
-- 1) Drop permissive policy that allowed any authenticated user to manage
DROP POLICY IF EXISTS "Allow authenticated users to manage subcategories" ON public.subcategories;

-- 2) Ensure RLS remains enabled
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- 3) Create admin-only policies for write operations
CREATE POLICY "Only admins can insert subcategories"
ON public.subcategories
FOR INSERT
WITH CHECK (auth.email() = 'digitaleyemedia25@gmail.com');

CREATE POLICY "Only admins can update subcategories"
ON public.subcategories
FOR UPDATE
USING (auth.email() = 'digitaleyemedia25@gmail.com');

CREATE POLICY "Only admins can delete subcategories"
ON public.subcategories
FOR DELETE
USING (auth.email() = 'digitaleyemedia25@gmail.com');

-- Keep existing public read access policy (SELECT true)
