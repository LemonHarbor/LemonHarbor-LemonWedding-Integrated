import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SongRequest } from "@/types/music";
import { Music, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MusicWishlistItemProps {
  song: SongRequest;
  guestId?: string;
  onDelete?: (songId: string) => void;
}

const MusicWishlistItem: React.FC<MusicWishlistItemProps> = ({
  song,
  guestId,
  onDelete,
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">{song.title}</h3>
            <p className="text-sm text-muted-foreground">{song.artist}</p>
          </div>
          <Badge variant={getStatusBadge(song.status)}>
            {song.status.charAt(0).toUpperCase() + song.status.slice(1)}
          </Badge>
        </div>

        {song.notes && (
          <div className="mt-2 mb-4">
            <p className="text-sm">{song.notes}</p>
          </div>
        )}

        <div className="flex items-center mt-4">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${song.guest_name?.replace(
                /\s+/g,
                "",
              )}`}
              alt={song.guest_name}
            />
            <AvatarFallback>
              {song.guest_name?.substring(0, 2).toUpperCase() || "GU"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">
              Suggested by {song.guest_name} on {formatDate(song.created_at)}
            </p>
          </div>

          {song.guest_id === guestId && onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(song.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Song
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MusicWishlistItem;
