// components/admin/resources/unified-solution-editor.tsx
"use client"

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
import { Label } from "@/components/ui/label"
import { 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  MoveUp, 
  MoveDown,
  Calculator 
} from "lucide-react"

// Define field types
type StepField = {
  title: string;
  content: string;
  explanation?: string;
  latex?: string;
  imageUrl?: string;
  tip?: string;
}

type MarkingField = {
  title: string;
  content: string;
}

// Schema
const stepSchema = z.object({
  title: z.string().min(1, "Step title is required"),
  content: z.string().min(1, "Step content is required"),
  explanation: z.string().optional(),
  latex: z.string().optional(),
  imageUrl: z.string().optional(),
  tip: z.string().optional(),
})

const markingPointSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
})

const solutionSchema = z.object({
  steps: z.array(stepSchema).min(1, "At least one step is required"),
  markingPoints: z.array(markingPointSchema),
  finalAnswer: z.string().min(1, "Final answer is required"),
  expertNotes: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
})

type SolutionFormData = z.infer<typeof solutionSchema>

interface UnifiedSolutionEditorProps {
  questionId: string
  questionType: string
  existingSolution?: SolutionFormData
  onSave: (data: SolutionFormData, isDraft: boolean) => Promise<void>
  onChange?: () => void
  isSubmitting?: boolean
}

export function UnifiedSolutionEditor({
  questionId,
  questionType,
  existingSolution,
  onSave,
  onChange,
  isSubmitting = false,
}: UnifiedSolutionEditorProps) {
  const form = useForm<SolutionFormData>({
    resolver: zodResolver(solutionSchema),
    defaultValues: {
      steps: existingSolution?.steps || [{
        title: "",
        content: "",
        explanation: "",
        latex: "",
        imageUrl: "",
        tip: "",
      }],
      markingPoints: existingSolution?.markingPoints || [{
        title: "",
        content: "",
      }],
      finalAnswer: existingSolution?.finalAnswer || "",
      expertNotes: existingSolution?.expertNotes || "",
      status: existingSolution?.status || 'draft',
    },
  })

  const { fields: stepFields, append: appendStep, remove: removeStep, move: moveStep } = useFieldArray<SolutionFormData>({
    control: form.control,
    name: "steps"
  })

  const { fields: markingFields, append: appendMarking, remove: removeMarking } = useFieldArray<SolutionFormData>({
    control: form.control,
    name: "markingPoints"
  })

  async function onSubmit(data: SolutionFormData) {
    try {
      await onSave(data, false)
    } catch (error) {
      console.error('Error saving solution:', error)
    }
  }

  const addNewStep = () => {
    appendStep({
      title: "",
      content: "",
      //explanation: "",
      //latex: "",
      //imageUrl: "",
      //tip: "",
    })
  }

  const handleImageUpload = async (index: number) => {
    // Implement image upload logic here
    console.log("Upload image for step", index)
  }

  const handleAddEquation = (index: number) => {
    // Implement equation editor logic here
    console.log("Add equation to step", index)
  }
  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        onChange={onChange}
        className="space-y-6"
      >
        {/* Solution Steps */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Solution Steps</h3>
              <p className="text-sm text-muted-foreground">
                Break down the solution into clear steps
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addNewStep}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>

          {stepFields.map((field, index) => (
            <Card key={field.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Step {index + 1}</span>
                <div className="flex gap-2">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveStep(index, index - 1)}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                  )}
                  {index < stepFields.length - 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveStep(index, index + 1)}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                  )}
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(index)}
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
                      <FormLabel>Step Title</FormLabel>
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
                      <div className="space-y-2">
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Explain this step..."
                          />
                        </FormControl>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleImageUpload(index)}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Add Image
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAddEquation(index)}
                          >
                            <Calculator className="h-4 w-4 mr-2" />
                            Add Equation
                          </Button>
                        </div>
                      </div>
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
                          rows={2}
                          placeholder="Provide additional context or explanation..."
                        />
                      </FormControl>
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
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Final Answer */}
        <Card className="p-6">
          <FormField
            control={form.control}
            name="finalAnswer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Final Answer</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={2}
                    placeholder="Provide the final answer..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        {/* Marking Points */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Marking Points</h3>
                <p className="text-sm text-muted-foreground">
                  List the key points for marking
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => appendMarking({
                  title: "",
                  content: ""
                })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Point
              </Button>
            </div>

            {markingFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <FormField
                    control={form.control}
                    name={`markingPoints.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Point title..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`markingPoints.${index}.content`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Point description..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMarking(index)}
                    className="text-red-500 self-start"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Expert Notes */}
        <Card className="p-6">
          <FormField
            control={form.control}
            name="expertNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expert Notes (Optional)</FormLabel>
                <FormDescription>
                  Add any additional notes, common mistakes, or teaching tips
                </FormDescription>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Add expert notes..."
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSave(form.getValues(), true)}
            disabled={isSubmitting}
          >
            Save as Draft
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Publish"}
          </Button>
        </div>
      </form>
    </Form>
  )
}