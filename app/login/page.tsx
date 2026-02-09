'use client'

import { Suspense, useEffect, useState } from 'react'
import { login, signup } from './actions'
import { useSearchParams, useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast-context'


function LoginForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { addToast } = useToast()
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const error = searchParams.get('error')
        if (error) {
            addToast(error, 'error')
            // Clean up the URL
            router.replace('/login')
        }

        const message = searchParams.get('message')
        if (message) {
            addToast(message, 'info')
        }
    }, [searchParams, addToast, router])

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            if (isLogin) {
                await login(formData)
            } else {
                await signup(formData)
            }
        } catch (e) {
            // Note: Server actions redirects often look like errors in client-side try-catch if they aren't handled as results
            // But since we use redirect() in valid cases, this catch block is for unexpected network errors
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-sm space-y-8 relative z-10">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-white/10 mb-6 group transition-all duration-500 hover:scale-105">
                        <div className="w-6 h-6 bg-black rounded-full" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        {isLogin ? 'Welcome back' : 'Create an account'}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {isLogin ? 'Enter your details to access your workspace.' : 'Start your journey to better focus today.'}
                    </p>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        handleSubmit(formData)
                    }}
                    className="mt-8 space-y-6"
                >
                    <div className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-muted-foreground mb-1 ml-1">
                                    Full Name
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    className="block w-full rounded-xl border border-border bg-secondary/50 p-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-white/20 outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-muted-foreground mb-1 ml-1">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="block w-full rounded-xl border border-border bg-secondary/50 p-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-white/20 outline-none transition-all"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1 ml-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="block w-full rounded-xl border border-border bg-secondary/50 p-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-white/20 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative flex w-full justify-center rounded-xl bg-white px-3 py-3 text-sm font-semibold text-black hover:bg-neutral-200 transition-all duration-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                isLogin ? 'Sign in' : 'Create account'
                            )}
                        </button>
                    </div>

                    {/* Sign up disabled
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div> 
                    */}
                </form>

                <div className="text-center mt-6">
                    <a href="/guide" className="text-xs text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground/20 pb-0.5">
                        Read the Kaizen Guide
                    </a>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-foreground">Loading...</div>}>
            <LoginForm />
        </Suspense>
    )
}
