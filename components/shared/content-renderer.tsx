"use client"

import React from 'react'
import Latex from 'react-latex-next'
import { cn } from "@/lib/utils"
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ImageData {
  url: string;
  caption?: string;
  alignment: 'left' | 'center' | 'right';
  width: number;
}

interface ImageContainerProps {
  imageData: ImageData;
}

function ImageContainer({ imageData }: ImageContainerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const containerStyles = {
    width: `${Math.min(Math.max(imageData.width, 25), 100)}%`,
    maxWidth: '100%'
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div 
      className={cn(
        "relative",
        imageData.alignment === 'left' && "float-left mr-4",
        imageData.alignment === 'center' && "mx-auto block",
        imageData.alignment === 'right' && "float-right ml-4",
        "my-4"
      )}
      style={containerStyles}
    >
      <div className="relative w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        <img
          src={imageData.url}
          alt={imageData.caption || ''}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "rounded-lg w-full h-auto object-contain",
            isLoading && "invisible"
          )}
        />
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Failed to load image</p>
          </div>
        )}
      </div>
      {imageData.caption && !hasError && (
        <p className="text-sm text-muted-foreground mt-1 text-center">
          {imageData.caption}
        </p>
      )}
    </div>
  );
}

interface ContentRendererProps {
  content: string;
  className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  const segments = [];
  let lastIndex = 0;
  const pattern = /\[image\|(.*?)\]/g;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    // Add text before the image
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index);
      segments.push(
        <span key={`text-${lastIndex}`}>
          <Latex>{text}</Latex>
        </span>
      );
    }

    try {
      const imageData = JSON.parse(match[1]) as ImageData;
      segments.push(
        <React.Fragment key={`image-${match.index}`}>
          <ImageContainer imageData={imageData} />
        </React.Fragment>
      );
    } catch (e) {
      console.error('Failed to parse image data:', e);
    }

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text after last image
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex);
    segments.push(
      <span key={`text-${lastIndex}`}>
        <Latex>{text}</Latex>
      </span>
    );
  }

  return (
    <div className={cn(
      "prose max-w-none break-words overflow-hidden", 
      "after:content-[''] after:block after:clear-both",
      className
    )}>
      {segments}
    </div>
  );
}