import React from 'react';

interface EnvironmentCardProps {
  environment: {
    id: string;
    name: string;
    status: 'pending' | 'provisioning' | 'active' | 'failed' | 'terminated';
    cloud_provider: 'aws' | 'gcp';
    github_repo?: string;
    created_at: string;
  };
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export function EnvironmentCard({ environment, onDelete, onViewDetails }: EnvironmentCardProps) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    provisioning: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    terminated: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold text-lg">{environment.name}</div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[environment.status]}`}>
          {environment.status}
        </span>
      </div>
      <div className="text-sm text-gray-600 mb-1">Provider: {environment.cloud_provider.toUpperCase()}</div>
      {environment.github_repo && (
        <div className="text-xs text-gray-500 mb-1">Repo: {environment.github_repo}</div>
      )}
      <div className="text-xs text-gray-400 mb-2">Created: {new Date(environment.created_at).toLocaleString()}</div>
      <div className="flex gap-2">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
          onClick={() => onViewDetails(environment.id)}
        >
          View Details
        </button>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
          onClick={() => onDelete(environment.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
} 