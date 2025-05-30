
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ShippingContextType {
  shippingCharges: number;
  loading: boolean;
  updateShippingCharges: (charges: number) => Promise<void>;
}

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

export const useShipping = () => {
  const context = useContext(ShippingContext);
  if (context === undefined) {
    throw new Error('useShipping must be used within a ShippingProvider');
  }
  return context;
};

export const ShippingProvider = ({ children }: { children: React.ReactNode }) => {
  const [shippingCharges, setShippingCharges] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchShippingCharges = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'shipping_charges')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching shipping charges:', error);
        return;
      }

      if (data) {
        setShippingCharges(parseFloat(data.value) || 0);
      }
    } catch (error) {
      console.error('Error fetching shipping charges:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateShippingCharges = async (charges: number) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'shipping_charges',
          value: charges.toString()
        });

      if (error) throw error;
      
      setShippingCharges(charges);
    } catch (error) {
      console.error('Error updating shipping charges:', error);
    }
  };

  useEffect(() => {
    fetchShippingCharges();
  }, []);

  const value = {
    shippingCharges,
    loading,
    updateShippingCharges,
  };

  return <ShippingContext.Provider value={value}>{children}</ShippingContext.Provider>;
};
