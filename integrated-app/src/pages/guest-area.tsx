import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Camera, Music } from "lucide-react";
import RSVPForm from "@/components/guest-area/RSVPForm";
import PhotoSharingSection from "@/components/guest-area/PhotoSharingSection";
import MusicWishlistSection from "@/components/guest-area/MusicWishlistSection";

const GuestArea = () => {
  // Mock guest ID for demo purposes - in a real app, this would come from auth context
  const [guestId, setGuestId] = useState<string | undefined>("guest-123");

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Guest Portal</h1>
          <p className="text-muted-foreground">
            Welcome to your wedding guest portal. Here you can RSVP, share
            photos, and suggest songs.
          </p>
        </div>

        <Tabs defaultValue="rsvp" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="rsvp" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              RSVP
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photo Sharing
            </TabsTrigger>
            <TabsTrigger value="music" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Music Wishlist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rsvp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>RSVP to the Wedding</CardTitle>
              </CardHeader>
              <CardContent>
                <RSVPForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <PhotoSharingSection guestId={guestId} isEditable={true} />
          </TabsContent>

          <TabsContent value="music" className="space-y-4">
            <MusicWishlistSection guestId={guestId} isEditable={true} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default GuestArea;
