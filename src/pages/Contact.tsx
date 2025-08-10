
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject,
          message: formData.message,
          status: 'unread'
        }]);

      if (error) throw error;

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen fashion-gradient">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-4">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Have questions about our products or need assistance? We're here to help!
            Reach out to us and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold font-serif mb-4 sm:mb-6">Get in Touch</h2>
              <div className="space-y-4 sm:space-y-6">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="bg-rose-100 p-2 sm:p-3 rounded-lg">
                        <span className="text-rose-600 text-lg sm:text-xl">📞</span>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1 text-sm sm:text-base">Phone</h3>
                        <p className="text-gray-600 text-sm sm:text-base">+92 3090449955</p>
                        <p className="text-xs sm:text-sm text-gray-500">Mon-Sat, 9 AM - 8 PM</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="bg-rose-100 p-2 sm:p-3 rounded-lg">
                        <span className="text-rose-600 text-lg sm:text-xl">✉️</span>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1 text-sm sm:text-base">Email</h3>
                        <p className="text-gray-600 text-sm sm:text-base break-all">digitaleyemedia25@gmail.com</p>
                        <p className="text-xs sm:text-sm text-gray-500">We'll respond within 24 hours</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="bg-rose-100 p-2 sm:p-3 rounded-lg">
                        <span className="text-rose-600 text-lg sm:text-xl">🏪</span>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1 text-sm sm:text-base">Location</h3>
                        <p className="text-gray-600 text-sm sm:text-base">Pakistan</p>
                        <p className="text-xs sm:text-sm text-gray-500">Nationwide shipping available</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-semibold font-serif mb-3 sm:mb-4">Business Hours</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Monday - Friday</span>
                  <span className="text-gray-600">9:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Saturday</span>
                  <span className="text-gray-600">10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Sunday</span>
                  <span className="text-gray-600">Closed</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-semibold font-serif mb-3 sm:mb-4">Need Quick Help?</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-sm" asChild>
                  <a href="https://azfabrics.com/track-order">📦 Track Your Order</a>
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" asChild>
                  <a href="https://azfabrics.com/shop">🛍️ Browse Products</a>
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" asChild>
                  <a href="tel:+923234882256">📞 Call Us Now</a>
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg sm:text-xl">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Your phone number"
                      className="text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What's your message about?"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Tell us how we can help you..."
                    className="text-sm resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 sm:py-3"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  * Required fields. We respect your privacy and will never share your information.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
