import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRealtimeSongRequests } from "@/hooks/useRealtimeMusic";
import { addSongRequest, deleteSongRequest } from "@/services/musicService";
import { Music, Plus, X, Loader2 } from "lucide-react";
import MusicWishlistForm from "./MusicWishlistForm";
import MusicWishlistItem from "./MusicWishlistItem";

interface MusicWishlistSectionProps {
  guestId?: string;
  isEditable?: boolean;
}

const MusicWishlistSection: React.FC<MusicWishlistSectionProps> = ({
  guestId,
  isEditable = true,
}) => {
  const { toast } = useToast();
  const { songs, loading } = useRealtimeSongRequests(
    isEditable ? guestId : undefined,
  );
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSong = async (data: {
    title: string;
    artist: string;
    notes?: string;
  }) => {
    if (!guestId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to add songs to the wishlist.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addSongRequest(guestId, {
        title: data.title,
        artist: data.artist,
        notes: data.notes,
      });

      toast({
        title: "Song Added",
        description: "Your song has been added to the wishlist.",
      });

      setShowForm(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add song: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    try {
      await deleteSongRequest(songId);
      toast({
        title: "Song Removed",
        description: "The song has been removed from the wishlist.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to remove song: ${error.message}`,
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Music Wishlist</CardTitle>
          {isEditable && (
            <Button
              onClick={() => setShowForm(!showForm)}
              variant={showForm ? "outline" : "default"}
              size="sm"
            >
              {showForm ? (
                <>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Add Song
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showForm && (
          <MusicWishlistForm
            onSubmit={handleAddSong}
            onCancel={() => setShowForm(false)}
            isSubmitting={isSubmitting}
          />
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : songs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {songs.map((song) => (
              <MusicWishlistItem
                key={song.id}
                song={song}
                guestId={guestId}
                onDelete={isEditable ? handleDeleteSong : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <Music className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Songs Yet</h3>
            <p className="text-muted-foreground">
              {isEditable
                ? "Be the first to suggest a song for the wedding playlist!"
                : "No songs have been suggested yet."}
            </p>
            {isEditable && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowForm(true)}
              >
                <Music className="mr-2 h-4 w-4" /> Suggest First Song
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MusicWishlistSection;
