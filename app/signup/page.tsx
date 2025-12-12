"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { validatePassword, validateEmail, validateUsername, getPasswordStrengthBg, type PasswordValidation } from '@/lib/validation';
import Link from 'next/link';

function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        setTheme(initialTheme);
        document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    if (!mounted) return <div className="w-10 h-10" />;

    return (
        <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#252525] transition-all"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-200">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            )}
        </button>
    );
}

function AnalyticsIllustration({ mounted }: { mounted: boolean }) {
    if (!mounted) return null;

    const monthData = [
        3, 5, 4, 7, 6, 8, 5, 4, 6, 8, 7, 9, 6, 8,
        10, 7, 8, 6, 9, 11, 8, 7, 10, 9, 12, 8, 10, 9, 11, 8
    ];
    const maxVal = Math.max(...monthData);
    const avgVal = Math.round(monthData.reduce((a, b) => a + b, 0) / monthData.length);

    const points = monthData.map((val, i) => {
        const x = (i / (monthData.length - 1)) * 100;
        const y = 100 - (val / maxVal) * 100;
        return `${x},${y}`;
    }).join(' ');

    const areaPath = `M0,100 L0,${100 - (monthData[0] / maxVal) * 100} ` +
        monthData.map((val, i) => {
            const x = (i / (monthData.length - 1)) * 100;
            const y = 100 - (val / maxVal) * 100;
            return `L${x},${y}`;
        }).join(' ') + ` L100,100 Z`;

    return (
        <div className="relative w-full h-full flex items-center justify-center p-8">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 left-10 w-16 h-16 border-2 border-white/20 rounded-xl" />
                <div className="absolute top-20 right-20 w-8 h-8 border-2 border-white/15 rounded-full" />
                <div className="absolute bottom-32 left-16 w-12 h-12 border-2 border-white/10 rounded-lg rotate-12" />
                <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-white/10 rounded-full" />
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white/15 rounded-full" />

                <svg className="absolute top-16 right-32 w-24 h-24 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>

                <svg className="absolute bottom-20 right-16 w-16 h-16 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                </svg>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">💧</span>
                            <div>
                                <h3 className="text-white font-semibold text-lg">Water Intake</h3>
                                <p className="text-white/60 text-sm">Glasses per day</p>
                            </div>
                        </div>
                        <div className="text-green-400 text-sm font-semibold flex items-center gap-1">
                            <span className="text-lg">↑</span>
                            <div>
                                <div>12%</div>
                                <div className="text-white/50 text-xs">vs last month</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <div className="text-xl font-bold text-white">{monthData.reduce((a, b) => a + b, 0)}</div>
                            <div className="text-white/50 text-xs">Total</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <div className="text-xl font-bold text-cyan-300">{avgVal}</div>
                            <div className="text-white/50 text-xs">Daily Avg</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <div className="text-xl font-bold text-amber-300">🏆 {maxVal}</div>
                            <div className="text-white/50 text-xs">Peak Day</div>
                        </div>
                    </div>

                    <div className="relative h-36 mb-2">
                        <div className="absolute inset-0 flex flex-col justify-between">
                            {[maxVal, Math.round(maxVal / 2), 0].map((val, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-white/40 text-xs w-4 text-right">{val}</span>
                                    <div className="flex-1 border-t border-white/10 border-dashed" />
                                </div>
                            ))}
                        </div>

                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(34, 211, 238, 0.6)" />
                                    <stop offset="100%" stopColor="rgba(34, 211, 238, 0.05)" />
                                </linearGradient>
                            </defs>
                            <path d={areaPath} fill="url(#areaGradient)" />
                            <polyline
                                points={points}
                                fill="none"
                                stroke="rgb(34, 211, 238)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        <div
                            className="absolute left-0 right-0 border-t-2 border-dashed border-cyan-400/50"
                            style={{ top: `${100 - (avgVal / maxVal) * 100}%` }}
                        >
                            <span className="absolute -top-3 right-0 text-xs text-cyan-300 bg-purple-700/80 px-1.5 py-0.5 rounded">avg</span>
                        </div>
                    </div>

                    <div className="flex justify-between text-xs text-white/50">
                        <span>Nov 1</span>
                        <span>Nov 15</span>
                        <span>Nov 30</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gradient-to-br from-orange-500/80 to-red-600/80 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                        <div className="text-2xl mb-1">🔥</div>
                        <div className="text-2xl font-bold text-white">18</div>
                        <div className="text-white/70 text-xs">Day Streak</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/80 to-green-600/80 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                        <div className="text-2xl mb-1">📈</div>
                        <div className="text-2xl font-bold text-white">92%</div>
                        <div className="text-white/70 text-xs">This Month</div>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mt-4 border border-white/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-lg">🏃</span>
                        </div>
                        <div className="flex-1">
                            <div className="text-white text-sm font-medium">Running</div>
                            <div className="text-white/50 text-xs">42.5 km this month</div>
                        </div>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1.5 rounded-full bg-gradient-to-t from-green-500 to-emerald-400"
                                    style={{ height: `${12 + Math.random() * 20}px` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8 text-center">
                <p className="text-white/80 text-lg font-medium">Track your habits, achieve your goals</p>
                <p className="text-white/50 text-sm mt-1">Join thousands building better routines</p>
            </div>
        </div>
    );
}

export default function SignupPage() {
    const { user, signUpWithEmail, signInWithOAuth } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState<PasswordValidation | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && user) {
            router.push('/');
            router.refresh();
        }
    }, [user, router, mounted]);

    useEffect(() => {
        if (password) {
            setPasswordValidation(validatePassword(password));
        } else {
            setPasswordValidation(null);
        }
    }, [password]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const emailValidation = validateEmail(email);
            if (!emailValidation.isValid) {
                setError(emailValidation.error || 'Invalid email');
                setLoading(false);
                return;
            }

            const usernameValidation = validateUsername(username);
            if (!usernameValidation.isValid) {
                setError(usernameValidation.error || 'Invalid username');
                setLoading(false);
                return;
            }

            const passValidation = validatePassword(password);
            if (!passValidation.isValid) {
                setError(passValidation.errors[0] || 'Weak password');
                setLoading(false);
                return;
            }

            await signUpWithEmail(email, password, username);
            // Wait for AuthContext to update user state or just redirect
            // AuthContext.signUpWithEmail sets the user, so the useEffect should pick it up
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign up');
            setLoading(false);
        }
    };

    const handleOAuthSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithOAuth('google');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign in');
            setLoading(false);
        }
    };

    if (!mounted) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-800 border-t-gray-900 dark:border-t-white rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col bg-[#fafafa] dark:bg-[#0a0a0a]">
                {/* Fixed Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 sm:px-8 md:px-12 lg:px-20 py-5 sm:py-6">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-black">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <span className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Trackerr</span>
                    </Link>
                    {/* Theme toggle for desktop - top right of illustration */}
                    <div className="lg:hidden">
                        <ThemeToggle />
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto">
                    <div className="min-h-full flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-20 py-6 sm:py-8">
                        <div className="w-full max-w-[400px] mx-auto">
                            {/* Title Section - Fixed height to prevent movement */}
                            <div className="mb-6 sm:mb-8">
                                <h1 className="text-[26px] sm:text-[28px] md:text-[30px] font-semibold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ minHeight: '36px' }}>
                                    Create your account
                                </h1>
                                <p className="text-[13px] sm:text-[14px] text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2" style={{ minHeight: '20px' }}>
                                    Start tracking your habits today
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleOAuthSignIn}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 sm:gap-3 h-10 sm:h-11 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-[#252525] hover:border-gray-300 dark:hover:border-gray-700 transition-all disabled:opacity-50 shadow-sm"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-[13px] sm:text-[14px] font-medium text-gray-700 dark:text-gray-200">
                                    Continue with Google
                                </span>
                            </button>

                            <div className="relative my-4 sm:my-5">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-3 sm:px-4 text-[11px] sm:text-[12px] text-gray-400 dark:text-gray-500 bg-[#fafafa] dark:bg-[#0a0a0a]">
                                        or continue with email
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/50 rounded-xl px-3 py-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 flex-shrink-0">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleAuth} className="space-y-3.5">
                                <div className="space-y-1">
                                    <label className="block text-[12px] font-medium text-gray-700 dark:text-gray-300">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="johndoe"
                                        required
                                        className="w-full h-11 px-3.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[12px] font-medium text-gray-700 dark:text-gray-300">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full h-11 px-3.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[12px] font-medium text-gray-700 dark:text-gray-300">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={8}
                                            className="w-full h-11 px-3.5 pr-11 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    {passwordValidation && password.length > 0 && (
                                        <div className="pt-1.5 space-y-1.5">
                                            <div className="flex gap-1">
                                                {[1, 2, 3].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-0.5 flex-1 rounded-full transition-all ${i === 1
                                                            ? getPasswordStrengthBg(passwordValidation.strength)
                                                            : i === 2 && passwordValidation.strength !== 'weak'
                                                                ? getPasswordStrengthBg(passwordValidation.strength)
                                                                : i === 3 && passwordValidation.strength === 'strong'
                                                                    ? getPasswordStrengthBg(passwordValidation.strength)
                                                                    : 'bg-gray-200 dark:bg-gray-800'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            {passwordValidation.errors.length > 0 && (
                                                <p className="text-[11px] text-gray-500">{passwordValidation.errors[0]}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || (passwordValidation !== null && !passwordValidation.isValid)}
                                    className="w-full h-11 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 text-[14px] font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1 shadow-sm"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent dark:border-t-transparent rounded-full animate-spin"></div>
                                            <span>Creating account...</span>
                                        </div>
                                    ) : (
                                        'Create account'
                                    )}
                                </button>
                            </form>

                            <p className="text-center mt-6 text-[13px] text-gray-500 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link
                                    href="/login"
                                    className="text-gray-900 dark:text-white hover:underline font-medium"
                                >
                                    Sign in
                                </Link>
                            </p>

                            <p className="text-center mt-4 text-[11px] text-gray-400 dark:text-gray-600">
                                By continuing, you agree to our{' '}
                                <button className="underline hover:text-gray-600 dark:hover:text-gray-400">Terms</button>
                                {' '}and{' '}
                                <button className="underline hover:text-gray-600 dark:hover:text-gray-400">Privacy Policy</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative">
                {/* Theme toggle for desktop - top right of illustration */}
                <div className="absolute top-6 right-6 z-20">
                    <ThemeToggle />
                </div>
                <AnalyticsIllustration mounted={mounted} />
            </div>
        </div>
    );
}
