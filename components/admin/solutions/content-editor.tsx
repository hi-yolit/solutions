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
import 'katex/dist/katex.min.css'
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
  compact?: boolean;
  disableImages?: boolean;
}

const renderImage = (imageData: ImageData) => {
  const alignment = cn(
    "my-2 max-w-full",
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
        <p className="text-xs text-muted-foreground mt-1 text-center">
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
  error,
  compact = false,
  disableImages = false
}: ContentEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showFullToolbar, setShowFullToolbar] = useState(false);

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

  const prepareLatexText = (text: string) => {
    return text.replace(/\\([a-zA-Z]+)(\{[^}]*\})/g, '\\$1$2');
  };

  const renderContent = useCallback(() => {
    const segments = [];
    let lastIndex = 0;
    const pattern = /\[image\|(.*?)\]/g;
    let match;

    while ((match = pattern.exec(value)) !== null) {
      if (match.index > lastIndex) {
        const text = value.slice(lastIndex, match.index);
        segments.push(
          <span key={`text-${lastIndex}`}>
            <Latex>{prepareLatexText(text)}</Latex>
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

    if (lastIndex < value.length) {
      const text = value.slice(lastIndex);
      segments.push(
        <span key={`text-${lastIndex}`}>
          <Latex>{prepareLatexText(text)}</Latex>
        </span>
      );
    }

    return segments;
  }, [value]);

  const latexButtons = [
    { label: 'Italic', command: '\\textit{text}' },
    { label: 'Bold', command: '\\textbf{text}' },
    { label: 'Underline', command: '\\underline{text}' },
    { label: 'Fraction', command: '\\frac{a}{b}' },
    { label: 'Square root', command: '\\sqrt{x}' },
    { label: 'Subscript', command: 'x_{i}' },
    { label: 'Superscript', command: 'x^{n}' }
  ];

  const EditorToolbar = (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <MathInput onInsert={handleLatexInsert}/>
          {!disableImages && <ImageUploadDialog onImageAdd={handleImageAdd}/>}
        </div>
        {!compact && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullToolbar(!showFullToolbar)}
            >
              {showFullToolbar ? 'Simplify' : 'More Tools'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFullScreen(!isFullScreen)}
            >
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>
      
      {(!compact || showFullToolbar) && (
        <div className="flex flex-wrap gap-2">
          {latexButtons.map((btn) => (
            <Button 
              key={btn.label}
              variant="outline" 
              size="sm"
              onClick={() => handleLatexInsert(`$${btn.command}$`)}
              className={compact ? "h-8 px-2 text-xs" : ""}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  const EditorContent = (
    <div className={cn("space-y-4", className)}>
      {(!compact || showFullToolbar) && EditorToolbar}

      <div className={cn(
        "grid gap-4",
        compact ? "grid-cols-2 items-center" : "grid-cols-2"
      )}>
        <div className="flex-1">
          <Textarea
            id="content-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={compact ? "Enter text..." : "Enter your content with LaTeX..."}
            className={cn(
              "font-mono resize-none",
              compact ? "min-h-[40px] text-sm" : "min-h-[300px]",
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

        <div className="flex-1 relative">
          <div className={cn(
            "bg-slate-50 overflow-hidden flex flex-col",
            compact ? "border-none" : "border rounded-lg"
          )}>
            {!compact && (
              <div className="p-2 border-b bg-white">
                <p className="text-sm text-muted-foreground">Preview</p>
              </div>
            )}
            <div className={cn(
              "overflow-y-auto flex-1",
              compact ? "p-1 text-sm" : "p-4"
            )}>
              <div className={cn(
                "prose max-w-none dark:prose-invert clearfix",
                compact ? "prose-sm" : "prose-base"
              )}>
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
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
              Edit your content in full-screen mode
            </DialogDescription>
          </DialogHeader>
          {EditorContent}
        </DialogContent>
      </Dialog>
    );
  }

  return EditorContent;
}