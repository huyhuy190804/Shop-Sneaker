import crypto from "crypto";

const getSessionSecret = () => process.env.JWT_SECRET || process.env.SESSION_SECRET || "dev-session-secret";

const base64UrlEncode = (value) => Buffer.from(value).toString("base64url");

const base64UrlDecode = (value) => Buffer.from(value, "base64url").toString("utf8");

export const createSessionToken = (payload, options = {}) => {
  const secret = getSessionSecret();
  const expiresInSeconds = options.expiresInSeconds ?? 7 * 24 * 60 * 60;
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
    type: "session",
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
  const signature = crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");

  return `${encodedPayload}.${signature}`;
};

export const verifySessionToken = (token) => {
  const secret = getSessionSecret();
  const [encodedPayload, signature] = String(token || "").split(".");

  if (!encodedPayload || !signature) {
    throw new Error("Invalid session token format");
  }

  const expectedSignature = crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(signature);

  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    throw new Error("Invalid session token signature");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp && payload.exp < now) {
    throw new Error("Session token expired");
  }

  return payload;
};
