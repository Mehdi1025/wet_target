"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSessionCookie,
  createAdminSession,
  setAdminSessionCookie,
  verifyAdminCredentials,
} from "@/lib/admin/session";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/admin");

  if (!username || !password) {
    return { error: "Identifiant et mot de passe requis." };
  }

  if (!verifyAdminCredentials(username, password)) {
    return { error: "Identifiant ou mot de passe incorrect." };
  }

  const token = await createAdminSession(username);
  await setAdminSessionCookie(token);

  redirect(redirectTo.startsWith("/admin") ? redirectTo : "/admin");
}

export async function logoutAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
