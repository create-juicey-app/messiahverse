import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getDb } from '../../../lib/mongodb';
import { validatePost } from '../../../utils/validators';
import sanitizeHtml from 'sanitize-html';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const db = await getDb();

    if (req.method === 'POST') {
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { content, metadata } = req.body;
      validatePost(content);

      // Sanitize content
      const sanitizedContent = sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt']
        }
      });

      const post = await db.collection('posts').insertOne({
        content: sanitizedContent,
        authorId: session.user.id,
        metadata: {
          images: metadata?.images || [],
          format: 'markdown',
          layout: 'standard',
          featuredImage: metadata?.featuredImage || null
        },
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
  } catch (error) {
    console.error('API error:', error);
    res.status(error.status || 500).json({ 
      error: error.message || 'Server error' 
    });
  }
}
