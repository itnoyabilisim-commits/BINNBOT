// services/api-gateway/storage.js
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = `${__dirname}/tmp`;
const ROBOTS_FILE = `${DATA_DIR}/robots.json`;

function ensureFiles() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(ROBOTS_FILE)) writeFileSync(ROBOTS_FILE, "[]", "utf8");
}

export function readRobots() {
  ensureFiles();
  const raw = readFileSync(ROBOTS_FILE, "utf8") || "[]";
  try { return JSON.parse(raw); } catch { return []; }
}

export function writeRobots(list) {
  ensureFiles();
  writeFileSync(ROBOTS_FILE, JSON.stringify(list, null, 2), "utf8");
}
