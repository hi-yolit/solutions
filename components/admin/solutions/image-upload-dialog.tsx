"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ImageData, ImagePosition } from '@/types/editor'
import { Image as ImageIcon, Upload } from 'lucide-react'

interface ImageUploadDialogProps {
  onImageAdd: (imageData: ImageData) => void;
}

export function ImageUploadDialog({ onImageAdd }: ImageUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [position, setPosition] = useState<ImagePosition>('below');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // Here you would implement your file upload logic
      // For example using a cloud storage service
      const uploadedUrl = await uploadImage(file);
      setImageUrl(uploadedUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    // Implement your image upload logic here
    // This is just a placeholder that returns a fake URL
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(URL.createObjectURL(file));
      }, 1000);
    });
  };

  const handleSubmit = () => {
    if (!imageUrl) return;

    onImageAdd({
      url: imageUrl,
      caption,
      position,
    });
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setImageUrl('');
    setCaption('');
    setPosition('below');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <ImageIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="image-upload">Upload Image</Label>
            <div className="mt-2 flex items-center gap-4">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </>
                )}
              </Button>
            </div>
            {imageUrl && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-40 rounded-md"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="image-url">Or enter image URL</Label>
            <Input
              id="image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter image caption..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="position">Position</Label>
            <Select
              value={position}
              onValueChange={(value: ImagePosition) => setPosition(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Above Text</SelectItem>
                <SelectItem value="below">Below Text</SelectItem>
                <SelectItem value="inline">Inline with Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!imageUrl}>
              Add Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}