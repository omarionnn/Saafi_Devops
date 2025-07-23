'use client';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { scopes: 'repo user:email' }
    });
  };

  return (
    <div>
      <h1>Sign in to Saafi</h1>
      <button onClick={handleLogin}>Sign in with GitHub</button>
    </div>
  );
}