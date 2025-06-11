
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, Calendar, Eye, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const AdminMessagesSection = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, statusFilter]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = [...messages];

    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(message => message.status === statusFilter);
    }

    setFilteredMessages(filtered);
  };

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Message updated",
        description: "Message status has been updated successfully.",
        variant: "default"
      });

      fetchMessages();
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        title: "Error",
        description: "Failed to update message status.",
        variant: "destructive"
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Message deleted",
        description: "Message has been deleted successfully.",
        variant: "default"
      });

      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive"
      });
    }
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsViewModalOpen(true);
    
    if (message.status === 'unread') {
      updateMessageStatus(message.id, 'read');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-red-500';
      case 'read': return 'bg-blue-500';
      case 'replied': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading messages...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Customer Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
              }}
            >
              Clear Filters
            </Button>
          </div>

          {/* Mobile View */}
          {isMobile ? (
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <Card key={message.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">{message.name}</p>
                      <p className="text-xs text-gray-500">{message.email}</p>
                    </div>
                    <Badge className={getStatusColor(message.status)}>
                      {message.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mb-2">{message.subject}</p>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{message.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewMessage(message)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMessage(message.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Desktop Table */
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{message.name}</p>
                          <p className="text-sm text-gray-600">{message.email}</p>
                          {message.phone && (
                            <p className="text-sm text-gray-600">{message.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{message.subject}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(message.status)}>
                          {message.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(message.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewMessage(message)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMessage(message.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredMessages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No messages found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Message Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Customer Name</label>
                  <p className="text-sm">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm">{selectedMessage.email}</p>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm">{selectedMessage.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm">{new Date(selectedMessage.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <p className="text-sm">{selectedMessage.subject}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Message</label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => updateMessageStatus(selectedMessage.id, 'replied')}
                  disabled={selectedMessage.status === 'replied'}
                >
                  Mark as Replied
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Reply via Email
                </Button>
                {selectedMessage.phone && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`tel:${selectedMessage.phone}`)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminMessagesSection;
