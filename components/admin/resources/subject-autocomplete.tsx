'use client'

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getSuggestedSubjects } from '@/actions/resources'

interface SubjectSelectProps {
  value: string
  onChange: (value: string) => void
}

export function SubjectSelect({ value, onChange }: SubjectSelectProps) {
  const [subjects, setSubjects] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isAddingNew, setIsAddingNew] = React.useState(false)
  const [newSubject, setNewSubject] = React.useState("")

  React.useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true)
        const { subjects: loadedSubjects } = await getSuggestedSubjects()
        setSubjects(loadedSubjects)
      } catch (error) {
        console.error('Failed to load subjects:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubjects()
  }, [])

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "new") {
      setIsAddingNew(true)
      setNewSubject("")
    } else {
      onChange(selectedValue)
    }
  }

  const handleAddNewSubject = () => {
    if (newSubject.trim()) {
      onChange(newSubject.trim())
      setSubjects(prev => [...prev, newSubject.trim()].sort())
      setIsAddingNew(false)
      setNewSubject("")
    }
  }

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading subjects..." />
        </SelectTrigger>
      </Select>
    )
  }

  if (isAddingNew) {
    return (
      <div className="flex gap-2">
        <Input
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="Enter new subject"
          className="flex-1"
        />
        <Button 
          onClick={handleAddNewSubject}
          disabled={!newSubject.trim()}
        >
          Add
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            setIsAddingNew(false)
            setNewSubject("")
          }}
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Select 
      value={value || undefined} 
      onValueChange={handleSelectChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a subject" />
      </SelectTrigger>
      <SelectContent>
        {subjects.map((subject) => (
          <SelectItem key={subject} value={subject}>
            {subject}
          </SelectItem>
        ))}
        <SelectItem value="new">Add New Subject</SelectItem>
      </SelectContent>
    </Select>
  )
}