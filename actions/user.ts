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
    const serviceClient = createServiceClient()

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
    const serviceClient = createServiceClient()

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

export async function useSolutionCredit() {
  try {
    const supabase =  createServiceClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user?.id) {
      return { error: 'User not authenticated' };
    }
    
    const userId = user.id;
    
    const { isAdmin } = await verifyAdmin();
    
    if (isAdmin) {
      return { 
        canViewSolution: true,
        creditsUsed: false
      };
    }
    
    const { profile, error: profileError } = await getProfile(userId);
    
    if (profileError || !profile) {
      return { error: 'User profile not found' };
    }

    // Users with active subscriptions don't use credits
    if (profile.subscriptionStatus === 'ACTIVE') {
      return { 
        canViewSolution: true,
        creditsUsed: false,
        creditsRemaining: profile.solutionCredits
      };
    }

    // Check if user has any credits left
    if (profile.solutionCredits <= 0) {
      return { 
        canViewSolution: false,
        creditsUsed: false,
        creditsRemaining: 0,
        error: 'No credits remaining'
      };
    }

    // User has credits and needs to use one
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profile')
      .update({ solutionCredits: profile.solutionCredits - 1 })
      .eq('id', userId)
      .select('solutionCredits')
      .single();

    if (updateError) {
      return { error: 'Failed to update credits', canViewSolution: false };
    }

    return {
      canViewSolution: true,
      creditsUsed: true,
      creditsRemaining: updatedProfile.solutionCredits
    };
  } catch (error) {
    console.error('Error using solution credit:', error);
    return { 
      error: 'Failed to process credit',
      canViewSolution: false
    };
  }
}

/* export async function updateProfile(data: {
  userId: string;
  status?: string | null;
  subscriptionCode?: string | null;
  currentPeriodEnd?: string | null;
  paystackCustomerId?: string | null;
  cancelAtPeriodEnd?: boolean;
}) {
  try {
    console.log('Updating Profile - Input Data:', data);

    const supabase = await createClient();
    const { data: existingProfile, error: profileFetchError } = await supabase
      .from('profile')
      .select('updatedAt')
      .eq('id', data.userId)
      .single();

    if (profileFetchError) {
      console.error('Error fetching existing profile:', profileFetchError);
      throw profileFetchError;
    }

    // Build update object only including non-null values
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    // Only add fields that are defined and not null
    if (data.status !== undefined && data.status !== null) {
      updateData.subscriptionStatus = data.status;
    }
    if (data.subscriptionCode !== undefined && data.subscriptionCode !== null) {
      updateData.subscriptionCode = data.subscriptionCode;
    }
    if (data.currentPeriodEnd !== undefined && data.currentPeriodEnd !== null) {
      updateData.currentPeriodEnd = new Date(data.currentPeriodEnd);
    }
    if (data.paystackCustomerId !== undefined && data.paystackCustomerId !== null) {
      updateData.paystackCustomerId = data.paystackCustomerId;
    }
    if (data.cancelAtPeriodEnd !== undefined) {
      updateData.cancelAtPeriodEnd = data.cancelAtPeriodEnd;
    }

    console.log('Preparing profile update:', updateData);

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profile')
      .update(updateData)
      .eq('id', data.userId)
      .gt('updatedAt', existingProfile?.updatedAt || '1970-01-01')
      .select();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw updateError;
    }

    console.log('Profile update successful', {
      updatedProfile,
      rowsAffected: updatedProfile ? updatedProfile.length : 0,
    });

    return updatedProfile;
  } catch (error) {
    console.error('Unexpected error in updateProfile:', error);
    throw error;
  }
} */

  export async function updateUserProfile({
    school,
    grade,
    subjects
  }: {
    school: string | null
    grade: number | null
    subjects: string[]
  }) {
    try {
      const supabase = await createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.id) {
        return { error: 'User not authenticated' };
      }
      
      const userId = user.id;
      
      // Update the user's profile
      const { error } = await supabase
        .from('profile')
        .update({ 
          school,
          grade,
          subjects
        })
        .eq('id', userId)
      
      if (error) {
        return { error: 'Failed to update profile' }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { error: 'An unexpected error occurred' }
    }
  }