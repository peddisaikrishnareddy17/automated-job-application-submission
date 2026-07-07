'use client';

import { Briefcase, MapPin, TrendingUp } from 'lucide-react';
import { applicationsApi } from '@/services/api';
import { useState } from 'react';
import type { Job } from '@/types';

interface JobCardProps {
  job: Job;
  onApply?: () => void;
}

export default function JobCard({ job, onApply }: JobCardProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await applicationsApi.apply(job.id);
      setApplied(true);
      onApply?.();
    } catch (error) {
      console.error('Failed to apply:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {job.title}
          </h3>
          <div className="flex items-center text-gray-600 mb-2">
            <Briefcase className="w-4 h-4 mr-1" />
            <span className="text-sm">{job.company}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{job.location}</span>
            {job.workMode && (
              <span className="ml-3 px-2 py-1 bg-gray-100 rounded text-xs">
                {job.workMode}
              </span>
            )}
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 ${getMatchColor(
            job.matchScore
          )}`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{job.matchScore}%</span>
        </div>
      </div>

      {job.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {job.description}
        </p>
      )}

      {job.salary && (
        <p className="text-gray-700 font-medium text-sm mb-4">
          {job.salary}
        </p>
      )}

      <button
        onClick={handleApply}
        disabled={isApplying || applied}
        className={`
          w-full px-4 py-2 rounded-md font-medium text-sm transition-colors
          ${
            applied
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }
          ${isApplying ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isApplying
          ? 'Applying...'
          : applied
          ? 'Applied ✓'
          : 'Apply Now'}
      </button>
    </div>
  );
}
