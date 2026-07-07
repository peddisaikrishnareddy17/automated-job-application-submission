'use client';
import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { useRouter } from 'next/navigation';

export default function ResumePage() {
  const [resumes, setResumes] = useState([] as any[]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const fetchResumes = async () => {
    const res = await api.get('/resume');
    setResumes(res.data);
  };

  useEffect(() => { fetchResumes(); }, []);

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.upload('/resume/upload', file);
      // Redirect to jobs page and trigger auto-fetch
      router.push('/dashboard/jobs?autofetch=true');
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume?')) return;
    await api.delete(`/resume/${id}`);
    fetchResumes();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-outfit p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">My Resumes</h1>

      <div className="mb-12 p-10 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 hover:bg-white/10 transition-all text-center relative pointer-events-auto">
        <input
          type="file"
          onChange={handleUpload}
          className="absolute inset-0 opacity-0 cursor-pointer"
          accept=".pdf,.docx"
        />
        <div className="text-4xl mb-4">📄</div>
        <h2 className="text-xl font-bold mb-2">Upload New Resume</h2>
        <p className="text-gray-400">PDF or DOCX, max 5MB</p>
        {uploading && <p className="mt-4 text-blue-400 animate-pulse">Uploading...</p>}
      </div>

      <div className="grid gap-4">
        {resumes.map(r => (
          <div key={r._id} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group">
            <div>
              <div className="text-sm text-gray-400 mb-4">{(r.size / 1024).toFixed(1)} KB • Uploaded on {new Date(r.uploadedAt).toLocaleDateString()}</div>
              
              {r.parsedData && (
                 <div className="space-y-2 mt-2 p-4 bg-black/30 rounded-xl text-sm border border-white/5">
                    <p><span className="text-gray-500 font-bold">Email:</span> {r.parsedData.email || 'N/A'} | <span className="text-gray-500 font-bold">Phone:</span> {r.parsedData.phone || 'N/A'}</p>
                    <p><span className="text-gray-500 font-bold">Address:</span> {r.parsedData.address || 'N/A'}</p>
                    {r.parsedData.skills && r.parsedData.skills.length > 0 && (
                        <p><span className="text-gray-500 font-bold">Top Skills:</span> {r.parsedData.skills.slice(0, 5).join(', ')}</p>
                    )}
                 </div>
              )}
            </div>
            <button
              onClick={() => handleDelete(r._id)}
              className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              Delete
            </button>
          </div>
        ))}
        {resumes.length === 0 && <p className="text-center text-gray-500 py-10">No resumes uploaded yet.</p>}
      </div>
    </div>
  );
}
