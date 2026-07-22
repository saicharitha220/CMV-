import { useEffect, useState } from 'react';

const resolveApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    }
  }

  return process.env.NEXT_PUBLIC_API_URL || 'https://backend-omega-one-26.vercel.app/api/v1';
};

const HomePage = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const apiBaseUrl = resolveApiBaseUrl();
        const resp = await fetch(`${apiBaseUrl}/content`);
        if (!resp.ok) {
          throw new Error('Failed to load content');
        }
        const data = await resp.json();
        setContent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <main style={{ padding: 24 }}>Loading content…</main>;
  if (error) return <main style={{ padding: 24 }}><p style={{ color: 'red' }}>{error}</p></main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>Public Website</h1>
      {content.length === 0 && <p>No content published yet.</p>}
      {content.map((item) => (
        <section key={item.key} style={{ marginBottom: 24, padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
          <h2>{item.name}</h2>
          <p>{item.description}</p>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(item.value, null, 2)}</pre>
        </section>
      ))}
    </main>
  );
};

export default HomePage;
