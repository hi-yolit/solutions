'use client'

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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { updateProfileRole, getProfiles } from '@/actions/user'
import type { ProfileWithMetadata, UserRole } from '@/types/user'
import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function UsersPage() {
  const [users, setUsers] = useState<ProfileWithMetadata[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const { toast } = useToast()
  const { profile: currentUserProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function loadUsers() {
      try {
        const result = await getProfiles()
        if (result.error) throw new Error(result.error)
          console.log(result)
        setUsers(result.profiles?.filter(p => p.id !== currentUserProfile?.id) || [])
      } catch (error) {
        console.error('Error loading users:', error)
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (currentUserProfile?.role === 'ADMIN') {
      loadUsers()
    }
  }, [currentUserProfile, toast])

  // Redirect if not admin
  if (currentUserProfile && currentUserProfile.role !== 'ADMIN') {
    router.push('/')
    return null
  }

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      setUpdating(userId)
      const result = await updateProfileRole(userId, newRole)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      })
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
      }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const filteredUsers = users.filter(user => {
    const searchTerm = search.toLowerCase()
    return (
      user.user_metadata?.full_name?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.school?.toLowerCase().includes(searchTerm)
    )
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Users ({users.length})</h2>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.user_metadata?.full_name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "secondary" : "outline"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.school || 'N/A'}</TableCell>
                <TableCell>{user.grade || 'N/A'}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => 
                      handleUpdateRole(
                        user.id,
                        user.role === "ADMIN" ? "STUDENT" : "ADMIN"
                      )
                    }
                    disabled={updating === user.id}
                  >
                    {updating === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : user.role === "ADMIN" ? (
                      "Demote to Student"
                    ) : (
                      "Promote to Admin"
                    )}
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