"use client"

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown,
} from "lucide-react"
import { ContentEditor } from './content-editor'
import { ImageData, Step, Solution } from '@/types/editor'

const stepSchema = z.object({
  title: z.string().min(1, "Step title is required"),
  content: z.string().min(1, "Step content is required"),
  contentBlocks: z.array(z.object({
    type: z.enum(['text', 'image']),
    content: z.string(),
    imageData: z.object({
      url: z.string(),
      caption: z.string().optional(),
      position: z.enum(['above', 'below', 'inline'])
    }).optional()
  })),
  explanation: z.string().optional(),
  tip: z.string().optional(),
});

const solutionSchema = z.object({
  steps: z.array(stepSchema).min(1, "At least one step is required"),
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).default('PENDING'),
});

type SolutionFormData = z.infer<typeof solutionSchema>;

interface SolutionEditorProps {
  questionId: string;
  expertId: string;
  existingSolution?: Solution;
  onSave: (data: SolutionFormData) => Promise<void>;
  onCancel: () => void;
}

export function SolutionEditor({
  questionId,
  expertId,
  existingSolution,
  onSave,
  onCancel
}: SolutionEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SolutionFormData>({
    resolver: zodResolver(solutionSchema),
    defaultValues: {
      steps: existingSolution?.steps || [{
        title: "",
        content: "",
        contentBlocks: [],
        explanation: "",
        tip: "",
      }],
      verificationStatus: existingSolution?.verificationStatus || 'PENDING',
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "steps"
  });

  const handleSubmit = async (data: SolutionFormData) => {
    try {
      setIsSubmitting(true);
      await onSave(data);
    } catch (error) {
      console.error('Error saving solution:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Solution Steps</h3>
              <p className="text-sm text-muted-foreground">
                Break down your solution into clear, logical steps
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => append({
                title: "",
                content: "",
                contentBlocks: [],
                explanation: "",
                tip: "",
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Step {index + 1}</span>
                <div className="flex gap-2">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => move(index, index - 1)}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                  )}
                  {index < fields.length - 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => move(index, index + 1)}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                  )}
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name={`steps.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Name this step" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`steps.${index}.content`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <ContentEditor
                          value={field.value}
                          onChange={field.onChange}
                          error={form.formState.errors.steps?.[index]?.content?.message}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`steps.${index}.explanation`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Explanation (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Provide additional context or explanation..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`steps.${index}.tip`}
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
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Solution"}
          </Button>
        </div>
      </form>
    </Form>
  );
}