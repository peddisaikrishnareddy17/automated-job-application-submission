'use client';
import Navbar from './Navbar';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>;
    if (!user) return null;

    return (
        <div className="flex bg-gray-950 min-h-screen">
            <Navbar />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
