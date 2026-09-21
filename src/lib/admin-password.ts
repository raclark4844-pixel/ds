import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
const derive = promisify(scrypt);
export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await derive(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}
export async function checkAdminPassword(password: string, stored: string) {
  const [salt, value] = stored.split(":");
  if (!salt || !value || !/^[a-f0-9]{128}$/.test(value)) return false;
  const actual = (await derive(password, salt, 64)) as Buffer;
  return timingSafeEqual(actual, Buffer.from(value, "hex"));
}
export const resetTokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
