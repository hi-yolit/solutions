"use client"

import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea"
import { MathInput } from './math-input'
import { ImageUploadDialog } from './image-upload-dialog'
import { ImageData } from '@/types/editor'
import Latex from 'react-latex-next'
import { cn } from "@/lib/utils"

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageAdd: (imageData: ImageData) => void;
  className?: string;
  error?: string;
}

export function ContentEditor({ 
  value, 
  onChange, 
  onImageAdd,
  className,
  error 
}: ContentEditorProps) {
  const handleLatexInsert = (latex: string) => {
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
  };

  const handlePreview = () => {
    return value.replace(/\$([^$]+)\$/g, (match, p1) => `$${p1}$`);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            id="content-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your content with LaTeX equations between $ symbols..."
            className={cn(
              "min-h-[100px] font-mono",
              error && "border-red-500"
            )}
          />
          {error && (
            <span className="text-sm text-red-500 mt-1">
              {error}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <MathInput onInsert={handleLatexInsert} />
          <ImageUploadDialog onImageAdd={onImageAdd} />
        </div>
      </div>
      
      {value && (
        <div className="p-4 bg-slate-50 rounded-lg min-h-[50px]">
          <p className="text-sm text-slate-500 mb-2">Preview:</p>
          <div className="prose max-w-none">
            <Latex>{handlePreview()}</Latex>
          </div>
        </div>
      )}
    </div>
  );
}