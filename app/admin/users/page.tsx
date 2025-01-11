'use client'

import { useState, useEffect } from "react"
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
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'ADMIN' | 'USER'
  status: 'active' | 'inactive'
}

interface UserProfile {
  id: string
  full_name: string | null
  role: 'ADMIN' | 'USER'
}

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function loadUsers() {
      try {
        console.log('Fetching users...')
        // Get users from auth
        const { data, error: usersError } = await supabase.auth.admin.listUsers()
        
        if (usersError) {
          console.error('Auth error:', usersError)
          toast({
            title: "Error",
            description: usersError.message,
            variant: "destructive",
          })
          return
        }

        const authUsers = data.users as User[]
        console.log('Auth users:', authUsers)
        
        // Get profiles data
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .returns<UserProfile[]>()

        if (profilesError) {
          console.error('Profiles error:', profilesError)
          toast({
            title: "Error",
            description: profilesError.message,
            variant: "destructive",
          })
          return
        }

        const profiles = profilesData || []
        console.log('Profiles:', profiles)

        // Combine auth users with their profiles
        const combinedUsers: Profile[] = authUsers.map(authUser => {
          const profile = profiles.find(p => p.id === authUser.id)
          return {
            id: authUser.id,
            email: authUser.email || '',
            full_name: profile?.full_name || null,
            role: profile?.role || 'USER',
            status: authUser ? 'inactive' : 'active'
          }
        })

        setUsers(combinedUsers)
      } catch (error) {
        console.error('Unexpected error:', error)
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [supabase, toast])

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleUpdateRole = async (userId: string, newRole: 'ADMIN' | 'USER') => {
    setUpdating(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      })
    } catch (error) {
      console.error('Update error:', error)
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
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "secondary" : "outline"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === "active" ? "default" : "destructive"}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleUpdateRole(
                        user.id,
                        user.role === "ADMIN" ? "USER" : "ADMIN"
                      )
                    }
                    disabled={updating === user.id}
                  >
                    {updating === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : user.role === "ADMIN" ? (
                      "Demote to User"
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