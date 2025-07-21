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
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div>{blueprint.name}</div>
      <div>{blueprint.description}</div>
      <button onClick={() => onSelect(blueprint.id)}>Select</button>
    </div>
  );
} 