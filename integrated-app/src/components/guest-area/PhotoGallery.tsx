import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useRealtimePhotos } from "@/hooks/useRealtimePhotos";
import { uploadPhoto, deletePhoto } from "@/services/photoService";
import { Photo } from "@/types/photo";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import PhotoItem from "./PhotoItem";

interface PhotoGalleryProps {
  guestId?: string;
  isEditable?: boolean;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  guestId,
  isEditable = true,
}) => {
  const { toast } = useToast();
  const { photos, loading } = useRealtimePhotos(guestId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !guestId) {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Please select a file and ensure you're logged in.",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please select a file smaller than 5MB.",
      });
      return;
    }

    // Validate file type
    const fileType = selectedFile.type;
    if (!fileType.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select an image file (JPEG, PNG, etc.).",
      });
      return;
    }

    setIsUploading(true);

    try {
      await uploadPhoto(selectedFile, guestId, caption);
      toast({
        title: "Upload Successful",
        description: "Your photo has been uploaded to the gallery.",
      });
      setSelectedFile(null);
      setCaption("");
      setShowUploadForm(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: `Error uploading photo: ${error.message}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deletePhoto(photoId);
      toast({
        title: "Photo Deleted",
        description: "The photo has been removed from the gallery.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: `Error deleting photo: ${error.message}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Photo Gallery</h2>
        {isEditable && (
          <Button
            onClick={() => setShowUploadForm(!showUploadForm)}
            variant={showUploadForm ? "outline" : "default"}
          >
            {showUploadForm ? (
              <>
                <X className="mr-2 h-4 w-4" /> Cancel
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" /> Add Photo
              </>
            )}
          </Button>
        )}
      </div>

      {showUploadForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <label htmlFor="photo-upload" className="text-sm font-medium">
                  Select Photo
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="truncate max-w-[150px]">
                        {selectedFile.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setSelectedFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid w-full gap-1.5">
                <label htmlFor="caption" className="text-sm font-medium">
                  Caption (Optional)
                </label>
                <Textarea
                  id="caption"
                  placeholder="Add a caption to your photo"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Upload Photo
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <PhotoItem
              key={photo.id}
              photo={photo}
              guestId={guestId}
              onDelete={isEditable ? handleDeletePhoto : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Photos Yet</h3>
          <p className="text-muted-foreground">
            {isEditable
              ? "Be the first to share a photo from the wedding!"
              : "No photos have been shared yet."}
          </p>
          {isEditable && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowUploadForm(true)}
            >
              <Camera className="mr-2 h-4 w-4" /> Add First Photo
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
