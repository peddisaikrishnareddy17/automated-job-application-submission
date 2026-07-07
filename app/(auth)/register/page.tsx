'use client';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Link from 'next/link';

export default function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirm) return setError('Passwords do not match');
        try {
            await register(formData.name, formData.email, formData.password);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 font-outfit py-12">
            <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-gray-400">Join JobFlow AI today</p>
                </div>

                {error && <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={formData.confirm}
                            onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 mt-4"
                    >
                        Get Started
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-400">
                    Already have an account? <Link href="/login" className="text-purple-400 hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
