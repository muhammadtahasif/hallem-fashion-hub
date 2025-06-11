
-- Create a table for contact messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access (assuming admin email)
CREATE POLICY "Admin can view all messages" 
  ON public.messages 
  FOR ALL 
  USING (true);

-- Create policy for inserting messages (anyone can send)
CREATE POLICY "Anyone can send messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (true);
