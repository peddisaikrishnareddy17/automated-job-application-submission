'use client';
import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { useRouter } from 'next/navigation';

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState({
    jobTitle: '',
    location: '',
    remote: false,
    salaryMin: 0,
    salaryMax: 0,
    skills: [] as string[],
    experienceYears: 0,
    preferredPortals: [] as string[]
  });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api.get('/preferences').then(res => {
      if (res.data && res.data.userId) setPrefs(res.data);
    });
  }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/preferences', prefs);
      router.push('/dashboard');
    } catch (err) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const togglePortal = (portal: string) => {
    const next = prefs.preferredPortals.includes(portal)
      ? prefs.preferredPortals.filter(p => p !== portal)
      : [...prefs.preferredPortals, portal];
    setPrefs({ ...prefs, preferredPortals: next });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-outfit p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Search Preferences</h1>

      <form onSubmit={handleSave} className="space-y-8 bg-white/5 p-8 border border-white/10 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Job Title</label>
            <input
              type="text"
              value={prefs.jobTitle}
              onChange={e => setPrefs({ ...prefs, jobTitle: e.target.value })}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl outline-none focus:border-blue-500"
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
            <input
              type="text"
              value={prefs.location}
              onChange={e => setPrefs({ ...prefs, location: e.target.value })}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl outline-none focus:border-blue-500"
              placeholder="e.g. Bangalore"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-4">Preferred Job Boards</label>
          <div className="flex flex-wrap gap-4">
            {['arbeitnow', 'remoteok', 'adzuna', 'usajobs', 'greenhouse'].map(portal => (
              <button
                key={portal}
                type="button"
                onClick={() => togglePortal(portal)}
                className={`px-6 py-2 rounded-full border transition-all capitalize ${prefs.preferredPortals.includes(portal)
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
              >
                {portal}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setPrefs({ ...prefs, remote: !prefs.remote })}
            className={`w-14 h-8 rounded-full transition-all relative ${prefs.remote ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${prefs.remote ? 'right-1' : 'left-1'}`} />
          </button>
          <span className="text-gray-300">Remote Only</span>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl font-bold shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
}
