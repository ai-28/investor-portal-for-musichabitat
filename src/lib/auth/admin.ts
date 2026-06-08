import { requireSessionUser } from "@/lib/auth/session";
import { isAdminUser } from "@/lib/admin/admins";

export { getAdminEmails, isAdminEmail } from "@/lib/auth/admin-emails";
export { isAdminUser } from "@/lib/admin/admins";

export async function requireAdmin() {
  const user = await requireSessionUser();
  if (!(await isAdminUser(user.id, user.email))) {
    throw new Error("Forbidden");
  }
  return user;
}
