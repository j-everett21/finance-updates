import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL });
let connected = false;

async function getClient() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { key } = req.query;
  if (!key) return res.status(400).json({ error: 'Missing key' });

  try {
    const rc = await getClient();
    const value = await rc.get(key);
    return res.json({ value });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
