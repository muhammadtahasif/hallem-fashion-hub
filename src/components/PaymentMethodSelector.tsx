
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Truck, CheckCircle } from "lucide-react";

interface PaymentMethodSelectorProps {
  onSelectMethod: (method: 'cod' | 'online') => void;
  selectedMethod: 'cod' | 'online' | null;
}

const PaymentMethodSelector = ({ onSelectMethod, selectedMethod }: PaymentMethodSelectorProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedMethod === 'cod' 
                ? 'border-rose-500 bg-rose-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelectMethod('cod')}
          >
            <div className="flex items-center space-x-3">
              <Truck className="w-6 h-6 text-gray-600" />
              <div>
                <h3 className="font-semibold">Cash on Delivery (COD)</h3>
                <p className="text-sm text-gray-600">Pay when you receive your order</p>
              </div>
              {selectedMethod === 'cod' && (
                <CheckCircle className="w-5 h-5 text-rose-500 ml-auto" />
              )}
            </div>
          </div>

          <div 
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedMethod === 'online' 
                ? 'border-rose-500 bg-rose-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelectMethod('online')}
          >
            <div className="flex items-center space-x-3">
              <CreditCard className="w-6 h-6 text-gray-600" />
              <div>
                <h3 className="font-semibold">Online Payment</h3>
                <p className="text-sm text-gray-600">Pay securely with SAFEPAY</p>
              </div>
              {selectedMethod === 'online' && (
                <CheckCircle className="w-5 h-5 text-rose-500 ml-auto" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
