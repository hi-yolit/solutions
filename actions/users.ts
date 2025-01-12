'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { UserRole, DatabaseError, ProfileWithMetadata } from '@/types/user'
import { PostgrestError } from '@supabase/supabase-js'



export async function getProfiles(): Promise<{ profiles?: ProfileWithMetadata[], error?: string }> {
  try {
    const supabase = await createClient()
    const adminAuthClient = supabase.auth.admin


    const { data: profiles, error: profileError } = await supabase
      .from('profile')
      .select(`*`)
      .order('createdAt', { ascending: false })

    if (profileError) throw profileError

    const { data: { users }, error: usersError } = await adminAuthClient.listUsers()
    
    
    if (usersError) throw usersError

    const combinedProfiles = profiles.map(profile => {
      const user = users.find(u => u.id === profile.id)
      return {
        ...profile,
        email: user?.email,
        user_metadata: user?.user_metadata
      }
    })


    return { profiles: combinedProfiles }
  } catch (error) {
    console.error('Error:', error)
    const dbError = error as DatabaseError
    return { error: dbError.message || 'Failed to fetch profiles' }
  }
}

export async function updateProfileRole(id: string, role: UserRole): Promise<{ profile?: ProfileWithMetadata, error?: string }> {
  try {
    const supabase = await createClient()

    const { data: profile, error } = await supabase
      .from('profile')
      .update({ role })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/users')
    return { profile }
  } catch (error) {
    console.error('Error:', error)
    const dbError = error as PostgrestError
    return { error: dbError.message || 'Failed to update profile' }
  }
}

export async function getProfile(userId: string): Promise<{ profile?: ProfileWithMetadata, error?: string }> {
  try {
    const supabase = await createClient()
    const adminAuthClient = supabase.auth.admin

    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select(`*`)
      .eq('id', userId)
      .single()

    if (profileError) throw profileError

    const { data: { user }, error: userError } = await adminAuthClient.getUserById(userId)
    
    if (userError) throw userError

    const profileWithMetadata = {
      ...profile,
      email: user?.email,
      user_metadata: user?.user_metadata
    }

    return { profile: profileWithMetadata }
  } catch (error) {
    console.error('Error:', error)
    const dbError = error as DatabaseError
    return { error: dbError.message || 'Failed to fetch profile' }
  }
}