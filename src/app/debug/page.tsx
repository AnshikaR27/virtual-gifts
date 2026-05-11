import { createClient } from '@/lib/supabase/server';

export default async function DebugPage() {
  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);

  try {
    const supabase = createClient();
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return (
      <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <h1>Supabase Debug</h1>
        <p>Host: {url.host}</p>
        <p>Users count: {count}</p>
      </div>
    );
  } catch (e) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <h1>Supabase Debug</h1>
        <p>Host: {url.host}</p>
        <p style={{ color: 'red' }}>
          Error: {e instanceof Error ? e.message : String(e)}
        </p>
      </div>
    );
  }
}
