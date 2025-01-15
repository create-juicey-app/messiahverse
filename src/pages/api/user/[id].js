import { getDb } from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req, res) {
  const { id } = req.query
  const session = await getServerSession(req, res, authOptions)

  try {
    const db = await getDb()
    let userId
    
    // Handle both ObjectId and string formats
    try {
      // First try to find by string ID
      const userByStringId = await db.collection('users').findOne({ id: id })
      if (userByStringId) {
        userId = id
      } else {
        // If not found, try ObjectId
        userId = new ObjectId(id)
      }
    } catch (error) {
      console.error('ID conversion error:', error)
      return res.status(400).json({ error: 'Invalid user ID format' })
    }

    // Convert session ID to ObjectId for comparison
    const isOwnProfile = session?.user?.id ? 
      new ObjectId(session.user.id).equals(userId) : false

    // Find user with either format
    const user = await db.collection('users').findOne(
      { $or: [{ _id: typeof userId === 'string' ? id : userId }, { id: id }] },
      { 
        projection: {
          _id: 1,
          name: 1,
          bio: 1,
          preferences: 1,
          image: 1,
          createdAt: 1,
          location: 1,
          accounts: 1,  // Include accounts for provider info
          username: 1,  // GitHub username if available
          followers: 1,
          following: 1,
          url: 1,      // Profile URL if available
          provider: 1   // Auth provider
        }
      }
    )
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get the authentication provider info
    const account = await db.collection('accounts').findOne(
      { userId: userId },
      { projection: { provider: 1, providerAccountId: 1 } }
    )

    // Format the response
    const response = {
      ...user,
      provider: account?.provider || 'unknown',
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('User fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
}
