-- Create product variants table to handle color, size, and price combinations
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, color, size)
);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Create policies for product variants
CREATE POLICY "Product variants are viewable by everyone" 
ON public.product_variants 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert product variants" 
ON public.product_variants 
FOR INSERT 
WITH CHECK (auth.email() = 'digitaleyemedia25@gmail.com');

CREATE POLICY "Only admins can update product variants" 
ON public.product_variants 
FOR UPDATE 
USING (auth.email() = 'digitaleyemedia25@gmail.com');

CREATE POLICY "Only admins can delete product variants" 
ON public.product_variants 
FOR DELETE 
USING (auth.email() = 'digitaleyemedia25@gmail.com');

-- Add new columns to cart_items table (skip if they already exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'variant_id') THEN
    ALTER TABLE public.cart_items ADD COLUMN variant_id UUID REFERENCES public.product_variants(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'selected_size') THEN
    ALTER TABLE public.cart_items ADD COLUMN selected_size TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'variant_price') THEN
    ALTER TABLE public.cart_items ADD COLUMN variant_price NUMERIC;
  END IF;
END $$;

-- Add new columns to order_items table (skip if they already exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'variant_id') THEN
    ALTER TABLE public.order_items ADD COLUMN variant_id UUID REFERENCES public.product_variants(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'selected_size') THEN
    ALTER TABLE public.order_items ADD COLUMN selected_size TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'variant_price') THEN
    ALTER TABLE public.order_items ADD COLUMN variant_price NUMERIC;
  END IF;
END $$;