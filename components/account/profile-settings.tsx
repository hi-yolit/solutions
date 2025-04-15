// app/(private)/account/components/profile-settings.tsx
'use client'

import { useEffect, useState } from 'react'
import { Profile } from '@/types/user'
import { updateUserProfile } from "@/actions/user"
import { getSuggestedSubjects } from "@/actions/resources"
import { useAuth } from '@/contexts/auth-context'
import { Loader2, School, GraduationCap, BookOpen, Check, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/multi-select"

export function ProfileSettings({ profile }: { profile: Profile }) {
  const { refreshAuth } = useAuth()
  const [school, setSchool] = useState(profile.school || '')
  const [grade, setGrade] = useState(profile.grade?.toString() || '')
  const [subjects, setSubjects] = useState(profile.subjects || [])
  const [suggestedSubjects, setSuggestedSubjects] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null)

  useEffect(() => {
    const loadSubjects = async () => {
      const result = await getSuggestedSubjects()
      if (result.subjects?.length) {
        setSuggestedSubjects(result.subjects)
      }
    }
    loadSubjects()
  }, [])

  const subjectOptions = [
    ...new Set([...suggestedSubjects, ...subjects])
  ].map(subject => ({ value: subject, label: subject }))

  const grades = Array.from({ length: 12 }, (_, i) => i + 1)

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)
      setSaveStatus(null)
      const gradeNum = grade ? parseInt(grade) : null
      const result = await updateUserProfile({ school, grade: gradeNum, subjects })
      
      if (result.error) throw new Error(result.error)
      await refreshAuth()
      
      setSaveStatus('success')
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setSaveStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your educational details to help us provide relevant content
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="school" className="flex items-center gap-2">
              <School className="h-4 w-4" /> School
            </Label>
            <Input
              id="school"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Enter your school name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Grade
            </Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger id="grade">
                <SelectValue placeholder="Select your grade" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((g) => (
                  <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjects" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Subjects
            </Label>
            <MultiSelect
              defaultValue={subjects}
              onValueChange={setSubjects}
              options={subjectOptions}
              placeholder="Select your subjects"
              variant="inverted"
              animation={2}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Select subjects you&apos;re interested in or type a new one
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center">
          {saveStatus === 'success' && (
            <div className="flex items-center text-green-600 text-sm">
              <Check className="h-4 w-4 mr-1" />
              <span>Profile updated</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center text-red-600 text-sm">
              <X className="h-4 w-4 mr-1" />
              <span>Failed to update</span>
            </div>
          )}
        </div>

        <Button onClick={handleSaveProfile} disabled={isLoading} className="ml-auto">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  )
}