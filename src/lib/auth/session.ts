import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export interface SessionUser {
  id: string;
  email: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) return null;
  return { id: session.user.id, email: session.user.email };
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
