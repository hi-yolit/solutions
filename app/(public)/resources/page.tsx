// src/app/resources/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const resources = {
  textbooks: [
    {
      title: 'Mind Action Series Mathematics',
      grade: 12,
      subject: 'Mathematics',
      publisher: 'Mind Action Series',
      curriculum: 'CAPS',
      year: 2023
    }
  ],
  pastPapers: [
    {
      title: 'Mathematics Paper 1',
      grade: 12,
      subject: 'Mathematics',
      curriculum: 'IEB',
      year: 2023,
      term: 2
    }
  ]
}

export default function ResourcesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Resources</h1>
      
      {/* Search */}
      <div className="mb-8">
        <Input placeholder="Search resources..." />
      </div>
      
      {/* Resource Tabs */}
      <Tabs defaultValue="textbooks">
        <TabsList>
          <TabsTrigger value="textbooks">Textbooks</TabsTrigger>
          <TabsTrigger value="pastPapers">Past Papers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="textbooks">
          <div className="grid gap-6">
            {resources.textbooks.map((book) => (
              <Card key={book.title}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {book.title}
                    <Badge>{book.curriculum}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <p>Grade {book.grade}</p>
                    <p>{book.subject}</p>
                    <p>{book.publisher}</p>
                    <p>{book.year}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="pastPapers">
          <div className="grid gap-6">
            {resources.pastPapers.map((paper) => (
              <Card key={paper.title}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {paper.title}
                    <Badge>{paper.curriculum}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <p>Grade {paper.grade}</p>
                    <p>{paper.subject}</p>
                    <p>Term {paper.term}</p>
                    <p>{paper.year}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}