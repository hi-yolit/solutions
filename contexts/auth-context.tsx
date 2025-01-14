'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { ProfileWithMetadata } from '@/types/user'
import { getProfile } from '@/actions/user'

interface AuthContextType {
  user: User | null
  profile: ProfileWithMetadata | null
  isLoading: boolean
  isProfileLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileWithMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const supabase = createClient()

  // Initial user load and auth state subscription
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        const { data: { user: initialUser }, error } = await supabase.auth.getUser()
        if (error) {
          throw error
        }
        setUser(initialUser)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        setUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Profile loading effect
  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null)
        return
      }

      try {
        setIsProfileLoading(true)
        const result = await getProfile(user.id)
        
        if (result.error) {
          console.error('Profile load error:', result.error)
          throw new Error(result.error)
        }

        // Handle the case where profile might be undefined
        setProfile(result.profile ?? null)
      } catch (error) {
        console.error('Error loading profile:', error)
        setProfile(null)
      } finally {
        setIsProfileLoading(false)
      }
    }

    if (isInitialized) {
      loadProfile()
    }
  }, [user, isInitialized])

  const signOut = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    profile,
    isLoading: isLoading || !isInitialized,
    isProfileLoading,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}