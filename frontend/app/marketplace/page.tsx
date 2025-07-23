'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BlueprintCard } from '../../components/BlueprintCard';

interface Blueprint {
  id: string;
  name: string;
  description: string;
  cloud_provider: 'aws' | 'gcp';
  category: string;
  cost_estimate: number;
  compliance_tags: string[];
  version: string;
}

export default function MarketplacePage() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlueprints = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('blueprints')
        .select('*')
        .order('name', { ascending: true });
      if (error) {
        console.error('Error fetching blueprints:', error.message);
        setBlueprints([]);
      } else {
        setBlueprints(data as Blueprint[]);
      }
      setLoading(false);
    };
    fetchBlueprints();
  }, []);

  const handleSelect = (id: string) => {
    const bp = blueprints.find(b => b.id === id);
    if (bp) alert(`Selected blueprint: ${bp.name}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Blueprint Marketplace</h1>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : blueprints.length === 0 ? (
        <div className="text-gray-500">No blueprints found.</div>
      ) : (
        blueprints.map(bp => (
          <BlueprintCard key={bp.id} blueprint={bp} onSelect={handleSelect} />
        ))
      )}
    </div>
  );
} 