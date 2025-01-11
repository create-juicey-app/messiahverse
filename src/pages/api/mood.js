import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('messiahverse');

    if (req.method === 'GET') {
      const mood = await db.collection('mood').findOne({ type: 'current' });
      const now = new Date();
      const defaultMood = {
        type: 'current',
        gridPosition: 0,
        mentalWellness: 50,
        tiredness: 50,
        updatedAt: now,
        parisTime12: now.toLocaleString('en-US', { 
          timeZone: 'Europe/Paris',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true 
        }),
        parisTime24: now.toLocaleString('en-US', { 
          timeZone: 'Europe/Paris',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false 
        }),
        timeEmoji: now.getHours() >= 6 && now.getHours() < 18 ? '🌞' : '🌙'
      };

      return res.json(mood || defaultMood);
    }

    if (req.method === 'POST') {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session || session.user.email !== process.env.AUTHORIZED_EMAIL) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      try {
        const { gridPosition, mentalWellness, tiredness } = req.body;
        const now = new Date();
        
        const updateData = {
          type: 'current',
          gridPosition,
          mentalWellness,
          tiredness,
          updatedAt: now,
          parisTime12: now.toLocaleString('en-US', { 
            timeZone: 'Europe/Paris',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true 
          }),
          parisTime24: now.toLocaleString('en-US', { 
            timeZone: 'Europe/Paris',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false 
          }),
          timeEmoji: now.getHours() >= 6 && now.getHours() < 18 ? '🌞' : '🌙'
        };

        const result = await db.collection('mood').updateOne(
          { type: 'current' },
          { $set: updateData },
          { upsert: true }
        );

        // Store historical data
        await db.collection('mood_history').insertOne({
          ...updateData,
          timestamp: now
        });

        if (result.acknowledged) {
          return res.status(200).json({ success: true });
        } else {
          throw new Error('Update failed');
        }
      } catch (error) {
        console.error('Mood update error:', error);
        return res.status(500).json({ error: 'Failed to update mood' });
      }
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
