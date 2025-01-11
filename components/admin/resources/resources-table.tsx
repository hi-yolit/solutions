// components/admin/resources/resources-table.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Resource, ResourceType, ResourceStatus } from "@prisma/client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import { Switch } from "@/components/ui/switch"
import { AddResourceForm } from "./add-resource-form"
import { EditResourceForm } from "./edit-resource-form"
import { deleteResource, updateResourceStatus } from "@/actions/resources"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { FAB } from "@/components/ui/fab"

interface ResourcesTableProps {
    initialResources: Resource[]
}

export function ResourcesTable({ initialResources }: ResourcesTableProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingResource, setEditingResource] = useState<Resource | null>(null)
    const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
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

    const handleStatusToggle = async (resourceId: string, currentStatus: ResourceStatus) => {
        const newStatus = currentStatus === ResourceStatus.LIVE
            ? ResourceStatus.DRAFT
            : ResourceStatus.LIVE

        const result = await updateResourceStatus(resourceId, newStatus)

        if (result.error) {
            toast({
                title: "Error",
                description: "Failed to update resource status",
                variant: "destructive"
            })
            return
        }

        setResources(resources.map(resource =>
            resource.id === resourceId
                ? { ...resource, status: newStatus }
                : resource
        ))

        toast({
            title: "Success",
            description: "Resource status updated successfully"
        })
    }

    const handleDelete = async () => {
        if (!resourceToDelete) return

        try {
            const result = await deleteResource(resourceToDelete.id)
            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive"
                })
                return
            }

            toast({
                title: "Success",
                description: "Resource deleted successfully"
            })
            router.refresh()
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive"
            })
        } finally {
            setDeleteDialogOpen(false)
            setResourceToDelete(null)
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Resources</h2>
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
                            <TableHead>Details</TableHead>
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
                                <TableCell className="text-sm text-muted-foreground">
                                    {resource.type === 'TEXTBOOK' ? (
                                        <>
                                            {resource.publisher && `${resource.publisher}`}
                                            {resource.edition && ` • ${resource.edition} Edition`}
                                        </>
                                    ) : (
                                        <>
                                            {resource.year}
                                            {resource.term && ` • Term ${resource.term}`}
                                        </>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={resource.status === 'LIVE'}
                                            onCheckedChange={() =>
                                                handleStatusToggle(resource.id, resource.status)
                                            }
                                        />
                                        <span className={cn(
                                            "text-sm",
                                            resource.status === 'LIVE'
                                                ? "text-green-600"
                                                : "text-muted-foreground"
                                        )}>
                                            {resource.status}
                                        </span>
                                    </div>
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
                                            onClick={() => {
                                                setEditingResource(resource)
                                                setIsEditDialogOpen(true)
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                setResourceToDelete(resource)
                                                setDeleteDialogOpen(true)
                                            }}
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

            {/* Add Resource Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add New Resource</DialogTitle>
                        <DialogDescription>
                            Add a new textbook, past paper, or study guide to the platform.
                        </DialogDescription>
                    </DialogHeader>
                    <AddResourceForm
                        onClose={() => setIsAddDialogOpen(false)}
                        onSuccess={() => {
                            setIsAddDialogOpen(false)
                            router.refresh()
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Resource Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Resource</DialogTitle>
                    </DialogHeader>
                    {editingResource && (
                        <EditResourceForm
                            resource={editingResource}
                            onClose={() => setIsEditDialogOpen(false)}
                            onSuccess={() => {
                                setIsEditDialogOpen(false)
                                router.refresh()
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this resource
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            <FAB
                onClick={() => setIsAddDialogOpen(true)}
                text="Add Resource"
            />

        </div>
    )
}