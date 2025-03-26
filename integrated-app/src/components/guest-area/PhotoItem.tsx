import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Photo } from "@/types/photo";
import { useRealtimePhotoComments } from "@/hooks/useRealtimePhotos";
import { addPhotoComment, deletePhotoComment } from "@/services/photoService";
import {
  MessageSquare,
  Send,
  Trash2,
  X,
  Loader2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface PhotoItemProps {
  photo: Photo;
  guestId?: string;
  onDelete?: (photoId: string) => void;
}

const PhotoItem: React.FC<PhotoItemProps> = ({ photo, guestId, onDelete }) => {
  const { toast } = useToast();
  const { comments, loading: commentsLoading } = useRealtimePhotoComments(
    photo.id,
  );
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim() || !guestId) {
      toast({
        variant: "destructive",
        title: "Comment Error",
        description: "Please enter a comment and ensure you're logged in.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addPhotoComment(photo.id, guestId, newComment.trim());
      setNewComment("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Comment Failed",
        description: `Error adding comment: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deletePhotoComment(commentId);
      toast({
        title: "Comment Deleted",
        description: "Your comment has been removed.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: `Error deleting comment: ${error.message}`,
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="relative">
          <img
            src={photo.url}
            alt={photo.caption || "Wedding photo"}
            className="w-full h-48 object-cover cursor-pointer"
            onClick={() => setShowFullImage(true)}
          />
          {onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
              onClick={() => onDelete(photo.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <CardContent className="p-4 flex-grow">
          {photo.caption && <p className="text-sm mb-2">{photo.caption}</p>}
          <p className="text-xs text-muted-foreground">
            Shared on {formatDate(photo.created_at)}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-col items-stretch gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {comments.length > 0
              ? `Comments (${comments.length})`
              : "Add Comment"}
          </Button>

          {showComments && (
            <div className="mt-2 space-y-4">
              <Separator />

              {/* Comment input */}
              {guestId && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                    disabled={isSubmitting}
                    className="flex-grow"
                  />
                  <Button
                    size="icon"
                    disabled={isSubmitting || !newComment.trim()}
                    onClick={handleAddComment}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}

              {/* Comments list */}
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {commentsLoading ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.guest_name.replace(
                            /\s+/g,
                            "",
                          )}`}
                          alt={comment.guest_name}
                        />
                        <AvatarFallback>
                          {comment.guest_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium">
                            {comment.guest_name}
                          </p>
                          {comment.guest_id === guestId && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <p className="text-sm">{comment.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Full image dialog */}
      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="sm:max-w-3xl p-1">
          <div className="relative">
            <img
              src={photo.url}
              alt={photo.caption || "Wedding photo"}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <DialogClose className="absolute top-2 right-2 rounded-full bg-background/80 p-1">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          {photo.caption && (
            <div className="p-4">
              <p className="text-sm">{photo.caption}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoItem;
