'use client';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import Link from 'next/link';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ totalPosts: 0, applied: 0, pending: 0, failed: 0 });
  const [customUrl, setCustomUrl] = useState('');
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/applications').then(res => {
        const apps = res.data;
        setStats({
          totalPosts: apps.length,
          applied: apps.filter((a: any) => a.status === 'submitted').length,
          pending: apps.filter((a: any) => a.status === 'pending' || a.status === 'in_progress').length,
          failed: apps.filter((a: any) => a.status === 'failed').length
        });
      });
    }
  }, [user]);

  const handleCustomApply = async (e: any) => {
      e.preventDefault();
      if (!customUrl) return;
      setTriggering(true);
      try {
          await api.post('/applications/auto-apply', { url: customUrl });
          setCustomUrl('');
          alert('Custom job URL queued for AI parsing!');
      } catch (err) {
          alert('Failed to queue custom URL.');
      } finally {
          setTriggering(false);
      }
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white font-outfit p-8">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}</h1>
          <p className="text-gray-400">Here's your job search overview</p>
        </div>
        <div className="flex space-x-4">
          <Link href="/dashboard/jobs" className="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all font-bold">Find Jobs</Link>
          <Link href="/dashboard/resume" className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all font-bold">Resumes</Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-gray-400 text-sm mb-2">Total Applications</div>
          <div className="text-3xl font-bold">{stats.totalPosts}</div>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-green-400 text-sm mb-2">Submitted</div>
          <div className="text-3xl font-bold">{stats.applied}</div>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-blue-400 text-sm mb-2">In Progress</div>
          <div className="text-3xl font-bold">{stats.pending}</div>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-red-400 text-sm mb-2">Failed</div>
          <div className="text-3xl font-bold">{stats.failed}</div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4">Direct AI Link Scanner</h2>
          <p className="text-gray-400 mb-6">Found a job on an unlisted board? Paste the URL below and the AI DOM scanner will attempt to resolve and apply automatically.</p>
          <form onSubmit={handleCustomApply} className="flex space-x-4">
              <input 
                  type="url" 
                  required 
                  value={customUrl} 
                  onChange={(e) => setCustomUrl(e.target.value)} 
                  placeholder="https://company.boards.greenhouse.io/..."
                  className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all"
              />
              <button disabled={triggering} type="submit" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50">
                  {triggering ? 'Queuing...' : 'Auto-Apply'}
              </button>
          </form>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/preferences" className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all">
            <h3 className="font-bold mb-1">Update Preferences</h3>
            <p className="text-gray-400 text-sm">Fine-tune your job search keywords and locations.</p>
          </Link>
          <Link href="/dashboard/applications" className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all">
            <h3 className="font-bold mb-1">Track Applications</h3>
            <p className="text-gray-400 text-sm">View real-time logs of your automated applications.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
