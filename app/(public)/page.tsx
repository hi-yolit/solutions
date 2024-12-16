// src/app/page.tsx
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold text-center mb-6">
        South African Textbook Solutions
      </h1>
      <p className="text-xl text-gray-600 text-center mb-8 max-w-2xl">
        Expert-verified solutions for CAPS and IEB textbooks and past papers
      </p>
      <div className="flex gap-4">
        <Link href="/subjects">
          <Button size="lg">Browse Subjects</Button>
        </Link>
        <Link href="/auth/register">
          <Button size="lg" variant="outline">Get Started</Button>
        </Link>
      </div>
    </div>
  )
}