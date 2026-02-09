'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ChangePasswordModal } from '@/components/ChangePasswordModal'
import { Profile } from '@/types'

interface ProfileModalContextType {
    openProfileModal: (profile: Profile | null) => void
    closeProfileModal: () => void
}

const ProfileModalContext = createContext<ProfileModalContextType | undefined>(undefined)

export function ProfileModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [profile, setProfile] = useState<Profile | null>(null)

    const openProfileModal = (p: Profile | null) => {
        setProfile(p)
        setIsOpen(true)
    }

    const closeProfileModal = () => {
        setIsOpen(false)
        // Don't clear profile immediately to avoid flash during exit animation if any
    }

    return (
        <ProfileModalContext.Provider value={{ openProfileModal, closeProfileModal }}>
            {children}
            {isOpen && (
                <ChangePasswordModal
                    isOpen={isOpen}
                    onClose={closeProfileModal}
                    profile={profile}
                />
            )}
        </ProfileModalContext.Provider>
    )
}

export function useProfileModal() {
    const context = useContext(ProfileModalContext)
    if (context === undefined) {
        throw new Error('useProfileModal must be used within a ProfileModalProvider')
    }
    return context
}
