import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2 } from "lucide-react";

interface ShippingCity {
  id: string;
  city_name: string;
  province: string;
  shipping_cost: number;
  delivery_available: boolean;
}

const ShippingCityManager = () => {
  const { toast } = useToast();
  const [cities, setCities] = useState<ShippingCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<ShippingCity | null>(null);
  const [newCity, setNewCity] = useState({
    city_name: '',
    province: '',
    shipping_cost: 0,
    delivery_available: true
  });

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_cities')
        .select('*')
        .order('city_name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast({
        title: "Error",
        description: "Failed to load shipping cities.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = async () => {
    if (!newCity.city_name || !newCity.province) {
      toast({
        title: "Missing Information",
        description: "Please fill in city name and province.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('shipping_cities')
        .insert([newCity]);

      if (error) throw error;

      toast({
        title: "City Added",
        description: "Shipping city has been added successfully.",
        variant: "default"
      });

      setNewCity({ city_name: '', province: '', shipping_cost: 0, delivery_available: true });
      setIsAddDialogOpen(false);
      fetchCities();
    } catch (error) {
      console.error('Error adding city:', error);
      toast({
        title: "Error",
        description: "Failed to add shipping city.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateCity = async () => {
    if (!editingCity) return;

    try {
      const { error } = await supabase
        .from('shipping_cities')
        .update({
          city_name: editingCity.city_name,
          province: editingCity.province,
          shipping_cost: editingCity.shipping_cost,
          delivery_available: editingCity.delivery_available
        })
        .eq('id', editingCity.id);

      if (error) throw error;

      toast({
        title: "City Updated",
        description: "Shipping city has been updated successfully.",
        variant: "default"
      });

      setEditingCity(null);
      fetchCities();
    } catch (error) {
      console.error('Error updating city:', error);
      toast({
        title: "Error",
        description: "Failed to update shipping city.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCity = async (cityId: string) => {
    if (!confirm('Are you sure you want to delete this city?')) return;

    try {
      const { error } = await supabase
        .from('shipping_cities')
        .delete()
        .eq('id', cityId);

      if (error) throw error;

      toast({
        title: "City Deleted",
        description: "Shipping city has been deleted successfully.",
        variant: "default"
      });

      fetchCities();
    } catch (error) {
      console.error('Error deleting city:', error);
      toast({
        title: "Error",
        description: "Failed to delete shipping city.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading shipping cities...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Shipping Cities Management</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-rose-500 hover:bg-rose-600">
                <Plus className="h-4 w-4 mr-2" />
                Add City
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Shipping City</DialogTitle>
                <DialogDescription>
                  Configure shipping cost and delivery availability for a new city.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="city_name">City Name</Label>
                  <Input
                    id="city_name"
                    value={newCity.city_name}
                    onChange={(e) => setNewCity({ ...newCity, city_name: e.target.value })}
                    placeholder="Enter city name"
                  />
                </div>
                <div>
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    value={newCity.province}
                    onChange={(e) => setNewCity({ ...newCity, province: e.target.value })}
                    placeholder="Enter province"
                  />
                </div>
                <div>
                  <Label htmlFor="shipping_cost">Shipping Cost (PKR)</Label>
                  <Input
                    id="shipping_cost"
                    type="number"
                    value={newCity.shipping_cost}
                    onChange={(e) => setNewCity({ ...newCity, shipping_cost: Number(e.target.value) })}
                    placeholder="Enter shipping cost"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="delivery_available"
                    checked={newCity.delivery_available}
                    onCheckedChange={(checked) => setNewCity({ ...newCity, delivery_available: checked })}
                  />
                  <Label htmlFor="delivery_available">Delivery Available</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCity} className="bg-rose-500 hover:bg-rose-600">
                  Add City
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>City</TableHead>
              <TableHead>Province</TableHead>
              <TableHead>Shipping Cost</TableHead>
              <TableHead>Delivery Available</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cities.map((city) => (
              <TableRow key={city.id}>
                <TableCell className="font-medium">{city.city_name}</TableCell>
                <TableCell>{city.province}</TableCell>
                <TableCell>PKR {city.shipping_cost.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    city.delivery_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {city.delivery_available ? 'Available' : 'Not Available'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCity(city)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCity(city.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Edit Dialog */}
        <Dialog open={!!editingCity} onOpenChange={() => setEditingCity(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Shipping City</DialogTitle>
              <DialogDescription>
                Update shipping cost and delivery availability for {editingCity?.city_name}.
              </DialogDescription>
            </DialogHeader>
            {editingCity && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit_city_name">City Name</Label>
                  <Input
                    id="edit_city_name"
                    value={editingCity.city_name}
                    onChange={(e) => setEditingCity({ ...editingCity, city_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_province">Province</Label>
                  <Input
                    id="edit_province"
                    value={editingCity.province}
                    onChange={(e) => setEditingCity({ ...editingCity, province: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_shipping_cost">Shipping Cost (PKR)</Label>
                  <Input
                    id="edit_shipping_cost"
                    type="number"
                    value={editingCity.shipping_cost}
                    onChange={(e) => setEditingCity({ ...editingCity, shipping_cost: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_delivery_available"
                    checked={editingCity.delivery_available}
                    onCheckedChange={(checked) => setEditingCity({ ...editingCity, delivery_available: checked })}
                  />
                  <Label htmlFor="edit_delivery_available">Delivery Available</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCity(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCity} className="bg-rose-500 hover:bg-rose-600">
                Update City
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ShippingCityManager;