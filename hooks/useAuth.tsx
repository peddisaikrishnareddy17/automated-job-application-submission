'use client';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { api } from '../lib/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchMe = useCallback(async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (localStorage.getItem('token')) {
            fetchMe();
        } else {
            setLoading(false);
        }
    }, [fetchMe]);

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        router.push('/dashboard');
    };

    const register = async (name: string, email: string, password: string) => {
        const res = await api.post('/auth/register', { name, email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value= {{ user, loading, login, register, logout }
}>
    { children }
    </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
