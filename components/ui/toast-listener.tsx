'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useToast } from '@/components/ui/toast-context'

export function ToastListener() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { addToast } = useToast()
    const processedRef = useRef<string>('')

    useEffect(() => {
        const success = searchParams.get('success')
        const error = searchParams.get('error')

        if (success && processedRef.current !== success) {
            addToast(success, 'success')
            processedRef.current = success
            // Clean up URL
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete('success')
            router.replace(newUrl.pathname + newUrl.search)
        }

        if (error && processedRef.current !== error) {
            addToast(error, 'error')
            processedRef.current = error
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete('error')
            router.replace(newUrl.pathname + newUrl.search)
        }
    }, [searchParams, addToast, router])

    return null
}
