import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password: string, hash: string) {
  try {
    const [salt, key] = hash.split(":");
    const expected = Buffer.from(key, "hex");
    return (
      expected.length === 64 &&
      timingSafeEqual(scryptSync(password, salt, 64), expected)
    );
  } catch {
    return false;
  }
}
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
