
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Eye, Mail, User, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const AdminMessagesDetail = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

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
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(message => message.status === statusFilter);
    }

    setFilteredMessages(filtered);
  };

  const handleStatusUpdate = async (messageId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: "Message status has been updated successfully.",
        variant: "default"
      });

      fetchMessages();
    } catch (error) {
      console.error('Error updating message status:', error);
      toast({
        title: "Error",
        description: "Failed to update message status.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageToDelete.id);

      if (error) throw error;

      toast({
        title: "Message deleted",
        description: "Message has been deleted successfully.",
        variant: "default"
      });

      setIsDeleteDialogOpen(false);
      setMessageToDelete(null);
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'unread': return 'bg-red-500';
      case 'read': return 'bg-blue-500';
      case 'replied': return 'bg-green-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading messages...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Messages Management</CardTitle>
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
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <Card key={message.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{message.name}</span>
                    <Badge className={getStatusColor(message.status)}>
                      {message.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-gray-500" />
                        <span>{message.email}</span>
                      </div>
                      {message.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">📞</span>
                          <span>{message.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span>{new Date(message.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-medium text-sm mb-1">Subject:</h4>
                    <p className="text-sm">{message.subject}</p>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-medium text-sm mb-1">Message:</h4>
                    <p className="text-sm text-gray-700 line-clamp-3">{message.message}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedMessage(message);
                      setIsDetailDialogOpen(true);
                      if (message.status === 'unread') {
                        handleStatusUpdate(message.id, 'read');
                      }
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Select
                    value={message.status}
                    onValueChange={(value) => handleStatusUpdate(message.id, value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setMessageToDelete(message);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No messages found matching your criteria.
          </div>
        )}

        {/* Message Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Message Details</DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Customer Name:</h4>
                    <p>{selectedMessage.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Email:</h4>
                    <p>{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <h4 className="font-medium mb-1">Phone:</h4>
                      <p>{selectedMessage.phone}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium mb-1">Date:</h4>
                    <p>{new Date(selectedMessage.created_at).toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Subject:</h4>
                  <p className="p-3 bg-gray-50 rounded">{selectedMessage.subject}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Message:</h4>
                  <p className="p-3 bg-gray-50 rounded whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Message Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Message</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this message from {messageToDelete?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteMessage}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminMessagesDetail;
