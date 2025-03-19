import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Extends the built-in session types
   */
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
  
  /**
   * Extends the built-in user types
   */
  interface User {
    username?: string;
    isGuest?: boolean;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extends the built-in JWT types
   */
  interface JWT {
    id?: string;
    username?: string;
    isGuest?: boolean;
  }
} 