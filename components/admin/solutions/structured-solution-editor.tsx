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
import { Plus, Trash2 } from "lucide-react"
import { StructuredStep } from "@/types/solution"
import { ContentEditor } from './content-editor'

const structuredStepSchema = z.object({
  title: z.string().min(1, "Step title is required"),
  content: z.string().min(1, "Step content is required"),
  explanation: z.string().optional(),
  marks: z.number().optional(),
  hint: z.string().optional()
})

const structuredSolutionSchema = z.array(structuredStepSchema);

interface StructuredSolutionEditorProps {
  initialData?: StructuredStep[];
  onSave: (data: StructuredStep[]) => Promise<void>;
}

export function StructuredSolutionEditor({ 
  initialData, 
  onSave 
}: StructuredSolutionEditorProps) {
  const form = useForm<{ steps: StructuredStep[] }>({
    resolver: zodResolver(z.object({ steps: structuredSolutionSchema })),
    defaultValues: {
      steps: initialData || [{
        title: "",
        content: "",
        explanation: "",
        hint: "",
        marks: undefined
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps"
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => onSave(data.steps))} className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id} className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Step {index + 1}</h3>
              {fields.length > 1 && (
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

            <div className="space-y-4">
              <FormField
                control={form.control}
                name={`steps.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter step title" />
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
                    <FormLabel>Explanation (Optional)</FormLabel>
                    <FormControl>
                      <ContentEditor
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`steps.${index}.hint`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hint (Optional)</FormLabel>
                    <FormControl>
                      <ContentEditor
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`steps.${index}.marks`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marks (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Enter marks"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>
        ))}

        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ 
              title: "", 
              content: "",
              explanation: "",
              hint: "",
              marks: undefined
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>

          <Button type="submit">Save Solution</Button>
        </div>
      </form>
    </Form>
  );
}