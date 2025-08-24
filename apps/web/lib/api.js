// apps/web/lib/api.js
export const API_BASE = "http://localhost:8080";

async function withRefresh(doRequest) {
  let r = await doRequest();
  if (r.status !== 401) return r;

  const rt = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
  if (!rt) return r;

  const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rt })
  });
  if (!refreshRes.ok) return r;

  const data = await refreshRes.json().catch(()=>null);
  if (data?.accessToken) {
    localStorage.setItem("accessToken", data.accessToken);
    r = await doRequest(true);
  }
  return r;
}

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return { "Authorization": token ? `Bearer ${token}` : "" };
}

export async function apiGet(path) {
  const r = await withRefresh(() =>
    fetch(`${API_BASE}${path}`, { headers: authHeaders() })
  );
  if (!r.ok) throw new Error(`GET ${path} failed (${r.status})`);
  return r.json();
}

export async function apiPost(path, body) {
  const r = await withRefresh(() =>
    fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body)
    })
  );
  if (!r.ok) {
    const txt = await r.text().catch(()=> "");
    throw new Error(txt || `POST ${path} failed (${r.status})`);
  }
  return r.json();
}

export async function apiPatch(path, body) {
  const r = await withRefresh(() =>
    fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body)
    })
  );
  if (!r.ok) {
    const txt = await r.text().catch(()=> "");
    throw new Error(txt || `PATCH ${path} failed (${r.status})`);
  }
  return r.json();
}

export async function apiDelete(path) {
  const r = await withRefresh(() =>
    fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: authHeaders()
    })
  );
  if (!r.ok) throw new Error(`DELETE ${path} failed (${r.status})`);
  return true;
}
