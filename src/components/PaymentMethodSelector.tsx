
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Truck, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

const PaymentMethodSelector = ({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Method
        </CardTitle>
        <CardDescription>
          Choose your preferred payment method
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="cod" id="cod" />
            <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
              <Truck className="h-4 w-4" />
              <div>
                <div className="font-medium">Cash on Delivery</div>
                <div className="text-sm text-gray-500">Pay when you receive your order</div>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 p-3 border rounded-lg opacity-50">
            <RadioGroupItem value="online" id="online" disabled />
            <Label htmlFor="online" className="flex items-center gap-2 cursor-not-allowed flex-1">
              <CreditCard className="h-4 w-4" />
              <div>
                <div className="font-medium">Online Payment</div>
                <div className="text-sm text-gray-500">Credit/Debit Card, JazzCash, EasyPaisa</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
        
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Online payment is not available right now. You can order by "Cash on Delivery".
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
