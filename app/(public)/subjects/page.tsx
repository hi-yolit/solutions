// src/app/subjects/page.tsx
import { SubjectCard } from '@/components/subjects/subject-card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Subject, CurriculumType } from '@/types'

const subjects: Subject[] = [
  {
    name: 'Mathematics',
    grades: [8, 9, 10, 11, 12],
    curriculumType: 'CAPS' as CurriculumType
  },
  {
    name: 'Physical Sciences',
    grades: [10, 11, 12],
    curriculumType: 'IEB' as CurriculumType
  },
  // Add more subjects
]

export default function SubjectsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Subjects</h1>
      
      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <div className="w-[200px]">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Grade" />
            </SelectTrigger>
            <SelectContent>
              {[8, 9, 10, 11, 12].map((grade) => (
                <SelectItem key={grade} value={grade.toString()}>
                  Grade {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-[200px]">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Curriculum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CAPS">CAPS</SelectItem>
              <SelectItem value="IEB">IEB</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <Input placeholder="Search subjects..." />
        </div>
      </div>
      
      {/* Subject Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <SubjectCard key={subject.name} subject={subject} />
        ))}
      </div>
    </div>
  )
}