// src/app/admin/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Shield, BookCheck } from "lucide-react"

const cards = [
  {
    label: "Total Users",
    number: "10,231",
    description: "+20.1% from last month",
    icon: Users
  },
  {
    label: "Total Solutions",
    number: "23,456",
    description: "+15.2% from last month",
    icon: BookCheck
  },
  {
    label: "Active Resources",
    number: "145",
    description: "Textbooks & Past Papers",
    icon: BookOpen
  },
  {
    label: "Pending Verifications",
    number: "23",
    description: "Requires review",
    icon: Shield
  }
]

export default function AdminPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Dashboard</h2>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {card.label}
              </CardTitle>
              <card.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.number}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}