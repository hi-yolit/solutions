// src/app/admin/verification/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const verifications = [
  {
    id: "1",
    solution: "Mathematics Grade 12 - Chapter 1, Question 3",
    expert: "Dr. Sarah Johnson",
    submitted: "2024-03-20",
    status: "pending"
  },
  // Add more sample verifications
]

export default function VerificationPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Solution Verifications</h2>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Solution</TableHead>
              <TableHead>Expert</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verifications.map((verification) => (
              <TableRow key={verification.id}>
                <TableCell className="font-medium">{verification.solution}</TableCell>
                <TableCell>{verification.expert}</TableCell>
                <TableCell>{verification.submitted}</TableCell>
                <TableCell>
                  <Badge variant={verification.status === "pending" ? "outline" : "default"}>
                    {verification.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm">
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}