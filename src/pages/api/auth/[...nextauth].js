import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from '../../../lib/mongodb'

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)
