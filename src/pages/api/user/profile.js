import { getDb } from '../../../lib/mongodb'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const db = await getDb()

  if (req.method === 'GET') {
    try {
      const profile = await db.collection('users').findOne(
        { _id: new ObjectId(session.user.id) },
        { projection: { password: 0 } }
      )
      return res.status(200).json(profile)
    } catch (error) {
      console.error('Profile API Error:', error)
      return res.status(500).json({ error: 'Database error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const updateResult = await db.collection('users').updateOne(
        { 
          $or: [
            { _id: new ObjectId(session.user.id) },
            { id: session.user.id }
          ]
        },
        { 
          $set: {
            name: req.body.name,
            bio: req.body.bio,
            preferences: req.body.preferences,
            updatedAt: new Date()
          }
        }
      )
      
      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ error: 'User not found' })
      }
      
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Profile update error:', error)
      return res.status(500).json({ error: 'Failed to update profile' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
