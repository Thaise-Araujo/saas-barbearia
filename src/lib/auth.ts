import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const COOKIE_NAME = "barbearia_session";

export type SessionPayload = {
  userId: string;
  barbershopId: string;
  name: string;
  email: string;
};

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export function getSession(): SessionPayload | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
