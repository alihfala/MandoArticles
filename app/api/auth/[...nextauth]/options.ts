import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

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
}

// Verify the database connection is available
const isPrismaConnected = async () => {
  try {
    await prisma.$queryRaw`SELECT 1+1 AS result`;
    return true;
  } catch (e) {
    console.error("Database connection error:", e);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Make sure we have proper credentials
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Verify database connection
        const isConnected = await isPrismaConnected();
        if (!isConnected) {
          throw new Error("Database connection failed");
        }

        // Find the user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) return null;
        
        // Verify password
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
    CredentialsProvider({
      id: "guest",
      credentials: {},
      async authorize() {
        return {
          id: "guest-user",
          name: "Guest",
          email: "guest@example.com",
          username: "guest",
          isGuest: true
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username as string;
        token.isGuest = user.isGuest as boolean || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.isGuest = token.isGuest as boolean || false;
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}; 