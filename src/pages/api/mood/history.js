import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('messiahverse');

    // Log IP address
    const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    await db.collection('storedips').insertOne({
      ip,
      timestamp: new Date()
    });

    // Get last 24 hours of mood history
    const history = await db.collection('mood_history')
      .find({
        timestamp: { 
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) 
        }
      })
      .sort({ timestamp: 1 })
      .toArray();

    return res.json(history);
  } catch (error) {
    console.error('History fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch mood history' });
  }
}
