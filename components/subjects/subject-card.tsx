// src/components/subjects/subject-card.tsx
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Subject } from '@/types'

interface SubjectCardProps {
  subject: Subject
}

export function SubjectCard({ subject }: SubjectCardProps) {
  return (
    <Link href={`/subjects/${subject.name.toLowerCase()}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {subject.name}
            <Badge>{subject.curriculumType}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Grades: {subject.grades.join(', ')}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}