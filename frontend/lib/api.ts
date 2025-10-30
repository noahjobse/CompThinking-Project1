export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

/**
 * Fetch all users (any role)
 * GET /api/users
 */
export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/api/users`);
  const json = await res.json();

  if (!res.ok || json.status !== "success") {
    throw new Error(json.detail || "Failed to fetch users");
  }

  return json.data;
}

export async function createAdminUser(creator?: string) {
  const newUser = {
    creator: creator || "admin123",
    username: `user${Math.floor(Math.random() * 1000)}`,
    password: "password123",
    role: "Viewer",
  };

  const res = await fetch(`${API_BASE}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  });

  const json = await res.json();

  if (!res.ok || json.status !== "success") {
    throw new Error(json.detail || "Failed to create user");
  }

  return json.data;
}
