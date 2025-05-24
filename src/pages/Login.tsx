
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '/';
  const isAdmin = formData.email === 'digitaleyemedia25@gmail.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication - will be connected to Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (isAdmin) {
      toast({
        title: "Admin login successful!",
        description: "Welcome back, Administrator.",
      });
      window.location.href = '/admin';
    } else {
      toast({
        title: "Login successful!",
        description: "Welcome back to AL - HALLEM.",
      });
      window.location.href = redirectUrl;
    }

    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen fashion-gradient flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif">Welcome Back</CardTitle>
          <p className="text-gray-600">Sign in to your AL - HALLEM account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
              {isAdmin && (
                <p className="text-xs text-rose-600 mt-1">Admin account detected</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Your password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <a href="#" className="text-rose-500 hover:text-rose-600">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-rose-500 hover:text-rose-600 font-medium">
                Sign up
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Continue shopping as{" "}
              <Link to="/shop" className="text-rose-500 hover:text-rose-600 font-medium">
                Guest
              </Link>
            </p>
          </div>

          {/* Demo Account Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Demo Accounts</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Admin:</strong> digitaleyemedia25@gmail.com</p>
              <p><strong>Customer:</strong> any email with password</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
