'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from './use-toast'

export interface SettingsProfile {
    name: string
    email: string
    subscription_tier: 'free' | 'pro' | 'enterprise'
    subscription_status: 'active' | 'inactive'
}

interface UseSettingsProps {
    userId?: string
    userEmail?: string
    userName?: string
}

export function useSettings({
    userId,
    userEmail,
    userName,
}: UseSettingsProps) {
    const [profile, setProfile] = useState<SettingsProfile>({
        name: userName || '',
        email: userEmail || '',
        subscription_tier: 'free',
        subscription_status: 'active',
    })
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const supabase = createClient()

    // Load profile data from database
    const loadProfile = useCallback(async () => {
        if (!userId) return

        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('users')
                .select('name, email, subscription_tier, subscription_status')
                .eq('id', userId)
                .single()

            if (error) throw error

            if (data) {
                setProfile({
                    name: data.name || userName || '',
                    email: data.email || userEmail || '',
                    subscription_tier: data.subscription_tier || 'free',
                    subscription_status: data.subscription_status || 'active',
                })
            }
        } catch (error: any) {
            console.error('Error loading profile:', error)
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load profile settings.',
            })
        } finally {
            setLoading(false)
        }
    }, [userId, userEmail, userName, supabase, toast])

    // Load profile on mount
    useEffect(() => {
        loadProfile()
    }, [loadProfile])

    const updateProfile = useCallback(
        async (name: string) => {
            if (!userId) return

            try {
                const { error } = await supabase
                    .from('users')
                    .update({ name })
                    .eq('id', userId)

                if (error) throw error

                setProfile((prev) => ({ ...prev, name }))
            } catch (error: any) {
                throw new Error(error.message || 'Failed to update profile')
            }
        },
        [userId, supabase]
    )

    return {
        profile,
        loading,
        loadProfile,
        updateProfile,
    }
}
