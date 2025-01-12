"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
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
import { ImageData } from '@/types/editor'
import { Image as ImageIcon, Upload, Loader2, X } from 'lucide-react'
import { uploadImage } from '@/actions/upload-image'
import { toast } from '@/hooks/use-toast';

interface ImageUploadDialogProps {
  onImageAdd: (imageData: ImageData) => void;
}

export function ImageUploadDialog({ onImageAdd }: ImageUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [width, setWidth] = useState(100);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      setImageLoaded(false);

      const { url } = await uploadImage(file);
      setImageUrl(url);
      setImageLoaded(true);
    } catch (error) {
      toast({
        title: "Error",
        description: 'Failed to upload image',
        variant: "destructive",
      })
    } finally {
      setUploading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setError('Failed to load image. Please try again.');
    setImageUrl('');
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImageLoaded(false);
    setError(null);
  };

  const handleSubmit = () => {
    if (!imageUrl) return;

    onImageAdd({
      url: imageUrl,
      caption,
      alignment,
      width,
    });
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setImageUrl('');
    setCaption('');
    setAlignment('center');
    setWidth(100);
    setError(null);
    setImageLoaded(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
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
          <div className="flex justify-center">
            {imageUrl ? (
              <div className="relative">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-md">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-48 rounded-md object-contain"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{
                    visibility: imageLoaded ? 'visible' : 'hidden',
                    maxWidth: '100%'
                  }}
                />
                {imageLoaded && !uploading && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="w-full">
                <Label htmlFor="image-upload" className="block mb-2">Upload Image</Label>
                <div className="flex items-center gap-4">
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
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

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
            <Label htmlFor="alignment">Alignment</Label>
            <Select
              value={alignment}
              onValueChange={(value: 'left' | 'center' | 'right') => setAlignment(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Image Width</Label>
              <span className="text-sm text-muted-foreground">{width}%</span>
            </div><Slider
              value={[width]}
              onValueChange={(value: number[]) => setWidth(value[0])}
              min={25}
              max={100}
              step={25}
              className="my-4"
            />

          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!imageUrl || uploading || !imageLoaded}
            >
              Add Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}