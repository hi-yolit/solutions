"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Plus, Trash2, Check } from "lucide-react"
import { MCQSolution } from '@/types/solution'
import { ContentEditor } from './content-editor'
import Latex from 'react-latex-next'
import { useEffect } from "react"

// Define the shape of an option
interface MCQOption {
  id: string;
  label: string;
  content: string;
  explanation?: string;
}

// Define the form values type
interface MCQFormValues {
  options: MCQOption[];
  correctOptionLabel: string;
  explanation: string;
  tip?: string;
}

const mcqSchema = z.object({
  options: z.array(z.object({
    id: z.string(),
    label: z.string().min(1, "Option label is required"),
    content: z.string().min(1, "Option content is required"),
    explanation: z.string().optional(),
  })).min(2, "At least two options are required"),
  correctOptionLabel: z.string().min(1, "Correct option is required"),
  explanation: z.string().min(1, "Main explanation is required"),
  tip: z.string().optional(),
});

interface MCQSolutionEditorProps {
  initialData?: MCQSolution;
  onSave: (data: MCQSolution) => Promise<void>;
}

export function MCQSolutionEditor({ initialData, onSave }: MCQSolutionEditorProps) {
  const form = useForm<MCQFormValues>({
    resolver: zodResolver(mcqSchema),
    defaultValues: {
      options: initialData?.options || [
        {
          id: crypto.randomUUID(),
          label: 'A',
          content: '',
          explanation: ''
        },
        {
          id: crypto.randomUUID(),
          label: 'B',
          content: '',
          explanation: ''
        }
      ],
      correctOptionLabel: initialData?.correctOption || 'A',
      explanation: initialData?.explanation || '',
      tip: initialData?.tip || ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const handleAddOption = () => {
    const newOptionLabel = String.fromCharCode(65 + fields.length);
    append({
      id: crypto.randomUUID(),
      label: newOptionLabel,
      content: '',
      explanation: ''
    });
  };

  const handleSubmit = async (data: MCQFormValues) => {
    try {
      // Find the correct option
      const correctOption = data.options.find(opt => opt.label === data.correctOptionLabel);
      
      if (!correctOption) {
        form.setError('correctOptionLabel', {
          message: "Please select a valid correct option"
        });
        return;
      }

      const solution: MCQSolution = {
        options: data.options,
        correctOption: data.correctOptionLabel,
        explanation: data.explanation,
        distractorExplanations: data.options
          .filter(opt => opt.label !== data.correctOptionLabel)
          .map(opt => ({
            option: opt.label,
            explanation: opt.explanation || ''
          })),
        tip: data.tip
      };

      await onSave(solution);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <FormLabel>Options</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                disabled={fields.length >= 6}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div 
                  key={field.id}
                  className={`
                    border rounded-lg p-4 space-y-4 
                    ${form.watch('correctOptionLabel') === field.label 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200'}
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <FormField
                          control={form.control}
                          name={`options.${index}.label`}
                          render={({ field: labelField }) => (
                            <FormItem className="flex-shrink-0">
                              <FormControl>
                                <Input {...labelField} placeholder="e.g., A" className="w-20" readOnly />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {form.watch('correctOptionLabel') === field.label && (
                          <Badge className="bg-green-500">
                            <Check className="h-3 w-3 mr-1" />
                            Correct Answer
                          </Badge>
                        )}
                        <Button
                          type="button"
                          variant={
                            form.watch('correctOptionLabel') === field.label 
                              ? "secondary" 
                              : "outline"
                          }
                          size="sm"
                          onClick={() => form.setValue('correctOptionLabel', field.label)}
                        >
                          {form.watch('correctOptionLabel') === field.label 
                            ? 'Correct Answer' 
                            : 'Set as Correct'}
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name={`options.${index}.content`}
                        render={({ field: contentField }) => (
                          <FormItem>
                            <FormLabel>Option Content</FormLabel>
                            <FormControl>
                              <ContentEditor
                                value={contentField.value}
                                onChange={contentField.onChange}
                                onImageAdd={() => { }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`options.${index}.explanation`}
                        render={({ field: explanationField }) => (
                          <FormItem>
                            <FormLabel>Option-specific Explanation</FormLabel>
                            <FormControl>
                              <ContentEditor
                                value={explanationField.value || ''}
                                onChange={explanationField.onChange}
                                onImageAdd={() => { }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {fields.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <FormField
            control={form.control}
            name="explanation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Explanation</FormLabel>
                <FormControl>
                  <ContentEditor
                    value={field.value}
                    onChange={field.onChange}
                    onImageAdd={() => { }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <Card className="p-6">
          <FormField
            control={form.control}
            name="tip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Helpful Tip (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Add a helpful tip..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Save Solution</Button>
        </div>
      </form>
    </Form>
  );
}