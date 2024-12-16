"use client"

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import Latex from 'react-latex-next'
import 'katex/dist/katex.min.css'
import { basicSymbols, trigSymbols, chemSymbols, templates } from '@/config/editor-symbols'
import { Keyboard } from 'lucide-react'

interface MathInputProps {
  onInsert: (latex: string) => void;
}

export function MathInput({ onInsert }: MathInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleInsert = (latex: string, wrapper: boolean) => {
    const insertText = wrapper ? `$${latex}$` : latex;
    onInsert(insertText);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Keyboard className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[400px]">
        <SheetHeader>
          <SheetTitle>Math & Chemistry Input</SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="basic" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Math</TabsTrigger>
            <TabsTrigger value="trig">Trigonometry</TabsTrigger>
            <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <ScrollArea className="h-[280px]">
              <div className="grid grid-cols-4 gap-2 p-4">
                {basicSymbols.map((symbol, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-12"
                    onClick={() => handleInsert(symbol.symbol, symbol.wrapper)}
                  >
                    <Latex>{`$${symbol.display}$`}</Latex>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="trig">
            <ScrollArea className="h-[280px]">
              <div className="grid grid-cols-3 gap-2 p-4">
                {trigSymbols.map((symbol, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-12"
                    onClick={() => handleInsert(symbol.symbol, symbol.wrapper)}
                  >
                    <Latex>{`$${symbol.display}$`}</Latex>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="chemistry">
            <ScrollArea className="h-[280px]">
              <div className="grid grid-cols-3 gap-2 p-4">
                {chemSymbols.map((symbol, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-12"
                    onClick={() => handleInsert(symbol.symbol, symbol.wrapper)}
                  >
                    <Latex>{`$${symbol.display}$`}</Latex>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="templates">
            <ScrollArea className="h-[280px]">
              <div className="grid gap-2 p-4">
                {templates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-16 flex flex-col"
                    onClick={() => handleInsert(template.symbol, template.wrapper)}
                  >
                    <span className="text-sm">{template.name}</span>
                    <Latex>{`$${template.symbol}$`}</Latex>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}