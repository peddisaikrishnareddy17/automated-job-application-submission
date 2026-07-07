'use client';
import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';


export default function JobsPage() {
  const [jobs, setJobs] = useState([] as any[]);
  const [fetching, setFetching] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);


  const fetchJobs = async () => {
    setFetching(true);
    try {
      const res = await api.post('/jobs/fetch', {});
      setJobs(res.data);
    } catch (err) {
      alert('Fetch failed');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    api.get('/jobs').then(res => setJobs(res.data.jobs || []));

    // Auto-fetch logic
    if (typeof window !== 'undefined' && window.location.search.includes('autofetch=true')) {
      // Clean URL so it doesn't refetch on reload
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => fetchJobs(), 500);
    }
  }, []);

  const handleApply = async (jobId: string, url: string) => {
    setApplying(jobId);
    try {
      window.open(url, '_blank');
      await api.post('/applications/start', { jobId });
      alert('Job opened! Track this in your Applications tab.');
    } catch (err) {
      alert('Apply failed');
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-outfit p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">Discover Jobs</h1>
        <button
          onClick={fetchJobs}
          disabled={fetching}
          className="px-8 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {fetching ? '🤖 Analyzing Resume & Fetching...' : 'Fetch Personalized Jobs'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map(job => (
          <div key={job._id} className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-blue-500/50 transition-all flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase">{job.portal}</span>
              <span className="text-gray-500 text-xs">Fetched {new Date(job.fetchedAt).toLocaleDateString()}</span>
            </div>
            <h3 className="text-xl font-bold mb-1">{job.title}</h3>
            <p className="text-purple-400 font-medium mb-4">{job.company}</p>
            <div className="text-gray-400 text-sm mb-6 flex items-center">
              <span className="mr-3">📍 {job.location}</span>
            </div>
            <div className="mt-auto pt-6 flex space-x-3">
              <button
                onClick={() => handleApply(job._id, job.url)}
                disabled={applying === job._id}
                className="flex-1 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {applying === job._id ? 'Opening...' : 'Apply Manually'}
              </button>
              <a href={job.url} target="_blank" className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">🔗</a>
            </div>
          </div>
        ))}
        {jobs.length === 0 && !fetching && <p className="text-center text-gray-500 col-span-full py-20">No jobs found. Click "Fetch New Jobs" to begin.</p>}
      </div>
    </div>
  );
}
