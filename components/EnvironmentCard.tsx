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
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div>{environment.name}</div>
      <div>Status: {environment.status}</div>
      <button onClick={() => onViewDetails(environment.id)}>View</button>
      <button onClick={() => onDelete(environment.id)}>Delete</button>
    </div>
  );
} 