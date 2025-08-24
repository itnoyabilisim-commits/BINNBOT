// apps/web/lib/api.js
export const API_BASE = "http://localhost:8080";

async function withRefresh(doRequest) {
  // 1) önce normal isteği dene
  let r = await doRequest();
  if (r.status !== 401) return r;

  // 2) 401 ise refresh dene
  const rt = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
  if (!rt) return r;

  const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rt })
  });

  if (!refreshRes.ok) return r; // refresh de başarısızsa orijinal 401'i döndür

  const data = await refreshRes.json().catch(()=>null);
  if (data?.accessToken) {
    localStorage.setItem("accessToken", data.accessToken);
    // 3) isteği yeni access ile tekrar dene
    r = await doRequest(true);
  }
  return r;
}

export async function apiGet(path) {
  const doReq = async (refreshed = false) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    return fetch(`${API_BASE}${path}`, {
      headers: { "Authorization": token ? `Bearer ${token}` : "" }
    });
  };

  const r = await withRefresh(() => doReq(false));
  if (!r.ok) throw new Error(`GET ${path} failed (${r.status})`);
  return r.json();
}

export async function apiPost(path, body) {
  const doReq = async (refreshed = false) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    return fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify(body)
    });
  };

  const r = await withRefresh(() => doReq(false));
  if (!r.ok) {
    const txt = await r.text().catch(()=> "");
    throw new Error(txt || `POST ${path} failed (${r.status})`);
  }
  return r.json();
}
