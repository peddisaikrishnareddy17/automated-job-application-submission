const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        if (response.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        throw new Error(data.error || 'Something went wrong');
    }
    return data;
};

export const api = {
    get: async (endpoint: string) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(res);
    },
    post: async (endpoint: string, body: any) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body),
            credentials: 'include'
        });
        return handleResponse(res);
    },
    put: async (endpoint: string, body: any) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(body),
            credentials: 'include'
        });
        return handleResponse(res);
    },
    patch: async (endpoint: string, body: any) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(body),
            credentials: 'include'
        });
        return handleResponse(res);
    },
    delete: async (endpoint: string) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(res);
    },
    upload: async (endpoint: string, file: File) => {
        const formData = new FormData();
        formData.append('resume', file);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData,
            credentials: 'include'
        });
        return handleResponse(res);
    }
};
