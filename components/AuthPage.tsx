
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Mail, Lock, User, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';

export const AuthPage: React.FC = () => {
    const { login, signup, loginWithGoogle } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                if (password.length < 6) {
                    throw new Error("Password must be at least 6 characters");
                }
                await signup(name, email, password);
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            setError("Google sign in failed");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-900 via-gray-900 to-black flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto min-h-[600px]">
                
                {/* Left Side - Graphic/Info */}
                <div className="md:w-1/2 bg-gradient-to-br from-orange-500 to-red-600 p-12 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                     <div className="absolute -top-24 -left-24 w-64 h-64 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-pulse"></div>
                     <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-600 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-pulse" style={{animationDelay: '2s'}}></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.5-3.3.3.3.5.5.5.8z"></path>
                            </svg>
                            <h1 className="text-3xl font-bold text-white tracking-tight">FireSocial</h1>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4">
                            {isLogin ? "Welcome Back!" : "Join the Spark."}
                        </h2>
                        <p className="text-orange-100 text-lg leading-relaxed">
                            {isLogin 
                                ? "Connect with friends, share your moments, and spark conversations. Your community is waiting." 
                                : "Create an account to start sharing your story. It only takes a minute to get started."}
                        </p>
                    </div>

                    <div className="relative z-10 mt-8">
                         <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-white/50"></div>
                            <div className="w-3 h-3 rounded-full bg-white/30"></div>
                            <div className="w-3 h-3 rounded-full bg-white/10"></div>
                         </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
                    <h3 className="text-2xl font-bold text-white mb-6">{isLogin ? "Sign In" : "Create Account"}</h3>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center gap-3 text-red-200">
                            <AlertTriangle size={20} />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <div className="space-y-4 mb-6">
                        <button 
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full py-3 px-4 rounded-xl bg-white text-gray-900 font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-70"
                        >
                           <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            {isLogin ? "Sign in with Google" : "Sign up with Google"}
                        </button>
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-transparent text-gray-500 uppercase">Or continue with</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                    <input 
                                        type="text" 
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                             <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                         {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                    <input 
                                        type="password" 
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        )}

                        {isLogin && (
                            <div className="flex justify-end">
                                <button type="button" className="text-sm text-orange-400 hover:text-orange-300">Forgot password?</button>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? "Sign In" : "Create Account")} 
                            {!isLoading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button 
                                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                                className="text-orange-400 font-semibold hover:text-orange-300"
                            >
                                {isLogin ? "Sign up" : "Log in"}
                            </button>
                        </p>
                         {isLogin && <div className="mt-4 text-xs text-gray-600">Demo login: yourname@example.com / password</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};
