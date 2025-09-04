-- Enable RLS on settings table and create policies
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "Only admins can view settings" 
ON public.settings 
FOR SELECT 
USING (auth.email() = 'digitaleyemedia25@gmail.com');

CREATE POLICY "Only admins can insert settings" 
ON public.settings 
FOR INSERT 
WITH CHECK (auth.email() = 'digitaleyemedia25@gmail.com');

CREATE POLICY "Only admins can update settings" 
ON public.settings 
FOR UPDATE 
USING (auth.email() = 'digitaleyemedia25@gmail.com');

CREATE POLICY "Only admins can delete settings" 
ON public.settings 
FOR DELETE 
USING (auth.email() = 'digitaleyemedia25@gmail.com');