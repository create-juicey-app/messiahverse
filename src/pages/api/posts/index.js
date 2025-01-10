import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const client = await clientPromise;
  const db = client.db();

  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, content, authorId } = req.body;
    const post = await db.collection('posts').insertOne({
      title,
      content,
      authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json(post);
  }

  if (req.method === 'GET') {
    const posts = await db.collection('posts')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(posts);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
