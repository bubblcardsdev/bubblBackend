import crypto from "crypto";

export function generateETag(updatedAt) {
  return crypto
    .createHash("sha1")
    .update(updatedAt.toISOString())
    .digest("hex")
    .slice(0, 10);
}
