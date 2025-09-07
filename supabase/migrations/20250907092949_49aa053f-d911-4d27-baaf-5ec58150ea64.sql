-- Create shipping cities table for city-based shipping management
CREATE TABLE IF NOT EXISTS public.shipping_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name TEXT NOT NULL UNIQUE,
  province TEXT NOT NULL,
  shipping_cost NUMERIC NOT NULL DEFAULT 0,
  delivery_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_cities ENABLE ROW LEVEL SECURITY;

-- Create policies for shipping cities
CREATE POLICY "Anyone can view shipping cities" 
ON public.shipping_cities 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage shipping cities" 
ON public.shipping_cities 
FOR ALL 
USING (auth.email() = 'digitaleyemedia25@gmail.com'::text);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shipping_cities_updated_at
BEFORE UPDATE ON public.shipping_cities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default Pakistani cities
INSERT INTO public.shipping_cities (city_name, province, shipping_cost, delivery_available) VALUES
('Karachi', 'Sindh', 200, true),
('Lahore', 'Punjab', 250, true),
('Islamabad', 'Islamabad Capital Territory', 300, true),
('Faisalabad', 'Punjab', 280, true),
('Rawalpindi', 'Punjab', 300, true),
('Multan', 'Punjab', 350, true),
('Peshawar', 'Khyber Pakhtunkhwa', 400, true),
('Quetta', 'Balochistan', 500, true),
('Sialkot', 'Punjab', 320, true),
('Gujranwala', 'Punjab', 290, true)
ON CONFLICT (city_name) DO NOTHING;