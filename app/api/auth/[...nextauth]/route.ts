// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "./options";

// Export a Request handler for the GET and POST methods
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);