//actions/user.ts
'use server'

import { createClient, createServiceClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { UserRole, DatabaseError, ProfileWithMetadata } from '@/types/user'
import { PostgrestError } from '@supabase/supabase-js'


export async function getProfiles(): Promise<{ profiles?: ProfileWithMetadata[], error?: string }> {
  try {

    const { isAdmin, profile, error } = await verifyAdmin()

    if (!isAdmin && !profile) {
      return { error: error || 'Unauthorized - Admin access required' }
    }

    const supabase = await createClient()
    const serviceClient = await createServiceClient()

    const { data: profiles, error: profileError } = await supabase
      .from('profile')
      .select(`*`)
      .order('createdAt', { ascending: false })

    if (profileError) throw profileError

    const { data: { users }, error: usersError } = await serviceClient.auth.admin.listUsers()


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

    const { isAdmin, profile: adminProfile, error: adminError } = await verifyAdmin()

    if (!isAdmin && !adminProfile) {
        return { error: adminError || 'Unauthorized - Admin access required' }
    }
    
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
    const serviceClient = await createServiceClient()

    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select(`*`)
      .eq('id', userId)
      .single()

    if (profileError) throw profileError

    const { data: { user }, error: userError } = await serviceClient.auth.admin.getUserById(userId)

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

export async function verifyAdmin(): Promise<{ isAdmin: boolean; error?: string; profile?: ProfileWithMetadata }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.id) {
      return { isAdmin: false, error: 'Not authenticated' }
    }

    const { profile, error } = await getProfile(user.id)

    if (error || !profile) {
      return {
        isAdmin: false,
        error: error || 'Failed to fetch profile'
      }
    }

    return {
      isAdmin: profile.role === 'ADMIN',
      profile
    }
  } catch (error) {
    console.error('Error verifying admin:', error)
    const dbError = error as DatabaseError
    return {
      isAdmin: false,
      error: dbError.message || 'Failed to verify admin status'
    }
  }
}
