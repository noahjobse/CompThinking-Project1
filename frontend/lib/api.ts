export const API_BASE = "http://localhost:8000";

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function createAdminUser() {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to insert user");
  return res.json();
}
