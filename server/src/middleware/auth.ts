import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../auth/jwt.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (header?.startsWith("Bearer ")) {
    try {
      req.user = verifyToken(header.slice(7));
    } catch {
      // Token invalid — proceed without user
    }
  }
  next();
}
