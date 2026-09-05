export const ADMIN_SESSION_COOKIE = "wetarget_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export type AdminSession = {
  username: string;
  role: "admin";
};
