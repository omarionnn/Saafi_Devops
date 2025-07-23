import React from 'react';

interface BlueprintCardProps {
  blueprint: {
    id: string;
    name: string;
    description: string;
    cloud_provider: 'aws' | 'gcp';
    category: string;
    cost_estimate: number;
    compliance_tags: string[];
    version: string;
  };
  onSelect: (id: string) => void;
}

export function BlueprintCard({ blueprint, onSelect }: BlueprintCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow mb-4">
      <div className="font-bold text-lg mb-1">{blueprint.name}</div>
      <div className="text-sm text-gray-600 mb-2">{blueprint.description}</div>
      <div className="flex flex-wrap gap-2 mb-2">
        <span className="bg-gray-200 text-xs px-2 py-1 rounded">Provider: {blueprint.cloud_provider.toUpperCase()}</span>
        <span className="bg-gray-200 text-xs px-2 py-1 rounded">Category: {blueprint.category}</span>
        <span className="bg-gray-200 text-xs px-2 py-1 rounded">Version: {blueprint.version}</span>
        <span className="bg-gray-200 text-xs px-2 py-1 rounded">Cost: ${blueprint.cost_estimate}</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {blueprint.compliance_tags.map(tag => (
          <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
      <button
        onClick={() => onSelect(blueprint.id)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
      >
        Select
      </button>
    </div>
  );
} 