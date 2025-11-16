import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Check, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ManageContacts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const { data } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setContacts(data);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated!" });
      loadContacts();
    }
  };

  const handleReply = (contact: any) => {
    setSelectedContact(contact);
    setReplyMessage("");
    setOpen(true);
  };

  const sendReply = async () => {
    // Call edge function to send email
    const { error } = await supabase.functions.invoke("send-contact-reply", {
      body: {
        to: selectedContact.email,
        name: selectedContact.name,
        message: replyMessage,
      },
    });

    if (error) {
      toast({ title: "Error sending email", description: error.message, variant: "destructive" });
    } else {
      await updateStatus(selectedContact.id, "replied");
      await supabase
        .from("contact_submissions")
        .update({ replied_at: new Date().toISOString() })
        .eq("id", selectedContact.id);
      toast({ title: "Reply sent successfully!" });
      setOpen(false);
      loadContacts();
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Contact Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell className="max-w-xs truncate">{contact.message}</TableCell>
                    <TableCell>
                      <Badge variant={contact.status === "pending" ? "default" : "secondary"}>
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(contact.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleReply(contact)}>
                          <Mail className="h-4 w-4" />
                        </Button>
                        {contact.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(contact.id, "archived")}>
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reply to {selectedContact?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Original Message</Label>
                <div className="p-3 bg-muted rounded-md text-sm">
                  {selectedContact?.message}
                </div>
              </div>
              <div>
                <Label>Your Reply</Label>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={6}
                  placeholder="Type your reply here..."
                />
              </div>
              <Button onClick={sendReply} className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Send Reply
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
