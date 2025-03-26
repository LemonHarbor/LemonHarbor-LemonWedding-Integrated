import { useState, useEffect } from "react";
import { guestsApi } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface EmailLog {
  id: string;
  email: string;
  email_type: string;
  sent_at: string;
  guest_id: string;
  guests: {
    name: string;
    email: string;
  };
}

interface EmailLogViewerProps {
  guestId?: string;
  limit?: number;
}

export default function EmailLogViewer({
  guestId,
  limit = 10,
}: EmailLogViewerProps) {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [guestId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const fetchedLogs = await guestsApi.getEmailLogs(guestId);
      setLogs(fetchedLogs.slice(0, limit));
    } catch (error) {
      console.error("Error fetching email logs:", error);
      toast({
        title: "Error",
        description: "Failed to load email logs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEmailTypeBadge = (type: string) => {
    switch (type) {
      case "rsvp_reminder":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            RSVP Reminder
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            {type}
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <Loader2 className="h-6 w-6 text-rose-600 animate-spin" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">No email logs found.</div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Guest</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">
                {format(new Date(log.sent_at), "MMM d, yyyy h:mm a")}
              </TableCell>
              <TableCell>{log.guests?.name || "Unknown"}</TableCell>
              <TableCell>{log.email}</TableCell>
              <TableCell>{getEmailTypeBadge(log.email_type)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
