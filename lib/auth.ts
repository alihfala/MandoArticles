import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Helper for server components
export async function auth() {
  return getServerSession(authOptions);
}

// Export for convenience
export { authOptions }; 