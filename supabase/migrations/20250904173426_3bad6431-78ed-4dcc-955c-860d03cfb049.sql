-- Add colors field to products table
ALTER TABLE public.products 
ADD COLUMN colors text[] DEFAULT '{}';

-- Add color field to cart_items table to store selected color
ALTER TABLE public.cart_items 
ADD COLUMN selected_color text;

-- Add color field to order_items table to store selected color
ALTER TABLE public.order_items 
ADD COLUMN selected_color text;