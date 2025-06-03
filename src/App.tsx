
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { ShippingProvider } from "@/hooks/useShipping";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import OrderPlaced from "./pages/OrderPlaced";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Account from "./pages/Account";
import AdminDashboard from "./pages/AdminDashboard";
import Contact from "./pages/Contact";
import OrderTracking from "./pages/OrderTracking";
import EmailVerification from "./pages/EmailVerification";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <ShippingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/checkout/success" element={<CheckoutSuccess />} />
                    <Route path="/checkout/cancel" element={<CheckoutCancel />} />
                    <Route path="/order-placed" element={<OrderPlaced />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/track-order" element={<OrderTracking />} />
                    <Route path="/verify-email" element={<EmailVerification />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </ShippingProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
