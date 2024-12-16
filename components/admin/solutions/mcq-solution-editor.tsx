"use client"

import { useFieldArray, useForm, FieldValues } from "react-hook-form"
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
  correctOptionId: string;
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
  correctOptionId: z.string().min(1, "Correct option is required"),
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
        { id: '1', label: 'A', content: '', explanation: '' },
        { id: '2', label: 'B', content: '', explanation: '' }
      ],
      correctOptionId: '',
      explanation: initialData?.explanation || '',
      tip: initialData?.tip || ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const correctOptionId = form.watch('correctOptionId');

  const handleSubmit = async (data: MCQFormValues) => {
    const correctOption = data.options.find(opt => opt.id === data.correctOptionId);
    
    if (!correctOption) {
      form.setError('correctOptionId', {
        message: "Please select the correct option"
      });
      return;
    }

    const solution: MCQSolution = {
      correctOption: correctOption.label,
      explanation: data.explanation,
      options: data.options,
      distractorExplanations: data.options
        .filter(opt => opt.id !== data.correctOptionId)
        .map(opt => ({
          option: opt.label,
          explanation: opt.explanation || ''
        })),
      tip: data.tip
    };

    await onSave(solution);
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
                onClick={() => append({
                  id: String(fields.length + 1),
                  label: String.fromCharCode(65 + fields.length),
                  content: '',
                  explanation: ''
                })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} 
                  className={`border rounded-lg p-4 space-y-4 ${
                    field.id === correctOptionId ? 'border-green-500 bg-green-50' : ''
                  }`}
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
                                <Input {...labelField} placeholder="e.g., A" className="w-20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {field.id === correctOptionId && (
                          <Badge className="bg-green-500">
                            <Check className="h-3 w-3 mr-1" />
                            Correct Answer
                          </Badge>
                        )}
                        <Button
                          type="button"
                          variant={field.id === correctOptionId ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => form.setValue('correctOptionId', field.id)}
                        >
                          {field.id === correctOptionId ? 'Correct Answer' : 'Set as Correct'}
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
                                onImageAdd={() => {}}
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
                                onImageAdd={() => {}}
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
                    onImageAdd={() => {}}
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