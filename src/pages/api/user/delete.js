import { getDb } from '../../../lib/mongodb'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const db = await getDb()
    const userId = new ObjectId(session.user.id)

    // Verify user exists before deletion
    const user = await db.collection('users').findOne({ _id: userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Delete all user data
    const deleteResults = await Promise.allSettled([
      db.collection('users').deleteOne({ _id: userId }),
      db.collection('accounts').deleteMany({ userId: userId }),
      db.collection('sessions').deleteMany({ userId: userId.toString() })
    ])

    // Check if any operations failed
    const failedOperations = deleteResults.filter(result => result.status === 'rejected')
    if (failedOperations.length > 0) {
      console.error('Delete operations failed:', failedOperations)
      return res.status(500).json({ error: 'Failed to delete all user data' })
    }

    // Verify deletion
    const userStillExists = await db.collection('users').findOne({ _id: userId })
    if (userStillExists) {
      return res.status(500).json({ error: 'Failed to delete user' })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return res.status(500).json({ 
      error: 'Failed to delete account',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
