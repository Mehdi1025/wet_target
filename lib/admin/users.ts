export type AdminUser = {
  username: string;
  password: string;
};

function parseAdminUsers(raw: string): AdminUser[] {
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separator = entry.indexOf(":");
      if (separator === -1) {
        throw new Error(
          `Invalid ADMIN_USERS entry "${entry}". Use format username:password`
        );
      }

      const username = entry.slice(0, separator).trim();
      const password = entry.slice(separator + 1);

      if (!username || !password) {
        throw new Error(
          `Invalid ADMIN_USERS entry "${entry}". Username and password are required.`
        );
      }

      return { username, password };
    });
}

export function getAdminUsers(): AdminUser[] {
  const fromList = process.env.ADMIN_USERS;

  if (fromList) {
    return parseAdminUsers(fromList);
  }

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (username && password) {
    return [{ username, password }];
  }

  throw new Error(
    "ADMIN_USERS (or ADMIN_USERNAME + ADMIN_PASSWORD) must be set in .env.local."
  );
}

export function verifyAdminUser(username: string, password: string): boolean {
  const users = getAdminUsers();
  return users.some(
    (user) => user.username === username && user.password === password
  );
}
