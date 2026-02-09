'use client'


import { AlertCircle, X, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Announcement } from '@/types'

export function AnnouncementBanner({ announcement }: { announcement: Announcement | null }) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (!announcement) return

        // Check local storage / cookies
        const dismissed = document.cookie.split('; ').find(row => row.startsWith(`focus_announcement_dismissed_${announcement.id}=`))

        if (!dismissed) {
            setIsVisible(true)
        }
    }, [announcement])

    if (!announcement || !isVisible) return null


    // Determine Icon
    const Icon = announcement.icon === 'check-circle' ? CheckCircle :
        announcement.icon === 'alert-triangle' ? AlertTriangle :
            announcement.icon === 'x-circle' ? XCircle :
                Info // default


    return (
        <div
            className="w-full px-4 py-2 flex items-center justify-between text-sm font-medium relative z-50 transition-all"
            style={{
                backgroundColor: announcement.background_color || '#332b00',
                color: announcement.text_color || '#f5a623'
            }}
        >
            <div className="flex items-center justify-center w-full gap-3">
                <Icon className="w-5 h-5 shrink-0" />
                <span>
                    {announcement.message}
                    {announcement.link && announcement.link_text && (
                        <>
                            {' · '}
                            <Link href={announcement.link} className="underline hover:opacity-80 transition-opacity">
                                {announcement.link_text}
                            </Link>
                        </>
                    )}
                </span>
            </div>

            <button
                onClick={() => {
                    // Set cookie for 24 hours
                    document.cookie = `focus_announcement_dismissed_${announcement.id}=true; max-age=86400; path=/`
                    setIsVisible(false)
                }}
                className="absolute right-4 p-1 rounded-full hover:bg-black/10 transition-colors"
                aria-label="Dismiss"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}
