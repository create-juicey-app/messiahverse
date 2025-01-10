import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const client = await clientPromise
    const db = client.db()

    if (req.method === 'GET') {
      const profile = await db.collection('users').findOne(
        { _id: new ObjectId(session.user.id) },
        { projection: { password: 0 } }
      )
      return res.status(200).json(profile)
    }

    if (req.method === 'POST') {
      const updateData = {
        ...req.body,
        updatedAt: new Date(),
      }
      
      await db.collection('users').updateOne(
        { _id: new ObjectId(session.user.id) },
        { $set: updateData }
      )
      return res.status(200).json({ message: 'Profile updated' })
    }
  } catch (error) {
    console.error('Profile API Error:', error)
    return res.status(500).json({ error: 'Database error' })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
