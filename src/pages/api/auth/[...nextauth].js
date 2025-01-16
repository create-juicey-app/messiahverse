import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from '../../../lib/mongodb'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: 'messiahverse', // Explicitly set database name
    collections: {
      Users: 'users',
      Accounts: 'accounts',
      Sessions: 'sessions',
      VerificationTokens: 'verification_tokens',
    }
  }),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        // Convert ObjectId to string if necessary
        token.id = user.id?.toString() || user._id?.toString() || user.id
      }
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      if (profile) {
        token.username = profile.login // GitHub username
        token.url = profile.html_url
        token.followers = profile.followers
        token.following = profile.following
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        // Ensure ID is always a string
        session.user.id = token.id?.toString()
        session.accessToken = token.accessToken
        session.provider = token.provider
        session.username = token.username
        session.url = token.url
        session.followers = token.followers
        session.following = token.following
      }
      return session
    },
    async signOut({ token }) {
      // Custom signOut callback to handle JWEInvalid error
      try {
        // Perform any necessary cleanup or logging here
      } catch (error) {
        console.error('Error during signOut:', error)
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signin',
    error: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)
