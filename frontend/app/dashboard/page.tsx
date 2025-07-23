'use client';
import React, { useEffect, useState } from 'react';
import { EnvironmentCard } from '../../components/EnvironmentCard';
import { supabase } from '../../lib/supabase';
import { useSearchParams } from 'next/navigation';

interface Environment {
  id: string;
  name: string;
  status: 'pending' | 'provisioning' | 'active' | 'failed' | 'terminated';
  cloud_provider: 'aws' | 'gcp';
  github_repo?: string;
  created_at: string;
  owner_id: string;
}

export default function DashboardPage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    status: 'pending' as Environment['status'],
    cloud_provider: 'aws' as Environment['cloud_provider'],
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const blueprintId = searchParams.get('blueprint');
  const [selectedBlueprint, setSelectedBlueprint] = useState<Environment | null>(null);

  useEffect(() => {
    const fetchUserAndEnvironments = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserId(null);
        setEnvironments([]);
        setLoading(false);
        return;
      }
      setUserId(user.id);
      const { data, error } = await supabase
        .from('environments')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching environments:', error.message);
        setEnvironments([]);
      } else {
        setEnvironments(data as Environment[]);
      }
      setLoading(false);
    };
    fetchUserAndEnvironments();
  }, []);

  useEffect(() => {
    if (blueprintId) {
      supabase
        .from('blueprints')
        .select('*')
        .eq('id', blueprintId)
        .single()
        .then(({ data }) => {
          if (data) {
            setSelectedBlueprint(data as any);
            // Only prefill if the form name is empty
            setForm(f => f.name ? f : { ...f, name: data.name + ' Environment' });
          }
        });
    }
  }, [blueprintId]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase
      .from('environments')
      .delete()
      .eq('id', id);
    if (error) {
      alert('Failed to delete environment: ' + error.message);
    } else {
      setEnvironments(envs => envs.filter(env => env.id !== id));
    }
    setDeletingId(null);
  };

  const handleViewDetails = (id: string) => {
    alert(`View details for environment: ${id}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    if (!form.name) {
      setError('Name is required');
      setCreating(false);
      return;
    }
    if (!userId) {
      setError('You must be logged in to create an environment.');
      setCreating(false);
      return;
    }
    const { data, error } = await supabase
      .from('environments')
      .insert([
        {
          name: form.name,
          status: form.status,
          cloud_provider: form.cloud_provider,
          owner_id: userId,
        },
      ])
      .select();
    if (error) {
      setError(error.message);
    } else if (data && data.length > 0) {
      setEnvironments(envs => [data[0], ...envs]);
      setForm({ name: '', status: 'pending', cloud_provider: 'aws' });
    }
    setCreating(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Your Environments</h1>
      {!userId ? (
        <div className="text-red-500 mb-4">You must be logged in to view or create environments.</div>
      ) : (
        <>
          {selectedBlueprint && (
            <div className="mb-2 p-2 bg-blue-50 rounded">
              <span className="font-semibold">Selected Blueprint:</span> {selectedBlueprint.name}
            </div>
          )}
          <form onSubmit={handleCreate} className="mb-8 p-4 border rounded">
            <div className="mb-2">
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                className="border px-2 py-1 rounded w-full"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1 font-medium">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleInputChange}
                className="border px-2 py-1 rounded w-full"
              >
                <option value="pending">Pending</option>
                <option value="provisioning">Provisioning</option>
                <option value="active">Active</option>
                <option value="failed">Failed</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block mb-1 font-medium">Cloud Provider</label>
              <select
                name="cloud_provider"
                value={form.cloud_provider}
                onChange={handleInputChange}
                className="border px-2 py-1 rounded w-full"
              >
                <option value="aws">AWS</option>
                <option value="gcp">GCP</option>
              </select>
            </div>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Environment'}
            </button>
          </form>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : environments.length === 0 ? (
            <div className="text-gray-500">No environments found.</div>
          ) : (
            environments.map(env => (
              <EnvironmentCard
                key={env.id}
                environment={env}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            ))
          )}
        </>
      )}
    </div>
  );
}