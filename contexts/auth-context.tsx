'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
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
  refreshAuth: () => Promise<void> 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileWithMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const supabase = createClient()

  const refreshAuth = useCallback(async () => {
    try {
      setIsProfileLoading(true)
      // Refresh user session
      const { data: { user: newUser }, error } = await supabase.auth.getUser()
      
      if (error) throw error
      setUser(newUser)

      // Refresh profile if user exists
      if (newUser) {
        const result = await getProfile(newUser.id)
        if (result.error) throw result.error
        setProfile(result.profile ?? null)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('Error refreshing auth:', error)
    } finally {
      setIsProfileLoading(false)
    }
  }, [supabase.auth])

  // Memoize signOut function
  const signOut = useCallback(async () => {
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
  }, [supabase.auth])

  // Initial user load and auth state subscription
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        
        // First check for existing session
        const { error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          // Check if it's the "Auth session missing" error
          if (sessionError.message || sessionError.message.includes('Auth session missing')) {
            console.warn('Auth session missing - this is expected for unauthenticated users')
          } else {
            console.error('Session error:', sessionError)
          }
          // Continue trying to get user anyway
        }
        
        // Then get the user (may work even if session has issues)
        const { data: { user: initialUser }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('User error:', userError)
          setUser(null)
        } else {
          setUser(initialUser)
        }
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

  // Memoize context value
  const value = useMemo(() => ({
    user,
    profile,
    isLoading: isLoading || !isInitialized,
    isProfileLoading,
    signOut,
    refreshAuth
  }), [
    user,
    profile,
    isLoading,
    isProfileLoading,
    isInitialized,
    signOut,
    refreshAuth
  ])

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