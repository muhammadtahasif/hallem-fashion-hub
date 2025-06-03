
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ShippingContextType {
  shippingCharges: number;
  loading: boolean;
  updateShippingCharges: (charges: number) => Promise<boolean>;
  fetchShippingCharges: () => Promise<void>;
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
  const [shippingCharges, setShippingCharges] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchShippingCharges = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'shipping_charges')
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine for first time
        throw error;
      }

      const charges = data ? parseFloat(data.value) || 0 : 0;
      setShippingCharges(charges);
    } catch (error) {
      console.error('Error fetching shipping charges:', error);
      setShippingCharges(0);
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
          value: charges.toString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      setShippingCharges(charges);
      return true;
    } catch (error) {
      console.error('Error updating shipping charges:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchShippingCharges();
  }, []);

  const value = {
    shippingCharges,
    loading,
    updateShippingCharges,
    fetchShippingCharges
  };

  return <ShippingContext.Provider value={value}>{children}</ShippingContext.Provider>;
};
