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
import { Plus, Trash2, GripVertical } from "lucide-react"
import { EssayOutlinePoint } from "@/types/solution"
import { ContentEditor } from './content-editor'

const essayOutlineSchema = z.object({
  title: z.string().min(1, "Point title is required"),
  content: z.string().min(1, "Content is required"),
  subPoints: z.array(z.string()).optional(),
  keyWords: z.array(z.string()).optional(),
  marks: z.number().optional(),
  explanation: z.string().optional(),
});

const essaySolutionSchema = z.array(essayOutlineSchema);

interface EssaySolutionEditorProps {
  initialData?: EssayOutlinePoint[];
  onSave: (data: EssayOutlinePoint[]) => Promise<void>;
}

export function EssaySolutionEditor({
  initialData,
  onSave
}: EssaySolutionEditorProps) {
  const form = useForm<{ points: EssayOutlinePoint[] }>({
    resolver: zodResolver(z.object({ points: essaySolutionSchema })),
    defaultValues: {
      points: initialData || [{
        title: "",
        content: "",
        subPoints: [],
        keyWords: []
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "points"
  });

  const addKeyWord = (index: number) => {
    const currentKeyWords = form.getValues(`points.${index}.keyWords`) || [];
    form.setValue(`points.${index}.keyWords`, [...currentKeyWords, ""]);
  };

  const addSubPoint = (index: number) => {
    const currentSubPoints = form.getValues(`points.${index}.subPoints`) || [];
    form.setValue(`points.${index}.subPoints`, [...currentSubPoints, ""]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => onSave(data.points))} className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id} className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Point {index + 1}</h3>
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
                name={`points.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Point</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`points.${index}.content`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Elaboration</FormLabel>
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

              {/* Sub Points */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel>Supporting Points</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSubPoint(index)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Point
                  </Button>
                </div>
                {form.watch(`points.${index}.subPoints`)?.map((_, subIndex) => (
                  <FormField
                    key={subIndex}
                    control={form.control}
                    name={`points.${index}.subPoints.${subIndex}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input {...field} placeholder="Supporting point..." />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentSubPoints = form.getValues(`points.${index}.subPoints`) || [];
                                form.setValue(
                                  `points.${index}.subPoints`,
                                  currentSubPoints.filter((_, i) => i !== subIndex)
                                );
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {/* Key Words */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel>Key Words</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addKeyWord(index)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Word
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch(`points.${index}.keyWords`)?.map((_, keyIndex) => (
                    <FormField
                      key={keyIndex}
                      control={form.control}
                      name={`points.${index}.keyWords.${keyIndex}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center gap-1">
                              <Input {...field} className="w-32" placeholder="Key word..." />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const currentKeyWords = form.getValues(`points.${index}.keyWords`) || [];
                                  form.setValue(
                                    `points.${index}.keyWords`,
                                    currentKeyWords.filter((_, i) => i !== keyIndex)
                                  );
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name={`points.${index}.marks`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marks (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
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
            content: "",
            subPoints: [],
            keyWords: []
          })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Main Point
        </Button>

        <div className="flex justify-end">
          <Button type="submit">Save Solution</Button>
        </div>
      </form>
    </Form>
  );
}