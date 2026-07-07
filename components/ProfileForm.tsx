"use client";
import React, { useEffect, useState } from 'react';
import { authApi } from '../services/api';

export default function ProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePath, setResumePath] = useState('');
  const [prefDomain, setPrefDomain] = useState('');
  const [prefLocation, setPrefLocation] = useState('');

  useEffect(() => {
    let mounted = true;
    authApi.getCurrentUser().then((u) => {
      if (!mounted) return;
      setName(u.name || '');
      setEmail(u.email || '');
      setPhone(u.phone || '');
      setResumePath(u.resumePath || '');
      const p = u.preferences || null;
      if (p) {
        setPrefDomain(p.domain || '');
        setPrefLocation(p.preferredLocation || '');
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload: any = { name, phone };
      if (password) payload.password = password;
      const updated = await authApi.updateProfile(payload);
      setName(updated.name || '');
      setPhone(updated.phone || '');
      setResumePath(updated.resumePath || '');
      setPassword('');
      setMessage('Profile updated');
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return setMessage('Select a file first');
    setSaving(true);
    try {
      const r = await (await import('../services/api')).resumeApi.upload(resumeFile);
      setResumePath(r.resumePath || r.fileName || '');
      setMessage('Resume uploaded');
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Upload failed');
    } finally { setSaving(false); }
  };

  const onSavePrefs = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const preferences = { domain: prefDomain, preferredLocation: prefLocation };
      await (await import('../services/api')).preferencesApi.save(preferences);
      setMessage('Preferences saved');
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={onSave} className="max-w-lg">
      <div className="mb-4">
        <label className="block text-sm font-medium">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded border px-2 py-1" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Email</label>
        <input value={email} readOnly className="mt-1 block w-full rounded border px-2 py-1 bg-gray-100" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Phone</label>
        <input value={phone || ''} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full rounded border px-2 py-1" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Resume</label>
        {resumePath ? <div className="text-sm mb-2">Current: {resumePath}</div> : null}
        <input type="file" onChange={(e: any) => setResumeFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} className="mt-1 block w-full" />
        <div className="mt-2">
          <button onClick={onUpload} disabled={saving} className="px-3 py-1 bg-gray-700 text-white rounded">Upload</button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Job Preferences</label>
        <input placeholder="Domain / Title" value={prefDomain} onChange={(e) => setPrefDomain(e.target.value)} className="mt-1 block w-full rounded border px-2 py-1 mb-2" />
        <input placeholder="Preferred Location" value={prefLocation} onChange={(e) => setPrefLocation(e.target.value)} className="mt-1 block w-full rounded border px-2 py-1" />
        <div className="mt-2">
          <button onClick={onSavePrefs} disabled={saving} className="px-3 py-1 bg-green-600 text-white rounded">Save Preferences</button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">New password (optional)</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full rounded border px-2 py-1" />
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
        {message && <div className="text-sm text-gray-700">{message}</div>}
      </div>
    </form>
  );
}
