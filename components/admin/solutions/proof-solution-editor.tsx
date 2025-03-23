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
import { ProofStep } from "@/types/solution"
import { ContentEditor } from './content-editor'

const proofStepSchema = z.object({
  title: z.string().min(1, "Step title is required"),
  statement: z.string().min(1, "Statement is required"),
  justification: z.string().min(1, "Justification is required"),
  hint: z.string().optional(),
});

const proofSolutionSchema = z.array(proofStepSchema);

interface ProofSolutionEditorProps {
  initialData?: ProofStep[];
  onSave: (data: ProofStep[]) => Promise<void>;
}

export function ProofSolutionEditor({
  initialData,
  onSave
}: ProofSolutionEditorProps) {
  const form = useForm<{ steps: ProofStep[] }>({
    resolver: zodResolver(z.object({ steps: proofSolutionSchema })),
    defaultValues: {
      steps: initialData || [{
        title: "",
        statement: "",
        justification: "",
        hint: ""
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
                    <FormLabel>Step Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`steps.${index}.statement`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statement</FormLabel>
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
                name={`steps.${index}.justification`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Justification</FormLabel>
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
                name={`steps.${index}.hint`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hint (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => append({
            title: "",
            statement: "",
            justification: "",
            hint: ""
          })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>

        <div className="flex justify-end">
          <Button type="submit">Save Solution</Button>
        </div>
      </form>
    </Form>
  );
}