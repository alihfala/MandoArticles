import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../../../lib/prisma";
import { compare } from "bcryptjs";
import { JWT } from "next-auth/jwt";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username: string;
      isGuest?: boolean;
    }
  }
  
  interface User {
    username?: string;
    isGuest?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    isGuest?: boolean;
  }
}

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) return null;
        
        const passwordMatch = await compare(credentials.password, user.password);
        
        if (passwordMatch) {
          return {
            id: user.id,
            name: user.fullName,
            email: user.email,
            username: user.username,
            image: user.avatar,
            isGuest: false
          };
        }
        
        return null;
      }
    }),
    
    // Guest mode provider
    CredentialsProvider({
      id: "guest",
      name: "Guest Access",
      credentials: {},
      async authorize() {
        const guestUser = {
          id: "guest-user",
          name: "Guest",
          email: "guest@example.com",
          username: "guest",
          isGuest: true
        };
        
        return guestUser;
      }
    }),
    
    // You can add Google provider later if needed
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.isGuest = user.isGuest || false;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.isGuest = token.isGuest || false;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST }

// Export auth for use in other server components
export const { auth, signIn, signOut } = NextAuth({ 
  ...handler.config,
  providers: [...handler.config.providers],
  callbacks: { ...handler.config.callbacks }
}); 