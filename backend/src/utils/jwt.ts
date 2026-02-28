import { sign, verify } from "hono/jwt";

/* =========================
   SIGN TOKEN
========================= */
export const signToken = async (
  payload: any,
  secret: string,
  expiresInSeconds: number
) => {
  const now = Math.floor(Date.now() / 1000);

  return await sign(
    {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
    },
    secret
  );
};

/* =========================
   VERIFY TOKEN
========================= */
export const verifyToken = async (token: string, secret: string) => {
  try {
    return await verify(token, secret, "HS256");
  } catch {
    return null;
  }
};
