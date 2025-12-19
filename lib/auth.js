import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
  session: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user) return null
        
        const valid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        
        if (!valid) return null
        
        console.log('=== AUTHORIZE: User from DB ===')
        console.log('User role:', user.role)
        console.log('Full user:', JSON.stringify(user, null, 2))
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id
      token.role = user.role
    }
    return token
  },
  async session({ session, token }) {
    if (token) {
      session.user.id = token.id
      session.user.role = token.role
    }
    return session
  },
  async redirect({ url, baseUrl }) {
    // After sign in, redirect based on role
    if (url === baseUrl || url.startsWith(baseUrl)) {
      try {
        // Try to get the session to determine role
        const response = await fetch(`${baseUrl}/api/auth/session`)
        const session = await response.json()
        
        if (session?.user?.role === 'ADMIN') {
          return `${baseUrl}/admin`
        }
        if (session?.user?.role === 'TEACHER') {
          return `${baseUrl}/teacher`
        }
        return baseUrl
      } catch {
        return baseUrl
      }
    }
    return url.startsWith(baseUrl) ? url : baseUrl
  }
}
}