import { getDb } from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const { id } = req.query

  try {
    const db = await getDb()
    const user = await db.collection('users').findOne(
      { $or: [
        { _id: new ObjectId(id) },
        { id: id }
      ]},
      { projection: { password: 0 } }
    )
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json(user)
  } catch (error) {
    console.error('User fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
}
