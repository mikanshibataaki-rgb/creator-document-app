export interface TimestampResult {
  provider: "prototype";
  timestampedAt: string;
  receipt: string;
}

export async function requestTimestamp(contentHash: string): Promise<TimestampResult> {
  const timestampedAt = new Date().toISOString();
  return { provider: "prototype", timestampedAt, receipt: `prototype:${contentHash.slice(0, 16)}:${timestampedAt}` };
}

export async function sendVerificationEmail(email: string): Promise<{ status: "確認待ち"; requestedAt: string }> {
  console.info(`[prototype] verification email requested for ${email.replace(/(.{2}).+(@.+)/, "$1***$2")}`);
  return { status: "確認待ち", requestedAt: new Date().toISOString() };
}

export async function hashText(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
