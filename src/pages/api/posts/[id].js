import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getDb } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { validatePost } from '../../../utils/validators';
import sanitizeHtml from 'sanitize-html';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const db = await getDb();

    if (req.method === 'PUT') {
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.query;
      const post = await db.collection('posts').findOne({
        _id: new ObjectId(id)
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (post.authorId !== session.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { title, content, metadata } = req.body;
      validatePost(title, content);

      const sanitizedContent = sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt']
        },
        textFilter: function(text) {
          return text.replace(/&quot;/g, '"')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>');
        }
      });

      const result = await db.collection('posts').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            title: title.trim(),
            content: sanitizedContent,
            metadata: {
              ...post.metadata,
              ...metadata,
              updatedAt: new Date()
            }
          }
        }
      );

      return res.status(200).json(result);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    res.status(error.status || 500).json({ 
      error: error.message || 'Server error' 
    });
  }
}
