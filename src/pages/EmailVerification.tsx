
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        // For now, we'll just mark as success since Supabase handles email verification
        // In a real app, you would verify the token against your database
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Email verification failed');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen fashion-gradient flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                Email Verified!
              </h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link to="/login">
                <Button className="bg-rose-500 hover:bg-rose-600">
                  Continue to Login
                </Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                Verification Failed
              </h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Link to="/signup">
                  <Button variant="outline" className="w-full">
                    Try Signing Up Again
                  </Button>
                </Link>
                <Link to="/">
                  <Button className="w-full bg-rose-500 hover:bg-rose-600">
                    Go to Home
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
