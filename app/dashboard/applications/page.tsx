'use client';
import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

export default function ApplicationsPage() {
  const [apps, setApps] = useState([] as any[]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    const res = await api.get('/applications');
    setApps(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
    const interval = setInterval(fetchApps, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/applications/${id}/status`, { status });
      fetchApps(); // refresh list
    } catch (error) {
      console.error('Update failed', error);
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selected': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'applied': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'denied': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-outfit p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-12">Application History</h1>

      <div className="overflow-hidden rounded-3xl bg-white/5 border border-white/10">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-sm">
              <th className="px-8 py-4">Job / Company</th>
              <th className="px-8 py-4">Portal</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Latest Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {apps.map(app => (
              <tr key={app._id} className="hover:bg-white/5 transition-all group">
                <td className="px-8 py-6">
                  <div className="font-bold">{app.jobId?.title || 'Unknown Job'}</div>
                  <div className="text-gray-400 text-sm">{app.jobId?.company || 'Unknown Company'}</div>
                </td>
                <td className="px-8 py-6 uppercase text-xs font-bold text-gray-500">{app.jobId?.portal || 'N/A'}</td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1 rounded-full border text-xs font-bold uppercase ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="text-sm text-gray-400 mb-2">
                    {app.automationLog[app.automationLog.length - 1] || 'Opened manually'}
                  </div>
                  {app.status === 'applied' && (
                    <div className="flex space-x-2">
                      <button onClick={() => updateStatus(app._id, 'selected')} className="px-3 py-1 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-lg text-xs font-bold transition-all">Mark Selected</button>
                      <button onClick={() => updateStatus(app._id, 'denied')} className="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-all">Mark Denied</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {apps.length === 0 && !loading && (
          <div className="py-20 text-center text-gray-500">No applications started yet.</div>
        )}
      </div>
    </div>
  );
}
