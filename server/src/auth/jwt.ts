import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

const SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: EXPIRES_IN as unknown as SignOptions["expiresIn"] };
  return jwt.sign({ ...payload }, SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
