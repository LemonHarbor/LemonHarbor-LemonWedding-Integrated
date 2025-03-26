import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PhotoGallery from "./PhotoGallery";

interface PhotoSharingSectionProps {
  guestId?: string;
  isEditable?: boolean;
}

const PhotoSharingSection: React.FC<PhotoSharingSectionProps> = ({
  guestId,
  isEditable = true,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Wedding Photos</CardTitle>
      </CardHeader>
      <CardContent>
        <PhotoGallery guestId={guestId} isEditable={isEditable} />
      </CardContent>
    </Card>
  );
};

export default PhotoSharingSection;
