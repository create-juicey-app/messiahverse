import { getDb } from '../../../lib/mongodb'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    let userId
    try {
      userId = new ObjectId(session.user.id)
    } catch (error) {
      console.error('Invalid ObjectId:', session.user.id)
      return res.status(400).json({ error: 'Invalid user ID format' })
    }

    const db = await getDb()
    
    if (!db) {
      console.error('Database connection failed')
      return res.status(500).json({ error: 'Database connection failed' })
    }

    if (req.method === 'GET') {
      try {
        const profile = await db.collection('users').findOne(
          { _id: userId },
          { 
            projection: {
              _id: 1,
              name: 1,
              bio: 1,
              preferences: 1,
              image: 1,
              createdAt: 1,
              location: 1,
              email: 1  // Include email only for own profile
            }
          }
        )

        if (!profile) {
          return res.status(404).json({ error: 'Profile not found' })
        }

        return res.status(200).json(profile)
      } catch (error) {
        console.error('Database query error:', error)
        return res.status(500).json({ error: 'Failed to fetch profile' })
      }
    }

    if (req.method === 'POST') {
      try {
        const updateResult = await db.collection('users').findOneAndUpdate(
          { _id: userId },
          { 
            $set: {
              name: req.body.name,
              bio: req.body.bio,
              preferences: req.body.preferences,
              updatedAt: new Date()
            }
          },
          { returnDocument: 'after' }
        )
        
        if (!updateResult.value) {
          return res.status(404).json({ error: 'Profile not found' })
        }
        
        return res.status(200).json({ 
          success: true,
          profile: {
            name: updateResult.value.name,
            bio: updateResult.value.bio,
            preferences: updateResult.value.preferences
          }
        })
      } catch (error) {
        console.error('Update error:', error)
        return res.status(500).json({ error: 'Failed to update profile' })
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Profile API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
