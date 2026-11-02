export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  typ: 'access' | 'refresh';
  iat: number;
  exp: number;
}

function toBase64Url(value: unknown): string {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = Uint8Array.from(binary, (m) => m.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function createJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>, ttlSeconds: number): string {
  const iat = Math.floor(Date.now() / 1000);
  const body: JwtPayload = { ...payload, iat, exp: iat + ttlSeconds };
  return `${toBase64Url({ alg: 'HS256', typ: 'JWT' })}.${toBase64Url(body)}.dummy-signature`;
}

export function decodeJwt(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    return JSON.parse(fromBase64Url(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string | null, skewSeconds = 10): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return Math.floor(Date.now() / 1000) >= payload.exp - skewSeconds;
}
