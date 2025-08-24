// apps/web/lib/api.js
export const API_BASE = "http://localhost:8080";

export async function apiGet(path) {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const r = await fetch(`${API_BASE}${path}`, {
    headers: { "Authorization": token ? `Bearer ${token}` : "" }
  });
  if (!r.ok) throw new Error(`GET ${path} failed`);
  return r.json();
}

export async function apiPost(path, body) {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(body)
  });
  if (!r.ok) {
    const txt = await r.text().catch(()=> "");
    throw new Error(txt || `POST ${path} failed`);
  }
  return r.json();
}
