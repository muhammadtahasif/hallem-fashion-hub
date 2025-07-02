
-- Create returns table
CREATE TABLE public.returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admin can view all returns" 
  ON public.returns 
  FOR ALL 
  USING (true);

-- Create policy for inserting returns (anyone can create)
CREATE POLICY "Anyone can create returns" 
  ON public.returns 
  FOR INSERT 
  WITH CHECK (true);

-- Create return_items table to store individual items being returned
CREATE TABLE public.return_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  return_id UUID REFERENCES public.returns(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  product_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security for return_items
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;

-- Create policies for return_items
CREATE POLICY "Admin can view all return items" 
  ON public.return_items 
  FOR ALL 
  USING (true);

CREATE POLICY "Anyone can create return items" 
  ON public.return_items 
  FOR INSERT 
  WITH CHECK (true);
