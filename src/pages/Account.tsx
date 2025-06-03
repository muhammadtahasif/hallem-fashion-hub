
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MyOrdersTable from "@/components/MyOrdersTable";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from "lucide-react";

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  created_at: string;
}

const Account = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user?.id,
          email: user?.email,
          first_name: null,
          last_name: null,
          phone: null,
          address: null,
          city: null,
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;
        setProfile(createdProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      city: profile?.city || '',
    });
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editedProfile)
        .eq('id', user?.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...editedProfile } : null);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile information.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({});
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
            <p className="text-gray-600">You need to be signed in to view your account.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold font-serif mb-8">My Account</h1>
          
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">My Orders</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders">
              <MyOrdersTable />
            </TabsContent>
            
            <TabsContent value="profile">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profile Information
                      </CardTitle>
                      {!isEditing ? (
                        <Button variant="outline" size="sm" onClick={handleEdit}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleCancel}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        {isEditing ? (
                          <Input
                            value={editedProfile.first_name || ''}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, first_name: e.target.value }))}
                            placeholder="Enter first name"
                          />
                        ) : (
                          <p className="text-gray-600 p-2 bg-gray-50 rounded">
                            {profile?.first_name || 'Not provided'}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        {isEditing ? (
                          <Input
                            value={editedProfile.last_name || ''}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, last_name: e.target.value }))}
                            placeholder="Enter last name"
                          />
                        ) : (
                          <p className="text-gray-600 p-2 bg-gray-50 rounded">
                            {profile?.last_name || 'Not provided'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <p className="text-gray-600 p-2 bg-gray-50 rounded">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.phone || ''}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <p className="text-gray-600 p-2 bg-gray-50 rounded">
                          {profile?.phone || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Address
                      </label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.address || ''}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter address"
                        />
                      ) : (
                        <p className="text-gray-600 p-2 bg-gray-50 rounded">
                          {profile?.address || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.city || ''}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Enter city"
                        />
                      ) : (
                        <p className="text-gray-600 p-2 bg-gray-50 rounded">
                          {profile?.city || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Account Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">User ID</label>
                      <p className="text-gray-600 text-xs font-mono p-2 bg-gray-50 rounded break-all">
                        {user.id}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Member Since</label>
                      <p className="text-gray-600 p-2 bg-gray-50 rounded">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Account Status</label>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Account;
