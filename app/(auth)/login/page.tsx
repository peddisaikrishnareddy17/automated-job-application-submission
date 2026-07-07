'use client';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Link from 'next/link';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 font-outfit">
            <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to your dashboard</p>
                </div>

                {error && <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        Sign In
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-400">
                    Don't have an account? <Link href="/register" className="text-blue-400 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
}
