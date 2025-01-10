import { ObjectId } from 'mongodb'
import clientPromise from '../../../lib/mongodb'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  try {
    const client = await clientPromise
    const db = client.db()
    
    const profile = await db.collection('users').findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    )

    if (!profile) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json(profile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return res.status(500).json({ error: 'Database error' })
  }
}
