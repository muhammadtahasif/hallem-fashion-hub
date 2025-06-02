
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Smartphone, Building } from "lucide-react";

interface PaymentCredentialsFormProps {
  onSubmit: (credentials: PaymentCredentials) => void;
  isLoading: boolean;
}

export interface PaymentCredentials {
  paymentType: 'card' | 'mobile' | 'bank';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardHolderName?: string;
  mobileNumber?: string;
  mobileProvider?: string;
  bankAccount?: string;
  bankName?: string;
}

const PaymentCredentialsForm = ({ onSubmit, isLoading }: PaymentCredentialsFormProps) => {
  const [paymentType, setPaymentType] = useState<'card' | 'mobile' | 'bank'>('card');
  const [credentials, setCredentials] = useState<PaymentCredentials>({
    paymentType: 'card'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...credentials, paymentType });
  };

  const handleInputChange = (field: keyof PaymentCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="paymentType">Payment Method</Label>
            <Select value={paymentType} onValueChange={(value: 'card' | 'mobile' | 'bank') => setPaymentType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Credit/Debit Card
                  </div>
                </SelectItem>
                <SelectItem value="mobile">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Mobile Payment (JazzCash/EasyPaisa)
                  </div>
                </SelectItem>
                <SelectItem value="bank">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Bank Transfer
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentType === 'card' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardHolderName">Card Holder Name *</Label>
                <Input
                  id="cardHolderName"
                  value={credentials.cardHolderName || ''}
                  onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                  placeholder="Enter card holder name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input
                  id="cardNumber"
                  value={credentials.cardNumber || ''}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    value={credentials.expiryDate || ''}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    value={credentials.cvv || ''}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {paymentType === 'mobile' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="mobileProvider">Mobile Payment Provider *</Label>
                <Select value={credentials.mobileProvider || ''} onValueChange={(value) => handleInputChange('mobileProvider', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jazzcash">JazzCash</SelectItem>
                    <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                    <SelectItem value="upaisa">UPaisa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  value={credentials.mobileNumber || ''}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                  placeholder="+92 300 1234567"
                  required
                />
              </div>
            </div>
          )}

          {paymentType === 'bank' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="bankName">Bank Name *</Label>
                <Select value={credentials.bankName || ''} onValueChange={(value) => handleInputChange('bankName', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hbl">HBL</SelectItem>
                    <SelectItem value="ubl">UBL</SelectItem>
                    <SelectItem value="mcb">MCB</SelectItem>
                    <SelectItem value="allied">Allied Bank</SelectItem>
                    <SelectItem value="askari">Askari Bank</SelectItem>
                    <SelectItem value="faysal">Faysal Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bankAccount">Account Number *</Label>
                <Input
                  id="bankAccount"
                  value={credentials.bankAccount || ''}
                  onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                  placeholder="Enter account number"
                  required
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-rose-500 hover:bg-rose-600"
          >
            {isLoading ? "Processing..." : "Proceed to Payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentCredentialsForm;
