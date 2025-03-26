import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Music, Save, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const formSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Song title must be at least 2 characters" }),
  artist: z
    .string()
    .min(2, { message: "Artist name must be at least 2 characters" }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MusicWishlistFormProps {
  onSubmit: (data: FormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const MusicWishlistForm: React.FC<MusicWishlistFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      artist: "",
      notes: "",
    },
  });

  const handleSubmit = (values: FormValues) => {
    try {
      onSubmit(values);
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to submit song request: ${error.message}`,
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add Song to Wishlist</CardTitle>
        <CardDescription>
          Suggest songs you'd like to hear at the wedding
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Song Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter song title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="artist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter artist name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why is this song special? (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us why you'd like to hear this song"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Share why this song is meaningful to you or the couple
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0 pt-4 flex justify-end space-x-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                <Music className="mr-2 h-4 w-4" />
                {isSubmitting ? "Adding..." : "Add to Wishlist"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MusicWishlistForm;
