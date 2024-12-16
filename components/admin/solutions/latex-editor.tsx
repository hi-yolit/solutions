import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Calculator,
  Keyboard,
  X
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Latex from 'react-latex-next'
import 'katex/dist/katex.min.css'

interface MathKeyboardProps {
  onInsert: (text: string) => void;
  value: string;
  onChange: (value: string) => void;
}

const basicSymbols = [
  ['x²', 'x□', '√□', '∛□', 'a/b', 'log□', 'π', 'θ', '∞', '∫'],
  ['≥', '≤', '·', '÷', 'x°', '(□)', '⬚', '∘', 'f(x)', 'ln'],
  ['(□)′', '∂/∂x', '∫□', 'lim', '∑', 'sin', 'cos', 'tan', 'cot', 'e□']
];

const trigSymbols = [
  ['sin', 'cos', 'tan', 'cot', 'sec', 'csc'],
  ['sinh', 'cosh', 'tanh', 'coth', 'sech', 'csch'],
  ['arcsin', 'arccos', 'arctan', 'arccot', 'arcsec', 'arccsc']
];

const chemElements = [
  ['H', '', '', '', '', '', '', '', '', 'He'],
  ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'],
  ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'],
  ['K', 'Ca']
];

const calcButtons = [
  ['7', '8', '9', '÷'],
  ['4', '5', '6', '×'],
  ['1', '2', '3', '-'],
  ['0', '.', '=', '+']
];

export function MathKeyboard({ onInsert, value, onChange }: MathKeyboardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleInsert = (symbol: string) => {
    const textarea = document.getElementById('content-input') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = value.substring(0, start) + symbol + value.substring(end);
      onChange(newText);
      
      // Set cursor position after inserted symbol
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + symbol.length, start + symbol.length);
      }, 0);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Textarea
          id="content-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your content..."
          className="min-h-[100px] font-mono"
        />
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
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="trig">Trigonometry</TabsTrigger>
                <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
                <TabsTrigger value="calculator">Calculator</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-4">
                <div className="grid grid-cols-10 gap-2">
                  {basicSymbols.map((row, i) => (
                    <React.Fragment key={i}>
                      {row.map((symbol, j) => (
                        <Button
                          key={j}
                          variant="outline"
                          className="h-12"
                          onClick={() => handleInsert(symbol)}
                        >
                          <Latex>{symbol}</Latex>
                        </Button>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="trig" className="mt-4">
                <div className="grid grid-cols-6 gap-2">
                  {trigSymbols.map((row, i) => (
                    <React.Fragment key={i}>
                      {row.map((symbol, j) => (
                        <Button
                          key={j}
                          variant="outline"
                          className="h-12"
                          onClick={() => handleInsert(symbol)}
                        >
                          {symbol}
                        </Button>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="chemistry" className="mt-4">
                <div className="grid grid-cols-10 gap-2">
                  {chemElements.map((row, i) => (
                    <React.Fragment key={i}>
                      {row.map((element, j) => (
                        element ? 
                          <Button
                            key={j}
                            variant="outline"
                            className="h-12"
                            onClick={() => handleInsert(element)}
                          >
                            {element}
                          </Button>
                        : <div key={j} className="h-12" />
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="calculator" className="mt-4">
                <div className="grid grid-cols-4 gap-2">
                  {calcButtons.map((row, i) => (
                    <React.Fragment key={i}>
                      {row.map((btn, j) => (
                        <Button
                          key={j}
                          variant="outline"
                          className="h-12"
                          onClick={() => handleInsert(btn)}
                        >
                          {btn}
                        </Button>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}