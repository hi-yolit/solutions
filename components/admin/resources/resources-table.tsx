"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Resource } from "@prisma/client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AddResourceForm } from "./add-resource-form"
import { useToast } from "@/hooks/use-toast"

interface ResourcesTableProps {
  initialResources: Resource[]
}

export function ResourcesTable({ initialResources }: ResourcesTableProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState<string | null>(null)
    const [curriculumFilter, setCurriculumFilter] = useState<string | null>(null)
    const [resources, setResources] = useState<Resource[]>(initialResources)

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(search.toLowerCase()) ||
            resource.subject.toLowerCase().includes(search.toLowerCase())
        const matchesType = !typeFilter || resource.type === typeFilter
        const matchesCurriculum = !curriculumFilter || resource.curriculum === curriculumFilter

        return matchesSearch && matchesType && matchesCurriculum
    })

    const handleResourceAdded = () => {
        setIsDialogOpen(false)
        router.refresh() // This will trigger a refresh of the server component
        toast({
            title: "Success",
            description: "Resource added successfully",
        })
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Resources</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Resource
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Add New Resource</DialogTitle>
                            <DialogDescription>
                                Add a new textbook, past paper, or study guide to the platform.
                            </DialogDescription>
                        </DialogHeader>
                        <AddResourceForm
                            onClose={() => setIsDialogOpen(false)}
                            onSuccess={handleResourceAdded}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        placeholder="Search resources..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select
                    value={typeFilter || "all"}
                    onValueChange={(value) => setTypeFilter(value === "all" ? null : value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Resource Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="TEXTBOOK">Textbook</SelectItem>
                        <SelectItem value="PAST_PAPER">Past Paper</SelectItem>
                        <SelectItem value="STUDY_GUIDE">Study Guide</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={curriculumFilter || "all"}
                    onValueChange={(value) => setCurriculumFilter(value === "all" ? null : value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Curriculum" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Curricula</SelectItem>
                        <SelectItem value="CAPS">CAPS</SelectItem>
                        <SelectItem value="IEB">IEB</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Resources Table */}
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Curriculum</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredResources.map((resource) => (
                            <TableRow key={resource.id}>
                                <TableCell className="font-medium">{resource.title}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {resource.type.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>{resource.subject}</TableCell>
                                <TableCell>{resource.grade}</TableCell>
                                <TableCell>{resource.curriculum}</TableCell>
                                <TableCell>{resource.year}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="default"
                                    >
                                        active
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/admin/resources/${resource.id}`)}
                                        >
                                            Manage
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}