-- Add visibility toggle for products
ALTER TABLE public.products 
ADD COLUMN is_visible boolean NOT NULL DEFAULT true;

-- Create index for better performance when filtering visible products
CREATE INDEX idx_products_visible ON public.products (is_visible);