import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT = "uscassignmenttracker.crypto.v1";

function getKey(): Buffer {
  const secret = process.env.SECRETS_ENCRYPTION_KEY;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SECRETS_ENCRYPTION_KEY must be set to a string of at least 32 characters.",
    );
  }
  return scryptSync(secret, SALT, 32);
}

export function encryptSecret(plainText: string): Buffer {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

export function decryptSecret(payload: Buffer): string {
  const key = getKey();
  const iv = payload.subarray(0, IV_LENGTH);
  const tag = payload.subarray(IV_LENGTH, IV_LENGTH + 16);
  const data = payload.subarray(IV_LENGTH + 16);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8",
  );
}

/**
 * Encrypt a string and return a PostgreSQL bytea hex literal (e.g. `\xDEAD…`).
 * Use when writing to a bytea column via PostgREST / Supabase JS.
 */
export function encryptToHex(plainText: string): string {
  return "\\x" + encryptSecret(plainText).toString("hex");
}

/**
 * Decrypt a value returned from a PostgreSQL bytea column via PostgREST.
 * PostgREST v9+ returns bytea as `\x<hex>`; this strips the prefix and decrypts.
 */
export function decryptFromHex(hexValue: string): string {
  const hex = hexValue.startsWith("\\x") ? hexValue.slice(2) : hexValue;
  return decryptSecret(Buffer.from(hex, "hex"));
}
