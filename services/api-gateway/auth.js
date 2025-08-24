// services/api-gateway/auth.js
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret";

// Basit login: email+password gelirse token üret
export function login(email, password) {
  if (!email || !password) {
    throw new Error("email/password required");
  }
  const payload = { email };
  const accessToken = jwt.sign(payload, SECRET, { expiresIn: "1h" });
  const refreshToken = jwt.sign(payload, SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken, expiresIn: 3600 };
}

// Token doğrulama (Bearer)
export function verify(req) {
  const h = req.headers["authorization"] || "";
  if (!h.startsWith("Bearer ")) return null;
  const token = h.substring(7);
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
