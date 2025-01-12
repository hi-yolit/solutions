"use client"

import React, { useState, useCallback } from 'react';
import { Textarea } from "@/components/ui/textarea"
import { MathInput } from './math-input'
import { ImageUploadDialog } from './image-upload-dialog'
import { ImageData } from '@/types/editor'
import Latex from 'react-latex-next'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
}

const renderImage = (imageData: ImageData) => {
  const alignment = cn(
    "my-4 max-w-full",
    imageData.alignment === 'left' && "float-left mr-4",
    imageData.alignment === 'center' && "mx-auto block",
    imageData.alignment === 'right' && "float-right ml-4"
  );

  const width = imageData.width ? `${Math.min(Math.max(imageData.width, 25), 100)}%` : '100%';

  return (
    <div className={alignment} style={{ width }}>
      <img
        src={imageData.url}
        alt={imageData.caption || ''}
        className="rounded-lg w-full h-auto object-contain"
      />
      {imageData.caption && (
        <p className="text-sm text-muted-foreground mt-1 text-center">
          {imageData.caption}
        </p>
      )}
    </div>
  );
};

export function ContentEditor({ 
  value, 
  onChange,
  className,
  error 
}: ContentEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const handleLatexInsert = useCallback((latex: string) => {
    const textarea = document.getElementById('content-input') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newText = value.substring(0, start) + latex + value.substring(end);
      onChange(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + latex.length, start + latex.length);
      }, 0);
    }
  }, [value, onChange]);

  const handleImageAdd = useCallback((imageData: ImageData) => {
    const textarea = document.getElementById('content-input') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const imageMarker = `[image|${JSON.stringify(imageData)}]`;
      const newText = value.substring(0, start) + "\n" + imageMarker + "\n" + value.substring(end);
      
      onChange(newText);
    }
  }, [value, onChange]);

  const renderContent = useCallback(() => {
    const segments = [];
    let lastIndex = 0;
    const pattern = /\[image\|(.*?)\]/g;
    let match;

    while ((match = pattern.exec(value)) !== null) {
      // Add text before the image
      if (match.index > lastIndex) {
        const text = value.slice(lastIndex, match.index);
        segments.push(
          <span key={`text-${lastIndex}`}>
            <Latex>{text.replace(/\$([^$]+)\$/g, (match, p1) => `$${p1}$`)}</Latex>
          </span>
        );
      }

      try {
        const imageData = JSON.parse(match[1]) as ImageData;
        segments.push(
          <React.Fragment key={`image-${match.index}`}>
            {renderImage(imageData)}
          </React.Fragment>
        );
      } catch (e) {
        console.error('Failed to parse image data:', e);
      }

      lastIndex = pattern.lastIndex;
    }

    // Add remaining text after last image
    if (lastIndex < value.length) {
      const text = value.slice(lastIndex);
      segments.push(
        <span key={`text-${lastIndex}`}>
          <Latex>{text.replace(/\$([^$]+)\$/g, (match, p1) => `$${p1}$`)}</Latex>
        </span>
      );
    }

    return segments;
  }, [value]);

  const EditorToolbar = (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <MathInput onInsert={handleLatexInsert} />
        <ImageUploadDialog onImageAdd={handleImageAdd} />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsFullScreen(!isFullScreen)}
          aria-label={isFullScreen ? 'Exit full screen' : 'Enter full screen'}
        >
          {isFullScreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );

  const EditorContent = (
    <div className={cn("space-y-4", className)}>
      {EditorToolbar}

      <div className={cn(
        "grid gap-4",
        showPreview && "grid-cols-2"
      )}>
        <div className="flex-1">
          <Textarea
            id="content-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your content with LaTeX equations between $ symbols... You can also add images"
            className={cn(
              "min-h-[400px] font-mono resize-none",
              error && "border-red-500",
              isFullScreen && "min-h-[60vh]"
            )}
          />
          {error && (
            <span className="text-sm text-red-500 mt-1">
              {error}
            </span>
          )}
        </div>

        {showPreview && (
          <div className="flex-1 relative">
            <div className="absolute inset-0 border rounded-lg bg-slate-50 overflow-hidden flex flex-col">
              <div className="p-2 border-b bg-white">
                <p className="text-sm text-muted-foreground">Preview</p>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                <div className="prose prose-sm max-w-none dark:prose-invert clearfix">
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isFullScreen) {
    return (
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle>Content Editor</DialogTitle>
            <DialogDescription>
              Edit your content in full-screen mode. Press ESC to exit.
            </DialogDescription>
          </DialogHeader>
          {EditorContent}
        </DialogContent>
      </Dialog>
    );
  }

  return EditorContent;
}