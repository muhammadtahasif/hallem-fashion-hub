-- Tighten RLS on messages to prevent public reads/updates/deletes
-- 1) Drop overly permissive policy
DROP POLICY IF EXISTS "Admin can view all messages" ON public.messages;

-- 2) Ensure RLS is enabled (idempotent)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3) Admin-only policies for read/manage
CREATE POLICY "Admins can select messages"
ON public.messages
FOR SELECT
USING (auth.email() = 'digitaleyemedia25@gmail.com');

CREATE POLICY "Admins can update messages"
ON public.messages
FOR UPDATE
USING (auth.email() = 'digitaleyemedia25@gmail.com');

CREATE POLICY "Admins can delete messages"
ON public.messages
FOR DELETE
USING (auth.email() = 'digitaleyemedia25@gmail.com');

-- Keep existing INSERT policy that allows anyone to send messages
-- (Policy name in project: "Anyone can send messages")
