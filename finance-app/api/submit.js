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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const rc = await getClient();
    const body = req.body;

    // CFO notes save
    if (body._isNote) {
      await rc.set(body.key, body.value);
      return res.json({ ok: true });
    }

    // Regular submission
    const { member, type, week } = body;
    if (!member || !type || !week) return res.status(400).json({ error: 'Missing fields' });

    const key = `${week}_${member}_${type}`;
    await rc.set(key, JSON.stringify(body));

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
